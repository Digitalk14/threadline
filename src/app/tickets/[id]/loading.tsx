import { Skeleton } from "@/components/ui/skeleton";

export default function TicketLoading() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 p-4">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-80" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-8 w-48" />
      </div>
      <Skeleton className="h-40 w-full" />
    </div>
  );
}
