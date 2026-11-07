import { z } from "zod";
import { PhaseSchema, TicketSchema, type Ticket } from "@/shared/ticket";
import { TicketIdSchema } from "@/shared/ticket-id";

export type TicketRow = {
  id: string;
  title: string;
  phase: string;
  repo: string | null;
  updated_at: string;
  cost_usd_total: number;
  last_run_at: string | null;
};

export const NewTicketSchema = z.object({
  id: TicketIdSchema,
  title: z.string().min(1),
  phase: PhaseSchema,
  repo: z.string().optional(),
  costUsdTotal: z.number().nonnegative().optional(),
});
export type NewTicket = z.infer<typeof NewTicketSchema>;

export function mapTicketRow(row: TicketRow): Ticket {
  return TicketSchema.parse({
    id: row.id,
    title: row.title,
    phase: row.phase,
    repo: row.repo ?? undefined,
    updatedAt: row.updated_at,
    costUsdTotal: row.cost_usd_total,
    lastRunAt: row.last_run_at ?? undefined,
  });
}
