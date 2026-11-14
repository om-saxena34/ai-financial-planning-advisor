import React from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Brain,
  Target,
  ShieldCheck,
  ChevronRight,
  PieChart,
  ArrowRight,
  Sparkles,
  Zap,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';

export default function Landing() {
  const features = [
    {
      icon: Brain,
      title: 'AI Behavior Classification',
      desc: 'Machine learning models classify your financial behavior into Saver, Balanced, or Overspender, highlighting your top spending drivers.',
      color: 'from-purple-500 to-indigo-500',
    },
    {
      icon: TrendingUp,
      title: 'Predictive Wealth Forecast',
      desc: 'Trained regression algorithms project your 12-month savings and 5-year wealth accumulation with confidence bands.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Target,
      title: 'Goal-Based SIP Planning',
      desc: 'Calculate exact monthly SIP commitments, step-up rates, and inflation adjustments needed to achieve every milestone.',
      color: 'from-emerald-500 to-teal-500',
    },
    {
      icon: ShieldCheck,
      title: 'Transparent Health Score',
      desc: '0–100 weighted metric analyzing savings rate, emergency coverage, debt-to-income, and discretionary expense discipline.',
      color: 'from-amber-500 to-orange-500',
    },
  ];

  const steps = [
    {
      num: '01',
      title: 'Set Up Your Profile',
      desc: 'Provide your income, fixed commitments, and risk preference in a 2-minute guided onboarding.',
    },
    {
      num: '02',
      title: 'Track & Import Transactions',
      desc: 'Log daily expenses or import bank statements via CSV with automated categorization.',
    },
    {
      num: '03',
      title: 'Get AI-Powered Action Plans',
      desc: 'Receive transparent, explainable recommendations ranked by financial impact.',
    },
  ];

  return (
    <PageWrapper>
      {/* Hero Section */}
      <div className="relative pt-6 pb-16 sm:pb-24 overflow-hidden text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs sm:text-sm font-medium mb-6">
          <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
          <span>Final Year B.Tech Computer Science Project · Invertis University</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight max-w-4xl mx-auto">
          Intelligent Financial Planning Powered by{' '}
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Machine Learning
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
          FinWise combines mathematical compound planning, transparent health scoring, and trained ML microservices to help students and young professionals master their wealth.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-xl text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5"
          >
            <span>Start Free Advisor</span>
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-xl text-base font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-all shadow-sm"
          >
            <span>Demo Login</span>
            <ChevronRight className="w-5 h-5 ml-1 text-gray-400" />
          </Link>
        </div>

        {/* Stats highlight bar */}
        <div className="mt-14 max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-md border border-gray-200/80 dark:border-gray-800">
          <div>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">10,000+</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Synthetic Profiles</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">0–100</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Health Score Index</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">3-Tier</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Microservice Arch</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">100%</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Explainable AI</div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-12 border-t border-gray-200 dark:border-gray-800">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Core System Capabilities</h2>
          <p className="mt-3 text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            Engineered specifically to solve the manual spreadsheets problem with automated, intelligent forecasting.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="group relative p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${f.color} flex items-center justify-center text-white mb-5 shadow-md`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* How it works */}
      <div className="py-16 border-t border-gray-200 dark:border-gray-800">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold tracking-wider uppercase text-indigo-600 dark:text-indigo-400">
            Methodology
          </span>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">How FinWise Works</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((s, i) => (
            <div
              key={i}
              className="relative p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
            >
              <div className="text-3xl font-black text-indigo-600/20 dark:text-indigo-400/20 mb-3">{s.num}</div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{s.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="my-12 p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white text-center shadow-xl relative overflow-hidden">
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">Ready to explore the demo system?</h2>
        <p className="text-indigo-200 max-w-xl mx-auto text-sm sm:text-base mb-6">
          Access the full suite of financial calculators, real-time health score simulator, and machine learning insight dashboards.
        </p>
        <Link
          to="/register"
          className="inline-flex items-center px-6 py-3 rounded-xl bg-white text-indigo-900 font-bold hover:bg-indigo-50 transition-colors shadow-md"
        >
          Create Free Account
        </Link>
      </div>
    </PageWrapper>
  );
}
