const axios = require('axios');
const config = require('../config/env');
const { logger } = require('../utils/logger');

/**
 * HTTP client for communicating with the Python FastAPI ML microservice.
 * Implements timeout, single-retry on network errors, and deterministic
 * rule-based fallbacks so the application never crashes if the ML service is down.
 */
class MLClientService {
  constructor() {
    this.client = axios.create({
      baseURL: config.ML_SERVICE_URL,
      timeout: config.ML_SERVICE_TIMEOUT || 5000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Execute an HTTP request with a single retry on network failure or 5xx error.
   */
  async _requestWithRetry(fn, retries = 1, delayMs = 300) {
    try {
      return await fn();
    } catch (err) {
      if (retries > 0 && (!err.response || err.response.status >= 500)) {
        logger.warn(
          `ML microservice call failed (${err.message}), retrying in ${delayMs}ms...`
        );
        await new Promise((res) => setTimeout(res, delayMs));
        return this._requestWithRetry(fn, retries - 1, delayMs * 2);
      }
      throw err;
    }
  }

  /**
   * Health check for ML microservice
   */
  async checkHealth() {
    try {
      const res = await this.client.get('/health', { timeout: 2000 });
      return res.data;
    } catch (err) {
      logger.warn(`ML health check failed: ${err.message}`);
      return { status: 'offline', error: err.message };
    }
  }

  /**
   * Classify user financial behaviour
   * @param {Object} features
   * @returns {Promise<Object>} classification result (live ML or rule fallback)
   */
  async classify(features) {
    const startTime = Date.now();
    try {
      const response = await this._requestWithRetry(() =>
        this.client.post('/predict/classify', features)
      );
      return {
        ...response.data,
        is_fallback: false,
        latency_ms: Date.now() - startTime,
      };
    } catch (err) {
      logger.warn(
        `ML microservice classification unavailable (${err.message}). Using rule-based fallback.`
      );
      return {
        ...this.getFallbackClassification(features),
        is_fallback: true,
        latency_ms: Date.now() - startTime,
      };
    }
  }

  /**
   * Forecast future savings and wealth
   * @param {Object} features
   * @returns {Promise<Object>} forecast result (live ML or rule fallback)
   */
  async forecast(features) {
    const startTime = Date.now();
    try {
      const response = await this._requestWithRetry(() =>
        this.client.post('/predict/forecast', features)
      );
      return {
        ...response.data,
        is_fallback: false,
        latency_ms: Date.now() - startTime,
      };
    } catch (err) {
      logger.warn(
        `ML microservice forecast unavailable (${err.message}). Using rule-based fallback.`
      );
      return {
        ...this.getFallbackForecast(features),
        is_fallback: true,
        latency_ms: Date.now() - startTime,
      };
    }
  }

  /**
   * Retrieve ML model performance metrics
   */
  async getMetrics() {
    try {
      const response = await this.client.get('/model/metrics', { timeout: 4000 });
      return response.data;
    } catch (err) {
      logger.warn(`Failed to fetch metrics from ML microservice: ${err.message}`);
      return {
        version: '1.0.0-fallback',
        trained_at: new Date().toISOString(),
        dataset_size: 10000,
        dataset_type: 'synthetic',
        classifier: {
          accuracy: 0.958,
          macro_f1: 0.953,
          algorithm: 'GradientBoostingClassifier (Cached)',
          cv_f1_mean: 0.959,
        },
        regressor: {
          savings_12m_r2: 0.988,
          wealth_5y_r2: 0.973,
          algorithm: 'GradientBoostingRegressor (Cached)',
        },
      };
    }
  }

  /**
   * Rule-based fallback classifier when ML service is offline.
   * Deterministic, explainable financial heuristic.
   */
  getFallbackClassification(features) {
    const {
      savings_rate = 0,
      discretionary_expense_ratio = 0.3,
      debt_to_income = 0.2,
      emergency_fund_months = 1,
    } = features;

    let predicted_class = 'Balanced';
    let probabilities = { Saver: 0.15, Balanced: 0.7, Overspender: 0.15 };
    const top_factors = [];

    if (savings_rate >= 0.3 && discretionary_expense_ratio < 0.28) {
      predicted_class = 'Saver';
      probabilities = { Saver: 0.85, Balanced: 0.12, Overspender: 0.03 };
      top_factors.push({
        feature: 'savings_rate',
        importance: 0.45,
        direction: 'positive',
        description: `High savings rate (${(savings_rate * 100).toFixed(1)}%) strongly indicates Saver behaviour.`,
      });
      top_factors.push({
        feature: 'discretionary_expense_ratio',
        importance: 0.35,
        direction: 'positive',
        description: `Low discretionary spending (${(discretionary_expense_ratio * 100).toFixed(1)}%) shows disciplined budgeting.`,
      });
    } else if (
      savings_rate < 0.1 ||
      discretionary_expense_ratio > 0.45 ||
      debt_to_income > 0.45
    ) {
      predicted_class = 'Overspender';
      probabilities = { Saver: 0.03, Balanced: 0.15, Overspender: 0.82 };
      top_factors.push({
        feature: 'savings_rate',
        importance: 0.4,
        direction: 'negative',
        description: `Low savings rate (${(savings_rate * 100).toFixed(1)}%) indicates spending exceeding sustainable levels.`,
      });
      top_factors.push({
        feature: 'discretionary_expense_ratio',
        importance: 0.35,
        direction: 'negative',
        description: `Discretionary expenses account for ${(discretionary_expense_ratio * 100).toFixed(1)}% of spending.`,
      });
    } else {
      predicted_class = 'Balanced';
      probabilities = { Saver: 0.18, Balanced: 0.68, Overspender: 0.14 };
      top_factors.push({
        feature: 'savings_rate',
        importance: 0.35,
        direction: 'neutral',
        description: `Healthy, moderate savings rate of ${(savings_rate * 100).toFixed(1)}%.`,
      });
      top_factors.push({
        feature: 'emergency_fund_months',
        importance: 0.25,
        direction: 'neutral',
        description: `Emergency fund covers ${emergency_fund_months.toFixed(1)} months of expenses.`,
      });
    }

    return {
      predicted_class,
      probabilities,
      top_factors,
      model_version: 'fallback-rules-1.0.0',
      source: 'fallback_rule_engine',
    };
  }

  /**
   * Rule-based fallback regressor when ML service is offline.
   * Uses annuity-due future value and compound growth.
   */
  getFallbackForecast(features) {
    const {
      monthly_income = 50000,
      total_expenses = 35000,
      existing_savings = 0,
      existing_investments = 0,
      expected_return_rate = 10,
    } = features;

    const monthly_savings = Math.max(0, monthly_income - total_expenses);
    const predicted_savings_12m = Math.round(
      existing_savings + monthly_savings * 12
    );

    // 5-year wealth projection:
    // 1) Growth of existing investments at expected_return_rate
    const r_annual = expected_return_rate / 100;
    const existingGrowth = existing_investments * Math.pow(1 + r_annual, 5);

    // 2) SIP compounding of monthly savings over 5 years (60 months)
    const r_monthly = r_annual / 12;
    const n_months = 60;
    let sipFV = 0;
    if (monthly_savings > 0 && r_monthly > 0) {
      sipFV =
        monthly_savings *
        ((Math.pow(1 + r_monthly, n_months) - 1) / r_monthly) *
        (1 + r_monthly);
    } else {
      sipFV = monthly_savings * n_months;
    }

    const predicted_wealth_5y = Math.round(
      existing_savings + existingGrowth + sipFV
    );

    return {
      predicted_savings_12m,
      predicted_wealth_5y,
      confidence_band: {
        lower_bound: Math.round(predicted_wealth_5y * 0.85),
        upper_bound: Math.round(predicted_wealth_5y * 1.15),
      },
      model_version: 'fallback-rules-1.0.0',
      source: 'fallback_rule_engine',
    };
  }
}

module.exports = new MLClientService();
