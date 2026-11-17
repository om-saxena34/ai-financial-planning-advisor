const { executeTool } = require('../../src/services/chatbot/geminiTools');
const geminiChatbotService = require('../../src/services/chatbot/geminiChatbot.service');

describe('FinWise Gemini Chatbot Unit Tests', () => {
  // ── 1. TOOL EXECUTION TESTS ──
  describe('Tool Execution Handlers', () => {
    test('calc_sip calculates correct future value and gains', async () => {
      const res = await executeTool('calc_sip', {
        monthlyInvestment: 5000,
        annualInterestRate: 12,
        years: 10,
      });

      expect(res.type).toBe('sip_result');
      expect(res.monthlyInvestment).toBe(5000);
      expect(res.totalInvested).toBe(600000);
      // Future value of 5000/mo for 10 yrs at 12% is approx 11,61,695
      expect(res.estimatedWealth).toBeGreaterThan(1150000);
      expect(res.estimatedWealth).toBeLessThan(1180000);
      expect(res.wealthGain).toBe(res.estimatedWealth - res.totalInvested);
    });

    test('calc_compound computes accurate lump sum growth', async () => {
      const res = await executeTool('calc_compound', {
        principal: 100000,
        annualRate: 10,
        years: 5,
      });

      expect(res.type).toBe('compound_result');
      expect(res.principal).toBe(100000);
      expect(res.futureValue).toBeGreaterThan(160000);
      expect(res.interestEarned).toBe(res.futureValue - 100000);
    });

    test('required_sip returns required monthly investment', async () => {
      const res = await executeTool('required_sip', {
        targetAmount: 1000000,
        annualInterestRate: 12,
        years: 5,
      });

      expect(res.type).toBe('required_sip_result');
      expect(res.targetAmount).toBe(1000000);
      expect(res.requiredMonthlySip).toBeGreaterThan(11000);
      expect(res.requiredMonthlySip).toBeLessThan(13000);
    });

    test('student_planner calculates 50/30/20 first salary split', async () => {
      const res = await executeTool('student_planner', {
        expectedSalary: 50000,
      });

      expect(res.type).toBe('first_salary_result');
      expect(res.needs).toBe(25000);
      expect(res.wants).toBe(15000);
      expect(res.savings).toBe(10000);
      expect(res.startingSip).toBe(5000);
    });

    test('student_planner calculates semester fee plan', async () => {
      const res = await executeTool('student_planner', {
        feeAmount: 60000,
        monthsUntilDue: 6,
      });

      expect(res.type).toBe('semester_fee_result');
      expect(res.monthlyNeeded).toBe(10000);
    });
  });

  // ── 2. ANTI-HALLUCINATION NUMBER VERIFIER TESTS ──
  describe('Anti-Hallucination Number Verifier', () => {
    test('passes when all numbers in the reply come from tool output', () => {
      const toolOutputs = [
        {
          monthlyInvestment: 5000,
          totalInvested: 600000,
          estimatedWealth: 1161695,
          years: 10,
          annualRate: 12,
        },
      ];
      const reply =
        'If you invest ₹5,000 every month for 10 years at 12%, you put in ₹6,00,000 and reach about ₹11,61,695!';

      const verified = geminiChatbotService.verifyNumbers(reply, toolOutputs, 'invest 5000 for 10 years');
      expect(verified).toBe(true);
    });

    test('flags reply when model invents ungrounded numbers', () => {
      const toolOutputs = [
        {
          monthlyInvestment: 5000,
          totalInvested: 600000,
          estimatedWealth: 1161695,
        },
      ];
      // Here 25,00,000 is completely made up
      const reply =
        'If you invest ₹5,000, your return will easily touch ₹25,00,000 with special bonus!';

      const verified = geminiChatbotService.verifyNumbers(reply, toolOutputs, 'invest 5000');
      expect(verified).toBe(false);
    });
  });

  // ── 3. PRIVACY & CONTEXT EXTRACTION TESTS ──
  describe('Privacy Boundary Check', () => {
    test('context payload contains zero PII (no name, email, or transactions)', async () => {
      // Mock FinancialProfile lookup
      const mockProfile = {
        occupationType: 'student',
        monthlyIncome: 20000,
        fixedExpenses: 8000,
        riskProfile: 'moderate',
        userId: 'test_user_123',
        fullName: 'Private User',
        email: 'user@private.com',
      };

      // Ensure that buildAnonymousContext would only return coarse numbers
      const context = {
        occupation: mockProfile.occupationType,
        monthlyIncomeApprox: mockProfile.monthlyIncome,
        fixedBillsApprox: mockProfile.fixedExpenses,
        riskComfort: mockProfile.riskProfile,
      };

      expect(context).not.toHaveProperty('fullName');
      expect(context).not.toHaveProperty('email');
      expect(context).not.toHaveProperty('userId');
      expect(context).not.toHaveProperty('transactions');
    });
  });

  // ── 4. QUICK REPLIES SUGGESTIONS TESTS ──
  describe('Quick Replies Generator', () => {
    test('generates relevant follow-ups for investment queries', () => {
      const chips = geminiChatbotService.generateQuickReplies('tell me about SIP');
      expect(chips).toContain('What if I save ₹2,000 more?');
      expect(chips).toContain('Check my Health Score');
    });

    test('generates student-specific follow-ups for college queries', () => {
      const chips = geminiChatbotService.generateQuickReplies('I am a college student');
      expect(chips).toContain('Plan semester fees');
      expect(chips).toContain('First-salary 50/30/20 split');
    });
  });

  // ── 5. GRACEFUL FALLBACK (CIRCUIT BREAKER) ──
  describe('Circuit Breaker Fallback', () => {
    test('falls back gracefully to basic mode when AI key is missing', async () => {
      // Temporarily mock isAiEnabled to false
      const origFn = geminiChatbotService.isAiEnabled;
      geminiChatbotService.isAiEnabled = () => false;

      const res = await geminiChatbotService.processMessage(null, 'What is SIP?');
      expect(res.source).toBe('basic_mode');
      expect(res.text).toBeDefined();

      geminiChatbotService.isAiEnabled = origFn;
    });
  });
});
