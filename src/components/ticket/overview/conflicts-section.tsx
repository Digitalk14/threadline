import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SafeLink } from "@/components/safe-link";
import type { Conflict } from "@/shared/ticket";

export function ConflictsSection({ conflicts }: { conflicts: Conflict[] }) {
  if (conflicts.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="conflicts-heading" className="flex flex-col gap-2">
      <h3 id="conflicts-heading" className="text-sm font-semibold text-foreground">
        Conflicts
      </h3>
      <div className="flex flex-col gap-2">
        {conflicts.map((conflict) => (
          <Alert key={conflict.id} variant="destructive">
            <AlertTriangle />
            <AlertTitle>{conflict.text}</AlertTitle>
            <AlertDescription className="flex flex-col gap-1.5">
              <p>
                <span className="font-medium">Ticket says: </span>
                {conflict.ticketSays}
              </p>
              <p>
                <span className="font-medium">Source says: </span>
                {conflict.sourceSays}
              </p>
              <SafeLink href={conflict.sourceUrl} />
            </AlertDescription>
          </Alert>
        ))}
      </div>
    </section>
  );
}
