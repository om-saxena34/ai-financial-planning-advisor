import React, { useState, useEffect } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import CornerDecor from '../components/common/CornerDecor';
import AnimatedNumber from '../components/common/AnimatedNumber';
import HelpTooltip from '../components/common/HelpTooltip';
import studentService from '../services/student.service';
import {
  GraduationCap,
  Calendar,
  Sparkles,
  TrendingUp,
  Shield,
  Briefcase,
  AlertCircle,
  Plus,
  Trash2,
  CheckCircle,
} from 'lucide-react';

export default function StudentPlanner() {
  const [loading, setLoading] = useState(true);
  const [effectiveIncome, setEffectiveIncome] = useState(0);
  const [semesterFees, setSemesterFees] = useState([
    { label: 'Upcoming Semester Fee', amount: 30000, dueDate: '2026-12-15', savedSoFar: 5000 },
  ]);
  const [expectedSalary, setExpectedSalary] = useState(45000);
  const [cityTier, setCityTier] = useState('tier1');
  const [salaryPlan, setSalaryPlan] = useState(null);
  const [savingFee, setSavingFee] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await studentService.getSemesterPlan();
      if (res.data) {
        setEffectiveIncome(res.data.effectiveIncome || 15000);
        if (res.data.plans && res.data.plans.length > 0) {
          setSemesterFees(
            res.data.plans.map((p) => ({
              label: 'Semester Fee',
              amount: p.feeAmount,
              dueDate: p.dueDate ? p.dueDate.slice(0, 10) : '2026-12-15',
              savedSoFar: p.currentSavings,
            }))
          );
        }
      }
      // Calculate first salary plan
      const planRes = await studentService.getFirstSalaryPlan(expectedSalary, cityTier);
      if (planRes.data) {
        setSalaryPlan(planRes.data.plan);
      }
    } catch (_) {
      // Fallback defaults
      setEffectiveIncome(15000);
      calculateLocalSalaryPlan(45000, 'tier1');
    } finally {
      setLoading(false);
    }
  };

  const calculateLocalSalaryPlan = (sal, city) => {
    const rentMult = city === 'tier1' ? 0.25 : 0.18;
    const needs = Math.round(sal * 0.5);
    const wants = Math.round(sal * 0.3);
    const savings = Math.round(sal * 0.2);
    const rent = Math.round(sal * rentMult);
    const emTarget = Math.round(needs * 3);
    const sip = Math.round(savings * 0.5);
    const emMonthly = Math.round(savings * 0.5);
    setSalaryPlan({
      salary: sal,
      needs,
      wants,
      savings,
      rent,
      emergencyTarget: emTarget,
      startingSip: sip,
      emergencyMonthly: emMonthly,
      monthsToEmergency: emMonthly > 0 ? Math.ceil(emTarget / emMonthly) : 0,
      sipFv1y: Math.round(sip * 12.8),
      sipFv5y: Math.round(sip * 82.5),
      sipFv10y: Math.round(sip * 232.3),
    });
  };

  const handleSalaryChange = async (val) => {
    const sal = Math.max(5000, Number(val));
    setExpectedSalary(sal);
    try {
      const res = await studentService.getFirstSalaryPlan(sal, cityTier);
      if (res.data?.plan) setSalaryPlan(res.data.plan);
    } catch (_) {
      calculateLocalSalaryPlan(sal, cityTier);
    }
  };

  const handleCityChange = async (city) => {
    setCityTier(city);
    try {
      const res = await studentService.getFirstSalaryPlan(expectedSalary, city);
      if (res.data?.plan) setSalaryPlan(res.data.plan);
    } catch (_) {
      calculateLocalSalaryPlan(expectedSalary, city);
    }
  };

  const handleSaveFees = async () => {
    setSavingFee(true);
    try {
      await studentService.saveSemesterFees(semesterFees);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (_) {}
    setSavingFee(false);
  };

  return (
    <PageWrapper>
      <div className="relative max-w-6xl mx-auto space-y-8">
        <CornerDecor variant="dots" />

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-blue-100">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
              <GraduationCap size={15} />
              <span>Student Mode</span>
            </div>
            <h1 className="text-3xl font-bold text-ink">Student Money Planner</h1>
            <p className="text-sm text-muted mt-1">
              Smart tools built for college life, irregular pocket money, and your upcoming first job.
            </p>
          </div>
        </div>

        {/* Top 3 Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-soft p-6 relative overflow-hidden">
            <CornerDecor variant="arc" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Monthly Planning Income
            </span>
            <div className="text-3xl font-bold text-ink mt-2">
              ₹<AnimatedNumber value={effectiveIncome} />
            </div>
            <p className="text-xs text-muted mt-2">
              Based on the median of your pocket money and part-time earnings.
            </p>
          </div>

          <div className="card-soft p-6 relative overflow-hidden">
            <CornerDecor variant="dots" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Student Emergency Cushion
            </span>
            <div className="text-3xl font-bold text-ink mt-2">3 Months</div>
            <p className="text-xs text-muted mt-2">
              Regular earners need 6 months. Students only need 3 months to be fully protected.
            </p>
          </div>

          <div className="card-soft p-6 relative overflow-hidden">
            <CornerDecor variant="wave" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              First Salary Target
            </span>
            <div className="text-3xl font-bold text-ink mt-2">
              ₹<AnimatedNumber value={expectedSalary} />
            </div>
            <p className="text-xs text-muted mt-2">
              Plan your 50/30/20 split before you receive your first offer letter.
            </p>
          </div>
        </div>

        {/* SECTION 1: Semester Fee Planner */}
        <div className="card-soft p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-blue-100 pb-4">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                <Calendar size={22} />
              </span>
              <div>
                <h2 className="text-xl font-bold text-ink">Semester Fee Planner</h2>
                <p className="text-xs text-muted">
                  Never stress when fee week arrives. Set aside a small amount each month.
                </p>
              </div>
            </div>
            <button
              onClick={handleSaveFees}
              disabled={savingFee}
              className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm"
            >
              {saveSuccess ? (
                <>
                  <CheckCircle size={15} /> Saved!
                </>
              ) : (
                'Save Schedule'
              )}
            </button>
          </div>

          <div className="space-y-4">
            {semesterFees.map((fee, idx) => {
              const due = new Date(fee.dueDate);
              const now = new Date();
              const monthsLeft = Math.max(1, Math.ceil((due - now) / (1000 * 60 * 60 * 24 * 30.44)));
              const remaining = Math.max(0, fee.amount - fee.savedSoFar);
              const monthlyNeeded = Math.ceil(remaining / monthsLeft);
              const onTrack = fee.savedSoFar >= fee.amount || monthlyNeeded <= effectiveIncome * 0.4;

              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white border border-blue-100 grid grid-cols-1 md:grid-cols-4 gap-4 items-center shadow-xs"
                >
                  <div>
                    <label className="text-xs font-semibold text-muted block mb-1">Fee Name</label>
                    <input
                      type="text"
                      value={fee.label}
                      onChange={(e) => {
                        const updated = [...semesterFees];
                        updated[idx].label = e.target.value;
                        setSemesterFees(updated);
                      }}
                      className="w-full text-sm font-semibold text-ink bg-blue-50/50 border border-blue-100 rounded-xl px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted block mb-1">Total Fee (₹)</label>
                    <input
                      type="number"
                      value={fee.amount}
                      onChange={(e) => {
                        const updated = [...semesterFees];
                        updated[idx].amount = Number(e.target.value);
                        setSemesterFees(updated);
                      }}
                      className="w-full text-sm font-semibold text-ink bg-blue-50/50 border border-blue-100 rounded-xl px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted block mb-1">Saved So Far (₹)</label>
                    <input
                      type="number"
                      value={fee.savedSoFar}
                      onChange={(e) => {
                        const updated = [...semesterFees];
                        updated[idx].savedSoFar = Number(e.target.value);
                        setSemesterFees(updated);
                      }}
                      className="w-full text-sm font-semibold text-ink bg-blue-50/50 border border-blue-100 rounded-xl px-3 py-2"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-blue-50 text-center">
                    <span className="text-xs text-muted block font-medium">Save each month</span>
                    <span className="text-lg font-bold text-blue-700">
                      ₹{monthlyNeeded.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs block text-muted mt-0.5">({monthsLeft} months left)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: First-Salary Planner */}
        <div className="card-soft p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-blue-100 pb-4">
            <span className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <Briefcase size={22} />
            </span>
            <div>
              <h2 className="text-xl font-bold text-ink">First-Salary Planner</h2>
              <p className="text-xs text-muted">
                Step into your first job with a clear plan for your money.
              </p>
            </div>
          </div>

          {/* Sliders / Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-2xl border border-blue-100">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-ink">Expected Take-Home Salary</span>
                <span className="text-base font-bold text-blue-700">
                  ₹{expectedSalary.toLocaleString('en-IN')}/mo
                </span>
              </div>
              <input
                type="range"
                min="15000"
                max="150000"
                step="5000"
                value={expectedSalary}
                onChange={(e) => handleSalaryChange(e.target.value)}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <span className="text-xs text-muted mt-1 block">
                Adjust between ₹15k to ₹1.5 Lakh/month
              </span>
            </div>

            <div>
              <span className="text-sm font-semibold text-ink block mb-2">Job Location</span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleCityChange('tier1')}
                  className={`py-2.5 px-4 rounded-xl text-xs font-semibold border transition-all ${
                    cityTier === 'tier1'
                      ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
                      : 'bg-surface text-ink border-blue-100 hover:bg-blue-50'
                  }`}
                >
                  Metro (Tier 1)
                  <span className="block text-2xs opacity-80 mt-0.5">~25% rent estimate</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCityChange('tier2')}
                  className={`py-2.5 px-4 rounded-xl text-xs font-semibold border transition-all ${
                    cityTier === 'tier2'
                      ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
                      : 'bg-surface text-ink border-blue-100 hover:bg-blue-50'
                  }`}
                >
                  Non-Metro (Tier 2/3)
                  <span className="block text-2xs opacity-80 mt-0.5">~18% rent estimate</span>
                </button>
              </div>
            </div>
          </div>

          {/* 50/30/20 Plan Cards */}
          {salaryPlan && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Needs Card */}
              <div className="p-5 rounded-2xl bg-white border border-blue-100 shadow-xs space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted">
                    Must-Haves (50%)
                  </span>
                  <span className="text-lg font-bold text-ink">
                    ₹{salaryPlan.needs.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="w-full h-2 bg-blue-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-1/2" />
                </div>
                <ul className="text-xs text-muted space-y-1.5 pt-1">
                  <li>• Rent & PG: ~₹{salaryPlan.rent.toLocaleString('en-IN')}</li>
                  <li>• Food, groceries, mess</li>
                  <li>• Daily commute & bills</li>
                </ul>
              </div>

              {/* Wants Card */}
              <div className="p-5 rounded-2xl bg-white border border-blue-100 shadow-xs space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted">
                    Wants & Fun (30%)
                  </span>
                  <span className="text-lg font-bold text-ink">
                    ₹{salaryPlan.wants.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="w-full h-2 bg-blue-100 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-400 w-[30%]" />
                </div>
                <ul className="text-xs text-muted space-y-1.5 pt-1">
                  <li>• Dining out with colleagues</li>
                  <li>• Shopping, clothes, gadgets</li>
                  <li>• Weekend outings & movies</li>
                </ul>
              </div>

              {/* Savings Card */}
              <div className="p-5 rounded-2xl bg-white border border-blue-100 shadow-xs space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted">
                    Future Savings (20%)
                  </span>
                  <span className="text-lg font-bold text-emerald-600">
                    ₹{salaryPlan.savings.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="w-full h-2 bg-blue-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[20%]" />
                </div>
                <ul className="text-xs text-muted space-y-1.5 pt-1">
                  <li>
                    • Starting SIP: ₹{salaryPlan.startingSip.toLocaleString('en-IN')}/mo
                  </li>
                  <li>
                    • Emergency Fund: ₹{salaryPlan.emergencyMonthly.toLocaleString('en-IN')}/mo
                  </li>
                  <li>• Target: ₹{salaryPlan.emergencyTarget.toLocaleString('en-IN')} (3 mo)</li>
                </ul>
              </div>
            </div>
          )}

          {/* Long term growth preview */}
          {salaryPlan && (
            <div className="p-5 rounded-2xl bg-blue-50 border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-xl bg-white text-blue-600 shadow-xs">
                  <TrendingUp size={20} />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-ink">If you invest ₹{salaryPlan.startingSip}/mo in a SIP</h4>
                  <p className="text-xs text-muted">Assuming typical 12% average annual market return</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-center">
                <div>
                  <span className="text-2xs uppercase tracking-wider text-muted block">In 1 Year</span>
                  <span className="text-sm font-bold text-ink">₹{salaryPlan.sipFv1y.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-2xs uppercase tracking-wider text-muted block">In 5 Years</span>
                  <span className="text-sm font-bold text-ink">₹{salaryPlan.sipFv5y.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-2xs uppercase tracking-wider text-muted block">In 10 Years</span>
                  <span className="text-base font-extrabold text-blue-700">₹{salaryPlan.sipFv10y.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
