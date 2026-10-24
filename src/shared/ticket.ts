import { z } from "zod";
import { TicketIdSchema } from "./ticket-id";

export const PhaseSchema = z.enum([
  "new",
  "fetched",
  "briefed",
  "plan_pending",
  "plan_approved",
]);
export type Phase = z.infer<typeof PhaseSchema>;

export const SourceSchema = z.enum(["jira", "slack", "gitlab"]);
export type Source = z.infer<typeof SourceSchema>;

export const TicketSchema = z.object({
  id: TicketIdSchema,
  title: z.string(),
  phase: PhaseSchema,
  repo: z.string().optional(),
  updatedAt: z.iso.datetime(),
  costUsdTotal: z.number().nonnegative(),
  lastRunAt: z.iso.datetime().optional(),
});
export type Ticket = z.infer<typeof TicketSchema>;

export const OpenQuestionStatusSchema = z.enum([
  "open",
  "answered",
  "superseded",
]);
export type OpenQuestionStatus = z.infer<typeof OpenQuestionStatusSchema>;

export const AnswerSchema = z.object({
  text: z.string(),
  by: z.string(),
  at: z.iso.datetime(),
  sourceUrl: z.url(),
});
export type Answer = z.infer<typeof AnswerSchema>;

export const OpenQuestionSchema = z.object({
  id: z.string(),
  text: z.string(),
  askedBy: z.string(),
  waitingOn: z.string(),
  source: SourceSchema,
  sourceUrl: z.url(),
  status: OpenQuestionStatusSchema,
  firstSeenAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  /** Present once the question has actually been answered (status "answered"). */
  answer: AnswerSchema.optional(),
});
export type OpenQuestion = z.infer<typeof OpenQuestionSchema>;

export const TopicStatusSchema = z.enum(["decided", "open", "superseded"]);
export type TopicStatus = z.infer<typeof TopicStatusSchema>;

export const DecisionSchema = z.object({
  text: z.string(),
  by: z.string(),
  at: z.iso.datetime(),
  sourceUrl: z.url(),
});
export type Decision = z.infer<typeof DecisionSchema>;

export const TopicSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: TopicStatusSchema,
  summary: z.string(),
  decisions: z.array(DecisionSchema),
  openQuestionIds: z.array(z.string()),
});
export type Topic = z.infer<typeof TopicSchema>;

export const ConflictSchema = z.object({
  id: z.string(),
  text: z.string(),
  ticketSays: z.string(),
  sourceSays: z.string(),
  sourceUrl: z.url(),
});
export type Conflict = z.infer<typeof ConflictSchema>;

export const ChangeKindSchema = z.enum([
  "question_added",
  "question_answered",
  "status_changed",
  "comment_added",
  "mr_updated",
]);
export type ChangeKind = z.infer<typeof ChangeKindSchema>;

export const ChangeSchema = z.object({
  id: z.string(),
  at: z.iso.datetime(),
  kind: ChangeKindSchema,
  text: z.string(),
  sourceUrl: z.url(),
});
export type Change = z.infer<typeof ChangeSchema>;

export const SourceItemSchema = z.object({
  id: z.string(),
  source: SourceSchema,
  author: z.string(),
  at: z.iso.datetime(),
  summary: z.string(),
  url: z.url(),
});
export type SourceItem = z.infer<typeof SourceItemSchema>;

export const TicketDetailSchema = TicketSchema.extend({
  questions: z.array(OpenQuestionSchema),
  topics: z.array(TopicSchema),
  conflicts: z.array(ConflictSchema),
  changes: z.array(ChangeSchema),
  sources: z.array(SourceItemSchema),
  brief: z.string(),
  plan: z.string(),
  planHash: z.string(),
});
export type TicketDetail = z.infer<typeof TicketDetailSchema>;
