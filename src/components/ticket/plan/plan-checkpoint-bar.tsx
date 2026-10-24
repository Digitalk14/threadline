"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type CheckpointAction = "approve" | "request_changes" | "ask_question";

const CONFIRMATION: Record<CheckpointAction, string> = {
  approve: "Marked as approved.",
  request_changes: "Requested changes.",
  ask_question: "Question noted.",
};

/**
 * Sticky bar at the bottom of the Plan tab. Wired to the real action API in
 * a later step; for now it only records the choice locally.
 */
export function PlanCheckpointBar() {
  const [lastAction, setLastAction] = useState<CheckpointAction | null>(null);

  return (
    <div className="sticky bottom-0 flex flex-wrap items-center gap-3 border-t border-border bg-background p-3">
      <Button size="sm" onClick={() => setLastAction("approve")}>
        Approve
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setLastAction("request_changes")}
      >
        Request changes
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setLastAction("ask_question")}
      >
        Ask question
      </Button>
      {lastAction && (
        <span className="text-sm text-muted-foreground">
          {CONFIRMATION[lastAction]}
        </span>
      )}
    </div>
  );
}
