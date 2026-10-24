import type { ComponentType } from "react";
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  CircleDollarSign,
  Hourglass,
  PlayCircle,
  Wrench,
  XCircle,
} from "lucide-react";
import { RelativeTime } from "@/components/relative-time";
import { cn } from "@/lib/utils";
import type { AgentEvent } from "@/shared/events";

interface EventDisplay {
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  className: string;
  text: string;
}

const MUTED = "text-muted-foreground";
const WARNING = "text-amber-700 dark:text-amber-400";

function describeEvent(event: AgentEvent): EventDisplay {
  switch (event.type) {
    case "step_started":
      return { icon: PlayCircle, className: MUTED, text: `Step started: ${event.step}` };
    case "step_finished":
      return {
        icon: CheckCircle2,
        className: "text-emerald-700 dark:text-emerald-400",
        text: `${event.step} finished — ${event.summary}`,
      };
    case "step_failed":
      return {
        icon: XCircle,
        className: "text-destructive",
        text: `${event.step} failed — ${event.error}`,
      };
    case "tool_call":
      return { icon: Wrench, className: MUTED, text: `${event.tool} — ${event.summary}` };
    case "tool_denied":
      return {
        icon: Ban,
        className: "text-destructive",
        text: `${event.tool} denied — ${event.reason}`,
      };
    case "awaiting_approval":
      return { icon: Hourglass, className: WARNING, text: event.message };
    case "cost":
      return {
        icon: CircleDollarSign,
        className: MUTED,
        text: `+$${event.usd.toFixed(2)} — ${event.note}`,
      };
    case "warning":
      return { icon: AlertTriangle, className: WARNING, text: event.message };
  }
}

export function EventLog({ events }: { events: AgentEvent[] }) {
  if (events.length === 0) {
    return <p className="text-sm text-muted-foreground">No activity yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {events.map((event) => {
        const { icon: Icon, className, text } = describeEvent(event);
        return (
          <li key={event.seq} className="flex items-start gap-2 text-sm">
            <Icon className={cn("mt-0.5 size-4 shrink-0", className)} aria-hidden />
            <span className={cn("flex-1", className)}>{text}</span>
            <RelativeTime
              iso={event.ts}
              className="shrink-0 text-xs text-muted-foreground"
            />
          </li>
        );
      })}
    </ul>
  );
}
