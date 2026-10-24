import { AgentEventSchema, type AgentEvent } from "@/shared/events";
import { ACTION_KINDS, type ActionKind } from "@/shared/api";
import { DataError } from "./errors";
import fetchEvents from "../../../mocks/events/fetch.json";
import briefEvents from "../../../mocks/events/brief.json";
import planEvents from "../../../mocks/events/plan.json";
import cancelEvents from "../../../mocks/events/cancel.json";

const RAW_FIXTURES: Record<ActionKind, unknown[]> = {
  fetch: fetchEvents,
  brief: briefEvents,
  plan: planEvents,
  cancel: cancelEvents,
};

const EVENT_FIXTURES = Object.fromEntries(
  ACTION_KINDS.map((action) => [
    action,
    RAW_FIXTURES[action].map((raw) => AgentEventSchema.parse(raw)),
  ]),
) as Record<ActionKind, AgentEvent[]>;

interface TicketActivity {
  /** Every event emitted so far, in order. Replayed to new SSE subscribers. */
  log: AgentEvent[];
  /** Shared across every action run on this ticket, never reset. */
  nextSeq: number;
  runningAction: ActionKind | null;
  pendingTimers: ReturnType<typeof setTimeout>[];
  listeners: Set<(event: AgentEvent) => void>;
}

const activityByTicket = new Map<string, TicketActivity>();

function getActivity(ticketId: string): TicketActivity {
  let activity = activityByTicket.get(ticketId);
  if (!activity) {
    activity = {
      log: [],
      nextSeq: 0,
      runningAction: null,
      pendingTimers: [],
      listeners: new Set(),
    };
    activityByTicket.set(ticketId, activity);
  }
  return activity;
}

export function getActivityLog(ticketId: string): AgentEvent[] {
  return getActivity(ticketId).log;
}

export function isTicketRunning(ticketId: string): boolean {
  return getActivity(ticketId).runningAction !== null;
}

/** Subscribes to live events for a ticket. Returns an unsubscribe function. */
export function subscribe(
  ticketId: string,
  listener: (event: AgentEvent) => void,
): () => void {
  const activity = getActivity(ticketId);
  activity.listeners.add(listener);
  return () => {
    activity.listeners.delete(listener);
  };
}

function emit(ticketId: string, fixtureEvent: AgentEvent): void {
  const activity = getActivity(ticketId);
  const event: AgentEvent = {
    ...fixtureEvent,
    seq: activity.nextSeq++,
    ts: new Date().toISOString(),
  };
  activity.log.push(event);
  for (const listener of activity.listeners) {
    listener(event);
  }
}

// Delay (ms) before emitting `next`, derived from the gap between the
// fixture's own timestamps and clamped so a fake run plays out quickly.
function delayBeforeMs(
  previous: AgentEvent | undefined,
  next: AgentEvent,
): number {
  if (!previous) {
    return 300;
  }
  const deltaMs = new Date(next.ts).getTime() - new Date(previous.ts).getTime();
  return Math.min(Math.max(deltaMs, 300), 2000);
}

function startRun(ticketId: string, action: ActionKind): void {
  const activity = getActivity(ticketId);
  if (activity.runningAction) {
    throw new DataError(
      "bad_request",
      `Ticket ${ticketId} already has an action running`,
    );
  }

  const events = EVENT_FIXTURES[action];
  activity.runningAction = action;

  let elapsed = 0;
  events.forEach((event, index) => {
    elapsed += delayBeforeMs(events[index - 1], event);
    const timer = setTimeout(() => {
      emit(ticketId, event);
      if (index === events.length - 1) {
        activity.runningAction = null;
        activity.pendingTimers = [];
      }
    }, elapsed);
    activity.pendingTimers.push(timer);
  });
}

function cancelRun(ticketId: string): void {
  const activity = getActivity(ticketId);
  if (!activity.runningAction) {
    return;
  }

  for (const timer of activity.pendingTimers) {
    clearTimeout(timer);
  }
  activity.pendingTimers = [];
  activity.runningAction = null;

  for (const event of EVENT_FIXTURES.cancel) {
    emit(ticketId, event);
  }
}

/**
 * Starts (or cancels) a fake agent run for a ticket. This only replays mock
 * events on a timer - no ticket data (brief, plan, sources, phase) is ever
 * generated or mutated here.
 */
export function triggerAction(ticketId: string, action: ActionKind): void {
  if (action === "cancel") {
    cancelRun(ticketId);
    return;
  }
  startRun(ticketId, action);
}
