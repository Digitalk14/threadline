"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AgentEventSchema, type AgentEvent } from "@/shared/events";
import { EventLog } from "./event-log";
import { useAutoScroll } from "./use-auto-scroll";

export function ActivityTab({ ticketId }: { ticketId: string }) {
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const { containerRef, isPaused, scrollToBottom, handleScroll } =
    useAutoScroll(events.length);

  useEffect(() => {
    const source = new EventSource(`/api/tickets/${ticketId}/events/stream`);

    source.onmessage = (message) => {
      const parsed = AgentEventSchema.safeParse(JSON.parse(message.data));
      if (parsed.success) {
        setEvents((prev) => [...prev, parsed.data]);
      }
    };

    return () => {
      source.close();
    };
  }, [ticketId]);

  return (
    <div className="relative flex min-h-0 flex-1 flex-col p-4">
      <div ref={containerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto">
        <EventLog events={events} />
      </div>
      {isPaused && (
        <Button
          size="sm"
          className="absolute bottom-6 left-1/2 -translate-x-1/2"
          onClick={scrollToBottom}
        >
          Scroll to latest
        </Button>
      )}
    </div>
  );
}
