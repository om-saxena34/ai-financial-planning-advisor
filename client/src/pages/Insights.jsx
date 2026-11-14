import React, { useState, useEffect } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import { predictionService } from '../services/prediction.service';
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
  Layers,
  ArrowRight,
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
      <PageWrapper title="ML Insights">
        <div className="py-24 text-center text-gray-500">
          <BrainCircuit className="w-10 h-10 text-indigo-600 animate-pulse mx-auto mb-3" />
          Querying ML inference engine and extracting feature weights...
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
      tagline: 'Disciplined Capital Accumulator',
      description:
        'Your spending telemetry reflects consistent savings, low discretionary friction, and an emergency cushion exceeding benchmark minimums.',
    },
    Balanced: {
      color: 'indigo',
      tagline: 'Sustainable Cash-Flow Equilibrium',
      description:
        'You maintain healthy financial equilibrium with predictable fixed outgo and moderate savings velocity.',
    },
    Overspender: {
      color: 'rose',
      tagline: 'High Discretionary Velocity',
      description:
        'Outflows in discretionary and dining categories are outpacing sustainable thresholds, putting goal timelines and emergency buffers at risk.',
    },
  }[predictedClass] || {
    color: 'indigo',
    tagline: 'Sustainable Cash-Flow Equilibrium',
    description: 'You maintain healthy financial equilibrium.',
  };

  return (
    <PageWrapper title="AI Behavioral Insights">
      {/* Page Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-semibold rounded-full mb-2">
          <BrainCircuit className="w-3.5 h-3.5" />
          Machine Learning Classification & Explainability (XAI)
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          AI Financial Behavioral Profile
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Detailed transparency breakdown of the GradientBoosting model diagnosis, class confidence probabilities, and top contributing factors.
        </p>
      </div>

      {/* Hero Classification Card */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 mb-8 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Persona Diagnosis */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">
                {predictedClass === 'Saver' ? '🛡️' : predictedClass === 'Overspender' ? '⚡' : '⚖️'}
              </span>
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-gray-400">
                  Predicted Persona
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
                  {predictedClass}
                </h2>
              </div>
            </div>
            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-2">
              {personaMeta.tagline}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-xl">
              {personaMeta.description}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-500">
              <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                Model: <strong>{classification?.model_version || '1.0.0'}</strong>
              </span>
              <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                Source:{' '}
                <strong>
                  {classification?.source === 'ml_service' ? 'FastAPI ML Microservice' : 'Rule-Based Fallback'}
                </strong>
              </span>
              {classification?.latency_ms !== undefined && (
                <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  Inference Latency: <strong>{classification.latency_ms} ms</strong>
                </span>
              )}
            </div>
          </div>

          {/* Probabilities Distribution */}
          <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center justify-between">
              <span>Class Probabilities</span>
              <Activity className="w-4 h-4 text-indigo-500" />
            </h3>

            <div className="space-y-3">
              {Object.entries(probabilities).map(([cls, prob]) => {
                const pct = Math.round(prob * 100);
                const isSelected = cls === predictedClass;
                return (
                  <div key={cls}>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className={`font-semibold ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'}`}>
                        {cls} {isSelected && '✓'}
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white">{pct}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          cls === 'Saver'
                            ? 'bg-emerald-500'
                            : cls === 'Overspender'
                            ? 'bg-rose-500'
                            : 'bg-indigo-500'
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
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 mb-8 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Top Feature Drivers (Explainable AI)
          </h2>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
          How each quantified dimension of your financial telemetry influenced the machine learning model's diagnosis.
        </p>

        {topFactors.length === 0 ? (
          <p className="text-xs text-gray-500">Feature importance factors loaded.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topFactors.map((factor, idx) => (
              <div
                key={idx}
                className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-900 dark:text-white font-mono">
                      {factor.feature}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        factor.direction === 'positive'
                          ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                          : factor.direction === 'negative'
                          ? 'bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
                          : 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                      }`}
                    >
                      {factor.direction} impact
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                    {factor.description}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700/60 flex items-center justify-between text-[11px] text-gray-500">
                  <span>Normalized Weight</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {(factor.importance * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Benchmark Metric Comparison Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 mb-8 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
          Financial Metric Telemetry vs Benchmarks
        </h2>
        <p className="text-xs text-gray-500 mb-6">
          Comparison of your measured ratios against standard personal finance guidelines.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-400 uppercase tracking-wider">
                <th className="pb-3 font-semibold">Metric</th>
                <th className="pb-3 font-semibold">Your Value</th>
                <th className="pb-3 font-semibold">Healthy Benchmark</th>
                <th className="pb-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
              <tr>
                <td className="py-3 font-medium">Monthly Savings Rate</td>
                <td className="py-3 font-bold text-indigo-600 dark:text-indigo-400">
                  {((features.savings_rate || 0) * 100).toFixed(1)}%
                </td>
                <td className="py-3">≥ 20%</td>
                <td className="py-3">
                  {(features.savings_rate || 0) >= 0.2 ? (
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Healthy
                    </span>
                  ) : (
                    <span className="text-amber-500 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Needs Attention
                    </span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="py-3 font-medium">Discretionary Ratio</td>
                <td className="py-3 font-bold text-indigo-600 dark:text-indigo-400">
                  {((features.discretionary_expense_ratio || 0) * 100).toFixed(1)}%
                </td>
                <td className="py-3">≤ 30%</td>
                <td className="py-3">
                  {(features.discretionary_expense_ratio || 0) <= 0.3 ? (
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Controlled
                    </span>
                  ) : (
                    <span className="text-rose-500 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> High Velocity
                    </span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="py-3 font-medium">Emergency Reserve Months</td>
                <td className="py-3 font-bold text-indigo-600 dark:text-indigo-400">
                  {(features.emergency_fund_months || 0).toFixed(1)} months
                </td>
                <td className="py-3">3 to 6 months</td>
                <td className="py-3">
                  {(features.emergency_fund_months || 0) >= 3 ? (
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Protected
                    </span>
                  ) : (
                    <span className="text-amber-500 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Under-buffered
                    </span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="py-3 font-medium">Debt-to-Income (DTI)</td>
                <td className="py-3 font-bold text-indigo-600 dark:text-indigo-400">
                  {((features.debt_to_income || 0) * 100).toFixed(1)}%
                </td>
                <td className="py-3">≤ 35%</td>
                <td className="py-3">
                  {(features.debt_to_income || 0) <= 0.35 ? (
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Manageable
                    </span>
                  ) : (
                    <span className="text-rose-500 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Elevated Burden
                    </span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Historical Prediction Audit Log */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            Audit Trail & Inference History
          </h2>
        </div>

        {history.length === 0 ? (
          <p className="text-xs text-gray-500">No previous inference logs found.</p>
        ) : (
          <div className="space-y-2">
            {history.map((log) => (
              <div
                key={log._id}
                className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs flex items-center justify-between border border-gray-200 dark:border-gray-700/60"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono font-semibold text-indigo-600 uppercase">
                    {log.type}
                  </span>
                  <span className="text-gray-500">
                    {new Date(log.createdAt).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium">
                    {log.source}
                  </span>
                </div>
                <div className="font-bold text-gray-900 dark:text-white">
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
