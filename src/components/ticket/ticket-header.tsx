"use client";

import { useEffect, useState } from "react";
import { PhaseBadge } from "@/components/phase-badge";
import { RelativeTime } from "@/components/relative-time";
import { Button } from "@/components/ui/button";
import { ApiError, triggerTicketAction } from "@/lib/api/tickets-client";
import { AgentEventSchema } from "@/shared/events";
import type { ActionKind } from "@/shared/api";
import type { TicketDetail } from "@/shared/ticket";

/** Action buttons that start a new run; disabled while one is already running. */
const START_ACTIONS: { action: ActionKind; label: string }[] = [
  { action: "fetch", label: "Fetch" },
  { action: "brief", label: "Brief" },
  { action: "plan", label: "Plan" },
];

export function TicketHeader({
  ticket,
  initialIsRunning,
}: {
  ticket: TicketDetail;
  initialIsRunning: boolean;
}) {
  const [isRunning, setIsRunning] = useState(initialIsRunning);
  const [error, setError] = useState<string | null>(null);

  // Tracks run status from the same event stream the Activity tab reads,
  // so the buttons stay in sync even if a run finishes on its own.
  useEffect(() => {
    const source = new EventSource(`/api/tickets/${ticket.id}/events/stream`);

    source.onmessage = (message) => {
      const parsed = AgentEventSchema.safeParse(JSON.parse(message.data));
      if (!parsed.success) {
        return;
      }
      if (parsed.data.type === "step_started") {
        setIsRunning(true);
      } else if (
        parsed.data.type === "step_finished" ||
        parsed.data.type === "step_failed"
      ) {
        setIsRunning(false);
      }
    };

    return () => {
      source.close();
    };
  }, [ticket.id]);

  async function handleAction(action: ActionKind) {
    setError(null);
    try {
      const response = await triggerTicketAction(ticket.id, action);
      setIsRunning(response.isRunning);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Action failed.");
    }
  }

  return (
    <header className="flex flex-col gap-3 border-b border-border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-muted-foreground">
              {ticket.id}
            </span>
            <PhaseBadge phase={ticket.phase} />
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            {ticket.title}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {START_ACTIONS.map(({ action, label }) => (
            <Button
              key={action}
              variant="outline"
              size="sm"
              disabled={isRunning}
              onClick={() => handleAction(action)}
            >
              {label}
            </Button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            disabled={!isRunning}
            onClick={() => handleAction("cancel")}
          >
            Cancel
          </Button>
        </div>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <dl className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
        {ticket.repo && (
          <div className="flex gap-1.5">
            <dt className="font-medium text-foreground">Repo</dt>
            <dd>{ticket.repo}</dd>
          </div>
        )}
        <div className="flex gap-1.5">
          <dt className="font-medium text-foreground">Cost</dt>
          <dd>${ticket.costUsdTotal.toFixed(2)}</dd>
        </div>
        <div className="flex gap-1.5">
          <dt className="font-medium text-foreground">Updated</dt>
          <dd>
            <RelativeTime iso={ticket.updatedAt} />
          </dd>
        </div>
      </dl>
    </header>
  );
}
