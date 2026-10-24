import { SafeLink } from "@/components/safe-link";
import { RelativeTime } from "@/components/relative-time";
import type { Change, ChangeKind } from "@/shared/ticket";

const KIND_LABEL: Record<ChangeKind, string> = {
  question_added: "Question added",
  question_answered: "Question answered",
  status_changed: "Status changed",
  comment_added: "Comment added",
  mr_updated: "MR updated",
};

export function ChangesSection({ changes }: { changes: Change[] }) {
  const sorted = [...changes].sort((a, b) => b.at.localeCompare(a.at));

  return (
    <section aria-labelledby="changes-heading" className="flex flex-col gap-2">
      <h3 id="changes-heading" className="text-sm font-semibold text-foreground">
        What changed since last update
      </h3>
      {sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing has changed yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {sorted.map((change) => (
            <li
              key={change.id}
              className="flex flex-col gap-1.5 rounded-lg border border-border p-3"
            >
              <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">
                  {KIND_LABEL[change.kind]}
                </span>
                <RelativeTime iso={change.at} />
              </div>
              <p className="text-sm text-foreground">{change.text}</p>
              <SafeLink href={change.sourceUrl} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
