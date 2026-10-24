import { SafeLink } from "@/components/safe-link";
import { SourceIcon } from "@/components/source-icon";
import { RelativeTime } from "@/components/relative-time";
import type { SourceItem } from "@/shared/ticket";

export function SourceTimeline({ items }: { items: SourceItem[] }) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No sources match the selected filters.
      </p>
    );
  }

  const sorted = [...items].sort((a, b) => b.at.localeCompare(a.at));

  return (
    <ol className="flex flex-col gap-2">
      {sorted.map((item) => (
        <li
          key={item.id}
          className="flex flex-col gap-1.5 rounded-lg border border-border p-3"
        >
          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <SourceIcon source={item.source} />
              <span className="font-medium text-foreground">{item.author}</span>
            </span>
            <RelativeTime iso={item.at} />
          </div>
          <p className="text-sm text-foreground">{item.summary}</p>
          <SafeLink href={item.url} />
        </li>
      ))}
    </ol>
  );
}
