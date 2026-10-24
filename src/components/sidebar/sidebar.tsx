"use client";

import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ApiError, fetchTicketList } from "@/lib/api/tickets-client";
import type { TicketListItem } from "@/shared/api";
import { AddTicketForm } from "./add-ticket-form";
import { TicketList } from "./ticket-list";

export function Sidebar() {
  const [tickets, setTickets] = useState<TicketListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initial load, then a short poll so phase/running changes made from a
  // ticket page (via action buttons) show up here too. Uses an `ignore` flag
  // (rather than a shared `refresh` function) so this effect only ever
  // updates state in response to its own fetch, never as a side effect of
  // calling an externally defined function.
  useEffect(() => {
    let ignore = false;

    function load() {
      fetchTicketList()
        .then((response) => {
          if (!ignore) {
            setTickets(response.tickets);
            setError(null);
          }
        })
        .catch((err: unknown) => {
          if (!ignore) {
            setError(err instanceof ApiError ? err.message : "Could not load tickets.");
          }
        })
        .finally(() => {
          if (!ignore) {
            setIsLoading(false);
          }
        });
    }

    load();
    const interval = setInterval(load, 2000);

    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, []);

  // Re-fetch after the add-ticket form creates a ticket. Only ever called
  // from that event handler, not from an effect.
  async function refresh() {
    try {
      const response = await fetchTicketList();
      setTickets(response.tickets);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load tickets.");
    }
  }

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="border-b border-sidebar-border p-3">
        <h1 className="mb-2 px-0.5 text-sm font-semibold text-sidebar-foreground">
          Threadline
        </h1>
        <AddTicketForm onCreated={refresh} />
      </div>
      <ScrollArea className="flex-1">
        <div className="py-2">
          <TicketList tickets={tickets} isLoading={isLoading} error={error} />
        </div>
      </ScrollArea>
    </aside>
  );
}
