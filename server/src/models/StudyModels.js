const mongoose = require('mongoose');

/** Anonymous participant (Study Mode). Never store real names. */
const studyParticipantSchema = new mongoose.Schema({
  code:       { type: String, required: true, unique: true }, // random 6-char alphanumeric
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  consentAt:  { type: Date },
  preScore:   { type: Number },
  postScore:  { type: Number },
  group:      { type: String, enum: ['control','treatment'], default: 'treatment' },
}, { timestamps: true });

const consentRecordSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  consentAt: { type: Date, required: true },
  version:   { type: String, default: 'v1.0' },
  ipHash:    { type: String }, // hash only, never raw IP
}, { timestamps: true });

const quizAttemptSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  phase:    { type: String, enum: ['pre','post'], required: true },
  answers:  [{ questionId: String, chosen: Number, correct: Number }],
  score:    { type: Number },
  selfReport: [{ itemId: String, rating: Number }],
  doneAt:   { type: Date, default: Date.now },
}, { timestamps: true });

const studyEventSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event:     { type: String, required: true },  // e.g. 'view_health_score', 'use_chatbot'
  metadata:  { type: mongoose.Schema.Types.Mixed },
  at:        { type: Date, default: Date.now },
}, { timestamps: true });

studyEventSchema.index({ userId: 1, at: -1 });

module.exports = {
  StudyParticipant: mongoose.model('StudyParticipant', studyParticipantSchema),
  ConsentRecord:    mongoose.model('ConsentRecord', consentRecordSchema),
  QuizAttempt:      mongoose.model('QuizAttempt', quizAttemptSchema),
  StudyEvent:       mongoose.model('StudyEvent', studyEventSchema),
};
