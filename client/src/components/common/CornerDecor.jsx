import React from 'react';

/**
 * Reusable corner decoration shapes rendered as sharp inline SVGs.
 * Soft light-blue tints with low opacity to add design depth without obscuring text.
 *
 * @param {'blob' | 'dots' | 'arc' | 'wave'} variant - Visual decoration style
 * @param {'top-right' | 'bottom-left' | 'top-left' | 'bottom-right'} position - Placement in container
 * @param {string} className - Optional Tailwind utility overrides
 * @param {number} opacity - Decimal opacity (defaults to 0.45)
 */
export default function CornerDecor({
  variant = 'blob',
  position = 'top-right',
  className = '',
  opacity = 0.45,
}) {
  const positionClasses = {
    'top-right': 'top-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'top-left': 'top-0 left-0',
    'bottom-right': 'bottom-0 right-0',
  }[position] || 'top-0 right-0';

  return (
    <div
      aria-hidden="true"
      className={`absolute pointer-events-none select-none z-0 overflow-hidden ${positionClasses} ${className}`}
      style={{ opacity }}
    >
      {variant === 'blob' && (
        <svg
          width="260"
          height="240"
          viewBox="0 0 260 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M210 20C240 60 270 130 240 180C210 230 140 240 90 220C40 200 10 150 20 100C30 50 80 0 140 0C170 0 190 0 210 20Z"
            fill="url(#blob-grad)"
          />
          <defs>
            <linearGradient id="blob-grad" x1="40" y1="20" x2="220" y2="200" gradientUnits="userSpaceOnUse">
              <stop stopColor="#A9CFEE" stopOpacity="0.8" />
              <stop offset="1" stopColor="#DCEBF8" stopOpacity="0.2" />
            </linearGradient>
          </defs>
        </svg>
      )}

      {variant === 'dots' && (
        <svg
          width="96"
          height="96"
          viewBox="0 0 96 96"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <pattern id="dot-pattern" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="2" fill="#5B9FD6" fillOpacity="0.6" />
          </pattern>
          <rect width="96" height="96" fill="url(#dot-pattern)" />
        </svg>
      )}

      {variant === 'arc' && (
        <svg
          width="180"
          height="180"
          viewBox="0 0 180 180"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="180" cy="0" r="140" stroke="#7EB3E0" strokeWidth="1.5" strokeDasharray="4 6" opacity="0.6" />
          <circle cx="180" cy="0" r="100" stroke="#A9CFEE" strokeWidth="2" opacity="0.8" />
          <circle cx="180" cy="0" r="60" stroke="#DCEBF8" strokeWidth="2.5" />
        </svg>
      )}

      {variant === 'wave' && (
        <svg
          width="400"
          height="80"
          viewBox="0 0 400 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 40C80 10 160 70 240 40C320 10 360 50 400 30V80H0V40Z"
            fill="url(#wave-grad)"
          />
          <defs>
            <linearGradient id="wave-grad" x1="0" y1="20" x2="400" y2="80" gradientUnits="userSpaceOnUse">
              <stop stopColor="#EEF6FC" stopOpacity="0.9" />
              <stop offset="1" stopColor="#DCEBF8" stopOpacity="0.3" />
            </linearGradient>
          </defs>
        </svg>
      )}
    </div>
  );
}
