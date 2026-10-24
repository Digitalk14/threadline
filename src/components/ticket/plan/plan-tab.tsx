import { SafeMarkdown } from "@/components/markdown/safe-markdown";
import { PlanCheckpointBar } from "./plan-checkpoint-bar";

export function PlanTab({ plan }: { plan: string }) {
  if (!plan) {
    return <p className="text-sm text-muted-foreground">No plan yet.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <SafeMarkdown content={plan} />
      <PlanCheckpointBar />
    </div>
  );
}
