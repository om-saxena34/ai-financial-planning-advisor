import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  User,
  Briefcase,
  IndianRupee,
  Shield,
  TrendingUp,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  PieChart,
} from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import { OCCUPATION_TYPES, RISK_PROFILES } from '../config/appConfig';

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
        toast.success('Financial profile configured successfully!');
        await checkAuth(); // Refresh user state with onboardingComplete=true
        navigate('/dashboard');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to save financial profile';
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
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Financial Onboarding Wizard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Let's Set Up Your Baseline
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            FinWise uses these parameters to customize your health score and machine learning forecasts.
          </p>

          {/* Progress bar */}
          <div className="mt-6 flex items-center justify-between max-w-md mx-auto">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex-1 flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step < currentStep
                      ? 'bg-emerald-500 text-white'
                      : step === currentStep
                      ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-950'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                  }`}
                >
                  {step < currentStep ? '✓' : step}
                </div>
                {step < 4 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded-full transition-all ${
                      step < currentStep ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-800'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Wizard Card */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-10 shadow-xl shadow-indigo-500/5">
          {/* STEP 1: Personal & Occupation */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                  <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span>Personal & Demographics</span>
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">Tell us a bit about your current life stage.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                    Your Age (Years)
                  </label>
                  <input
                    type="number"
                    min="18"
                    max="100"
                    value={formData.age}
                    onChange={(e) => handleChange('age', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                    Occupation Type
                  </label>
                  <select
                    value={formData.occupationType}
                    onChange={(e) => handleChange('occupationType', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="student">Student</option>
                    <option value="salaried">Salaried Professional</option>
                    <option value="self-employed">Self-Employed / Freelancer</option>
                    <option value="business">Business Owner</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                    Number of Dependents
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={formData.dependents}
                    onChange={(e) => handleChange('dependents', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <span className="text-[11px] text-gray-400 mt-1 block">
                    Individuals who rely on your income (children, non-earning parents, etc.)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Monthly Cash Flow */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                  <IndianRupee className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span>Monthly Cash Flow</span>
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">Your typical take-home income and recurring essential bills.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                    Monthly Take-Home Income (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-gray-400 font-semibold text-sm">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={formData.monthlyIncome}
                      onChange={(e) => handleChange('monthlyIncome', e.target.value)}
                      placeholder="50,000"
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                    Fixed Monthly Commitments (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-gray-400 font-semibold text-sm">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="500"
                      value={formData.fixedExpenses}
                      onChange={(e) => handleChange('fixedExpenses', e.target.value)}
                      placeholder="20,000"
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <span className="text-[11px] text-gray-400 mt-1 block">
                    Total essential recurring costs: Rent, EMIs, Groceries, Electricity, WiFi, Insurance.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Current Financial Assets */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                  <PieChart className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span>Current Reserves & Investments</span>
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">Helps calculate your initial Emergency Fund Coverage ratio.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                    Liquid Bank Savings & Cash (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-gray-400 font-semibold text-sm">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={formData.existingSavings}
                      onChange={(e) => handleChange('existingSavings', e.target.value)}
                      placeholder="50,000"
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <span className="text-[11px] text-gray-400 mt-1 block">
                    Funds readily available in savings accounts, FDs, or liquid funds.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                    Existing Investments (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-gray-400 font-semibold text-sm">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={formData.existingInvestments}
                      onChange={(e) => handleChange('existingInvestments', e.target.value)}
                      placeholder="25,000"
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <span className="text-[11px] text-gray-400 mt-1 block">
                    Current value of Mutual Funds, Stocks, PF/PPF, or Gold.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Risk Appetite */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span>Investment Risk Appetite</span>
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">Select how you handle investment volatility.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: 'conservative',
                    label: 'Conservative',
                    returnRate: '~7% p.a.',
                    desc: 'Prioritizes safety over high returns. Heavy in Debt, FDs & Government bonds.',
                  },
                  {
                    id: 'moderate',
                    label: 'Moderate',
                    returnRate: '~10–12% p.a.',
                    desc: 'Balanced approach with Index funds, large-cap equities and fixed income.',
                  },
                  {
                    id: 'aggressive',
                    label: 'Aggressive',
                    returnRate: '~14–16% p.a.',
                    desc: 'Higher volatility tolerance for maximum compounding via Equity, Mid/Small-caps.',
                  },
                ].map((risk) => (
                  <div
                    key={risk.id}
                    onClick={() => handleChange('riskProfile', risk.id)}
                    className={`cursor-pointer p-4 rounded-2xl border-2 transition-all ${
                      formData.riskProfile === risk.id
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30'
                        : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-sm text-gray-900 dark:text-white">{risk.label}</span>
                      <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{risk.returnRate}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{risk.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
              </button>
            ) : <div />}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all disabled:opacity-60"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Finish Setup & Launch</span>
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
