import { z } from "zod";

const baseEventFields = {
  seq: z.number().int().nonnegative(),
  ts: z.iso.datetime(),
};

export const StepStartedEventSchema = z.object({
  type: z.literal("step_started"),
  ...baseEventFields,
  step: z.string(),
});

export const ToolCallEventSchema = z.object({
  type: z.literal("tool_call"),
  ...baseEventFields,
  tool: z.string(),
  summary: z.string(),
});

export const ToolDeniedEventSchema = z.object({
  type: z.literal("tool_denied"),
  ...baseEventFields,
  tool: z.string(),
  reason: z.string(),
});

export const StepFinishedEventSchema = z.object({
  type: z.literal("step_finished"),
  ...baseEventFields,
  step: z.string(),
  summary: z.string(),
});

export const StepFailedEventSchema = z.object({
  type: z.literal("step_failed"),
  ...baseEventFields,
  step: z.string(),
  error: z.string(),
});

export const AwaitingApprovalEventSchema = z.object({
  type: z.literal("awaiting_approval"),
  ...baseEventFields,
  message: z.string(),
});

export const CostEventSchema = z.object({
  type: z.literal("cost"),
  ...baseEventFields,
  usd: z.number().nonnegative(),
  note: z.string(),
});

export const WarningEventSchema = z.object({
  type: z.literal("warning"),
  ...baseEventFields,
  message: z.string(),
});

export const AgentEventSchema = z.discriminatedUnion("type", [
  StepStartedEventSchema,
  ToolCallEventSchema,
  ToolDeniedEventSchema,
  StepFinishedEventSchema,
  StepFailedEventSchema,
  AwaitingApprovalEventSchema,
  CostEventSchema,
  WarningEventSchema,
]);
export type AgentEvent = z.infer<typeof AgentEventSchema>;

export type AgentEventType = AgentEvent["type"];
