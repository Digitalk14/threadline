"use client";

import { usePathname } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { TicketListItem } from "./ticket-list-item";
import type { TicketListItem as TicketListItemType } from "@/shared/api";

export function TicketList({
  tickets,
  isLoading,
  error,
}: {
  tickets: TicketListItemType[];
  isLoading: boolean;
  error: string | null;
}) {
  const pathname = usePathname();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 px-2">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (error) {
    return <p className="px-2.5 py-2 text-sm text-destructive">{error}</p>;
  }

  if (tickets.length === 0) {
    return (
      <p className="px-2.5 py-2 text-sm text-muted-foreground">
        No tickets yet. Add one above to get started.
      </p>
    );
  }

  return (
    <nav aria-label="Tickets" className="flex flex-col gap-1 px-2">
      {tickets.map((ticket) => (
        <TicketListItem
          key={ticket.id}
          ticket={ticket}
          isActive={pathname === `/tickets/${ticket.id}`}
        />
      ))}
    </nav>
  );
}
