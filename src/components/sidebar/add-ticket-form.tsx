"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { extractTicketId } from "@/shared/ticket-id";
import { ApiError, createTicket } from "@/lib/api/tickets-client";

export function AddTicketForm({ onCreated }: { onCreated: () => void }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }

    if (!extractTicketId(trimmed)) {
      setError("Enter a ticket ID like PROJ-123, or a Jira issue URL");
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        const { ticket } = await createTicket(trimmed);
        setValue("");
        onCreated();
        router.push(`/tickets/${ticket.id}`);
      } catch (err) {
        setError(
          err instanceof ApiError ? err.message : "Something went wrong. Try again.",
        );
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-1">
      <Input
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          if (error) {
            setError(null);
          }
        }}
        placeholder="Add ticket (ID or Jira URL)"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? "add-ticket-error" : undefined}
        disabled={isPending}
      />
      {error && (
        <p id="add-ticket-error" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </form>
  );
}
