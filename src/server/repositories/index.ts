import "server-only";
import { db } from "@/server/db/connection";
import { createTicketsRepository } from "./tickets.repository";

export const ticketsRepository = createTicketsRepository(db);
