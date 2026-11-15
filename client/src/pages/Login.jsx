import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Wallet, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import CornerDecor from '../components/common/CornerDecor';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const redirectPath = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      if (!result.data?.onboardingComplete) {
        navigate('/onboarding');
      } else {
        navigate(redirectPath);
      }
    } else {
      setErrorMsg(result.error);
    }
  };

  const handleDemoFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrorMsg('');
  };

  return (
    <PageWrapper>
      <div className="min-h-[75vh] flex items-center justify-center py-6 px-4 relative">
        <CornerDecor variant="blob" position="top-right" opacity={0.3} />
        <CornerDecor variant="dots" position="bottom-left" opacity={0.35} />

        <div className="w-full max-w-md relative z-10">
          {/* Card */}
          <div className="bg-white border border-brand-100 rounded-3xl p-8 sm:p-10 shadow-card relative overflow-hidden">
            <CornerDecor variant="arc" position="top-right" opacity={0.25} />

            {/* Header */}
            <div className="text-center mb-7 relative z-10">
              <div className="inline-flex w-11 h-11 rounded-2xl bg-brand-50 items-center justify-center text-brand-600 mb-3 shadow-xs">
                <Wallet className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-heading font-bold text-ink">Welcome Back</h1>
              <p className="mt-1 text-xs sm:text-sm text-muted">
                Sign in to check your money score and savings goals
              </p>
            </div>

            {/* Error banner */}
            {errorMsg && (
              <div className="mb-5 p-3 rounded-xl bg-bad-bg border border-bad/30 text-xs text-bad flex items-start space-x-2">
                <span>⚠️</span>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
              <div>
                <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                  Your Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-100 bg-bg text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-ink uppercase tracking-wider">
                    Password
                  </label>
                  <span className="text-xs text-brand-600 hover:underline cursor-pointer">
                    Forgot password?
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-brand-100 bg-bg text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all text-xs sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted hover:text-ink"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl text-white font-semibold text-xs sm:text-sm bg-brand-500 hover:bg-brand-600 shadow-card transition-all flex items-center justify-center space-x-2 disabled:opacity-60 mt-2"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Accounts for Viva Evaluation */}
            <div className="mt-7 pt-5 border-t border-brand-100 relative z-10">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted text-center mb-2.5">
                Quick Demo Accounts (1-Click Fill)
              </p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleDemoFill('saver.demo@finwise.com', 'Password@123')}
                  className="p-2 rounded-xl border border-brand-100 bg-brand-50/60 hover:bg-brand-50 text-ink transition-colors text-left"
                >
                  <span className="font-semibold block text-good text-[11px]">Saver Demo</span>
                  <span className="text-[10px] text-muted truncate block">Score 89</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoFill('balanced.demo@finwise.com', 'Password@123')}
                  className="p-2 rounded-xl border border-brand-100 bg-brand-50/60 hover:bg-brand-50 text-ink transition-colors text-left"
                >
                  <span className="font-semibold block text-brand-600 text-[11px]">Balanced</span>
                  <span className="text-[10px] text-muted truncate block">Score 74</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoFill('overspender.demo@finwise.com', 'Password@123')}
                  className="p-2 rounded-xl border border-brand-100 bg-brand-50/60 hover:bg-brand-50 text-ink transition-colors text-left"
                >
                  <span className="font-semibold block text-bad text-[11px]">Overspender</span>
                  <span className="text-[10px] text-muted truncate block">Score 36</span>
                </button>
              </div>
            </div>

            {/* Switch to Register */}
            <div className="mt-6 text-center text-xs text-muted relative z-10">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-brand-600 hover:underline">
                Create one in 1 minute
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
