import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

function parseHttpUrl(href: string): URL | null {
  try {
    const url = new URL(href);
    return url.protocol === "http:" || url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

/**
 * The only way untrusted URLs (Jira/Slack/GitLab links, or links from LLM
 * output) get rendered as navigable links. Only http(s) URLs become an `<a>`;
 * anything else renders as inert text. The link always shows the hostname
 * rather than caller-supplied text, so link text can never be spoofed.
 */
export function SafeLink({
  href,
  className,
}: {
  href: string;
  className?: string;
}) {
  const url = parseHttpUrl(href);

  if (!url) {
    return (
      <span className={cn("text-muted-foreground", className)}>{href}</span>
    );
  }

  return (
    <a
      href={url.href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-1 text-primary underline underline-offset-2 hover:no-underline",
        className,
      )}
    >
      {url.hostname}
      <ExternalLink className="size-3" aria-hidden="true" />
    </a>
  );
}
