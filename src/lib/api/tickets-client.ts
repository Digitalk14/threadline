import {
  ApiErrorResponseSchema,
  CreateTicketResponseSchema,
  ListTicketsResponseSchema,
  TriggerActionResponseSchema,
  type ActionKind,
  type CreateTicketResponse,
  type ListTicketsResponse,
  type TriggerActionResponse,
} from "@/shared/api";

export class ApiError extends Error {}

async function readError(response: Response): Promise<never> {
  const json = await response.json().catch(() => null);
  const parsed = ApiErrorResponseSchema.safeParse(json);
  throw new ApiError(
    parsed.success ? parsed.data.error : `Request failed (${response.status})`,
  );
}

export async function fetchTicketList(): Promise<ListTicketsResponse> {
  const response = await fetch("/api/tickets");
  if (!response.ok) {
    await readError(response);
  }
  return ListTicketsResponseSchema.parse(await response.json());
}

export async function createTicket(
  input: string,
): Promise<CreateTicketResponse> {
  const response = await fetch("/api/tickets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input }),
  });
  if (!response.ok) {
    await readError(response);
  }
  return CreateTicketResponseSchema.parse(await response.json());
}

export async function triggerTicketAction(
  ticketId: string,
  action: ActionKind,
): Promise<TriggerActionResponse> {
  const response = await fetch(`/api/tickets/${ticketId}/actions/${action}`, {
    method: "POST",
  });
  if (!response.ok) {
    await readError(response);
  }
  return TriggerActionResponseSchema.parse(await response.json());
}
