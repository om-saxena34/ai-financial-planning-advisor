/**
 * Feature flags — server side.
 * Set any to false to turn off a feature without deleting code.
 */
module.exports = {
  STUDENT_MODE:          process.env.FF_STUDENT_MODE          !== 'false',
  WHAT_IF_SAVE_SCENARIOS:process.env.FF_WHAT_IF_SCENARIOS     !== 'false',
  WHY_EXPLAINER:         process.env.FF_WHY_EXPLAINER         !== 'false',
  STATEMENT_UPLOAD:      process.env.FF_STATEMENT_UPLOAD      !== 'false',
  STUDY_MODE:            process.env.FF_STUDY_MODE            === 'true',   // OFF by default
};
