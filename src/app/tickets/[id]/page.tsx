import { notFound } from "next/navigation";
import { TicketHeader } from "@/components/ticket/ticket-header";
import { TicketTabs } from "@/components/ticket/ticket-tabs";
import { isTicketRunning } from "@/server/data/agent-actions";
import { DataError } from "@/server/data/errors";
import { getTicketDetail } from "@/server/data/tickets";
import type { TicketDetail } from "@/shared/ticket";

export default async function TicketPage({
  params,
}: PageProps<"/tickets/[id]">) {
  const { id } = await params;

  let ticket: TicketDetail;
  try {
    ticket = getTicketDetail(id);
  } catch (err) {
    if (err instanceof DataError && err.code === "not_found") {
      notFound();
    }
    throw err;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <TicketHeader ticket={ticket} initialIsRunning={isTicketRunning(id)} />
      <TicketTabs ticket={ticket} />
    </div>
  );
}
