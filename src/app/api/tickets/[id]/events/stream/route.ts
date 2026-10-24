import { DataError, DATA_ERROR_STATUS } from "@/server/data/errors";
import { getActivityLog, subscribe } from "@/server/data/event-stream";
import { getTicketDetail } from "@/server/data/tickets";
import type { AgentEvent } from "@/shared/events";

export const dynamic = "force-dynamic";

const HEARTBEAT_INTERVAL_MS = 15000;

function toSseMessage(event: AgentEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    getTicketDetail(id);
  } catch (err) {
    if (err instanceof DataError) {
      return Response.json(
        { error: err.message },
        { status: DATA_ERROR_STATUS[err.code] },
      );
    }
    return Response.json({ error: "Unexpected error" }, { status: 500 });
  }

  const encoder = new TextEncoder();
  let unsubscribe: (() => void) | undefined;
  let heartbeat: ReturnType<typeof setInterval> | undefined;

  const stream = new ReadableStream({
    start(controller) {
      // Replay everything that already happened before this client
      // connected, then stay open for live events.
      for (const event of getActivityLog(id)) {
        controller.enqueue(encoder.encode(toSseMessage(event)));
      }

      unsubscribe = subscribe(id, (event) => {
        controller.enqueue(encoder.encode(toSseMessage(event)));
      });

      heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(`: heartbeat\n\n`));
      }, HEARTBEAT_INTERVAL_MS);
    },
    cancel() {
      unsubscribe?.();
      clearInterval(heartbeat);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
