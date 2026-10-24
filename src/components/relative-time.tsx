const RELATIVE_TIME_FORMATTER = new Intl.RelativeTimeFormat("en", {
  numeric: "auto",
});

const DIVISIONS: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
  { amount: 60, unit: "seconds" },
  { amount: 60, unit: "minutes" },
  { amount: 24, unit: "hours" },
  { amount: 7, unit: "days" },
  { amount: 4.34524, unit: "weeks" },
  { amount: 12, unit: "months" },
  { amount: Number.POSITIVE_INFINITY, unit: "years" },
];

export function formatRelativeTime(iso: string, now: number = Date.now()): string {
  let duration = (new Date(iso).getTime() - now) / 1000;

  for (const division of DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return RELATIVE_TIME_FORMATTER.format(Math.round(duration), division.unit);
    }
    duration /= division.amount;
  }

  return RELATIVE_TIME_FORMATTER.format(Math.round(duration), "years");
}

export function RelativeTime({
  iso,
  className,
}: {
  iso: string;
  className?: string;
}) {
  return (
    <time dateTime={iso} title={new Date(iso).toLocaleString()} className={className}>
      {formatRelativeTime(iso)}
    </time>
  );
}
