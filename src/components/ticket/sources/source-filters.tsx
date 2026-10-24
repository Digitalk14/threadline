import { SOURCE_ICON, SOURCE_LABEL } from "@/components/source-icon";
import { cn } from "@/lib/utils";
import type { Source } from "@/shared/ticket";

const ALL_SOURCES: Source[] = ["jira", "slack", "gitlab"];

export function SourceFilters({
  active,
  onToggle,
}: {
  active: Set<Source>;
  onToggle: (source: Source) => void;
}) {
  return (
    <div role="group" aria-label="Filter by source" className="flex gap-2">
      {ALL_SOURCES.map((source) => {
        const isActive = active.has(source);
        const Icon = SOURCE_ICON[source];
        return (
          <button
            key={source}
            type="button"
            aria-pressed={isActive}
            onClick={() => onToggle(source)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium transition-colors",
              isActive
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:bg-muted",
            )}
          >
            <Icon className="size-3.5" aria-hidden="true" />
            {SOURCE_LABEL[source]}
          </button>
        );
      })}
    </div>
  );
}
