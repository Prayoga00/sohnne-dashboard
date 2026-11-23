import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';

interface AnimatedNumberProps {
  value: number;
  formatter: (n: number) => string;
  durationMs?: number;
  className?: string;
}

export function AnimatedNumber({
  value,
  formatter,
  durationMs = 360,
  className = '',
}: AnimatedNumberProps) {
  const prefersReduced = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(value);
  const currentRef = useRef(value);

  useEffect(() => {
    if (prefersReduced) {
      currentRef.current = value;
      setDisplayValue(value);
      return;
    }

    const from = currentRef.current;
    const to = value;
    if (from === to) return;

    let rafId = 0;
    const start = performance.now();

    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / durationMs);
      // easeOutExpo-like deceleration curve matching UI ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = from + (to - from) * eased;
      currentRef.current = next;
      setDisplayValue(next);
      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        currentRef.current = to;
        setDisplayValue(to);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [value, durationMs, prefersReduced]);

  return <span className={`tabular-nums ${className}`}>{formatter(Math.round(displayValue))}</span>;
}
