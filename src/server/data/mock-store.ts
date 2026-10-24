import { TicketDetailSchema, type TicketDetail } from "@/shared/ticket";
import proj101 from "../../../mocks/tickets/PROJ-101.json";
import proj202 from "../../../mocks/tickets/PROJ-202.json";
import proj303 from "../../../mocks/tickets/PROJ-303.json";
import proj404 from "../../../mocks/tickets/PROJ-404.json";

const seedTickets: TicketDetail[] = [proj101, proj202, proj303, proj404].map(
  (raw) => TicketDetailSchema.parse(raw),
);

/**
 * In-memory ticket store seeded from the mock fixtures in `mocks/tickets`.
 * Mutable so `POST /api/tickets` can add new tickets for the lifetime of the
 * server process. There is no real persistence: a restart (or a fresh
 * serverless invocation on Vercel) resets added tickets back to the seed set.
 */
export const ticketStore = new Map<string, TicketDetail>(
  seedTickets.map((ticket) => [ticket.id, ticket]),
);
