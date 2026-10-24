import { z } from "zod";
import { TicketSchema, TicketDetailSchema } from "./ticket";

export const TicketTabSchema = z.enum([
  "overview",
  "sources",
  "brief",
  "plan",
  "activity",
]);
export type TicketTab = z.infer<typeof TicketTabSchema>;
export const DEFAULT_TICKET_TAB: TicketTab = "overview";

/** Ticket as shown in the sidebar list: the base ticket plus live run state. */
export const TicketListItemSchema = TicketSchema.extend({
  isRunning: z.boolean(),
});
export type TicketListItem = z.infer<typeof TicketListItemSchema>;

export const ListTicketsResponseSchema = z.object({
  tickets: z.array(TicketListItemSchema),
});
export type ListTicketsResponse = z.infer<typeof ListTicketsResponseSchema>;

export const GetTicketDetailResponseSchema = z.object({
  ticket: TicketDetailSchema,
});
export type GetTicketDetailResponse = z.infer<
  typeof GetTicketDetailResponseSchema
>;

/** Raw user input for "Add ticket": either a bare ID or a Jira issue URL. */
export const CreateTicketRequestSchema = z.object({
  input: z.string().min(1, "Enter a ticket ID or Jira URL"),
});
export type CreateTicketRequest = z.infer<typeof CreateTicketRequestSchema>;

export const CreateTicketResponseSchema = z.object({
  ticket: TicketListItemSchema,
});
export type CreateTicketResponse = z.infer<typeof CreateTicketResponseSchema>;

/** Error body shape for all API routes. Never includes stack traces. */
export const ApiErrorResponseSchema = z.object({
  error: z.string(),
});
export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;

export const ACTION_KINDS = ["fetch", "brief", "plan", "cancel"] as const;
export const ActionKindSchema = z.enum(ACTION_KINDS);
export type ActionKind = z.infer<typeof ActionKindSchema>;

export const TriggerActionResponseSchema = z.object({
  isRunning: z.boolean(),
});
export type TriggerActionResponse = z.infer<
  typeof TriggerActionResponseSchema
>;
