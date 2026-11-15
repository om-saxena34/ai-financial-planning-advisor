import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Wallet, Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import CornerDecor from '../components/common/CornerDecor';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Password strength calculation
  const getPasswordStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 10) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    return score; // 0 to 5
  };

  const strength = getPasswordStrength(password);
  const strengthLabels = ['Too short', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const strengthColors = [
    'bg-brand-100',
    'bg-bad',
    'bg-warn',
    'bg-warn',
    'bg-brand-500',
    'bg-good',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    const result = await register(name, email, password);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/onboarding');
    } else {
      setErrorMsg(result.error);
    }
  };

  return (
    <PageWrapper>
      <div className="min-h-[75vh] flex items-center justify-center py-6 px-4 relative">
        <CornerDecor variant="blob" position="top-right" opacity={0.3} />
        <CornerDecor variant="dots" position="bottom-left" opacity={0.35} />

        <div className="w-full max-w-md relative z-10">
          <div className="bg-white border border-brand-100 rounded-3xl p-8 sm:p-10 shadow-card relative overflow-hidden">
            <CornerDecor variant="arc" position="top-right" opacity={0.25} />

            {/* Header */}
            <div className="text-center mb-7 relative z-10">
              <div className="inline-flex w-11 h-11 rounded-2xl bg-brand-50 items-center justify-center text-brand-600 mb-3 shadow-xs">
                <Wallet className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-heading font-bold text-ink">Create Account</h1>
              <p className="mt-1 text-xs sm:text-sm text-muted">
                Join FinWise to plan your savings and hit your goals
              </p>
            </div>

            {/* Error banner */}
            {errorMsg && (
              <div className="mb-5 p-3 rounded-xl bg-bad-bg border border-bad/30 text-xs text-bad flex items-start space-x-2">
                <span>⚠️</span>
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
              <div>
                <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Om Sharma"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-100 bg-bg text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                  Email Address
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
                <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
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
                {/* Strength meter */}
                {password && (
                  <div className="mt-2">
                    <div className="flex justify-between items-center text-[11px] mb-1">
                      <span className="text-muted">Password Safety:</span>
                      <span className="font-semibold text-ink">
                        {strengthLabels[strength]}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-brand-50 rounded-full overflow-hidden flex">
                      <div
                        className={`h-full transition-all duration-300 ${strengthColors[strength]}`}
                        style={{ width: `${(strength / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your password"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-100 bg-bg text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 rounded-xl text-white font-semibold text-xs sm:text-sm bg-brand-500 hover:bg-brand-600 shadow-card transition-all flex items-center justify-center space-x-2 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Continue to Onboarding</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center text-xs text-muted relative z-10">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-brand-600 hover:underline">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
