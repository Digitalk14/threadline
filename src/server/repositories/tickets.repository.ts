import "server-only";
import type Database from "better-sqlite3";
import {
  mapTicketRow,
  NewTicketSchema,
  type NewTicket,
  type TicketRow,
} from "@/server/domain/tickets";
import type { Ticket } from "@/shared/ticket";

const SELECT_TICKET = `
  SELECT id, title, phase, repo, updated_at, cost_usd_total, last_run_at
  FROM tickets
`;

export function createTicketsRepository(database: Database.Database) {
  const listStmt = database.prepare(
    `${SELECT_TICKET} ORDER BY updated_at DESC`,
  );
  const findByIdStmt = database.prepare(`${SELECT_TICKET} WHERE id = ?`);
  const insertStmt = database.prepare(`
    INSERT INTO tickets (
      id, title, phase, repo, updated_at, cost_usd_total, last_run_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  return {
    list(): Ticket[] {
      const rows = listStmt.all() as TicketRow[];
      return rows.map(mapTicketRow);
    },

    findById(id: string): Ticket | null {
      const row = findByIdStmt.get(id) as TicketRow | undefined;
      return row ? mapTicketRow(row) : null;
    },

    create(input: NewTicket, updatedAt: string = new Date().toISOString()): Ticket {
      const ticket = NewTicketSchema.parse(input);
      insertStmt.run(
        ticket.id,
        ticket.title,
        ticket.phase,
        ticket.repo ?? null,
        updatedAt,
        ticket.costUsdTotal ?? 0,
        null,
      );
      const row = findByIdStmt.get(ticket.id) as TicketRow;
      return mapTicketRow(row);
    },
  };
}
