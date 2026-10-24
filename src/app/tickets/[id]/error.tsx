"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function TicketError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
      <p className="text-sm font-medium text-foreground">
        Something went wrong loading this ticket
      </p>
      <p className="text-sm text-muted-foreground">
        Try again, or pick another ticket from the sidebar.
      </p>
      <Button size="sm" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
