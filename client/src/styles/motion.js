/**
 * Shared motion settings for FinWise.
 * Calibrated for smooth, calm, 60fps transitions without bouncy or distracting motion.
 * Automatically checks and respects prefers-reduced-motion.
 */

const isReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const easeSmooth = [0.22, 1, 0.36, 1]; // Gentle cubic bezier

export const pageMotion = {
  initial: () => (isReducedMotion() ? { opacity: 0 } : { opacity: 0, y: 10 }),
  animate: () => (isReducedMotion() ? { opacity: 1 } : { opacity: 1, y: 0 }),
  exit: () => (isReducedMotion() ? { opacity: 0 } : { opacity: 0, y: -6 }),
  transition: { duration: 0.28, ease: easeSmooth },
};

export const staggerContainer = (staggerDelay = 0.06) => ({
  animate: {
    transition: {
      staggerChildren: isReducedMotion() ? 0 : staggerDelay,
    },
  },
});

export const fadeUpItem = {
  initial: () => (isReducedMotion() ? { opacity: 0 } : { opacity: 0, y: 12 }),
  animate: () => (isReducedMotion() ? { opacity: 1 } : { opacity: 1, y: 0 }),
  transition: { duration: 0.32, ease: easeSmooth },
};

export const cardHover = {
  whileHover: () =>
    isReducedMotion()
      ? {}
      : {
          y: -2.5,
          transition: { duration: 0.18, ease: easeSmooth },
        },
};

export const buttonPress = {
  whileTap: () => (isReducedMotion() ? {} : { scale: 0.985 }),
};
