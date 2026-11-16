import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  User,
  IndianRupee,
  Shield,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  PieChart,
} from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import CornerDecor from '../components/common/CornerDecor';
import HelpTooltip from '../components/common/HelpTooltip';

export default function Onboarding() {
  const { user, checkAuth } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    age: 23,
    occupationType: 'salaried',
    dependents: 0,
    monthlyIncome: 45000,
    fixedExpenses: 18000,
    existingSavings: 35000,
    existingInvestments: 15000,
    riskProfile: 'moderate',
    expectedFirstSalary: 45000,
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (formData.age < 18 || formData.age > 100) {
        toast.error('Age must be between 18 and 100');
        return;
      }
    }
    if (currentStep === 2) {
      if (formData.monthlyIncome <= 0) {
        toast.error('Monthly income must be greater than zero');
        return;
      }
      if (formData.fixedExpenses < 0) {
        toast.error('Fixed expenses cannot be negative');
        return;
      }
      if (formData.fixedExpenses > formData.monthlyIncome * 1.5) {
        toast.error('Fixed expenses seem unusually higher than income. Please review.');
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        age: Number(formData.age),
        occupationType: formData.occupationType,
        dependents: Number(formData.dependents),
        monthlyIncome: Number(formData.monthlyIncome),
        fixedExpenses: Number(formData.fixedExpenses),
        existingSavings: Number(formData.existingSavings),
        existingInvestments: Number(formData.existingInvestments),
        riskProfile: formData.riskProfile,
      };

      const { data } = await api.put('/profile', payload);

      if (data.success) {
        toast.success('Your profile is ready!');
        await checkAuth();
        navigate('/dashboard');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Could not save your profile';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto py-6 px-4">
        {/* Step Indicator Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[var(--blue-50)] text-[var(--blue-700)] border border-[var(--blue-100)] text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[var(--blue-500)]" />
            <span>Quick Setup</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--ink)]">
            Tell Us a Bit About Your Finances
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            We use these simple numbers to build your health score and personalized plan.
          </p>

          {/* Progress bar */}
          <div className="mt-6 flex items-center justify-between max-w-md mx-auto">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex-1 flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step < currentStep
                      ? 'bg-[var(--good)] text-white'
                      : step === currentStep
                      ? 'bg-[var(--blue-500)] text-white ring-4 ring-blue-100'
                      : 'bg-[var(--blue-50)] text-[var(--muted)] border border-[var(--blue-100)]'
                  }`}
                >
                  {step < currentStep ? '✓' : step}
                </div>
                {step < 4 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded-full transition-all ${
                      step < currentStep ? 'bg-[var(--good)]' : 'bg-[var(--blue-100)]'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Wizard Card */}
        <div className="bg-white border border-[var(--blue-100)] rounded-3xl p-6 sm:p-10 shadow-xs relative overflow-hidden">
          <CornerDecor variant="blob" position="top-right" size={90} opacity={0.3} />

          {/* STEP 1: Personal & Occupation */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-[var(--ink)] flex items-center space-x-2">
                  <User className="w-5 h-5 text-[var(--blue-500)]" />
                  <span>About You</span>
                </h2>
                <p className="text-xs text-[var(--muted)] mt-0.5">Tell us a bit about your current life stage.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--ink)] uppercase tracking-wider mb-2">
                    Your Age (Years)
                  </label>
                  <input
                    type="number"
                    min="18"
                    max="100"
                    value={formData.age}
                    onChange={(e) => handleChange('age', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--blue-100)] bg-[var(--bg)] text-[var(--ink)] text-sm focus:border-[var(--blue-500)] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--ink)] uppercase tracking-wider mb-2">
                    What You Do
                  </label>
                  <select
                    value={formData.occupationType}
                    onChange={(e) => handleChange('occupationType', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--blue-100)] bg-[var(--bg)] text-[var(--ink)] text-sm focus:border-[var(--blue-500)] outline-none"
                  >
                    <option value="student">Student</option>
                    <option value="salaried">Salaried Job</option>
                    <option value="self-employed">Freelancer / Self-Employed</option>
                    <option value="business">Business Owner</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {formData.occupationType === 'student' && (
                  <div>
                    <label className="block text-xs font-semibold text-[var(--ink)] uppercase tracking-wider mb-2">
                      Expected First Salary (After Graduation)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 45000"
                      value={formData.expectedFirstSalary || ''}
                      onChange={(e) => handleChange('expectedFirstSalary', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[var(--blue-100)] bg-[var(--bg)] text-[var(--ink)] text-sm focus:border-[var(--blue-500)] outline-none"
                    />
                    <p className="text-2xs text-[var(--muted)] mt-1">
                      Helps Fin build your 50/30/20 first-job plan and student emergency fund target.
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[var(--ink)] uppercase tracking-wider mb-2">
                    People Depending on You
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={formData.dependents}
                    onChange={(e) => handleChange('dependents', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--blue-100)] bg-[var(--bg)] text-[var(--ink)] text-sm focus:border-[var(--blue-500)] outline-none"
                  />
                  <span className="text-[11px] text-[var(--muted)] mt-1 block">
                    Family members who rely on your income (like parents or children).
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Monthly Cash Flow */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-[var(--ink)] flex items-center space-x-2">
                  <IndianRupee className="w-5 h-5 text-[var(--blue-500)]" />
                  <span>Monthly Income & Bills</span>
                </h2>
                <p className="text-xs text-[var(--muted)] mt-0.5">Your typical take-home income and regular bills.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--ink)] uppercase tracking-wider mb-2">
                    Take-Home Salary or Earnings (₹ / month)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-[var(--muted)] font-semibold text-sm">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={formData.monthlyIncome}
                      onChange={(e) => handleChange('monthlyIncome', e.target.value)}
                      placeholder="50,000"
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-[var(--blue-100)] bg-[var(--bg)] text-[var(--ink)] text-sm focus:border-[var(--blue-500)] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--ink)] uppercase tracking-wider mb-2">
                    Fixed Monthly Bills (₹ / month)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-[var(--muted)] font-semibold text-sm">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="500"
                      value={formData.fixedExpenses}
                      onChange={(e) => handleChange('fixedExpenses', e.target.value)}
                      placeholder="20,000"
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-[var(--blue-100)] bg-[var(--bg)] text-[var(--ink)] text-sm focus:border-[var(--blue-500)] outline-none"
                    />
                  </div>
                  <span className="text-[11px] text-[var(--muted)] mt-1 block">
                    Essential monthly bills: Rent, EMIs, Groceries, Electricity, WiFi.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Current Financial Assets */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-[var(--ink)] flex items-center space-x-2">
                  <PieChart className="w-5 h-5 text-[var(--blue-500)]" />
                  <span>Your Current Savings</span>
                </h2>
                <p className="text-xs text-[var(--muted)] mt-0.5">Helps us calculate your emergency cushion.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--ink)] uppercase tracking-wider mb-2">
                    Bank Balance & Cash (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-[var(--muted)] font-semibold text-sm">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={formData.existingSavings}
                      onChange={(e) => handleChange('existingSavings', e.target.value)}
                      placeholder="50,000"
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-[var(--blue-100)] bg-[var(--bg)] text-[var(--ink)] text-sm focus:border-[var(--blue-500)] outline-none"
                    />
                  </div>
                  <span className="text-[11px] text-[var(--muted)] mt-1 block">
                    Money sitting in your bank accounts or fixed deposits.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--ink)] uppercase tracking-wider mb-2">
                    Current Investments (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-[var(--muted)] font-semibold text-sm">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={formData.existingInvestments}
                      onChange={(e) => handleChange('existingInvestments', e.target.value)}
                      placeholder="25,000"
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-[var(--blue-100)] bg-[var(--bg)] text-[var(--ink)] text-sm focus:border-[var(--blue-500)] outline-none"
                    />
                  </div>
                  <span className="text-[11px] text-[var(--muted)] mt-1 block">
                    Total in Mutual Funds, Stocks, PF/PPF, or Gold.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Risk Appetite */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-[var(--ink)] flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-[var(--blue-500)]" />
                  <span>How You Feel About Risk</span>
                </h2>
                <p className="text-xs text-[var(--muted)] mt-0.5">Select what makes you feel most comfortable.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: 'conservative',
                    label: 'Safe & Steady',
                    returnRate: '~7% p.a.',
                    desc: 'You prefer safety over high returns. Heavy in Fixed Deposits and Government bonds.',
                  },
                  {
                    id: 'moderate',
                    label: 'Balanced',
                    returnRate: '~10–12% p.a.',
                    desc: 'Balanced approach with broad market index funds and safe savings.',
                  },
                  {
                    id: 'aggressive',
                    label: 'Growth Focused',
                    returnRate: '~14–16% p.a.',
                    desc: 'You can handle ups and downs to grow your wealth faster in equity funds.',
                  },
                ].map((risk) => (
                  <div
                    key={risk.id}
                    onClick={() => handleChange('riskProfile', risk.id)}
                    className={`cursor-pointer p-4 rounded-2xl border-2 transition-all ${
                      formData.riskProfile === risk.id
                        ? 'border-[var(--blue-500)] bg-[var(--blue-50)]'
                        : 'border-[var(--blue-100)] bg-white hover:border-[var(--blue-300)]'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-sm text-[var(--ink)]">{risk.label}</span>
                      <span className="text-xs font-semibold text-[var(--blue-700)]">{risk.returnRate}</span>
                    </div>
                    <p className="text-xs text-[var(--muted)] mt-1">{risk.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="mt-8 pt-6 border-t border-[var(--blue-100)] flex justify-between items-center">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold text-[var(--ink)] hover:bg-[var(--blue-50)] border border-[var(--blue-100)] bg-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
              </button>
            ) : <div />}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-[var(--blue-500)] hover:bg-[var(--blue-700)] shadow-xs transition-all"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-[var(--good)] hover:opacity-90 shadow-xs transition-all disabled:opacity-60"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Finish Setup & Go to Dashboard</span>
                    <CheckCircle2 className="w-4 h-4 ml-1.5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
