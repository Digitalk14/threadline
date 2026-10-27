import {
  query,
  type HookCallback,
  type SDKResultMessage,
} from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import { toEvents, type AgentEvent } from "./events";

export const AgentInputSchema = z.object({
  prompt: z.string().min(1),
  systemPrompt: z.string().min(1),
  allowedTools: z.array(z.string().min(1)).nonempty(),
  model: z.string().min(1),
  maxTurns: z.number().int().positive().max(50),
  budgetUsd: z.number().positive().max(0.5).default(0.5),
  cwd: z.string().optional(),
  resumeSessionId: z.string().optional(),
});
export type AgentInput = z.infer<typeof AgentInputSchema>;

interface agentCTX {
  emit: (event: AgentEvent) => void;
  abortController: AbortController;
}

export interface Denial {
  toolName: string;
  reason: string;
}

export interface RunResult {
  text: string;
  sessionId: string;
  costUsd: number;
  numTurns: number;
  denials: Denial[];
  structuredOutput?: unknown;
  durationMs: number;
}

export class AgentRunError extends Error {
  constructor(
    readonly reason: string,
    readonly costUsd: number,
    readonly sessionId?: string,
  ) {
    super(reason);
    this.name = "AgentRunError";
  }
}

const SAFE_INPUT_KEYS = ["file_path", "path", "pattern", "issueKey"] as const;

export function pickSafeToolInput(raw: unknown): Record<string, string> {
  if (typeof raw !== "object" || raw === null) return {};
  const out: Record<string, string> = {};
  for (const k of SAFE_INPUT_KEYS) {
    const v = (raw as Record<string, unknown>)[k];
    if (typeof v === "string") out[k] = v.slice(0, 200);
  }
  return out;
}

export const runAgent = async (
  rawInput: unknown,
  ctx: agentCTX,
  queryFn: typeof query = query,
): Promise<RunResult> => {
  const input = AgentInputSchema.parse(rawInput);

  const denials: Denial[] = [];
  const allowed = new Set(input.allowedTools);

  const onSubagentStart: HookCallback = async (h) => {
    if (h.hook_event_name === "SubagentStart") {
      ctx.emit({ type: "subagent_started", name: h.agent_type });
    }
    return { continue: true };
  };
  const onSubagentStop: HookCallback = async (h) => {
    if (h.hook_event_name === "SubagentStop") {
      ctx.emit({ type: "subagent_done", name: h.agent_type });
    }
    return { continue: true };
  };

  const preToolUse: HookCallback = async (hookInput) => {
    if (hookInput.hook_event_name !== "PreToolUse") return { continue: true };
    const toolName = hookInput.tool_name;
    if (!allowed.has(toolName)) {
      const reason = `Tool ${toolName} is not in allowlist`;
      denials.push({ toolName, reason });
      ctx.emit({ type: "tool_denied", toolName, reason });
      return {
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: "deny",
          permissionDecisionReason: reason,
        },
      };
    }
    ctx.emit({
      type: "tool_call",
      toolName,
      input: pickSafeToolInput(hookInput.tool_input),
    });
    return { continue: true };
  };
  const agentStream = queryFn({
    prompt: input.prompt,

    options: {
      systemPrompt: input.systemPrompt,
      allowedTools: input.allowedTools,
      model: input.model,
      maxTurns: input.maxTurns,
      maxBudgetUsd: input.budgetUsd,
      cwd: input.cwd,
      resume: input.resumeSessionId,
      abortController: ctx.abortController,
      permissionMode: "dontAsk",
      settingSources: [],
      tools: input.allowedTools,
      hooks: {
        PreToolUse: [{ matcher: "", hooks: [preToolUse] }],
        SubagentStart: [{ hooks: [onSubagentStart] }],
        SubagentStop: [{ hooks: [onSubagentStop] }],
      },
      mcpServers: {},
    },
  });
  let lastResult: SDKResultMessage | undefined;
  try {
    for await (const message of agentStream) {
      for (const ev of toEvents(message)) ctx.emit(ev);
      if (message.type === "result") lastResult = message;
    }
  } catch (err) {
    if (ctx.abortController.signal.aborted) {
      ctx.emit({ type: "run_cancelled" });
      throw new AgentRunError(
        "cancelled",
        lastResult?.total_cost_usd ?? 0,
        lastResult?.session_id,
      );
    }
    ctx.emit({
      type: "run_failed",
      reason: "sdk_error",
      costUsd: lastResult?.total_cost_usd,
    });
    throw err;
  }
  if (ctx.abortController.signal.aborted) {
    ctx.emit({ type: "run_cancelled" });
    throw new AgentRunError(
      "cancelled",
      lastResult?.total_cost_usd ?? 0,
      lastResult?.session_id,
    );
  }
  if (lastResult?.subtype === "error_max_budget_usd") {
    ctx.emit({
      type: "run_failed",
      reason: "budget_exceeded",
      costUsd: lastResult.total_cost_usd,
    });
    throw new AgentRunError(
      "budget_exceeded",
      lastResult.total_cost_usd,
      lastResult.session_id,
    );
  }
  if (lastResult?.subtype !== "success") {
    const reason = lastResult?.subtype ?? "no_result";
    const costUsd = lastResult?.total_cost_usd ?? 0;
    ctx.emit({ type: "run_failed", reason, costUsd });
    throw new AgentRunError(reason, costUsd, lastResult?.session_id);
  }
  ctx.emit({
    type: "run_finished",
    costUsd: lastResult.total_cost_usd,
    numTurns: lastResult.num_turns,
  });
  return {
    text: lastResult.result,
    sessionId: lastResult.session_id,
    costUsd: lastResult.total_cost_usd,
    numTurns: lastResult.num_turns,
    denials,
    structuredOutput: lastResult.structured_output,
    durationMs: lastResult.duration_ms,
  };
};
