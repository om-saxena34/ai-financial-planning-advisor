/**
 * CSV Export utility for Future Life Plan
 */
export function exportLifePlanCsv(plan, filename = 'FinWise_Future_Life_Plan.csv') {
  if (!plan || !plan.years || plan.years.length === 0) return;

  const headers = [
    'Year',
    'Monthly Income (INR)',
    'Annual Income (INR)',
    'Monthly Expenses (INR)',
    'Annual Expenses (INR)',
    'Monthly Surplus (INR)',
    'Monthly SIP (INR)',
    'Annual Invested (INR)',
    'Life Events Cost (INR)',
    'Cash Savings Balance (INR)',
    'Investment Nominal Value (INR)',
    'Total Net Worth Nominal (INR)',
    'Total Net Worth Real / Inflation-Adjusted (INR)',
  ];

  const rows = plan.years.map((yr) => [
    `Year ${yr.year}`,
    yr.monthlyIncome,
    yr.annualIncome,
    yr.monthlyExpenses,
    yr.annualExpenses,
    yr.monthlySurplus,
    yr.monthlySip,
    yr.annualInvested,
    yr.eventsCost || 0,
    yr.cashSavingsBalance,
    yr.investmentValueNominal,
    yr.totalNetWorthNominal,
    yr.totalNetWorthReal,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((r) => r.join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
