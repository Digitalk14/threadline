import { z } from "zod";

/**
 * Ticket IDs look like Jira-style keys: one or more uppercase letters/digits
 * (starting with a letter), a dash, and a number. Examples: "PROJ-101", "AB1-42".
 */
export const TICKET_ID_PATTERN = /^[A-Z][A-Z0-9]+-\d+$/;

export const TicketIdSchema = z
  .string()
  .regex(TICKET_ID_PATTERN, "Ticket ID must look like PROJ-123");

export type TicketId = z.infer<typeof TicketIdSchema>;

export function parseTicketId(value: string): TicketId | null {
  const result = TicketIdSchema.safeParse(value.trim());
  return result.success ? result.data : null;
}

/**
 * Accepts either a bare ticket ID or a Jira issue URL
 * (e.g. "https://company.atlassian.net/browse/PROJ-101") and extracts the ID.
 */
export function extractTicketId(input: string): TicketId | null {
  const trimmed = input.trim();

  const direct = parseTicketId(trimmed);
  if (direct) {
    return direct;
  }

  const browseMatch = trimmed.match(/\/browse\/([A-Z][A-Z0-9]+-\d+)/);
  if (browseMatch) {
    return parseTicketId(browseMatch[1]);
  }

  return null;
}
