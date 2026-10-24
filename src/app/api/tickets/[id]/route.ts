import { NextResponse } from "next/server";
import type { GetTicketDetailResponse } from "@/shared/api";
import { DataError, DATA_ERROR_STATUS } from "@/server/data/errors";
import { getTicketDetail } from "@/server/data/tickets";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const ticket = getTicketDetail(id);
    const body: GetTicketDetailResponse = { ticket };
    return NextResponse.json(body);
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
