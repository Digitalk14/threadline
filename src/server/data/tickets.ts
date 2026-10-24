import type { Ticket, TicketDetail } from "@/shared/ticket";
import { extractTicketId, type TicketId } from "@/shared/ticket-id";
import { CreateTicketRequestSchema, type TicketListItem } from "@/shared/api";
import { ticketStore } from "./mock-store";
import { isTicketRunning } from "./agent-actions";
import { DataError } from "./errors";

// Ticket objects in the store are actually TicketDetail at runtime, so we
// must pick only the base Ticket fields here rather than spread, or the list
// response would leak questions/topics/brief/plan to every sidebar entry.
function toListItem(ticket: Ticket): TicketListItem {
  const { id, title, phase, repo, updatedAt, costUsdTotal, lastRunAt } =
    ticket;
  return {
    id,
    title,
    phase,
    repo,
    updatedAt,
    costUsdTotal,
    lastRunAt,
    isRunning: isTicketRunning(id),
  };
}

export function listTickets(): TicketListItem[] {
  return Array.from(ticketStore.values())
    .map((detail) => toListItem(detail))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getTicketDetail(id: string): TicketDetail {
  const ticket = ticketStore.get(id);
  if (!ticket) {
    throw new DataError("not_found", `Ticket ${id} was not found`);
  }
  return ticket;
}

/** Validates a raw request body and extracts a ticket ID from its `input` field. */
export function parseAddTicketInput(raw: unknown): TicketId {
  const parsed = CreateTicketRequestSchema.safeParse(raw);
  if (!parsed.success) {
    throw new DataError(
      "bad_request",
      "Request body must include a non-empty 'input' field",
    );
  }

  const id = extractTicketId(parsed.data.input);
  if (!id) {
    throw new DataError(
      "invalid_id",
      "Could not find a valid ticket ID (e.g. PROJ-123) in the input",
    );
  }

  return id;
}

export function createTicket(id: TicketId): TicketListItem {
  const existing = ticketStore.get(id);
  if (existing) {
    return toListItem(existing);
  }

  const now = new Date().toISOString();
  const detail: TicketDetail = {
    id,
    title: "Untitled ticket",
    phase: "new",
    updatedAt: now,
    costUsdTotal: 0,
    questions: [],
    topics: [],
    conflicts: [],
    changes: [],
    sources: [],
    brief: "",
    plan: "",
    planHash: "",
  };
  ticketStore.set(id, detail);
  return toListItem(detail);
}
