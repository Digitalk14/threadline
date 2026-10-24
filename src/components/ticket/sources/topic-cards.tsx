import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SafeLink } from "@/components/safe-link";
import { RelativeTime } from "@/components/relative-time";
import { cn } from "@/lib/utils";
import type { OpenQuestion, Topic, TopicStatus } from "@/shared/ticket";

const STATUS_LABEL: Record<TopicStatus, string> = {
  decided: "Decided",
  open: "Open",
  superseded: "Superseded",
};

const STATUS_CLASSNAME: Record<TopicStatus, string> = {
  decided:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300",
  open: "bg-amber-100 text-amber-800 dark:bg-amber-400/10 dark:text-amber-300",
  superseded:
    "bg-zinc-100 text-zinc-500 dark:bg-zinc-400/10 dark:text-zinc-400",
};

export function TopicCards({
  topics,
  questions,
}: {
  topics: Topic[];
  questions: OpenQuestion[];
}) {
  if (topics.length === 0) {
    return null;
  }

  const questionById = new Map(questions.map((question) => [question.id, question]));

  return (
    <section aria-labelledby="topics-heading" className="flex flex-col gap-2">
      <h3 id="topics-heading" className="text-sm font-semibold text-foreground">
        Topics
      </h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {topics.map((topic) => (
          <Card key={topic.id} size="sm">
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle>{topic.title}</CardTitle>
                <Badge
                  variant="outline"
                  className={cn("border-transparent", STATUS_CLASSNAME[topic.status])}
                >
                  {STATUS_LABEL[topic.status]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <p className="text-muted-foreground">{topic.summary}</p>
              {topic.decisions.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <p className="text-xs font-medium text-foreground">Decisions</p>
                  <ul className="flex flex-col gap-1.5">
                    {topic.decisions.map((decision, index) => (
                      <li key={index} className="flex flex-col gap-0.5">
                        <p>{decision.text}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{decision.by}</span>
                          <RelativeTime iso={decision.at} />
                          <SafeLink href={decision.sourceUrl} />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {topic.openQuestionIds.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <p className="text-xs font-medium text-foreground">Open questions</p>
                  <ul className="flex flex-col gap-1">
                    {topic.openQuestionIds.map((id) => (
                      <li key={id} className="text-xs text-muted-foreground">
                        {questionById.get(id)?.text ?? id}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
