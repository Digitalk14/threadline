import { SafeMarkdown } from "@/components/markdown/safe-markdown";

export function BriefTab({ brief }: { brief: string }) {
  if (!brief) {
    return <p className="text-sm text-muted-foreground">No brief yet.</p>;
  }

  return <SafeMarkdown content={brief} />;
}
