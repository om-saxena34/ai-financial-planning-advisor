/**
 * Study Mode controller.
 * Handles consent, pre/post quiz, usage events, and admin analytics.
 * IMPORTANT: Never fabricate data. Show "No data yet" until real participants exist.
 */
const crypto = require('crypto');
const mongoose = require('mongoose');
const { StudyParticipant, ConsentRecord, QuizAttempt, StudyEvent } = require('../models/StudyModels');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const features = require('../config/features');

function checkStudyEnabled() {
  if (!features.STUDY_MODE) {
    throw ApiError.forbidden('Study mode is not active right now.');
  }
}

/** POST /study/consent — record informed consent */
async function recordConsent(req, res, next) {
  try {
    checkStudyEnabled();
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const { agreed } = req.body;
    if (!agreed) throw ApiError.badRequest('You must agree to participate.');

    // Hash the IP — never store raw IP
    const rawIp  = req.ip || '';
    const ipHash = crypto.createHash('sha256').update(rawIp).digest('hex').slice(0, 16);

    // Create consent record
    await ConsentRecord.findOneAndUpdate(
      { userId },
      { consentAt: new Date(), version: 'v1.0', ipHash },
      { upsert: true, new: true }
    );

    // Generate anonymous participant code if first time
    let participant = await StudyParticipant.findOne({ userId });
    if (!participant) {
      const code = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6-char code
      participant = await StudyParticipant.create({ userId, code, consentAt: new Date() });
    }

    return ApiResponse.success(res, { code: participant.code }, 'Thanks for joining the study!');
  } catch (err) { next(err); }
}

/** GET /study/consent — check if user has consented */
async function getConsent(req, res, next) {
  try {
    checkStudyEnabled();
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const consent = await ConsentRecord.findOne({ userId });
    return ApiResponse.success(res, { hasConsented: !!consent }, '');
  } catch (err) { next(err); }
}

/** GET /study/quiz/:phase — get quiz questions (pre or post) */
async function getQuiz(req, res, next) {
  try {
    checkStudyEnabled();
    const { phase } = req.params;
    if (!['pre','post'].includes(phase)) throw ApiError.badRequest('Phase must be pre or post');
    // Shuffle options per session (order randomized, not content)
    const questions = getQuizQuestions().map((q) => ({
      ...q,
      options: shuffleArray([...q.options], req.user.userId + phase + q.id),
    }));
    return ApiResponse.success(res, { phase, questions }, 'Quiz questions');
  } catch (err) { next(err); }
}

/** POST /study/quiz — submit quiz answers */
async function submitQuiz(req, res, next) {
  try {
    checkStudyEnabled();
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const { phase, answers, selfReport } = req.body;
    if (!phase || !Array.isArray(answers)) throw ApiError.badRequest('Send phase and answers array');

    const questions = getQuizQuestions();
    const scored = answers.map((a) => {
      const q = questions.find((q) => q.id === a.questionId);
      return { questionId: a.questionId, chosen: a.chosen, correct: q ? q.correctIndex : -1 };
    });
    const score = scored.filter((a) => a.chosen === a.correct).length;

    const attempt = await QuizAttempt.create({ userId, phase, answers: scored, score, selfReport: selfReport || [] });

    // Update participant pre/post score
    if (phase === 'pre')  await StudyParticipant.findOneAndUpdate({ userId }, { preScore: score });
    if (phase === 'post') await StudyParticipant.findOneAndUpdate({ userId }, { postScore: score });

    return ApiResponse.success(res, { score, total: questions.length }, `You got ${score} out of ${questions.length}!`);
  } catch (err) { next(err); }
}

/** POST /study/event — log a usage event */
async function logEvent(req, res, next) {
  try {
    checkStudyEnabled();
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const { event, metadata } = req.body;
    if (!event) throw ApiError.badRequest('Send event name');
    await StudyEvent.create({ userId, event, metadata });
    return ApiResponse.success(res, {}, 'Event logged');
  } catch (err) { next(err); }
}

/** GET /study/admin/results — admin only: anonymized results */
async function getAdminResults(req, res, next) {
  try {
    checkStudyEnabled();
    if (req.user.role !== 'admin') throw ApiError.forbidden('Admin only');

    const participants = await StudyParticipant.find({}, '-userId -__v').lean();
    if (!participants.length) {
      return ApiResponse.success(res, { participants: [], message: 'No data yet — no participants have completed the study.' }, '');
    }

    // Paired differences (post - pre) for participants who did both
    const paired = participants.filter((p) => p.preScore != null && p.postScore != null);
    const diffs  = paired.map((p) => p.postScore - p.preScore);
    const meanDiff = diffs.length ? diffs.reduce((s, d) => s + d, 0) / diffs.length : null;

    // Event counts
    const eventCounts = await StudyEvent.aggregate([
      { $group: { _id: '$event', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    return ApiResponse.success(res, {
      participantCount: participants.length,
      pairedCount: paired.length,
      meanScoreDiff: meanDiff !== null ? Number(meanDiff.toFixed(2)) : null,
      participants: participants.map((p) => ({ code: p.code, group: p.group, preScore: p.preScore, postScore: p.postScore })),
      eventCounts,
      note: 'All data is anonymous. Codes cannot be linked back to real users without the participant list.',
    }, 'Study results');
  } catch (err) { next(err); }
}

// ─── Quiz Questions (10 MCQ + 3 self-report) ──────────────────────────────────
function getQuizQuestions() {
  return [
    { id:'q1', text:'What does SIP stand for?', options:['Saving Is Possible','Systematic Investment Plan','Simple Interest Plan','Stock Investment Portfolio'], correctIndex:1, type:'mcq' },
    { id:'q2', text:'An "emergency fund" is…', options:['Money to buy stocks when prices fall','Money kept aside for sudden big needs','Money in a savings account that earns interest','A loan from a bank for emergencies'], correctIndex:1, type:'mcq' },
    { id:'q3', text:'If your income is ₹30,000 and you spend ₹27,000, your savings rate is…', options:['3%','10%','30%','90%'], correctIndex:1, type:'mcq' },
    { id:'q4', text:'Which loan type usually has the highest interest rate?', options:['Home loan','Car loan','Education loan','Credit card debt'], correctIndex:3, type:'mcq' },
    { id:'q5', text:'The 50-30-20 rule means…', options:['50% tax, 30% spend, 20% invest','50% needs, 30% wants, 20% savings','50% savings, 30% needs, 20% fun','50% invest, 30% spend, 20% insure'], correctIndex:1, type:'mcq' },
    { id:'q6', text:'Compound interest means you earn interest on…', options:['Only the original amount you saved','Both your original saving and the interest already earned','The interest only, not the original amount','Whatever your bank decides'], correctIndex:1, type:'mcq' },
    { id:'q7', text:'Which of these is NOT a fixed expense?', options:['Rent','Electricity bill (varies every month)','Loan EMI','Netflix subscription'], correctIndex:1, type:'mcq' },
    { id:'q8', text:'A "debt-to-income ratio" of 50% means…', options:['Half your income is profit','Half your income goes to loan payments','You owe twice your income','Your savings equal your debt'], correctIndex:1, type:'mcq' },
    { id:'q9', text:'What is "rupee cost averaging" in a SIP?', options:['You always buy at the cheapest price','You buy more units when prices are low and fewer when prices are high, automatically','You invest only when the market is rising','You split your investment across different currencies'], correctIndex:1, type:'mcq' },
    { id:'q10', text:'Which habit helps your financial health score the most?', options:['Taking more loans to invest','Spending all your income so you enjoy life now','Saving and investing a part of every income, however small','Keeping all money in a savings account'], correctIndex:2, type:'mcq' },
    { id:'s1', text:'I feel confident managing my monthly money.', options:['Strongly disagree','Disagree','Neutral','Agree','Strongly agree'], type:'likert', correctIndex:-1 },
    { id:'s2', text:'I know how to plan for a big expense like a semester fee or a trip.', options:['Strongly disagree','Disagree','Neutral','Agree','Strongly agree'], type:'likert', correctIndex:-1 },
    { id:'s3', text:'I would recommend this app to a friend who wants to manage money better.', options:['Strongly disagree','Disagree','Neutral','Agree','Strongly agree'], type:'likert', correctIndex:-1 },
  ];
}

/** Deterministic shuffle based on seed so order is consistent per user+phase */
function shuffleArray(arr, seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash << 5) - hash + seed.charCodeAt(i);
  const rng = () => { hash = (hash * 1664525 + 1013904223) & 0xffffffff; return (hash >>> 0) / 0xffffffff; };
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

module.exports = { recordConsent, getConsent, getQuiz, submitQuiz, logEvent, getAdminResults };
