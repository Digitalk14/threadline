"use client";

import { useState } from "react";
import type { Source, TicketDetail } from "@/shared/ticket";
import { SourceFilters } from "./source-filters";
import { SourceTimeline } from "./source-timeline";
import { TopicCards } from "./topic-cards";

const ALL_SOURCES: Source[] = ["jira", "slack", "gitlab"];

export function SourcesTab({ ticket }: { ticket: TicketDetail }) {
  const [activeSources, setActiveSources] = useState<Set<Source>>(
    () => new Set(ALL_SOURCES),
  );

  function toggleSource(source: Source) {
    setActiveSources((prev) => {
      const next = new Set(prev);
      if (next.has(source)) {
        next.delete(source);
      } else {
        next.add(source);
      }
      return next;
    });
  }

  const filteredSources = ticket.sources.filter((item) =>
    activeSources.has(item.source),
  );

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <SourceFilters active={activeSources} onToggle={toggleSource} />
        <SourceTimeline items={filteredSources} />
      </section>
      <TopicCards topics={ticket.topics} questions={ticket.questions} />
    </div>
  );
}
