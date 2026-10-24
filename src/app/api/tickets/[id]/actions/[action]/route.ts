import { NextResponse } from "next/server";
import { isTicketRunning, triggerAction } from "@/server/data/agent-actions";
import { DataError, DATA_ERROR_STATUS } from "@/server/data/errors";
import { getTicketDetail } from "@/server/data/tickets";
import { ACTION_KINDS, ActionKindSchema } from "@/shared/api";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string; action: string }> },
) {
  const { id, action: rawAction } = await params;

  try {
    getTicketDetail(id);

    const parsedAction = ActionKindSchema.safeParse(rawAction);
    if (!parsedAction.success) {
      throw new DataError(
        "bad_request",
        `Unknown action '${rawAction}'. Expected one of: ${ACTION_KINDS.join(", ")}`,
      );
    }

    triggerAction(id, parsedAction.data);
    return NextResponse.json({ isRunning: isTicketRunning(id) }, { status: 202 });
  } catch (err) {
    if (err instanceof DataError) {
      return NextResponse.json(
        { error: err.message },
        { status: DATA_ERROR_STATUS[err.code] },
      );
    }
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
