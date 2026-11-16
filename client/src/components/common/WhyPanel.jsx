import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HelpCircle, Sparkles, TrendingUp, Award, ArrowRight } from 'lucide-react';
import explainService from '../../services/explain.service';

export default function WhyPanel({ isOpen, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      explainService
        .explainScore()
        .then((res) => {
          setData(res.data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-end bg-ink/20 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative h-full w-full max-w-md bg-surface p-6 shadow-2xl flex flex-col overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-blue-100">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <HelpCircle size={20} />
              </span>
              <div>
                <h3 className="font-semibold text-ink text-lg">Why this score?</h3>
                <p className="text-xs text-muted">A clear look at every part of your score</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-muted hover:text-ink hover:bg-blue-50 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center py-12">
              <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
            </div>
          ) : data ? (
            <div className="space-y-6 pt-4">
              {/* Overall Summary Card */}
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                    Health Score
                  </span>
                  <span className="text-2xl font-bold text-ink">{data.score}/100</span>
                </div>
                <p className="text-sm text-ink/80 leading-relaxed">{data.summary}</p>
              </div>

              {/* Quickest Win Banner */}
              {data.easiestWin && (
                <div className="p-4 rounded-2xl bg-white border border-blue-200 shadow-sm relative overflow-hidden">
                  <div className="flex items-start gap-3">
                    <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 shrink-0 mt-0.5">
                      <Sparkles size={18} />
                    </span>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
                        Easiest way to gain points
                      </h4>
                      <p className="text-sm text-ink font-medium leading-snug">{data.easiestWin}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Pillar Breakdown */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-3">
                  Score breakdown (6 parts)
                </h4>
                <div className="space-y-3">
                  {data.explanations?.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-surface border border-blue-100 hover:border-blue-300 transition-all shadow-xs"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{item.emoji}</span>
                          <span className="text-sm font-semibold text-ink">{item.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-ink">{item.score}</span>
                          <span className="text-xs text-muted">/100</span>
                        </div>
                      </div>

                      {/* Mini bar */}
                      <div className="w-full h-1.5 bg-blue-100 rounded-full overflow-hidden mb-2">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(5, item.score))}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted">
                        <span>{item.tip}</span>
                        <span className="font-semibold text-blue-700 shrink-0 ml-2">
                          +{item.contribution} pts
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Honest AI Notice */}
              <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 text-xs text-muted">
                <span className="font-semibold text-ink">How we score:</span> Calculated using
                transparent rules across 6 financial pillars. No fake scores, and your private data
                stays safe.
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-sm text-muted">
              Could not load the score explanation right now.
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
