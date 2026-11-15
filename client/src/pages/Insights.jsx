import React, { useState, useEffect } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import { predictionService } from '../services/prediction.service';
import CornerDecor from '../components/common/CornerDecor';
import HelpTooltip from '../components/common/HelpTooltip';
import AnimatedNumber from '../components/common/AnimatedNumber';
import {
  BrainCircuit,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  Activity,
  History,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

export default function Insights() {
  const [classification, setClassification] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInsights() {
      try {
        setLoading(true);
        const [classRes, historyRes] = await Promise.allSettled([
          predictionService.classify(),
          predictionService.getHistory(null, 5),
        ]);

        if (classRes.status === 'fulfilled') setClassification(classRes.value.data);
        if (historyRes.status === 'fulfilled') setHistory(historyRes.value.data || []);
      } catch (err) {
        console.error('Failed to load ML insights', err);
      } finally {
        setLoading(false);
      }
    }

    loadInsights();
  }, []);

  if (loading) {
    return (
      <PageWrapper title="Your Spending Style">
        <div className="py-24 text-center text-[var(--muted)]">
          <BrainCircuit className="w-10 h-10 text-[var(--blue-500)] animate-pulse mx-auto mb-3" />
          Checking your numbers and spending patterns...
        </div>
      </PageWrapper>
    );
  }

  const predictedClass = classification?.predicted_class || 'Balanced';
  const probabilities = classification?.probabilities || {
    Saver: 0.2,
    Balanced: 0.65,
    Overspender: 0.15,
  };
  const topFactors = classification?.top_factors || [];
  const features = classification?.features || {};

  const personaMeta = {
    Saver: {
      color: 'emerald',
      tagline: 'Steady Saver',
      description:
        'You save money regularly, keep non-essential shopping low, and have an emergency fund ready.',
    },
    Balanced: {
      color: 'blue',
      tagline: 'Balanced Spender',
      description:
        'You balance your needs, wants, and savings in a healthy, sustainable way.',
    },
    Overspender: {
      color: 'coral',
      tagline: 'Heavy Spender',
      description:
        'A large share of your money goes to eating out or shopping, leaving less room for savings and goals.',
    },
  }[predictedClass] || {
    color: 'blue',
    tagline: 'Balanced Spender',
    description: 'You maintain a healthy balance in your day-to-day spending.',
  };

  return (
    <PageWrapper title="Your Spending Style">
      {/* Page Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--blue-50)] text-[var(--blue-700)] text-xs font-semibold rounded-full mb-2 border border-[var(--blue-100)]">
          <BrainCircuit className="w-3.5 h-3.5 text-[var(--blue-500)]" />
          Machine Learning Model & Explainability
        </div>
        <h1 className="text-2xl font-bold text-[var(--ink)]">
          Your Spending Style
        </h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          See which spending group our smart model places you in, and the top reasons why.
        </p>
      </div>

      {/* Hero Classification Card */}
      <div className="bg-white border border-[var(--blue-100)] rounded-2xl p-6 sm:p-8 mb-8 shadow-xs relative overflow-hidden">
        <CornerDecor variant="blob" position="top-right" size={100} opacity={0.35} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Persona Diagnosis */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">
                {predictedClass === 'Saver' ? '🛡️' : predictedClass === 'Overspender' ? '⚡' : '⚖️'}
              </span>
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-[var(--muted)]">
                  Your Spending Group
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--ink)]">
                  {personaMeta.tagline}
                </h2>
              </div>
            </div>
            <p className="text-sm text-[var(--ink)] leading-relaxed max-w-xl">
              {personaMeta.description}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2.5 text-xs text-[var(--muted)]">
              <span className="px-2.5 py-1 bg-[var(--blue-50)] rounded-lg border border-[var(--blue-100)] text-[var(--blue-700)]">
                Model: <strong>GradientBoosting ({classification?.model_version || '1.0.0'})</strong>
              </span>
              <span className="px-2.5 py-1 bg-[var(--blue-50)] rounded-lg border border-[var(--blue-100)] text-[var(--blue-700)]">
                Engine:{' '}
                <strong>
                  {classification?.source === 'ml_service' ? 'FastAPI ML Service' : 'Rule-Based Fallback'}
                </strong>
              </span>
              {classification?.latency_ms !== undefined && (
                <span className="px-2.5 py-1 bg-[var(--blue-50)] rounded-lg border border-[var(--blue-100)] text-[var(--blue-700)]">
                  Speed: <strong>{classification.latency_ms} ms</strong>
                </span>
              )}
            </div>
          </div>

          {/* Probabilities Distribution */}
          <div className="bg-[var(--blue-50)] rounded-xl p-5 border border-[var(--blue-100)]">
            <h3 className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider mb-4 flex items-center justify-between">
              <span>Group Chances</span>
              <Activity className="w-4 h-4 text-[var(--blue-500)]" />
            </h3>

            <div className="space-y-3">
              {Object.entries(probabilities).map(([cls, prob]) => {
                const pct = Math.round(prob * 100);
                const isSelected = cls === predictedClass;
                return (
                  <div key={cls}>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className={`font-semibold ${isSelected ? 'text-[var(--blue-700)] font-bold' : 'text-[var(--muted)]'}`}>
                        {cls === 'Saver' ? 'Saver' : cls === 'Balanced' ? 'Balanced' : 'Heavy Spender'} {isSelected && '✓'}
                      </span>
                      <span className="font-bold text-[var(--ink)]">{pct}%</span>
                    </div>
                    <div className="w-full h-2 bg-white rounded-full overflow-hidden border border-[var(--blue-100)]">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          cls === 'Saver'
                            ? 'bg-[var(--good)]'
                            : cls === 'Overspender'
                            ? 'bg-[var(--bad)]'
                            : 'bg-[var(--blue-500)]'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Feature Explainability (XAI) */}
      <div className="bg-white border border-[var(--blue-100)] rounded-2xl p-6 sm:p-8 mb-8 shadow-xs relative overflow-hidden">
        <CornerDecor variant="dots" position="top-right" size={50} opacity={0.3} />
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-[var(--blue-500)]" />
          <h2 className="text-lg font-bold text-[var(--ink)]">
            What Shaped This Result (Explainable AI)
          </h2>
        </div>
        <p className="text-xs text-[var(--muted)] mb-6">
          Here is how your actual money habits guided the machine learning model.
        </p>

        {topFactors.length === 0 ? (
          <p className="text-xs text-[var(--muted)]">Factors loaded.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topFactors.map((factor, idx) => (
              <div
                key={idx}
                className="p-4 bg-[var(--blue-50)] rounded-xl border border-[var(--blue-100)] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[var(--ink)] font-mono">
                      {factor.feature}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        factor.direction === 'positive'
                          ? 'bg-emerald-50 text-[var(--good)] border border-emerald-200'
                          : factor.direction === 'negative'
                          ? 'bg-rose-50 text-[var(--bad)] border border-rose-200'
                          : 'bg-white text-[var(--blue-700)] border border-[var(--blue-100)]'
                      }`}
                    >
                      {factor.direction} impact
                    </span>
                  </div>
                  <p className="text-xs text-[var(--ink)] leading-relaxed">
                    {factor.description}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-[var(--blue-100)] flex items-center justify-between text-[11px] text-[var(--muted)]">
                  <span>How much it mattered</span>
                  <span className="font-bold text-[var(--ink)]">
                    {(factor.importance * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Benchmark Metric Comparison Table */}
      <div className="bg-white border border-[var(--blue-100)] rounded-2xl p-6 sm:p-8 mb-8 shadow-xs relative overflow-hidden">
        <CornerDecor variant="arc" position="top-right" size={45} opacity={0.3} />
        <h2 className="text-lg font-bold text-[var(--ink)] mb-1">
          Your Numbers vs Healthy Guidelines
        </h2>
        <p className="text-xs text-[var(--muted)] mb-6">
          How your personal percentages compare against simple finance benchmarks.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--blue-100)] text-[var(--muted)] uppercase tracking-wider">
                <th className="pb-3 font-semibold">Area</th>
                <th className="pb-3 font-semibold">Your Number</th>
                <th className="pb-3 font-semibold">Healthy Target</th>
                <th className="pb-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--blue-100)]/60 text-[var(--ink)]">
              <tr>
                <td className="py-3 font-medium">Monthly Savings Rate</td>
                <td className="py-3 font-bold text-[var(--blue-700)]">
                  {((features.savings_rate || 0) * 100).toFixed(1)}%
                </td>
                <td className="py-3">At least 20%</td>
                <td className="py-3">
                  {(features.savings_rate || 0) >= 0.2 ? (
                    <span className="text-[var(--good)] font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Healthy
                    </span>
                  ) : (
                    <span className="text-[var(--warn)] font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Needs attention
                    </span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="py-3 font-medium">Fun & Shopping Outflows</td>
                <td className="py-3 font-bold text-[var(--blue-700)]">
                  {((features.discretionary_expense_ratio || 0) * 100).toFixed(1)}%
                </td>
                <td className="py-3">Under 30%</td>
                <td className="py-3">
                  {(features.discretionary_expense_ratio || 0) <= 0.3 ? (
                    <span className="text-[var(--good)] font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Well controlled
                    </span>
                  ) : (
                    <span className="text-[var(--bad)] font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> A bit high
                    </span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="py-3 font-medium">Emergency Cushion</td>
                <td className="py-3 font-bold text-[var(--blue-700)]">
                  {(features.emergency_fund_months || 0).toFixed(1)} months
                </td>
                <td className="py-3">3 to 6 months</td>
                <td className="py-3">
                  {(features.emergency_fund_months || 0) >= 3 ? (
                    <span className="text-[var(--good)] font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Well protected
                    </span>
                  ) : (
                    <span className="text-[var(--warn)] font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Under 3 months
                    </span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="py-3 font-medium">Loan Payments Share (DTI)</td>
                <td className="py-3 font-bold text-[var(--blue-700)]">
                  {((features.debt_to_income || 0) * 100).toFixed(1)}%
                </td>
                <td className="py-3">Under 35%</td>
                <td className="py-3">
                  {(features.debt_to_income || 0) <= 0.35 ? (
                    <span className="text-[var(--good)] font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Safe level
                    </span>
                  ) : (
                    <span className="text-[var(--bad)] font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Too high
                    </span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Historical Prediction Audit Log */}
      <div className="bg-white border border-[var(--blue-100)] rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-5 h-5 text-[var(--blue-500)]" />
          <h2 className="text-base font-bold text-[var(--ink)]">
            Previous Model Checks
          </h2>
        </div>

        {history.length === 0 ? (
          <p className="text-xs text-[var(--muted)]">No previous check records found.</p>
        ) : (
          <div className="space-y-2">
            {history.map((log) => (
              <div
                key={log._id}
                className="p-3 bg-[var(--blue-50)] rounded-xl text-xs flex items-center justify-between border border-[var(--blue-100)]"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono font-semibold text-[var(--blue-700)] uppercase">
                    {log.type}
                  </span>
                  <span className="text-[var(--muted)]">
                    {new Date(log.createdAt).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white text-[var(--muted)] border border-[var(--blue-100)] font-medium">
                    {log.source}
                  </span>
                </div>
                <div className="font-bold text-[var(--ink)]">
                  {log.output?.predicted_class ||
                    `₹${(log.output?.predicted_wealth_5y || 0).toLocaleString('en-IN')}`}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
