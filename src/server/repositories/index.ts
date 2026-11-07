import "server-only";
import { db } from "@/server/db";
import { createTicketsRepository } from "./tickets.repository";

export const ticketsRepository = createTicketsRepository(db);
