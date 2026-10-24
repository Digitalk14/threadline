import type { ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { SafeLink } from "@/components/safe-link";
import { cn } from "@/lib/utils";
import { MermaidBlock } from "./mermaid-block";

function CodeBlock({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  const language = /language-(\w+)/.exec(className ?? "")?.[1];
  const value = String(children).replace(/\n$/, "");

  if (language === "mermaid") {
    return <MermaidBlock chart={value} />;
  }

  if (language) {
    return (
      <pre className="my-2 overflow-x-auto rounded-md bg-muted p-3 text-xs">
        <code className={className}>{value}</code>
      </pre>
    );
  }

  return (
    <code className="rounded bg-muted px-1 py-0.5 text-xs">{children}</code>
  );
}

const headingClass = "mt-4 mb-2 font-semibold text-foreground first:mt-0";

const components: Components = {
  a: ({ href }) => <SafeLink href={href ?? ""} />,
  // Images from untrusted sources are never fetched; render them as a link
  // to the source instead.
  img: ({ src, alt }) =>
    typeof src === "string" ? (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        [image: {alt || "untitled"}]
        <SafeLink href={src} />
      </span>
    ) : null,
  h1: ({ children }) => (
    <h1 className={cn(headingClass, "text-lg")}>{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className={cn(headingClass, "text-base")}>{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className={cn(headingClass, "text-sm")}>{children}</h3>
  ),
  p: ({ children }) => (
    <p className="mb-3 text-sm leading-relaxed text-foreground last:mb-0">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="mb-3 list-disc space-y-1 pl-5 text-sm text-foreground last:mb-0">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-3 list-decimal space-y-1 pl-5 text-sm text-foreground last:mb-0">
      {children}
    </ol>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-2 border-l-2 border-border pl-3 text-sm text-muted-foreground">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-4 border-border" />,
  table: ({ children }) => (
    <div className="mb-3 overflow-x-auto">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-b border-border p-2 text-left font-semibold text-foreground">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-border p-2 text-foreground">
      {children}
    </td>
  ),
  // The `code` component renders its own `pre` for fenced blocks (or a
  // `MermaidBlock`), so the default wrapping `pre` is a transparent
  // pass-through here.
  pre: ({ children }) => <>{children}</>,
  code: CodeBlock,
};

/**
 * Renders markdown from untrusted sources (Jira/Slack/LLM text). Raw HTML in
 * the markdown source is never parsed into elements (react-markdown renders
 * it as literal text without `rehype-raw`), links go through `SafeLink`, and
 * images are rendered as links rather than loaded.
 */
export function SafeMarkdown({ content }: { content: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {content}
    </ReactMarkdown>
  );
}
