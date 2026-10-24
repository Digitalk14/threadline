"use client";

import { useEffect, useRef, useState } from "react";

let diagramCounter = 0;

/**
 * Renders a mermaid diagram from a code fence. Mermaid and DOMPurify are
 * dynamically imported so they are never part of the initial bundle, and
 * this component is only ever mounted while the Plan tab is active (Base UI
 * unmounts inactive tab panels by default).
 *
 * The rendered SVG is sanitized with DOMPurify and then inserted via
 * `DOMParser` + plain DOM APIs rather than `dangerouslySetInnerHTML`.
 */
export function MermaidBlock({ chart }: { chart: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const idRef = useRef(`mermaid-diagram-${++diagramCounter}`);

  useEffect(() => {
    let cancelled = false;
    const container = containerRef.current;

    async function render() {
      try {
        const [{ default: mermaid }, { default: DOMPurify }] =
          await Promise.all([import("mermaid"), import("dompurify")]);

        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          htmlLabels: false,
          flowchart: { htmlLabels: false },
        });

        const { svg } = await mermaid.render(idRef.current, chart);
        const sanitized = DOMPurify.sanitize(svg, {
          USE_PROFILES: { svg: true, svgFilters: true },
        });

        if (cancelled || !container) {
          return;
        }

        const svgElement = new DOMParser().parseFromString(
          sanitized,
          "image/svg+xml",
        ).documentElement;
        container.replaceChildren(svgElement);
        setStatus("ready");
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error ? error.message : "Unknown error.",
          );
          setStatus("error");
        }
      }
    }

    void render();

    return () => {
      cancelled = true;
      container?.replaceChildren();
    };
  }, [chart]);

  if (status === "error") {
    return (
      <pre className="my-2 overflow-x-auto rounded-md bg-muted p-3 text-xs text-destructive">
        Could not render diagram: {errorMessage}
      </pre>
    );
  }

  return (
    <div className="my-2">
      {status === "loading" && (
        <div
          className="h-32 animate-pulse rounded-md bg-muted"
          aria-label="Rendering diagram"
        />
      )}
      <div ref={containerRef} className="overflow-x-auto" />
    </div>
  );
}
