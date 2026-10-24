import { GitMerge, MessageSquare, Ticket } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Source } from "@/shared/ticket";

export const SOURCE_ICON: Record<Source, typeof Ticket> = {
  jira: Ticket,
  slack: MessageSquare,
  gitlab: GitMerge,
};

export const SOURCE_LABEL: Record<Source, string> = {
  jira: "Jira",
  slack: "Slack",
  gitlab: "GitLab",
};

export function SourceIcon({
  source,
  className,
}: {
  source: Source;
  className?: string;
}) {
  const Icon = SOURCE_ICON[source];
  return (
    <Tooltip>
      <TooltipTrigger>
        <Icon
          className={cn("size-3.5 text-muted-foreground", className)}
          aria-label={SOURCE_LABEL[source]}
        />
      </TooltipTrigger>
      <TooltipContent>{SOURCE_LABEL[source]}</TooltipContent>
    </Tooltip>
  );
}
