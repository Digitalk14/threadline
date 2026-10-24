import type { TicketDetail } from "@/shared/ticket";
import { ChangesSection } from "./changes-section";
import { ConflictsSection } from "./conflicts-section";
import { OpenQuestionsSection } from "./open-questions-section";

export function OverviewTab({ ticket }: { ticket: TicketDetail }) {
  return (
    <div className="flex flex-col gap-6">
      <ConflictsSection conflicts={ticket.conflicts} />
      <OpenQuestionsSection questions={ticket.questions} />
      <ChangesSection changes={ticket.changes} />
    </div>
  );
}
