import { z } from "zod";
import type { SDKMessage } from "@anthropic-ai/claude-agent-sdk";

export const AgentEventSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("run_started"), sessionId: z.string() }),
  z.object({ type: z.literal("assistant_text"), text: z.string() }),
  z.object({
    type: z.literal("tool_call"),
    toolName: z.string(),
    input: z.record(z.string(), z.string()).optional(),
  }),
  z.object({ type: z.literal("tool_denied"), toolName: z.string(), reason: z.string() }),
  z.object({ type: z.literal("run_completed"), costUsd: z.number(), numTurns: z.number() }),
  z.object({ type: z.literal("run_failed"), reason: z.string(), costUsd: z.number().optional() }),
  z.object({ type: z.literal("run_cancelled") }),
]);
export type AgentEvent = z.infer<typeof AgentEventSchema>;

export function toEvents(m: SDKMessage): AgentEvent[] {
  switch (m.type) {
    case "system":
      return m.subtype === "init" ? [{ type: "run_started", sessionId: m.session_id }] : [];
    case "assistant":
      return m.message.content
        .filter((b) => b.type === "text")
        .map((b) => ({ type: "assistant_text" as const, text: (b as { text: string }).text }));
    case "result":
      return m.subtype === "success"
        ? [{ type: "run_completed", costUsd: m.total_cost_usd, numTurns: m.num_turns }]
        : [];
    default:
      return []; // tool results / user messages не эмитим (ПДн)
  }
}