import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ShieldCheck, Sparkles, Target, Coins } from 'lucide-react';

/**
 * FloatingElements component renders gentle, floating matter / badges.
 * Calm, continuous ambient motion calibrated to feel like a high-end fintech product.
 * Fully ignores pointer events so it never interferes with clicks or user interaction.
 */
export default function FloatingElements({ variant = 'hero' }) {
  if (variant === 'hero') {
    return (
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0" aria-hidden="true">
        {/* Floating Matter 1: Top-Right Health Pill */}
        <motion.div
          animate={{
            y: [-6, 6, -6],
            rotate: [-1, 1.5, -1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-12 right-6 lg:right-24 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-xs border border-[var(--blue-100)] shadow-card text-xs"
        >
          <span className="w-2 h-2 rounded-full bg-[var(--good)] animate-pulse" />
          <ShieldCheck className="w-3.5 h-3.5 text-[var(--good)]" />
          <span className="font-semibold text-[var(--ink)]">Health Score: 84/100</span>
        </motion.div>

        {/* Floating Matter 2: Left SIP Return Pill */}
        <motion.div
          animate={{
            y: [8, -8, 8],
            rotate: [1, -1, 1],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.5,
          }}
          className="absolute top-44 left-4 lg:left-20 hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-xs border border-[var(--blue-100)] shadow-card text-xs"
        >
          <TrendingUp className="w-3.5 h-3.5 text-[var(--blue-500)]" />
          <span className="font-semibold text-[var(--ink)]">SIP Compounding +12%</span>
          <span className="text-[10px] text-[var(--good)] font-bold bg-emerald-50 px-1.5 py-0.5 rounded-full">
            +₹3.2L
          </span>
        </motion.div>

        {/* Floating Matter 3: Bottom Right Savings Goal */}
        <motion.div
          animate={{
            y: [-7, 5, -7],
            x: [-2, 3, -2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
          className="absolute bottom-20 right-8 lg:right-32 hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-xs border border-[var(--blue-100)] shadow-card text-xs"
        >
          <Target className="w-3.5 h-3.5 text-[var(--warn)]" />
          <span className="font-semibold text-[var(--ink)]">Emergency Fund</span>
          <span className="text-[10px] font-bold text-[var(--blue-700)] bg-[var(--blue-50)] px-1.5 py-0.5 rounded-full">
            On Track
          </span>
        </motion.div>

        {/* Floating Soft Ambient Sparkle Dots */}
        <div className="absolute top-28 left-1/4 w-3 h-3 rounded-full bg-[var(--blue-300)] opacity-40 animate-pulse-subtle" />
        <div className="absolute top-64 right-1/4 w-2 h-2 rounded-full bg-[var(--blue-400)] opacity-35 animate-float" />
        <div className="absolute bottom-28 left-1/3 w-2.5 h-2.5 rounded-full bg-[var(--blue-200)] opacity-40 animate-float-reverse" />
      </div>
    );
  }

  if (variant === 'dashboard') {
    return (
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0" aria-hidden="true">
        {/* Subtle floating matter dots in dashboard canvas */}
        <div className="absolute top-8 right-16 w-3 h-3 rounded-full bg-[var(--blue-300)] opacity-30 animate-float-slow" />
        <div className="absolute top-48 left-8 w-2 h-2 rounded-full bg-[var(--blue-400)] opacity-25 animate-float-reverse" />
        <div className="absolute bottom-16 right-1/3 w-2.5 h-2.5 rounded-full bg-[var(--blue-200)] opacity-30 animate-pulse-subtle" />
      </div>
    );
  }

  return null;
}
