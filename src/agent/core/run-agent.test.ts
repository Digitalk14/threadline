import { describe, it, expect, vi } from "vitest";
import type { SDKMessage, query } from "@anthropic-ai/claude-agent-sdk";
import { runAgent, AgentRunError } from "./run-agent";

const baseInput = {
  prompt: "hi",
  systemPrompt: "sys",
  allowedTools: ["Read"],
  model: "claude-haiku-4-5",
  maxTurns: 3,
};

const result = (over: Partial<Record<string, unknown>> = {}) =>
  ({
    type: "result",
    subtype: "success",
    result: "ok",
    session_id: "s1",
    total_cost_usd: 0.01,
    num_turns: 1,
    duration_ms: 10,
    ...over,
  }) as unknown as SDKMessage;

// фейковый query: отдаёт сообщения и даёт тесту дёрнуть хук
function fakeQuery(
  messages: SDKMessage[],
  opts: { toolCall?: string; abortAfter?: number; ac?: AbortController } = {},
): typeof query {
  return ((args: Parameters<typeof query>[0]) => {
    async function* gen() {
      if (opts.toolCall) {
        const hook = args.options!.hooks!.PreToolUse![0].hooks[0];
        await hook(
          {
            hook_event_name: "PreToolUse",
            tool_name: opts.toolCall,
            tool_input: { file_path: "/a" },
          } as never,
          undefined,
          { signal: new AbortController().signal },
        );
      }
      for (const [i, m] of messages.entries()) {
        if (opts.abortAfter === i) {
          opts.ac!.abort();
          throw Object.assign(new Error("aborted"), { name: "AbortError" });
        }
        yield m;
      }
    }
    return gen();
  }) as unknown as typeof query;
}

const ctx = () => ({ emit: vi.fn(), abortController: new AbortController() });

describe("runAgent", () => {
  it("запрещает инструмент вне allowlist и пишет в denials", async () => {
    const r = await runAgent(
      baseInput,
      ctx(),
      fakeQuery([result()], { toolCall: "Bash" }),
    );
    expect(r.denials).toEqual([
      { toolName: "Bash", reason: expect.any(String) },
    ]);
  });

  it("возвращает последний result", async () => {
    const r = await runAgent(
      baseInput,
      ctx(),
      fakeQuery([result({ result: "first" }), result({ result: "last" })]),
    );
    expect(r.text).toBe("last");
  });

  it("budget_exceeded", async () => {
    const c = ctx();
    await expect(
      runAgent(
        baseInput,
        c,
        fakeQuery([
          result({ subtype: "error_max_budget_usd", total_cost_usd: 0.6 }),
        ]),
      ),
    ).rejects.toMatchObject({ reason: "budget_exceeded", costUsd: 0.6 });
    expect(c.emit).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "run_failed",
        reason: "budget_exceeded",
      }),
    );
  });

  it("abort посреди стрима → run_cancelled", async () => {
    const c = ctx();
    await expect(
      runAgent(
        baseInput,
        c,
        fakeQuery([result(), result()], {
          abortAfter: 1,
          ac: c.abortController,
        }),
      ),
    ).rejects.toBeInstanceOf(AgentRunError);
    expect(c.emit).toHaveBeenCalledWith({ type: "run_cancelled" });
  });

  it("ошибочный result → AgentRunError со стоимостью", async () => {
    await expect(
      runAgent(
        baseInput,
        ctx(),
        fakeQuery([
          result({ subtype: "error_during_execution", total_cost_usd: 0.03 }),
        ]),
      ),
    ).rejects.toMatchObject({ costUsd: 0.03 });
  });

  it("без allowedTools — ошибка", async () => {
    await expect(
      runAgent({ ...baseInput, allowedTools: [] }, ctx(), fakeQuery([])),
    ).rejects.toThrow();
  });
  it("сабагент → subagent_started/subagent_done", async () => {
    const c = ctx();
    const q = ((args: Parameters<typeof query>[0]) =>
      (async function* () {
        const h = args.options!.hooks!;
        const sig = { signal: new AbortController().signal };
        await h.SubagentStart![0].hooks[0](
          {
            hook_event_name: "SubagentStart",
            agent_type: "planner",
            agent_id: "a1",
          } as never,
          undefined,
          sig,
        );
        await h.SubagentStop![0].hooks[0](
          {
            hook_event_name: "SubagentStop",
            agent_type: "planner",
            agent_id: "a1",
          } as never,
          undefined,
          sig,
        );
        yield result();
      })()) as unknown as typeof query;
    await runAgent(baseInput, c, q);
    expect(c.emit).toHaveBeenCalledWith({
      type: "subagent_started",
      name: "planner",
    });
    expect(c.emit).toHaveBeenCalledWith({
      type: "subagent_done",
      name: "planner",
    });
  });
  it("передаёт безопасные дефолты в query", async () => {
    const spy = vi.fn(fakeQuery([result()]));
    const c = ctx();
    await runAgent(baseInput, c, spy as unknown as typeof query);
    const options = spy.mock.calls[0][0].options;
    expect(options).toMatchObject({
      permissionMode: "dontAsk",
      settingSources: [],
      mcpServers: {},
      tools: ["Read"],
      allowedTools: ["Read"],
      maxBudgetUsd: 0.5,
    });
    expect(options?.abortController).toBe(c.abortController);
    expect(options?.hooks?.PreToolUse).toHaveLength(1);
  });
  it("успех → run_finished", async () => {
    const c = ctx();
    await runAgent(baseInput, c, fakeQuery([result()]));
    expect(c.emit).toHaveBeenLastCalledWith({
      type: "run_finished",
      costUsd: 0.01,
      numTurns: 1,
    });
  });
});
