import React from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Brain,
  Target,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Coins,
  Smile,
} from 'lucide-react';
import { motion } from 'framer-motion';
import PageWrapper from '../components/layout/PageWrapper';
import CornerDecor from '../components/common/CornerDecor';
import AnimatedNumber from '../components/common/AnimatedNumber';
import FloatingElements from '../components/common/FloatingElements';
import { pageMotion, fadeUpItem, staggerContainer } from '../styles/motion';

export default function Landing() {
  const features = [
    {
      icon: Brain,
      title: 'AI Behavior Classification',
      desc: 'See if you are a Saver, Balanced, or Overspender. Find where your money goes each month.',
    },
    {
      icon: TrendingUp,
      title: '5-Year Wealth Forecast',
      desc: 'See how your money can grow over 1, 3, and 5 years with regular monthly savings.',
    },
    {
      icon: Target,
      title: 'Easy Goal Planning',
      desc: 'Pick a goal like a laptop, travel, or safety cash. We tell you the exact monthly amount to save.',
    },
    {
      icon: ShieldCheck,
      title: 'Money Health Score (0–100)',
      desc: 'A single, honest number that checks your savings, loans, and emergency cushion.',
    },
  ];

  const steps = [
    {
      num: '01',
      title: 'Share your basic numbers',
      desc: 'Add your monthly income and fixed rent or bills in a 2-minute quick setup.',
    },
    {
      num: '02',
      title: 'Track your daily expenses',
      desc: 'Enter what you spend or upload a CSV file. We group it into food, travel, and shopping.',
    },
    {
      num: '03',
      title: 'Get simple, clear tips',
      desc: 'Get friendly ideas on where to save more and chat with Fin, your AI money buddy.',
    },
  ];

  return (
    <PageWrapper>
      <motion.div variants={pageMotion} initial="initial" animate="animate">
        {/* Hero Section */}
        <div className="relative pt-8 pb-16 sm:pb-24 text-center">
          {/* Subtle Corner Decorations & Floating Matter */}
          <CornerDecor variant="blob" position="top-right" opacity={0.35} />
          <CornerDecor variant="dots" position="bottom-left" opacity={0.4} />
          <FloatingElements variant="hero" />

          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs sm:text-sm font-medium mb-4 shadow-xs">
            <Sparkles className="w-4 h-4 text-brand-500" />
            <span>Intelligent Financial Planning Powered by Machine Learning</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-heading font-extrabold text-ink tracking-tight leading-tight max-w-4xl mx-auto">
            Money planning that actually{' '}
            <span className="text-brand-500 underline decoration-brand-200 decoration-wavy decoration-2">
              makes sense
            </span>
            .
          </h1>

          <p className="mt-5 text-base sm:text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            No confusing finance jargon. Track your daily expenses, grow your savings with smart SIP math, and check your Money Health Score in seconds.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3 rounded-2xl text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 shadow-card hover:shadow-hover transition-all transform hover:-translate-y-0.5"
            >
              <span>Start Free Advisor</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-2xl text-sm font-semibold text-ink bg-white hover:bg-brand-50 border border-brand-100 transition-all shadow-xs"
            >
              <span>Demo Login</span>
              <ChevronRight className="w-4 h-4 ml-1 text-muted" />
            </Link>
          </div>

          {/* Quick Highlight Stats Bar */}
          <div className="mt-14 max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-3xl bg-white border border-brand-100 shadow-card">
            <div className="p-2">
              <div className="text-2xl font-heading font-bold text-brand-600">
                <AnimatedNumber value={10000} suffix="+" />
              </div>
              <div className="text-xs text-muted mt-0.5">Sample Profiles</div>
            </div>
            <div className="p-2">
              <div className="text-2xl font-heading font-bold text-good">
                0 to 100
              </div>
              <div className="text-xs text-muted mt-0.5">Health Score Gauge</div>
            </div>
            <div className="p-2">
              <div className="text-2xl font-heading font-bold text-brand-500">
                ₹0
              </div>
              <div className="text-xs text-muted mt-0.5">100% Free Demo</div>
            </div>
            <div className="p-2">
              <div className="text-2xl font-heading font-bold text-ink">
                Class 7
              </div>
              <div className="text-xs text-muted mt-0.5">Simple English</div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="py-14 border-t border-brand-100">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-ink">
              Everything you need to handle your money
            </h2>
            <p className="mt-2 text-sm text-muted">
              We took away all the complicated spreadsheets and replaced them with friendly guidance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="relative p-6 rounded-2xl bg-white border border-brand-100 shadow-card hover:shadow-hover transition-all hover:-translate-y-1 overflow-hidden"
                >
                  <CornerDecor variant="dots" position="top-right" opacity={0.2} />
                  <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-heading font-bold text-ink mb-1.5">
                    {f.title}
                  </h3>
                  <p className="text-xs text-muted leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* How it works */}
        <div className="py-14 border-t border-brand-100">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-semibold tracking-wider uppercase text-brand-600">
              Three Simple Steps
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-ink mt-1">
              How FinWise helps you
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {steps.map((s, i) => (
              <div
                key={i}
                className="relative p-6 rounded-2xl bg-white border border-brand-100 shadow-card"
              >
                <div className="text-3xl font-heading font-black text-brand-100 mb-2">
                  {s.num}
                </div>
                <h3 className="text-base font-heading font-bold text-ink mb-1.5">
                  {s.title}
                </h3>
                <p className="text-xs text-muted leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA Card */}
        <div className="my-10 p-8 sm:p-10 rounded-3xl bg-brand-50 border border-brand-100 text-center relative overflow-hidden shadow-card">
          <CornerDecor variant="arc" position="top-right" opacity={0.5} />
          <CornerDecor variant="blob" position="bottom-left" opacity={0.3} />

          <div className="relative z-10 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-ink mb-2">
              Ready to see where your money goes?
            </h2>
            <p className="text-muted text-xs sm:text-sm mb-6">
              Sign in with one click as a Saver or an Overspender to see the entire dashboard in action.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/login"
                className="inline-flex items-center px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs shadow-card transition-colors"
              >
                Open Demo Accounts
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center px-6 py-2.5 rounded-xl bg-white hover:bg-brand-50 text-ink font-semibold text-xs border border-brand-100 transition-colors"
              >
                Create My Account
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </PageWrapper>
  );
}
