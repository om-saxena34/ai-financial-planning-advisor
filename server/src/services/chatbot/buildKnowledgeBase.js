const fs = require('fs');
const path = require('path');

const KNOWLEDGE_BASE = [
  // ── 1. BASICS & BUDGETING (1-12) ──
  {
    id: 'what-is-emergency-fund',
    category: 'basics',
    keywords: ['emergency fund', 'emergency cushion', 'rainy day fund', 'backup money', 'aapatkaal', 'emergency paise'],
    question: 'What is an emergency fund and why do I need one?',
    answer: 'An emergency fund is money kept safely in a bank account for real surprises like medical bills or sudden job loss. A healthy target is 3 to 6 months of your basic living expenses.',
    actionHint: 'open_health_score',
    quickReplies: ['Where should I keep it?', 'How is my emergency cushion?']
  },
  {
    id: 'what-is-50-30-20-rule',
    category: 'basics',
    keywords: ['50 30 20', 'budget rule', 'budgeting method', 'how to split salary', 'salary division', '50-30-20'],
    question: 'What is the 50-30-20 budgeting rule?',
    answer: 'The 50-30-20 rule is a simple guide for your monthly salary: 50% for needs (rent, groceries, bills), 30% for wants (eating out, entertainment, shopping), and 20% saved and invested for your future.',
    actionHint: 'open_dashboard',
    quickReplies: ['Check my spending pattern', 'How to save 20%?']
  },
  {
    id: 'how-inflation-works',
    category: 'basics',
    keywords: ['inflation', 'mehangai', 'prices rising', 'purchasing power', 'rupee value'],
    question: 'What is inflation and how does it hurt my money?',
    answer: 'Inflation means prices rise over time. If inflation is 6% per year, an item costing ₹100 today will cost ₹106 next year. If your money just sits in zero-interest cash, you lose buying power every year.',
    actionHint: 'open_sip_calculator',
    quickReplies: ['How to beat inflation?', 'What is compound interest?']
  },
  {
    id: 'how-compound-interest-works',
    category: 'basics',
    keywords: ['compound interest', 'compounding', 'magic of compounding', 'exponential growth', 'chakravarthi vyaj'],
    question: 'How does compound interest work?',
    answer: 'Compounding means you earn interest on both your initial deposit and the interest you already earned. Over 10 to 20 years, the interest you earn becomes much bigger than the money you put in.',
    actionHint: 'open_compound_calculator',
    quickReplies: ['Try Compound Calculator', 'What is an SIP?']
  },
  {
    id: 'what-is-net-worth',
    category: 'basics',
    keywords: ['net worth', 'total wealth', 'assets minus debt', 'how much am i worth'],
    question: 'What does net worth mean?',
    answer: 'Net worth is what you own (savings, investments, property) minus what you owe (credit card debt, student loans, EMIs). As you save more and pay down loans, your net worth grows.',
    actionHint: 'open_dashboard',
    quickReplies: ['How is my score?', 'How to increase net worth?']
  },
  {
    id: 'saving-vs-investing',
    category: 'basics',
    keywords: ['saving vs investing', 'save or invest', 'difference saving investing', 'bachat aur nivesh'],
    question: 'What is the difference between saving and investing?',
    answer: 'Saving is setting aside safe cash for short-term needs and emergencies. Investing is putting money into assets like mutual funds or stocks to beat inflation and build long-term wealth.',
    actionHint: 'open_sip_calculator',
    quickReplies: ['What is an SIP?', 'Where to keep emergency fund?']
  },
  {
    id: 'what-is-cash-flow',
    category: 'basics',
    keywords: ['cash flow', 'money in money out', 'inflow outflow', 'monthly surplus'],
    question: 'What is cash flow in simple terms?',
    answer: 'Cash flow is simply the money coming in (your salary or freelance income) versus the money going out (bills, shopping, rent). Positive cash flow means you have money left over to save each month.',
    actionHint: 'open_transactions',
    quickReplies: ['See my monthly cash flow', 'Add a transaction']
  },
  {
    id: 'what-is-financial-health-score',
    category: 'basics',
    keywords: ['health score', 'financial health score', 'finwise score', 'score out of 100', 'swasthya score'],
    question: 'What is the FinWise Health Score (0–100)?',
    answer: 'Your Health Score is a single number from 0 to 100 that checks 6 pillars: your savings rate, emergency cushion, debt payments, non-essential spending, investment consistency, and goal progress.',
    actionHint: 'open_health_score',
    quickReplies: ['How is my score calculated?', 'Ways to boost score']
  },
  {
    id: 'liquid-cash-meaning',
    category: 'basics',
    keywords: ['liquid cash', 'liquidity', 'liquid funds', 'access money quickly'],
    question: 'What does liquid money or liquidity mean?',
    answer: 'Liquid money is cash you can withdraw and use immediately without penalty, like money in your savings account or ATM. Land and locked fixed deposits are less liquid.',
    actionHint: 'open_dashboard',
    quickReplies: ['Where to keep emergency fund?', 'What are liquid funds?']
  },
  {
    id: 'how-to-start-budgeting',
    category: 'basics',
    keywords: ['how to budget', 'first budget', 'beginner budgeting', 'budget kaise banaye'],
    question: 'How do I start budgeting if I am a beginner?',
    answer: 'Start simple: for 30 days, track every rupee you spend. Group your costs into Needs, Wants, and Savings. Once you see where your money leaks, set a weekly spending limit.',
    actionHint: 'open_transactions',
    quickReplies: ['What is 50-30-20?', 'Track an expense']
  },
  {
    id: 'discretionary-expenses-meaning',
    category: 'basics',
    keywords: ['discretionary', 'non-essential', 'wants vs needs', 'kharcha control'],
    question: 'What are discretionary expenses?',
    answer: 'Discretionary expenses are optional "wants" that you can live without in a pinch, such as food delivery, weekend movies, clothes shopping, or streaming subscriptions.',
    actionHint: 'open_transactions',
    quickReplies: ['Cut non-essentials in simulator', 'See my top expenses']
  },
  {
    id: 'lifestyle-creep',
    category: 'basics',
    keywords: ['lifestyle creep', 'lifestyle inflation', 'earning more spending more', 'kharcha badhna'],
    question: 'What is lifestyle creep?',
    answer: 'Lifestyle creep happens when your salary increases and your spending immediately rises to match it. A smart habit is saving at least half of every salary raise before upgrading your lifestyle.',
    actionHint: 'open_what_if',
    quickReplies: ['Try What-If Simulator', 'Set a savings goal']
  },

  // ── 2. INVESTING & SIP (13-28) ──
  {
    id: 'what-is-sip',
    category: 'investing',
    keywords: ['sip', 'systematic investment plan', 'what is sip', 'sip kya hai', 'sip meaning', 'monthly sip'],
    question: 'What is an SIP (Systematic Investment Plan)?',
    answer: 'An SIP is a method of investing a fixed amount (like ₹1,000 or ₹5,000) into mutual funds every month automatically. It builds discipline and averages out market ups and downs.',
    actionHint: 'open_sip_calculator',
    quickReplies: ['Calculate my SIP growth', 'How much to invest in SIP?']
  },
  {
    id: 'step-up-sip-meaning',
    category: 'investing',
    keywords: ['step up sip', 'top up sip', 'step-up', 'increase sip yearly', 'badhti sip'],
    question: 'What is a Step-Up SIP and why is it powerful?',
    answer: 'A Step-Up SIP automatically increases your monthly investment by 5% or 10% each year as your salary increases. Over 10 to 15 years, it can nearly double your final wealth compared to a flat SIP.',
    actionHint: 'open_sip_calculator',
    quickReplies: ['Test Step-Up in Calculator', 'How to pick an SIP amount?']
  },
  {
    id: 'what-is-mutual-fund',
    category: 'investing',
    keywords: ['mutual fund', 'mf', 'what is mutual fund', 'mutual fund kya hai'],
    question: 'What is a mutual fund?',
    answer: 'A mutual fund pools money from thousands of investors to buy a diversified basket of stocks or bonds managed by professionals. This gives you instant diversification with small amounts.',
    actionHint: 'open_sip_calculator',
    quickReplies: ['What is an index fund?', 'Direct vs Regular funds?']
  },
  {
    id: 'what-is-index-fund',
    category: 'investing',
    keywords: ['index fund', 'nifty 50', 'sensex fund', 'passive investing', 'nifty fund'],
    question: 'What is an index fund and why is it recommended for beginners?',
    answer: 'An index fund simply copies the top 50 biggest companies in India (Nifty 50). It has ultra-low management fees and historically beats most active funds over 10+ year time horizons.',
    actionHint: 'open_sip_calculator',
    quickReplies: ['What return to expect?', 'What is an SIP?']
  },
  {
    id: 'fd-vs-mutual-fund',
    category: 'investing',
    keywords: ['fd vs mutual fund', 'fixed deposit or mutual fund', 'fd accha hai ya mf', 'fd mutual fund difference'],
    question: 'Should I put money in Fixed Deposits (FD) or Mutual Funds?',
    answer: 'FDs are guaranteed and safe, making them ideal for short-term goals (under 3 years) or emergency cash (~6.5-7%). Equity mutual funds carry short-term ups and downs but beat inflation over 5+ years (~11-13%).',
    actionHint: 'open_sip_calculator',
    quickReplies: ['Calculate SIP returns', 'Check FD compounding']
  },
  {
    id: 'what-is-ppf',
    category: 'investing',
    keywords: ['ppf', 'public provident fund', 'ppf scheme', 'ppf tax benefit', 'ppf safe'],
    question: 'What is PPF (Public Provident Fund)?',
    answer: 'PPF is a 15-year government-backed savings scheme currently offering around 7.1% interest. It has triple tax-exempt status (EEE: investment, interest, and maturity are all completely tax-free).',
    actionHint: 'open_compound_calculator',
    quickReplies: ['Compare with mutual funds', 'What is 80C tax saving?']
  },
  {
    id: 'what-is-recurring-deposit-rd',
    category: 'investing',
    keywords: ['rd', 'recurring deposit', 'bank rd', 'rd interest'],
    question: 'What is a Recurring Deposit (RD)?',
    answer: 'An RD is a bank scheme where you deposit a fixed sum every month for a fixed duration (like 1 to 5 years) and earn guaranteed interest similar to a Fixed Deposit.',
    actionHint: 'open_compound_calculator',
    quickReplies: ['Calculate RD interest', 'Difference between RD and SIP?']
  },
  {
    id: 'direct-vs-regular-mutual-fund',
    category: 'investing',
    keywords: ['direct vs regular', 'direct mutual fund', 'regular mutual fund', 'commission in mutual funds'],
    question: 'What is the difference between Direct and Regular mutual funds?',
    answer: 'Direct plans have zero broker commission, so you keep 100% of the returns. Regular plans pay a commission to an agent every single year, which can eat 15–20% of your total wealth over 20 years.',
    actionHint: 'open_sip_calculator',
    quickReplies: ['How to buy direct plans?', 'Calculate SIP']
  },
  {
    id: 'large-cap-vs-small-cap',
    category: 'investing',
    keywords: ['large cap', 'mid cap', 'small cap', 'market cap differences', 'which fund to choose'],
    question: 'What is the difference between Large-cap, Mid-cap, and Small-cap funds?',
    answer: 'Large-cap funds invest in India’s 100 biggest, most stable companies (lower risk, steady growth). Small-cap funds invest in smaller growing companies (higher returns potential, but sharp drops during market corrections).',
    actionHint: 'open_sip_calculator',
    quickReplies: ['What is an index fund?', 'Set up an investment goal']
  },
  {
    id: 'how-to-start-with-500-rupees',
    category: 'investing',
    keywords: ['500 rupees', 'start with 500', 'low money investment', 'kam paise me nivesh', '500 se shuru'],
    question: 'Can I start investing with just ₹500 a month?',
    answer: 'Yes! Most top Nifty 50 and large-cap index funds allow monthly SIPs starting at just ₹100 or ₹500. Starting small builds the habit early, and you can step up the amount later.',
    actionHint: 'open_sip_calculator',
    quickReplies: ['Simulate ₹500 SIP', 'How does compounding work?']
  },
  {
    id: 'sovereign-gold-bonds-sgb',
    category: 'investing',
    keywords: ['sgb', 'gold bonds', 'gold investment', 'sovereign gold bond', 'digital gold'],
    question: 'Are Sovereign Gold Bonds (SGB) good for gold investment?',
    answer: 'SGBs are issued by the RBI. They track the price of gold, pay 2.5% extra interest every year into your bank account, and carry zero capital gains tax if held till maturity (8 years).',
    actionHint: 'open_compound_calculator',
    quickReplies: ['Compare Gold with Mutual Funds', 'What is PPF?']
  },
  {
    id: 'expected-return-rate',
    category: 'investing',
    keywords: ['expected return', 'return rate', 'how much return', 'equity return india'],
    question: 'What is a realistic yearly return to expect from Indian mutual funds?',
    answer: 'For a broad Indian equity index fund over a 7 to 10 year period, 11% to 13% per year is a realistic long-term expectation. Avoid anyone promising guaranteed 25%+ returns; that usually indicates high risk or a scam.',
    actionHint: 'open_sip_calculator',
    quickReplies: ['Run a SIP calculation at 12%', 'Calculate compound growth']
  },
  {
    id: 'dividend-vs-growth-option',
    category: 'investing',
    keywords: ['growth vs idcw', 'growth option', 'dividend mutual fund', 'idcw meaning'],
    question: 'Should I choose Growth or IDCW (Dividend) in a mutual fund?',
    answer: 'For wealth building, always choose the Growth option. It automatically reinvests all earnings to compound faster. The IDCW (dividend) option pays out small cash amounts which gets taxed at your slab rate.',
    actionHint: 'open_sip_calculator',
    quickReplies: ['What is compound interest?', 'What is an SIP?']
  },
  {
    id: 'cagr-meaning',
    category: 'investing',
    keywords: ['cagr', 'compound annual growth rate', 'cagr meaning', 'how to read return'],
    question: 'What does CAGR mean in simple terms?',
    answer: 'CAGR stands for Compound Annual Growth Rate. It tells you the exact yearly growth rate of an investment as if it grew at a smooth, steady rate every single year.',
    actionHint: 'open_compound_calculator',
    quickReplies: ['Try Compound Calculator', 'What is an SIP?']
  },
  {
    id: 'market-crash-advice',
    category: 'investing',
    keywords: ['market crash', 'market down', 'loss in mutual funds', 'market gir gaya', 'nuksan'],
    question: 'What should I do when the stock market crashes and my investments drop?',
    answer: 'Don’t panic or stop your SIP! Market drops are normal. When markets are down, your monthly SIP buys more fund units at discounted prices, which boosts your wealth when the market recovers.',
    actionHint: 'open_sip_calculator',
    quickReplies: ['How does SIP averaging work?', 'Check my long-term goals']
  },

  // ── 3. DEBT, LOANS & CARDS (29-38) ──
  {
    id: 'good-debt-vs-bad-debt',
    category: 'debt_loans',
    keywords: ['good debt', 'bad debt', 'good loan bad loan', 'credit card debt', 'loan types'],
    question: 'What is the difference between good debt and bad debt?',
    answer: 'Good debt has low interest and helps build future income (like student loans or home down-payments). Bad debt has high interest (like 36–42% on credit cards or personal loans for gadgets) and drains your future wealth.',
    actionHint: 'open_health_score',
    quickReplies: ['Check my loan burden (DTI)', 'How to clear credit card debt?']
  },
  {
    id: 'credit-card-minimum-due-trap',
    category: 'debt_loans',
    keywords: ['minimum due', 'credit card trap', 'minimum amount due', 'credit card interest rate'],
    question: 'Why should I never pay only the "Minimum Amount Due" on a credit card?',
    answer: 'Paying only the minimum due incurs huge interest (up to 40% per year) on the entire remaining balance, plus all new purchases lose their interest-free period. Always pay the full statement balance on time.',
    actionHint: 'open_transactions',
    quickReplies: ['What is a CIBIL score?', 'How to improve credit score?']
  },
  {
    id: 'what-is-cibil-score',
    category: 'debt_loans',
    keywords: ['cibil score', 'credit score', 'cibil kya hai', 'credit score check', 'cibil 750'],
    question: 'What is a CIBIL credit score and what is a good number?',
    answer: 'Your CIBIL score is a 3-digit number from 300 to 900 showing how reliably you repay loans and credit cards. A score above 750 gets you fast loan approvals and lower interest rates.',
    actionHint: 'open_health_score',
    quickReplies: ['How to boost CIBIL?', 'Safe credit card usage']
  },
  {
    id: 'debt-snowball-vs-avalanche',
    category: 'debt_loans',
    keywords: ['snowball', 'avalanche', 'clear debt fast', 'pay off loans', 'karza kaise utare'],
    question: 'What is the fastest way to clear multiple loans (Snowball vs Avalanche)?',
    answer: 'The Avalanche method pays off the highest interest loan first (saves maximum money). The Snowball method pays off the smallest balance first (gives quick psychological wins). Both work—pick the one you can stick to.',
    actionHint: 'open_health_score',
    quickReplies: ['Check my debt payments share', 'What is good vs bad debt?']
  },
  {
    id: 'dti-meaning',
    category: 'debt_loans',
    keywords: ['dti', 'debt to income', 'loan emi percentage', 'kitna loan le sakte hai'],
    question: 'What is Debt-to-Income (DTI) ratio?',
    answer: 'DTI is the percentage of your monthly income that goes toward paying loan EMIs and credit card bills. A healthy DTI is under 30% to 35%. Above 40% leaves very little room for savings.',
    actionHint: 'open_health_score',
    quickReplies: ['Check my DTI score', 'Affordability check for new EMI']
  },
  {
    id: 'education-loan-tips',
    category: 'debt_loans',
    keywords: ['education loan', 'student loan', 'study loan', 'padhai ka loan'],
    question: 'How should I manage my education loan after getting a job?',
    answer: 'Use the moratorium period wisely. Once your salary starts, pay your EMI on time to build your CIBIL score, and check Section 80E tax deductions on the interest paid for up to 8 years.',
    actionHint: 'open_goals',
    quickReplies: ['Set loan payoff goal', 'What is 80E tax deduction?']
  },
  {
    id: 'prepaying-home-loan',
    category: 'debt_loans',
    keywords: ['prepay home loan', 'home loan prepayment', 'close loan early', 'emi kam kare'],
    question: 'Does prepaying a home loan save money?',
    answer: 'Yes! Paying just one extra EMI per year or increasing your EMI by 5% every year can reduce a 20-year home loan by 5 to 7 years and save lakhs in interest.',
    actionHint: 'open_compound_calculator',
    quickReplies: ['Calculate compounding interest', 'What is good debt?']
  },
  {
    id: 'credit-card-usage-rule',
    category: 'debt_loans',
    keywords: ['credit card rule', 'credit utilization', 'limit 30 percent', 'card limit'],
    question: 'What is the 30% credit card utilization rule?',
    answer: 'Try to spend under 30% of your total credit card limit (e.g. spend under ₹15,000 if your limit is ₹50,000). Spending close to the limit makes banks think you are hungry for credit and drops your score.',
    actionHint: 'open_health_score',
    quickReplies: ['How to boost CIBIL?', 'Pay credit card on time']
  },
  {
    id: 'buy-now-pay-later-bnpl',
    category: 'debt_loans',
    keywords: ['bnpl', 'buy now pay later', 'simpl', 'lazypay', 'amazon pay later'],
    question: 'Are Buy Now Pay Later (BNPL) apps safe to use?',
    answer: 'BNPL apps are short-term loans. If you pay on time they are convenient, but missing a due date triggers penalty fees and gets reported to credit bureaus, hurting your CIBIL score.',
    actionHint: 'open_transactions',
    quickReplies: ['Track daily expenses', 'Credit card vs BNPL']
  },
  {
    id: 'no-cost-emi-truth',
    category: 'debt_loans',
    keywords: ['no cost emi', 'zero cost emi', 'zero percent emi', 'is no cost emi free'],
    question: 'Is "No-Cost EMI" really free?',
    answer: 'Not completely! The merchant gives an upfront discount equal to the interest, but you still pay 18% GST on the interest amount, plus many credit cards charge a processing fee (₹99 to ₹299).',
    actionHint: 'open_what_if',
    quickReplies: ['Check affordability in simulator', 'What is bad debt?']
  },

  // ── 4. EMERGENCY SAVINGS & SAFETY (39-46) ──
  {
    id: 'how-much-emergency-fund',
    category: 'emergency_savings',
    keywords: ['how much emergency fund', 'emergency fund size', 'kitna emergency fund chahiye', 'months of expenses'],
    question: 'How many months of expenses should be in my emergency fund?',
    answer: 'If you have a steady salaried job, aim for 3 to 6 months of basic living expenses (rent + food + EMIs). If you are a freelancer or have unstable income, aim for 6 to 9 months.',
    actionHint: 'open_health_score',
    quickReplies: ['Check my emergency buffer', 'Where should I keep it?']
  },
  {
    id: 'where-to-park-emergency-fund',
    category: 'emergency_savings',
    keywords: ['where to keep emergency fund', 'park emergency money', 'best place emergency cash', 'savings or fd'],
    question: 'Where is the best place to keep my emergency fund?',
    answer: 'Keep 1 month of expenses in your regular savings account, and put the remaining 2 to 5 months into an instant-redemption liquid mutual fund or auto-sweep Fixed Deposit for safety and easy access.',
    actionHint: 'open_goals',
    quickReplies: ['Create an emergency goal', 'What are liquid funds?']
  },
  {
    id: 'when-to-use-emergency-fund',
    category: 'emergency_savings',
    keywords: ['when to use emergency fund', 'valid emergency', 'can i use emergency fund for shopping'],
    question: 'What counts as a real emergency to use this fund?',
    answer: 'A real emergency is Unexpected, Necessary, and Urgent (like hospital bills, urgent bike/car repair, or job loss). A big festival sale, flight tickets for vacation, or a new smartphone are not emergencies.',
    actionHint: 'open_goals',
    quickReplies: ['Set up a gadget savings goal', 'Check my health score']
  },
  {
    id: 'auto-sweep-facility',
    category: 'emergency_savings',
    keywords: ['auto sweep', 'sweep in fd', 'mod balance', 'auto sweep account'],
    question: 'What is an auto-sweep bank account?',
    answer: 'Auto-sweep automatically moves any balance in your savings account above a chosen limit (e.g. ₹25,000) into higher-interest Fixed Deposits. If you spend money via UPI or card, it breaks just enough FD instantly without penalty.',
    actionHint: 'open_dashboard',
    quickReplies: ['Where to keep emergency fund?', 'Difference between FD and savings account']
  },
  {
    id: 'medical-emergency-prep',
    category: 'emergency_savings',
    keywords: ['medical emergency', 'hospital bill', 'doctor cost', 'illness backup'],
    question: 'How do I protect my savings from a sudden medical emergency?',
    answer: 'Get a standalone health insurance policy of at least ₹5–10 Lakhs. Relying only on personal savings for medical emergencies can wipe out years of disciplined investing in just a few days.',
    actionHint: 'open_recommendations',
    quickReplies: ['What is health insurance?', 'Tips for young adults']
  },
  {
    id: 'job-loss-plan',
    category: 'emergency_savings',
    keywords: ['job loss', 'layoff', 'unemployed backup', 'naukri chali gayi'],
    question: 'How do I prepare financially for a possible job change or layoff?',
    answer: 'Build a full 6-month living expense cushion, freeze non-essential subscriptions immediately, avoid taking on any new EMIs, and keep your resume and professional network up to date.',
    actionHint: 'open_what_if',
    quickReplies: ['Try What-If Simulator', 'Check current emergency months']
  },
  {
    id: 'rebuilding-emergency-fund',
    category: 'emergency_savings',
    keywords: ['rebuild emergency fund', 'used my emergency fund', 'replenish fund'],
    question: 'What should I do after I spend my emergency fund on a crisis?',
    answer: 'Pause non-essential shopping and extra investments for a few months, and direct your monthly savings entirely into replenishing your emergency fund until it hits your 3–6 month target again.',
    actionHint: 'open_goals',
    quickReplies: ['Add money to emergency goal', 'Check budget']
  },
  {
    id: 'liquid-funds-safety',
    category: 'emergency_savings',
    keywords: ['liquid funds safe', 'liquid mutual fund risk', 'can liquid funds lose money'],
    question: 'Are liquid mutual funds safe for emergency savings?',
    answer: 'Liquid mutual funds invest in very short-term government and corporate debt (up to 91 days). They are very safe, have no lock-in, offer instant withdrawal up to ₹50,000, and typically earn 6–7% per year.',
    actionHint: 'open_goals',
    quickReplies: ['Where to park emergency cash?', 'What is an SIP?']
  },

  // ── 5. BANKING & UPI SAFETY (47-54) ──
  {
    id: 'upi-safety-rules',
    category: 'banking_upi',
    keywords: ['upi safety', 'upi pin scam', 'money received pin', 'gpay scam', 'phonepe fraud'],
    question: 'Do I ever need to enter my UPI PIN to receive money?',
    answer: 'NEVER! Entering your UPI PIN is only needed when money leaves your bank account. If anyone asks you to enter your PIN or scan a QR code to "receive cashback or payment", it is a 100% scam.',
    actionHint: 'open_transactions',
    quickReplies: ['UPI daily limits', 'Safe banking habits']
  },
  {
    id: 'upi-daily-limits',
    category: 'banking_upi',
    keywords: ['upi limit', 'gpay limit', 'daily upi transfer limit', 'kitna transfer kar sakte hai upi'],
    question: 'What is the daily transaction limit on UPI?',
    answer: 'The NPCI standard limit is ₹1 Lakh per day (up to 20 transactions in 24 hours). Higher limits (up to ₹5 Lakh) apply for hospital bills, tax payments, and college fees.',
    actionHint: 'open_transactions',
    quickReplies: ['Record a UPI transaction', 'UPI safety tips']
  },
  {
    id: 'bank-insurance-dicgc',
    category: 'banking_upi',
    keywords: ['bank insurance', 'dicgc', 'bank doob gaya to', '5 lakh bank insurance'],
    question: 'Is my money in an Indian bank insured if the bank fails?',
    answer: 'Yes. Under the RBI DICGC scheme, your deposits (principal + interest) are insured up to ₹5 Lakh per depositor per bank across all branches.',
    actionHint: 'open_dashboard',
    quickReplies: ['Safe banking practices', 'Where to keep savings?']
  },
  {
    id: 'separate-accounts-strategy',
    category: 'banking_upi',
    keywords: ['two bank accounts', 'three bank accounts', 'split bank accounts', 'salary account'],
    question: 'Should I have more than one bank account?',
    answer: 'Yes! A two-account strategy works best: Account 1 for salary and investments (don’t link this to shopping apps), and Account 2 with a small balance linked to UPI for daily chai, food, and cab expenses.',
    actionHint: 'open_transactions',
    quickReplies: ['Track daily expenses', 'Budgeting tips']
  },
  {
    id: 'avoid-lottery-phishing-scams',
    category: 'banking_upi',
    keywords: ['phishing', 'lottery message', 'otp scam', 'bank sms fraud', 'kyc scam'],
    question: 'How do I spot fake bank messages and KYC scams?',
    answer: 'Banks never send SMS messages with links to update KYC or threaten account closure in 24 hours. Never share your OTP, card CVV, or passwords with anyone, even if they claim to call from your bank.',
    actionHint: 'open_dashboard',
    quickReplies: ['UPI safety rules', 'Credit card security']
  },
  {
    id: 'savings-account-interest-rate',
    category: 'banking_upi',
    keywords: ['savings account interest', 'bank interest rate', 'savings interest taxable'],
    question: 'How much interest do regular savings accounts pay?',
    answer: 'Most big banks pay 2.7% to 3.5% per year, while some newer private/small finance banks offer 5% to 7% on higher balances. Interest up to ₹10,000 per year is tax-free under Section 80TTA.',
    actionHint: 'open_dashboard',
    quickReplies: ['Auto-sweep facility', 'What is inflation?']
  },
  {
    id: 'chargeback-disputed-transactions',
    category: 'banking_upi',
    keywords: ['wrong upi transfer', 'galat upi transfer', 'dispute transaction', 'chargeback'],
    question: 'What should I do if I send money to the wrong UPI ID?',
    answer: 'First contact the recipient politely. If uncooperative, immediately file a dispute in your UPI app (GPay/PhonePe), inform your bank within 24 hours, and raise a complaint on the NPCI portal (npci.org.in).',
    actionHint: 'open_transactions',
    quickReplies: ['UPI safety tips', 'See my transactions']
  },
  {
    id: 'credit-card-international-switch',
    category: 'banking_upi',
    keywords: ['international transaction switch', 'card safety', 'switch off international', 'card limit set'],
    question: 'How can I prevent unauthorized credit or debit card transactions?',
    answer: 'In your banking mobile app, turn off international transactions and contactless (tap-and-pay) when not in use, and set a daily domestic spending limit matching your routine.',
    actionHint: 'open_dashboard',
    quickReplies: ['Credit card safety', 'What is CIBIL score?']
  },

  // ── 6. INSURANCE ESSENTIALS (55-62) ──
  {
    id: 'term-insurance-vs-ulip',
    category: 'insurance',
    keywords: ['term insurance', 'ulip', 'lic policy', 'term plan vs endowment', 'term plan'],
    question: 'Why is Pure Term Insurance better than a mixed investment plan (ULIP or Endowment)?',
    answer: 'Never mix investment with insurance! Pure term insurance gives huge financial protection (like ₹1 Crore cover for just ₹600–800/month for young adults). Mixed plans give low cover and poor returns (4–6%). Keep them separate.',
    actionHint: 'open_recommendations',
    quickReplies: ['When to buy term insurance?', 'What is health insurance?']
  },
  {
    id: 'health-insurance-for-young-adults',
    category: 'insurance',
    keywords: ['health insurance young', 'mediclaim', 'do i need health insurance at 23', 'family floater'],
    question: 'Why do I need personal health insurance if I am young and healthy?',
    answer: 'Buying young locks in very cheap premiums with no pre-existing illness waiting periods. Plus, company-provided insurance vanishes the moment you switch jobs or take a career break.',
    actionHint: 'open_health_score',
    quickReplies: ['Check my financial health', 'How much health cover is enough?']
  },
  {
    id: 'how-much-health-cover',
    category: 'insurance',
    keywords: ['how much health insurance', 'cover size', '5 lakh or 10 lakh', 'super top up'],
    question: 'How much health insurance cover should a beginner get in India?',
    answer: 'A minimum base policy of ₹5 to ₹10 Lakhs is recommended for tier-1/tier-2 cities. You can later add a super top-up policy (e.g. ₹20 Lakh cover) for just ₹2,000–3,000 per year.',
    actionHint: 'open_recommendations',
    quickReplies: ['Deductibles explained', 'What is term insurance?']
  },
  {
    id: 'health-insurance-waiting-period',
    category: 'insurance',
    keywords: ['waiting period', 'pre existing disease', 'ped waiting', 'health claim reject'],
    question: 'What is a waiting period in health insurance?',
    answer: 'It is the time (usually 2 to 4 years) you must wait before the policy covers existing illnesses (like diabetes or thyroid). Accidental injuries are covered from day 1, and other hospitalizations after 30 days.',
    actionHint: 'open_recommendations',
    quickReplies: ['Why buy health cover early?', 'Emergency fund tips']
  },
  {
    id: 'when-to-buy-term-insurance',
    category: 'insurance',
    keywords: ['when to buy term plan', 'do i need term plan', 'no dependents term plan'],
    question: 'Do I need term life insurance if I have no dependents?',
    answer: 'If no one depends on your income (no spouse, children, or dependent parents), you don’t need life insurance right now. Buy it as soon as family members rely on your earnings.',
    actionHint: 'open_health_score',
    quickReplies: ['Health insurance for young earners', 'Build emergency cushion']
  },
  {
    id: 'zero-depreciation-car-insurance',
    category: 'insurance',
    keywords: ['zero dep', 'car insurance', 'bike insurance', 'bumper to bumper'],
    question: 'What is Zero Depreciation (Bumper to Bumper) vehicle insurance?',
    answer: 'Zero Dep insurance pays the full cost of replacing damaged plastic, rubber, and metal parts without deducting depreciation when repairing your car or bike after an accident.',
    actionHint: 'open_transactions',
    quickReplies: ['Emergency expense backup', 'Budget for vehicle goals']
  },
  {
    id: 'corporate-vs-personal-health-cover',
    category: 'insurance',
    keywords: ['corporate health cover', 'office health insurance', 'company insurance enough'],
    question: 'Is my employer-provided health insurance enough?',
    answer: 'No. Corporate insurance ends the day you leave your job, covers limited amounts (often ₹2–3 Lakhs), and cannot be renewed when you retire. Always have your own personal base policy.',
    actionHint: 'open_recommendations',
    quickReplies: ['How much health cover is enough?', 'What is term insurance?']
  },
  {
    id: 'critical-illness-insurance',
    category: 'insurance',
    keywords: ['critical illness', 'cancer cover', 'heart attack cover', 'critical illness rider'],
    question: 'What is critical illness insurance?',
    answer: 'Unlike regular health insurance that reimburses hospital bills, critical illness insurance gives you a direct cash lump sum if you are diagnosed with a major disease like cancer, stroke, or heart attack.',
    actionHint: 'open_recommendations',
    quickReplies: ['Health insurance tips', 'Emergency cushion']
  },

  // ── 7. TAXES & GOVERNMENT SCHEMES (63-70) ──
  {
    id: 'old-vs-new-tax-regime',
    category: 'taxes_schemes',
    keywords: ['old vs new tax regime', 'new tax regime', 'tax slab 2024', 'which tax regime is better'],
    question: 'Should a young earner pick the Old or New Tax Regime?',
    answer: 'For incomes up to ₹7.5 Lakh per year, the New Tax Regime is virtually tax-free (with standard deduction and rebate). If you don’t have heavy home loan interest or ₹2L+ in deductions, the New Regime is usually better and simpler.',
    actionHint: 'open_dashboard',
    quickReplies: ['What is Section 80C?', 'What is an ELSS fund?']
  },
  {
    id: 'section-80c-basics',
    category: 'taxes_schemes',
    keywords: ['80c', 'section 80c', 'tax saving 1.5 lakh', '80c investment options'],
    question: 'What is Section 80C and what investments qualify?',
    answer: 'Section 80C (available under the Old Tax Regime) lets you deduct up to ₹1.5 Lakh from taxable income using investments like ELSS mutual funds, PPF, EPF, Life insurance premiums, and 5-year tax-saving FDs.',
    actionHint: 'open_sip_calculator',
    quickReplies: ['What is ELSS?', 'What is PPF?']
  },
  {
    id: 'what-is-elss-mutual-fund',
    category: 'taxes_schemes',
    keywords: ['elss', 'tax saving mutual fund', 'elss lock in', 'elss vs ppf'],
    question: 'What is an ELSS mutual fund?',
    answer: 'ELSS (Equity Linked Savings Scheme) is a mutual fund that qualifies for Section 80C tax deduction. It has the shortest lock-in period among all 80C options (only 3 years) and high potential growth from equity.',
    actionHint: 'open_sip_calculator',
    quickReplies: ['Calculate ELSS returns', 'Compare ELSS with PPF']
  },
  {
    id: 'what-is-nps',
    category: 'taxes_schemes',
    keywords: ['nps', 'national pension system', 'nps 80ccd', 'retirement scheme'],
    question: 'What is NPS (National Pension System)?',
    answer: 'NPS is a government retirement investment program. It mixes equity and debt funds, offers low fees, and gives an additional ₹50,000 tax deduction under Section 80CCD(1B) beyond the 80C limit.',
    actionHint: 'open_compound_calculator',
    quickReplies: ['Retirement goal planning', 'Compound Calculator']
  },
  {
    id: 'capital-gains-tax-mutual-funds',
    category: 'taxes_schemes',
    keywords: ['ltcg', 'stcg', 'mutual fund tax', 'capital gains tax equity'],
    question: 'How are mutual fund profits taxed in India?',
    answer: 'For equity mutual funds held for more than 1 year (LTCG), profits above ₹1.25 Lakh per financial year are taxed at 12.5%. For units sold within 1 year (STCG), profits are taxed at 20%.',
    actionHint: 'open_sip_calculator',
    quickReplies: ['Calculate SIP gains', 'What is index investing?']
  },
  {
    id: 'fd-interest-tds-rules',
    category: 'taxes_schemes',
    keywords: ['tds on fd', 'fd tax', 'form 15g 15h', 'fixed deposit tax'],
    question: 'Is Fixed Deposit (FD) interest taxable?',
    answer: 'Yes! FD interest is fully added to your income and taxed at your regular slab rate. Banks deduct 10% TDS automatically if your yearly interest from a bank exceeds ₹40,000 (or ₹50,000 for senior citizens).',
    actionHint: 'open_compound_calculator',
    quickReplies: ['Compare FD vs Mutual Fund', 'Try Compound Calculator']
  },
  {
    id: 'advance-tax-for-freelancers',
    category: 'taxes_schemes',
    keywords: ['advance tax', 'freelancer tax', '44ada', 'presumptive taxation'],
    question: 'How do freelancers and developers pay income tax in India?',
    answer: 'Freelancers can use Section 44ADA (presumptive taxation) if receipts are under ₹75 Lakh, declaring 50% as profit with no need to maintain books. Advance tax is paid in 4 quarterly installments.',
    actionHint: 'open_dashboard',
    quickReplies: ['Budgeting for freelancers', 'Track freelance income']
  },
  {
    id: 'sukanya-samriddhi-yojana-ssy',
    category: 'taxes_schemes',
    keywords: ['ssy', 'sukanya samriddhi', 'girl child scheme', 'ssy interest'],
    question: 'What is Sukanya Samriddhi Yojana (SSY)?',
    answer: 'SSY is a government-backed savings scheme for parents of girl children under 10. It offers 8.2% tax-free interest, Section 80C deduction, and matures when the daughter turns 21.',
    actionHint: 'open_compound_calculator',
    quickReplies: ['Calculate compound returns', 'Set a life goal']
  },

  // ── 8. HABITS, BEHAVIOR & FIRST SALARY (71-80) ──
  {
    id: 'first-salary-checklist',
    category: 'spending_habits',
    keywords: ['first salary', 'first job money', 'pehli salary', 'what to do with first salary'],
    question: 'What should I do with my first salary?',
    answer: '1. Treat your parents or buy something meaningful. 2. Set aside 20% in an emergency account. 3. Start a ₹1,000 index fund SIP. 4. Avoid locking yourself into big phone or bike EMIs immediately.',
    actionHint: 'open_onboarding',
    quickReplies: ['Set up my profile', 'Create my first savings goal']
  },
  {
    id: 'impulse-buying-30-day-rule',
    category: 'spending_habits',
    keywords: ['impulse buying', '30 day rule', 'shopping addiction', 'fizzul kharcha', 'stop shopping'],
    question: 'How can I stop impulse online shopping?',
    answer: 'Use the 30-Day Rule: when you want to buy something non-essential, write it down and wait 30 days. If you still genuinely want it and can pay cash after 30 days, buy it. In 80% of cases, the urge passes.',
    actionHint: 'open_transactions',
    quickReplies: ['See my spending breakdown', 'Trim expenses in simulator']
  },
  {
    id: 'automate-savings-habit',
    category: 'spending_habits',
    keywords: ['automate savings', 'pay yourself first', 'automatic investment', 'auto debit sip'],
    question: 'What does "Pay Yourself First" mean?',
    answer: 'Instead of saving whatever is left over at the end of the month, set up your SIP auto-debit for the day after your salary arrives. You save first and spend the rest guilt-free.',
    actionHint: 'open_goals',
    quickReplies: ['Create an automated goal', 'Calculate monthly SIP']
  },
  {
    id: 'small-leaks-chai-coffee',
    category: 'spending_habits',
    keywords: ['small expenses', 'chai coffee habit', 'latte factor', 'daily money leaks', 'zomato swiggy habit'],
    question: 'Do daily small expenses like ₹150 for coffee or food delivery really matter?',
    answer: 'Spending ₹150 every day adds up to ₹4,500/month or ₹54,000/year! If invested in a 12% index fund for 10 years, that ₹4,500/month would grow into over ₹10.4 Lakhs.',
    actionHint: 'open_sip_calculator',
    quickReplies: ['Test ₹4,500/mo in SIP calculator', 'See my dining transactions']
  },
  {
    id: 'diwali-bonus-checklist',
    category: 'spending_habits',
    keywords: ['bonus', 'diwali bonus', 'windfall money', 'how to spend bonus'],
    question: 'What is the smartest way to use a festival bonus or appraisal increment?',
    answer: 'Use the 50/30/20 rule for bonuses: Put 50% toward clearing high-interest debt or boosting investments, 30% toward your emergency cushion or long-term goals, and spend 20% to celebrate and enjoy!',
    actionHint: 'open_goals',
    quickReplies: ['Add money to an existing goal', 'Check my wealth forecast']
  },
  {
    id: 'tracking-expenses-psychology',
    category: 'spending_habits',
    keywords: ['why track expenses', 'expense tracking benefit', 'hisaab kitab'],
    question: 'Why does tracking expenses help people save more money?',
    answer: 'Just the act of writing down or categorizing an expense makes you conscious of your choices. People who track spending typically cut mindless expenses by 15% to 20% within 2 months.',
    actionHint: 'open_transactions',
    quickReplies: ['Add an expense right now', 'See my monthly breakdown']
  },
  {
    id: 'peer-pressure-spending',
    category: 'spending_habits',
    keywords: ['peer pressure', 'friends spending', 'show off', 'expensive outings', 'fomo spending'],
    question: 'How do I handle peer pressure when friends spend lavishly on trips and dinners?',
    answer: 'Suggest budget-friendly alternatives (like home get-togethers or park hangouts) and be honest about your savings priorities. True friends respect financial discipline.',
    actionHint: 'open_dashboard',
    quickReplies: ['What is my spending style?', 'Check Health Score']
  },
  {
    id: 'rent-vs-buy-home-for-youth',
    category: 'spending_habits',
    keywords: ['rent vs buy', 'buy house early', 'rent or emi', 'makaan kharide ya rent'],
    question: 'Should someone in their 20s buy a house or rent?',
    answer: 'For young professionals, renting is usually smarter: it keeps you mobile for better job opportunities, avoids locking up capital in down-payments, and lets your early savings compound in liquid equity.',
    actionHint: 'open_goals',
    quickReplies: ['Plan a house down-payment goal', 'Compound Calculator']
  },

  // ── 9. HINGLISH QUERIES & POPULAR SEARCHES (81-88) ──
  {
    id: 'bachat-kaise-kare',
    category: 'hinglish_queries',
    keywords: ['bachat kaise kare', 'paisa kaise bachaye', 'saving tips hindi', 'paise nahi bachte'],
    question: 'Mahine ke aakhri me paise nahi bachte, bachat kaise shuru kare?',
    answer: 'Sabse pehle 50-30-20 rule apnaye: salary aate hi pehle 20% alag account me daal de ya SIP chalu kare. Baaki bache 80% me se hi ghar ka kharcha aur masti kare.',
    actionHint: 'open_dashboard',
    quickReplies: ['What is 50-30-20?', 'Calculate SIP']
  },
  {
    id: 'paisa-kahan-lagaye',
    category: 'hinglish_queries',
    keywords: ['paisa kahan lagaye', 'kahan invest kare', 'best investment for beginners', 'invest kaha kare'],
    question: 'Naye investors ko pehle apna paisa kahan lagana chahiye?',
    answer: 'Pehle 3-6 mahine ka emergency fund safe bank me rakhe. Uske baad Nifty 50 Index Mutual Fund me ₹1,000 ya ₹2,000 ki monthly SIP se shuruat kare.',
    actionHint: 'open_sip_calculator',
    quickReplies: ['What is an SIP?', 'Calculate my returns']
  },
  {
    id: 'kitna-invest-kare',
    category: 'hinglish_queries',
    keywords: ['kitna invest karu', 'salary ka kitna percent invest kare', 'monthly investment kitni honi chahiye'],
    question: 'Har mahine salary ka kitna hissa invest karna chahiye?',
    answer: 'Standard guideline hai kam se kam 20% se 30% apni take-home salary ka invest kare. Agar salary ₹50,000 hai, to ₹10,000 se ₹15,000 har mahine invest karne ka target rakhe.',
    actionHint: 'open_sip_calculator',
    quickReplies: ['Calculate ₹10k SIP in 10 years', 'Check my score']
  },
  {
    id: 'fd-todna-chahiye-ya-nahi',
    category: 'hinglish_queries',
    keywords: ['fd todna chahiye', 'fd break penalty', 'premature fd withdrawal'],
    question: 'Kya stock market me daalne ke liye Fixed Deposit (FD) todna chahiye?',
    answer: 'Nahi! FD ka maqsad safety aur emergency backup hai. FD mat tode. Agar nivesh karna hai to aane wali mahine ki regular income me se nayi SIP shuru kare.',
    actionHint: 'open_compound_calculator',
    quickReplies: ['Check emergency fund size', 'Try SIP calculator']
  },
  {
    id: 'credit-card-lena-chahiye-kya',
    category: 'hinglish_queries',
    keywords: ['credit card lena chahiye', 'credit card fayda nuksan', 'first credit card'],
    question: 'Kya pehli naukri me credit card lena chahiye?',
    answer: 'Haan, lifetime free credit card le sakte hai CIBIL score banane ke liye. Bas ek rule yaad rakhe: card ko debit card ki tarah use kare aur har mahine pura bill time pe bhare.',
    actionHint: 'open_health_score',
    quickReplies: ['What is a CIBIL score?', 'Minimum due trap']
  },
  {
    id: 'loan-jaldi-khatam-kaise-kare',
    category: 'hinglish_queries',
    keywords: ['loan jaldi khatam', 'emi kam kaise kare', 'karz mukt', 'loan prepayment'],
    question: 'Apne personal ya education loan ko jaldi kaise khatam kare?',
    answer: 'Har saal bonus ya tax refund me se ek extra EMI pay kare, aur har saal 5% EMI amount badhaye. Isse loan 30-40% pehle khatam ho jata hai.',
    actionHint: 'open_goals',
    quickReplies: ['Set loan payoff goal', 'What is DTI?']
  },
  {
    id: 'sip-kya-hai-hinglish',
    category: 'hinglish_queries',
    keywords: ['sip kya hota hai', 'sip ka matlab', 'sip samjhao'],
    question: 'SIP kya hota hai aur isme fayda kya hai?',
    answer: 'SIP ka matlab hai har mahine ek tay rashi (jaise ₹2,000) mutual fund me dalna. Isme compound interest ki taaqat se lambe samay me chhota paisa bhi bohot bada fund ban jata hai.',
    actionHint: 'open_sip_calculator',
    quickReplies: ['Try SIP Calculator', 'How does compounding work?']
  },
  {
    id: 'student-money-tips',
    category: 'hinglish_queries',
    keywords: ['student pocket money', 'college student savings', 'student paise kaise bachaye'],
    question: 'College students pocket money me se bachat kaise kare?',
    answer: '1. Fast food aur daily chai me chhota control rakhe. 2. Student discounts (Spotify, Apple, Amazon Prime) use kare. 3. Bachaye huye ₹500 se pehli index fund SIP shuru kare.',
    actionHint: 'open_sip_calculator',
    quickReplies: ['Start with ₹500', 'Create a study goal']
  }
];

// Write to server knowledge base
const serverFilePath = path.join(__dirname, 'knowledge_base.json');
fs.writeFileSync(serverFilePath, JSON.stringify(KNOWLEDGE_BASE, null, 2), 'utf-8');
console.log(`Saved ${KNOWLEDGE_BASE.length} knowledge base entries to ${serverFilePath}`);

// Mirror to ml-service data folder
const mlFilePath = path.join(__dirname, '../../../../ml-service/data/knowledge_base.json');
fs.writeFileSync(mlFilePath, JSON.stringify(KNOWLEDGE_BASE, null, 2), 'utf-8');
console.log(`Mirrored ${KNOWLEDGE_BASE.length} knowledge base entries to ${mlFilePath}`);
