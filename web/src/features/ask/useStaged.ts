import { useEffect, useState } from "react";

const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Counts from 0 to `total`, one step at a time, so an answer that arrived whole can be shown piece by piece.
 * Starts again whenever `runKey` changes. With reduced motion everything shows at once.
 */
export function useStaged(
  total: number,
  runKey: unknown,
  stepMs = 450,
): number {
  const [progress, setProgress] = useState<{ key: unknown; count: number }>({
    key: null,
    count: 0,
  });
  const instant = total > 0 && reducedMotion();

  useEffect(() => {
    if (total === 0 || instant) return;
    let count = 0;
    const timer = setInterval(() => {
      count += 1;
      setProgress({ key: runKey, count });
      if (count >= total) clearInterval(timer);
    }, stepMs);
    return () => clearInterval(timer);
  }, [runKey, total, instant, stepMs]);

  if (total === 0) return 0;
  return instant ? total : progress.key === runKey ? progress.count : 0;
}
