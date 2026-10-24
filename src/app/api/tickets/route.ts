import { NextResponse } from "next/server";
import type {
  CreateTicketResponse,
  ListTicketsResponse,
} from "@/shared/api";
import { DataError, DATA_ERROR_STATUS } from "@/server/data/errors";
import {
  createTicket,
  listTickets,
  parseAddTicketInput,
} from "@/server/data/tickets";

export async function GET() {
  const body: ListTicketsResponse = { tickets: listTickets() };
  return NextResponse.json(body);
}

export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON" },
      { status: 400 },
    );
  }

  try {
    const id = parseAddTicketInput(raw);
    const ticket = createTicket(id);
    const body: CreateTicketResponse = { ticket };
    return NextResponse.json(body, { status: 201 });
  } catch (err) {
    if (err instanceof DataError) {
      return NextResponse.json(
        { error: err.message },
        { status: DATA_ERROR_STATUS[err.code] },
      );
    }
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
