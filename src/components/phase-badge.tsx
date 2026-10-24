import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Phase } from "@/shared/ticket";

const PHASE_LABEL: Record<Phase, string> = {
  new: "New",
  fetched: "Fetched",
  briefed: "Briefed",
  plan_pending: "Plan pending",
  plan_approved: "Plan approved",
};

const PHASE_CLASSNAME: Record<Phase, string> = {
  new: "bg-zinc-100 text-zinc-700 dark:bg-zinc-400/10 dark:text-zinc-300",
  fetched: "bg-blue-100 text-blue-700 dark:bg-blue-400/10 dark:text-blue-300",
  briefed:
    "bg-violet-100 text-violet-700 dark:bg-violet-400/10 dark:text-violet-300",
  plan_pending:
    "bg-amber-100 text-amber-800 dark:bg-amber-400/10 dark:text-amber-300",
  plan_approved:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300",
};

export function PhaseBadge({
  phase,
  className,
}: {
  phase: Phase;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("border-transparent", PHASE_CLASSNAME[phase], className)}
    >
      {PHASE_LABEL[phase]}
    </Badge>
  );
}
