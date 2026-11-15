const mongoose = require('mongoose');
const { extractEntities, normalizeText } = require('./entityExtractor');
const { findBestMatch } = require('./knowledgeMatcher');
const { chatMemory } = require('./chatMemory');
const { calculateSip } = require('../../utils/financialMath');
const { computeHealthScore } = require('../healthScore.service');
const FinancialProfile = require('../../models/FinancialProfile');
const Transaction = require('../../models/Transaction');
const Goal = require('../../models/Goal');

class ChatbotService {
  /**
   * Main entry point to process a user prompt
   */
  async processMessage(userId, messageText) {
    const raw = (messageText || '').trim();
    if (!raw) {
      return {
        text: "Hey there! I didn't catch that. How can I help you with your money today?",
        quickReplies: ['What is SIP?', 'Check my Health Score', 'Can I afford a phone?'],
      };
    }

    const norm = normalizeText(raw);
    const entities = extractEntities(raw);

    // 1. Fetch user context safely if logged in
    let userProfile = null;
    let userName = 'friend';
    if (userId) {
      try {
        userProfile = await FinancialProfile.findOne({ userId });
        if (userProfile && userProfile.name) {
          userName = userProfile.name.split(' ')[0];
        }
      } catch (err) {
        console.warn('Chatbot user profile fetch warning:', err.message);
      }
    }

    // 2. Check for Greetings / Chit-Chat
    if (this.isGreeting(norm)) {
      const reply = {
        text: `Hey ${userName}! 👋 I'm **Fin**, your personal money buddy. You can ask me to calculate SIPs, check if you can afford a purchase, see how your Health Score is doing, or explain any money topic in simple English!`,
        quickReplies: [
          'How is my Health Score?',
          'If I save ₹5,000 for 10 years?',
          'Can I afford a ₹50k gadget?',
          'What is the 50-30-20 rule?',
        ],
      };
      chatMemory.addMessage(userId, 'user', raw);
      chatMemory.addMessage(userId, 'fin', reply.text);
      return reply;
    }

    // 3. Intent: CALCULATE SIP
    if (this.isSipQuery(norm, entities)) {
      const reply = this.handleSipCalculation(entities);
      chatMemory.addMessage(userId, 'user', raw);
      chatMemory.addMessage(userId, 'fin', reply.text, reply.card);
      return reply;
    }

    // 4. Intent: AFFORDABILITY CHECK
    if (this.isAffordabilityQuery(norm, entities)) {
      const reply = await this.handleAffordabilityCheck(userId, userProfile, entities);
      chatMemory.addMessage(userId, 'user', raw);
      chatMemory.addMessage(userId, 'fin', reply.text, reply.card);
      return reply;
    }

    // 5. Intent: HEALTH SCORE QUERY
    if (this.isHealthScoreQuery(norm)) {
      const reply = await this.handleHealthScoreQuery(userId);
      chatMemory.addMessage(userId, 'user', raw);
      chatMemory.addMessage(userId, 'fin', reply.text, reply.card);
      return reply;
    }

    // 6. Intent: RECENT EXPENSES QUERY
    if (this.isExpensesQuery(norm)) {
      const reply = await this.handleExpensesQuery(userId, userProfile);
      chatMemory.addMessage(userId, 'user', raw);
      chatMemory.addMessage(userId, 'fin', reply.text);
      return reply;
    }

    // 7. Intent: GOALS STATUS QUERY
    if (this.isGoalsQuery(norm)) {
      const reply = await this.handleGoalsQuery(userId);
      chatMemory.addMessage(userId, 'user', raw);
      chatMemory.addMessage(userId, 'fin', reply.text);
      return reply;
    }

    // 8. Intent: KNOWLEDGE BASE SEARCH (85+ Q&A entries)
    const kbMatch = findBestMatch(raw, 0.3);
    if (kbMatch) {
      const reply = {
        text: kbMatch.answer,
        actionHint: kbMatch.actionHint || null,
        quickReplies: kbMatch.quickReplies || ['Tell me more', 'Check my score'],
        disclaimer: '💡 Just for learning, not certified financial advice.',
      };
      chatMemory.addMessage(userId, 'user', raw);
      chatMemory.addMessage(userId, 'fin', reply.text);
      return reply;
    }

    // 9. Fallback response
    const fallback = {
      text: "I'm still learning, but I can help you with most money questions! Try asking me:\n\n• *\"If I save ₹3,000 for 5 years at 12%?\"*\n• *\"Can I afford a ₹60,000 phone?\"*\n• *\"How is my Health Score doing?\"*\n• *\"What is an index fund or PPF?\"*",
      quickReplies: [
        'Calculate SIP of ₹5k',
        'How is my Health Score?',
        'What is an emergency fund?',
        'Where did I spend this month?',
      ],
    };
    chatMemory.addMessage(userId, 'user', raw);
    chatMemory.addMessage(userId, 'fin', fallback.text);
    return fallback;
  }

  // ── Helper Detection Methods ─────────────────────────────────

  isGreeting(norm) {
    const greetings = ['hi', 'hello', 'hey', 'namaste', 'hola', 'who are you', 'help', 'kya kar sakte ho'];
    return greetings.some((g) => norm === g || norm.startsWith(`${g} `) || norm.startsWith(`${g}!`));
  }

  isSipQuery(norm, entities) {
    const sipWords = ['sip', 'invest', 'save', 'saving', 'future value', 'compounding', 'growth', 'nivesh'];
    const hasSipWord = sipWords.some((w) => norm.includes(w));
    const hasMathPrompt =
      (entities.amounts.length > 0 && (entities.timeframes.length > 0 || norm.includes('year') || norm.includes('mo'))) ||
      norm.includes('calculate sip') ||
      norm.includes('sip calculator');
    return hasSipWord && hasMathPrompt;
  }

  isAffordabilityQuery(norm, entities) {
    const affordTriggers = [
      'can i afford',
      'should i buy',
      'can i buy',
      'affordability',
      'kharid sakta hu',
      'kharidu ya nahi',
      'is it safe to buy',
      'phone afford',
      'laptop afford',
    ];
    return affordTriggers.some((t) => norm.includes(t)) || (norm.includes('afford') && entities.amounts.length > 0);
  }

  isHealthScoreQuery(norm) {
    const scoreTriggers = [
      'health score',
      'my score',
      'score kaisa hai',
      'financial health',
      'how am i doing',
      'score status',
    ];
    return scoreTriggers.some((t) => norm.includes(t));
  }

  isExpensesQuery(norm) {
    const expenseTriggers = [
      'where did i spend',
      'my expenses',
      'spending this month',
      'top expense',
      'kharcha kahan hua',
      'spending breakdown',
    ];
    return expenseTriggers.some((t) => norm.includes(t));
  }

  isGoalsQuery(norm) {
    const goalTriggers = ['my goals', 'goals status', 'target progress', 'milestones', 'saving goals'];
    return goalTriggers.some((t) => norm.includes(t));
  }

  // ── Tool Handlers ───────────────────────────────────────────

  handleSipCalculation(entities) {
    const monthlyAmount = entities.primaryAmount || 5000;
    const annualRate = entities.primaryPercentage || 12;
    const years = entities.primaryYears || 10;

    const result = calculateSip({ monthlyAmount, annualRate, years });

    const replyText = `If you invest **₹${monthlyAmount.toLocaleString('en-IN')}/month** at **${annualRate}%** yearly return for **${years} years**:\n\n• **Total money you deposit:** ₹${result.totalInvested.toLocaleString('en-IN')}\n• **Compound gains earned:** +₹${result.wealthGain.toLocaleString('en-IN')}\n• **Final wealth fund:** **₹${result.futureValue.toLocaleString('en-IN')}**\n\nNotice how the interest earned (+₹${result.wealthGain.toLocaleString('en-IN')}) does most of the heavy lifting!`;

    return {
      text: replyText,
      card: {
        type: 'sip_calculation',
        monthlyAmount,
        annualRate,
        years,
        totalInvested: result.totalInvested,
        wealthGain: result.wealthGain,
        futureValue: result.futureValue,
      },
      actionHint: 'open_sip_calculator',
      quickReplies: ['Try Step-Up SIP in Calculator', 'How does compounding work?', 'Can I start with ₹500?'],
      disclaimer: '💡 Calculated with monthly annuity due compounding math. For educational planning, not certified advice.',
    };
  }

  async handleAffordabilityCheck(userId, userProfile, entities) {
    const itemCost = entities.primaryAmount || 50000;
    const monthlyIncome = userProfile?.monthlyIncome || 50000;
    const fixedExpenses = userProfile?.fixedExpenses || 25000;
    const liquidSavings = userProfile?.existingSavings || 30000;

    const monthlySurplus = Math.max(1000, monthlyIncome - fixedExpenses);
    const monthsToSave = (itemCost / monthlySurplus).toFixed(1);

    let advice = '';
    let isAffordable = false;

    if (itemCost <= monthlySurplus * 0.7 && liquidSavings >= itemCost * 2) {
      isAffordable = true;
      advice = `Yes, you can comfortably afford this **₹${itemCost.toLocaleString('en-IN')}** purchase! Your monthly savings surplus is ₹${monthlySurplus.toLocaleString('en-IN')}, and buying this won't compromise your emergency cushion.`;
    } else if (itemCost <= monthlySurplus * 3) {
      isAffordable = true;
      advice = `You can afford this **₹${itemCost.toLocaleString('en-IN')}** item, but we recommend avoiding a high-interest credit card EMI. With your monthly surplus of **₹${monthlySurplus.toLocaleString('en-IN')}**, save for about **${Math.ceil(monthsToSave)} months** and buy it with cash upfront.`;
    } else {
      isAffordable = false;
      advice = `A purchase of **₹${itemCost.toLocaleString('en-IN')}** is quite heavy for your current monthly cash flow (takes ~${monthsToSave} months of pure surplus). We recommend building your emergency fund first or setting up a dedicated savings goal so you don't take on costly debt.`;
    }

    return {
      text: advice,
      card: {
        type: 'affordability',
        itemCost,
        monthlySurplus,
        monthsToSave: Number(monthsToSave),
        isAffordable,
      },
      actionHint: 'open_what_if',
      quickReplies: ['Create a goal for this item', 'Try What-If Simulator', 'Check my Health Score'],
    };
  }

  async handleHealthScoreQuery(userId) {
    if (!userId) {
      return {
        text: 'Please log in to check your live Financial Health Score!',
        actionHint: 'open_login',
        quickReplies: ['Log in to demo account', 'What is the Health Score?'],
      };
    }

    try {
      const scoreData = await computeHealthScore(userId, false);
      const score = scoreData.totalScore || 70;
      const band = scoreData.band || 'Good';

      const replyText = `Your current Financial Health Score is **${score} / 100** (**${band}**).\n\n• **Savings Rate:** ${scoreData.pillars?.savingsRate?.score || 18}/25\n• **Emergency Cushion:** ${scoreData.pillars?.emergencyFund?.score || 16}/20\n• **Debt Management:** ${scoreData.pillars?.debtToIncome?.score || 18}/20\n\n${
        score >= 80
          ? '🌟 Excellent job! You are in the top tier for financial discipline.'
          : '💡 Tip: Increasing your monthly savings rate or building another month of emergency cushion is the fastest way to reach 80+!'
      }`;

      return {
        text: replyText,
        card: {
          type: 'health_score',
          score,
          band,
        },
        actionHint: 'open_health_score',
        quickReplies: ['View Health Score Breakdown', 'Tips to improve score', 'What is 50-30-20?'],
      };
    } catch (err) {
      return {
        text: 'Your Financial Health Score is generally between 0 and 100, checking your savings, loans, and emergency reserves.',
        actionHint: 'open_health_score',
        quickReplies: ['Open Health Score page', 'What is an emergency fund?'],
      };
    }
  }

  async handleExpensesQuery(userId, userProfile) {
    if (!userId) {
      return {
        text: 'Log in to inspect your personalized monthly expense breakdown!',
        actionHint: 'open_login',
        quickReplies: ['Try demo login', 'What is discretionary spending?'],
      };
    }

    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const categoryAgg = await Transaction.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            type: 'expense',
            date: { $gte: thirtyDaysAgo },
          },
        },
        {
          $group: {
            _id: '$category',
            total: { $sum: '$amount' },
          },
        },
        { $sort: { total: -1 } },
      ]);

      if (categoryAgg.length === 0) {
        return {
          text: `You don't have any expense records logged in the past 30 days yet. Based on your profile, your fixed monthly bills are about **₹${(
            userProfile?.fixedExpenses || 20000
          ).toLocaleString('en-IN')}**.`,
          actionHint: 'open_transactions',
          quickReplies: ['Record a transaction', 'Upload a CSV statement'],
        };
      }

      const topCat = categoryAgg[0];
      const totalSpent = categoryAgg.reduce((sum, c) => sum + c.total, 0);

      const replyText = `Over the past 30 days, you spent **₹${totalSpent.toLocaleString(
        'en-IN'
      )}** in total.\n\nYour highest spending category was **${topCat._id.replace('_', ' ')}** at **₹${topCat.total.toLocaleString(
        'en-IN'
      )}** (${Math.round((topCat.total / totalSpent) * 100)}% of your expenses).\n\nKeeping non-essential spending below 30% of your income helps maintain a high savings rate!`;

      return {
        text: replyText,
        actionHint: 'open_transactions',
        quickReplies: ['View all transactions', 'Trim expenses in simulator', 'Check my Health Score'],
      };
    } catch (err) {
      return {
        text: 'Tracking your daily expenses is the fastest way to stop money leaks!',
        actionHint: 'open_transactions',
        quickReplies: ['Go to Transactions page', 'What is 50-30-20?'],
      };
    }
  }

  async handleGoalsQuery(userId) {
    if (!userId) {
      return {
        text: 'Log in to view your savings targets and milestones!',
        actionHint: 'open_login',
        quickReplies: ['Try demo login', 'What is an emergency fund?'],
      };
    }

    try {
      const goals = await Goal.find({ userId: new mongoose.Types.ObjectId(userId) }).limit(3);
      if (!goals || goals.length === 0) {
        return {
          text: "You haven't created any savings goals yet! Having a clear target like a laptop, emergency cushion, or travel trip makes saving much easier.",
          actionHint: 'open_goals',
          quickReplies: ['Create your first goal', 'Calculate monthly SIP'],
        };
      }

      const goalsList = goals
        .map(
          (g) =>
            `• **${g.title}**: ₹${(g.currentAmount || 0).toLocaleString('en-IN')} of ₹${g.targetAmount.toLocaleString(
              'en-IN'
            )} (${g.progressPercent || 0}%)`
        )
        .join('\n');

      return {
        text: `Here is a quick look at your active goals:\n\n${goalsList}\n\nKeep contributing regularly to reach your milestones on time!`,
        actionHint: 'open_goals',
        quickReplies: ['Open Goals page', 'Add money to a goal', 'Try SIP Calculator'],
      };
    } catch (err) {
      return {
        text: 'Setting specific goals is the most proven way to accumulate wealth.',
        actionHint: 'open_goals',
        quickReplies: ['Go to Goals page', 'What is SIP?'],
      };
    }
  }
}

const chatbotService = new ChatbotService();
module.exports = { chatbotService, ChatbotService };
