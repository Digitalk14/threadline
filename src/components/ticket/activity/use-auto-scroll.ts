"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const BOTTOM_THRESHOLD_PX = 24;

/**
 * Keeps a scroll container pinned to the bottom as `dependency` changes
 * (e.g. the event count), but stops once the user scrolls up, resuming only
 * when they scroll back near the bottom or call `scrollToBottom` directly.
 */
export function useAutoScroll(dependency: unknown) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  const scrollToBottom = useCallback(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    container.scrollTop = container.scrollHeight;
    setIsPaused(false);
  }, []);

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    setIsPaused(distanceFromBottom > BOTTOM_THRESHOLD_PX);
  }, []);

  useEffect(() => {
    if (!isPaused) {
      scrollToBottom();
    }
  }, [dependency, isPaused, scrollToBottom]);

  return { containerRef, isPaused, scrollToBottom, handleScroll };
}
