import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function formatInr(val) {
  if (val === undefined || val === null || isNaN(val)) return 'Rs. 0';
  return 'Rs. ' + Math.round(val).toLocaleString('en-IN');
}

/**
 * Generates a clean, branded PDF report for the Future Life Plan.
 */
export function exportLifePlanPdf(plan, readinessLadder = null, userProfile = null) {
  if (!plan || !plan.years || plan.years.length === 0) return;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor = [26, 92, 149]; // FinWise brand blue #1A5C95
  const secondaryColor = [70, 80, 95];
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();

  // ── Header Banner ──
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('FinWise | Personalized Future Life Plan', 14, 13);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Prepared on: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} | Horizon: ${plan.timelineYears || 10} Years`,
    14,
    21
  );

  let currentY = 36;

  // ── Readiness Ladder Status Box ──
  if (readinessLadder && readinessLadder.steps) {
    const activeStep = readinessLadder.steps.find((s) => s.step === readinessLadder.currentStep) || readinessLadder.steps[0];
    
    doc.setFillColor(243, 247, 251);
    doc.roundedRect(14, currentY, pageWidth - 28, 22, 3, 3, 'F');
    doc.setDrawColor(200, 220, 240);
    doc.roundedRect(14, currentY, pageWidth - 28, 22, 3, 3, 'S');

    doc.setFontSize(11);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(`Financial Readiness Ladder: Step ${readinessLadder.currentStep} of 5 - ${activeStep.title}`, 18, currentY + 7);

    doc.setFontSize(8.5);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFont('helvetica', 'normal');
    const actionTxt = doc.splitTextToSize(`Action focus: ${activeStep.action}`, pageWidth - 36);
    doc.text(actionTxt, 18, currentY + 14);

    currentY += 28;
  }

  // ── Executive Summary Metrics ──
  const lastYear = plan.years[plan.years.length - 1];
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('Plan Summary & Wealth Targets', 14, currentY);
  currentY += 5;

  const cardWidth = (pageWidth - 28 - 6) / 3;
  const metrics = [
    { label: 'Estimated Net Worth (Nominal)', val: formatInr(lastYear?.totalNetWorthNominal) },
    { label: 'Real Purchasing Power (Inflation-Adj)', val: formatInr(lastYear?.totalNetWorthReal) },
    { label: 'Cost of Waiting 3 Years to Save', val: formatInr(plan.costOfWaiting?.costOf3YearsLost || 0) },
  ];

  metrics.forEach((m, idx) => {
    const x = 14 + idx * (cardWidth + 3);
    doc.setFillColor(249, 250, 252);
    doc.roundedRect(x, currentY, cardWidth, 18, 2, 2, 'F');
    doc.setDrawColor(220, 225, 235);
    doc.roundedRect(x, currentY, cardWidth, 18, 2, 2, 'S');

    doc.setFontSize(7.5);
    doc.setTextColor(110, 120, 135);
    doc.setFont('helvetica', 'normal');
    doc.text(m.label, x + 3, currentY + 6);

    doc.setFontSize(10.5);
    doc.setTextColor(idx === 2 ? 180 : primaryColor[0], idx === 2 ? 50 : primaryColor[1], idx === 2 ? 50 : primaryColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(m.val, x + 3, currentY + 13);
  });

  currentY += 24;

  // ── Year-by-Year Projection Table ──
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('Year-by-Year Financial Growth Projection', 14, currentY);
  currentY += 4;

  const tableBody = plan.years.map((yr) => [
    `Year ${yr.year}`,
    formatInr(yr.monthlyIncome),
    formatInr(yr.monthlyExpenses),
    formatInr(yr.monthlySip),
    formatInr(yr.cashSavingsBalance),
    formatInr(yr.totalNetWorthNominal),
    formatInr(yr.totalNetWorthReal),
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [
      ['Year', 'Monthly Inflow', 'Monthly Bills', 'Monthly SIP', 'Bank Balance', 'Net Worth (Nom)', 'Real Value (Adj)'],
    ],
    body: tableBody,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2,
      font: 'helvetica',
      textColor: [40, 45, 55],
    },
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { fontStyle: 'bold', halign: 'center' },
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'right', fontStyle: 'bold' },
      6: { halign: 'right', textColor: [26, 120, 90] },
    },
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
      currentY = data.cursor.y;
    },
  });

  currentY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 8 : currentY + 40;

  // ── Milestone Notes & Life Events ──
  if (plan.milestoneNotes && plan.milestoneNotes.length > 0 && currentY < pageHeight - 35) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('Planned Life Milestones & Events:', 14, currentY);
    currentY += 5;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    plan.milestoneNotes.slice(0, 4).forEach((note) => {
      doc.text(`• ${note}`, 18, currentY);
      currentY += 4;
    });
  }

  // ── Honest Educational Disclaimer Footer ──
  const footerY = pageHeight - 12;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(140, 150, 165);
  doc.text(
    'Disclaimer: Projections are illustrative models based on compound math and assumed inflation/returns. They are not guaranteed returns or SEBI-registered advisory.',
    14,
    footerY
  );

  doc.save('FinWise_Future_Life_Plan.pdf');
}
