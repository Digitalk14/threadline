import Link from "next/link";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PhaseBadge } from "@/components/phase-badge";
import { RelativeTime } from "@/components/relative-time";
import type { TicketListItem as TicketListItemType } from "@/shared/api";

export function TicketListItem({
  ticket,
  isActive,
}: {
  ticket: TicketListItemType;
  isActive: boolean;
}) {
  return (
    <Link
      href={`/tickets/${ticket.id}`}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex flex-col gap-1 rounded-lg px-2.5 py-2 text-sm transition-colors outline-none hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring",
        isActive && "bg-sidebar-accent",
      )}
    >
      <span className="flex items-center justify-between gap-2">
        <span className="font-mono text-xs text-muted-foreground">
          {ticket.id}
        </span>
        <span className="flex items-center gap-1.5">
          {ticket.isRunning && (
            <Loader2
              className="size-3.5 animate-spin text-muted-foreground"
              aria-label="Running"
            />
          )}
          <PhaseBadge phase={ticket.phase} />
        </span>
      </span>
      <span className="truncate font-medium text-sidebar-foreground">
        {ticket.title}
      </span>
      <RelativeTime iso={ticket.updatedAt} className="text-xs text-muted-foreground" />
    </Link>
  );
}
