/**
 * Feature flags — client side (read by Vite at build time via import.meta.env).
 * Values here are defaults; override via .env.local.
 */
export const FEATURES = {
  STUDENT_MODE:           import.meta.env.VITE_FF_STUDENT_MODE          !== 'false',
  WHAT_IF_SAVE_SCENARIOS: import.meta.env.VITE_FF_WHAT_IF_SCENARIOS     !== 'false',
  WHY_EXPLAINER:          import.meta.env.VITE_FF_WHY_EXPLAINER         !== 'false',
  STATEMENT_UPLOAD:       import.meta.env.VITE_FF_STATEMENT_UPLOAD      !== 'false',
  STUDY_MODE:             import.meta.env.VITE_FF_STUDY_MODE            === 'true',
};
