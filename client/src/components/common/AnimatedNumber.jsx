import React, { useEffect, useState } from 'react';

/**
 * Smooth number counter animation.
 * Counts up smoothly on load or value change without external dependencies.
 */
export default function AnimatedNumber({
  value = 0,
  duration = 800,
  prefix = '',
  suffix = '',
  formatIndian = false,
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const isReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isReduced) {
      setDisplayValue(value);
      return;
    }

    const startValue = 0;
    const targetValue = Number(value) || 0;
    const startTime = performance.now();

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Gentle ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + (targetValue - startValue) * eased);
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }, [value, duration]);

  const formatted = formatIndian
    ? displayValue.toLocaleString('en-IN')
    : displayValue.toLocaleString();

  return (
    <span>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
