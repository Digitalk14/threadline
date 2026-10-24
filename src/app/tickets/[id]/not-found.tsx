import Link from "next/link";

export default function TicketNotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
      <p className="text-sm font-medium text-foreground">Ticket not found</p>
      <p className="text-sm text-muted-foreground">
        It may have been removed, or the ID in the URL is wrong.
      </p>
      <Link
        href="/"
        className="mt-2 text-sm text-primary underline underline-offset-2 hover:no-underline"
      >
        Back to Threadline
      </Link>
    </div>
  );
}
