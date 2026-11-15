const { extractEntities, extractAmounts, extractPercentages, extractTimeframes } = require('../../src/services/chatbot/entityExtractor');
const { findBestMatch, knowledgeBase } = require('../../src/services/chatbot/knowledgeMatcher');
const { ChatbotService } = require('../../src/services/chatbot/chatbot.service');
const { ChatMemory } = require('../../src/services/chatbot/chatMemory');

describe('FinWise Chatbot "Fin" Brain Unit Tests', () => {
  let chatbotService;
  let chatMemory;

  beforeEach(() => {
    chatbotService = new ChatbotService();
    chatMemory = new ChatMemory(5);
  });

  // ── 1. ENTITY EXTRACTOR TESTS (Amounts, Percentages, Tenures) ──
  describe('Entity Extractor: Indian Currency & Values', () => {
    test('extracts "k" notation correctly (5k, 50k, 12.5k)', () => {
      expect(extractAmounts('save 5k per month')[0]).toBe(5000);
      expect(extractAmounts('buy a 50k laptop')[0]).toBe(50000);
      expect(extractAmounts('12.5k salary')[0]).toBe(12500);
    });

    test('extracts Lakh notation correctly (1L, 1.5 lakh, 10 lakhs, 2 lac)', () => {
      expect(extractAmounts('1L fund')[0]).toBe(100000);
      expect(extractAmounts('1.5 lakh car downpayment')[0]).toBe(150000);
      expect(extractAmounts('10 lakhs corpus')[0]).toBe(1000000);
      expect(extractAmounts('2 lac gold')[0]).toBe(200000);
    });

    test('extracts Crore notation correctly (1 cr, 2.5 crore, 5 crores)', () => {
      expect(extractAmounts('retire with 1 cr')[0]).toBe(10000000);
      expect(extractAmounts('2.5 crore target')[0]).toBe(25000000);
      expect(extractAmounts('5 crores')[0]).toBe(50000000);
    });

    test('extracts Rupee symbol and formatted numbers (₹5,000, Rs. 10,000)', () => {
      expect(extractAmounts('save ₹5,000 each month')[0]).toBe(5000);
      expect(extractAmounts('Rs. 10,000 EMI')[0]).toBe(10000);
      expect(extractAmounts('INR 25000 surplus')[0]).toBe(25000);
    });

    test('extracts percentages accurately', () => {
      expect(extractPercentages('return of 12% p.a.')[0]).toBe(12);
      expect(extractPercentages('inflation is 6.5 percent')[0]).toBe(6.5);
    });

    test('extracts durations in years and months', () => {
      const yrMatch = extractTimeframes('for 10 years');
      expect(yrMatch[0]).toEqual({ value: 10, unit: 'years' });

      const yrMatchHindi = extractTimeframes('5 saal ke liye');
      expect(yrMatchHindi[0]).toEqual({ value: 5, unit: 'years' });

      const moMatch = extractTimeframes('in 6 months');
      expect(moMatch[0]).toEqual({ value: 6, unit: 'months' });
    });
  });

  // ── 2. INTENT ROUTING & FINANCIAL MATH EXECUTION ──
  describe('Intent Routing & Financial Calculations', () => {
    test('routes SIP calculation and returns correct compound math', async () => {
      const res = await chatbotService.processMessage(null, 'If I save ₹5,000 for 10 years at 12%?');
      expect(res.text).toContain('5,000');
      expect(res.text).toContain('11,61,695'); // exact annuity due FV for 5k/10y/12%
      expect(res.card.type).toBe('sip_calculation');
      expect(res.card.totalInvested).toBe(600000);
      expect(res.card.futureValue).toBe(1161695);
      expect(res.card.wealthGain).toBe(561695);
      expect(res.actionHint).toBe('open_sip_calculator');
    });

    test('handles messy casing in SIP query ("SiP oF 10K fOr 5 yRs")', async () => {
      const res = await chatbotService.processMessage(null, 'SiP oF 10K fOr 5 yRs');
      expect(res.card).toBeDefined();
      expect(res.card.monthlyAmount).toBe(10000);
      expect(res.card.years).toBe(5);
      expect(res.text).toContain('₹10,000');
    });

    test('evaluates affordability check for small gadget comfortably within budget', async () => {
      const mockProfile = { monthlyIncome: 60000, fixedExpenses: 25000, existingSavings: 80000 };
      const entities = extractEntities('can I afford a 15k tablet?');
      const res = await chatbotService.handleAffordabilityCheck('user123', mockProfile, entities);
      expect(res.card.isAffordable).toBe(true);
      expect(res.text).toContain('comfortably afford');
      expect(res.card.itemCost).toBe(15000);
    });

    test('evaluates affordability check for heavy purchase recommending saving first', async () => {
      const mockProfile = { monthlyIncome: 35000, fixedExpenses: 22000, existingSavings: 15000 };
      const entities = extractEntities('can I buy a 1.2L bike?');
      const res = await chatbotService.handleAffordabilityCheck('user123', mockProfile, entities);
      expect(res.card.isAffordable).toBe(false);
      expect(res.text).toContain('heavy');
      expect(res.card.itemCost).toBe(120000);
    });

    test('handles greetings warmly and returns quick replies', async () => {
      const res = await chatbotService.processMessage(null, 'hello fin!');
      expect(res.text).toContain('Fin');
      expect(res.text).toContain('money buddy');
      expect(res.quickReplies.length).toBeGreaterThan(0);
    });

    test('handles empty or blank message gracefully', async () => {
      const res = await chatbotService.processMessage(null, '   ');
      expect(res.text).toContain("didn't catch that");
      expect(res.quickReplies.length).toBeGreaterThan(0);
    });
  });

  // ── 3. CONVERSATIONAL MEMORY TESTS ──
  describe('Conversation Memory (Last 5 Turns)', () => {
    test('stores and limits history to 5 turns (10 messages max)', () => {
      const mem = new ChatMemory(5);
      for (let i = 1; i <= 8; i++) {
        mem.addMessage('testUser', 'user', `Question ${i}`);
        mem.addMessage('testUser', 'fin', `Answer ${i}`);
      }
      const history = mem.getHistory('testUser');
      expect(history.length).toBe(10); // 5 turns * 2
      expect(history[history.length - 1].text).toBe('Answer 8');
      expect(history[0].text).toBe('Question 4');
    });

    test('clears user history on demand', () => {
      const mem = new ChatMemory(5);
      mem.addMessage('user456', 'user', 'Hi');
      mem.addMessage('user456', 'fin', 'Hello');
      expect(mem.getHistory('user456').length).toBe(2);

      mem.clear('user456');
      expect(mem.getHistory('user456').length).toBe(0);
    });
  });

  // ── 4. KNOWLEDGE BASE MATCHING (85+ QUESTIONS TESTED) ──
  describe('Knowledge Base: Exhaustive 85+ Question Coverage', () => {
    test('knowledge base contains at least 80 valid entries', () => {
      expect(knowledgeBase.length).toBeGreaterThanOrEqual(80);
    });

    // Loop through all entries and verify matching accuracy
    knowledgeBase.forEach((entry, idx) => {
      test(`KB [${idx + 1}/${knowledgeBase.length}] matches question: "${entry.id}"`, () => {
        const match = findBestMatch(entry.question);
        expect(match).not.toBeNull();
        expect(match.id).toBe(entry.id);
        expect(match.answer.length).toBeGreaterThan(20);
        expect(match.confidence).toBeGreaterThanOrEqual(0.35);
      });
    });

    // Test specific Hinglish variations
    test('matches Hinglish "bachat kaise kare"', () => {
      const match = findBestMatch('mahine me bachat kaise kare');
      expect(match).not.toBeNull();
      expect(match.id).toBe('bachat-kaise-kare');
    });

    test('matches Hinglish "paisa kahan lagaye"', () => {
      const match = findBestMatch('nivesh ke liye paisa kahan lagaye');
      expect(match).not.toBeNull();
      expect(match.id).toBe('paisa-kahan-lagaye');
    });

    test('matches Hinglish "kitna invest karu"', () => {
      const match = findBestMatch('salary me se kitna invest karu har mahine');
      expect(match).not.toBeNull();
      expect(match.id).toBe('kitna-invest-kare');
    });

    test('matches Hinglish "credit card safe hai kya"', () => {
      const match = findBestMatch('kya credit card lena chahiye first job me');
      expect(match).not.toBeNull();
      expect(match.id).toBe('credit-card-lena-chahiye-kya');
    });

    test('matches Hinglish "SIP kya hota hai"', () => {
      const match = findBestMatch('sip kya hota hai aur fayda kya hai');
      expect(match).not.toBeNull();
      expect(match.id).toBe('sip-kya-hai-hinglish');
    });
  });
});
