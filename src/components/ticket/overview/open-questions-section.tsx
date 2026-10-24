import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SourceIcon } from "@/components/source-icon";
import { SafeLink } from "@/components/safe-link";
import { RelativeTime } from "@/components/relative-time";
import { cn } from "@/lib/utils";
import type { OpenQuestion, OpenQuestionStatus } from "@/shared/ticket";

const STATUS_LABEL: Record<OpenQuestionStatus, string> = {
  open: "Open",
  answered: "Answered",
  superseded: "Superseded",
};

const STATUS_CLASSNAME: Record<OpenQuestionStatus, string> = {
  open: "bg-amber-100 text-amber-800 dark:bg-amber-400/10 dark:text-amber-300",
  answered:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300",
  superseded:
    "bg-zinc-100 text-zinc-500 dark:bg-zinc-400/10 dark:text-zinc-400",
};

function QuestionCard({
  question,
  muted,
}: {
  question: OpenQuestion;
  muted: boolean;
}) {
  return (
    <li
      className={cn(
        "flex flex-col gap-1.5 rounded-lg border border-border p-3",
        muted && "opacity-70",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <Badge
          variant="outline"
          className={cn("border-transparent", STATUS_CLASSNAME[question.status])}
        >
          {STATUS_LABEL[question.status]}
        </Badge>
        <SourceIcon source={question.source} />
      </div>
      <p className="text-sm text-foreground">{question.text}</p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>
          Asked by{" "}
          <span className="font-medium text-foreground">{question.askedBy}</span>
        </span>
        <span>
          Waiting on{" "}
          <span className="font-medium text-foreground">{question.waitingOn}</span>
        </span>
        <SafeLink href={question.sourceUrl} />
      </div>
      {question.answer && (
        <p className="border-t border-border pt-1.5 text-xs text-muted-foreground">
          Answered by{" "}
          <span className="font-medium text-foreground">{question.answer.by}</span>
          {" · "}
          <RelativeTime iso={question.answer.at} />: {question.answer.text}{" "}
          <SafeLink href={question.answer.sourceUrl} />
        </p>
      )}
    </li>
  );
}

export function OpenQuestionsSection({
  questions,
}: {
  questions: OpenQuestion[];
}) {
  const open = questions.filter((q) => q.status === "open");
  const resolved = questions.filter((q) => q.status !== "open");

  return (
    <section
      aria-labelledby="questions-heading"
      className="flex flex-col gap-2"
    >
      <h3 id="questions-heading" className="text-sm font-semibold text-foreground">
        Open questions
      </h3>
      {open.length === 0 && resolved.length === 0 ? (
        <p className="text-sm text-muted-foreground">No questions recorded yet.</p>
      ) : (
        <>
          {open.length === 0 ? (
            <p className="text-sm text-muted-foreground">No open questions.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {open.map((question) => (
                <QuestionCard key={question.id} question={question} muted={false} />
              ))}
            </ul>
          )}
          {resolved.length > 0 && (
            <details className="group">
              <summary className="flex w-fit cursor-pointer list-none items-center gap-1 text-xs font-medium text-muted-foreground select-none hover:text-foreground">
                <ChevronDown className="size-3.5 -rotate-90 transition-transform group-open:rotate-0" />
                Answered ({resolved.length})
              </summary>
              <ul className="mt-2 flex flex-col gap-2">
                {resolved.map((question) => (
                  <QuestionCard key={question.id} question={question} muted />
                ))}
              </ul>
            </details>
          )}
        </>
      )}
    </section>
  );
}
