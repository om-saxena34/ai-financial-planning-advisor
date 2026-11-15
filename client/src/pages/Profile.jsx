import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  User,
  Shield,
  Lock,
  Save,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import CornerDecor from '../components/common/CornerDecor';
import HelpTooltip from '../components/common/HelpTooltip';

export default function Profile() {
  const { user, checkAuth } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordUpdating, setPasswordUpdating] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/profile');
      if (data.data?.profile) {
        setProfile(data.data.profile);
      }
    } catch (err) {
      toast.error('Could not load profile details.');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (field, value) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profile) return;
    try {
      setSaving(true);
      const payload = {
        age: Number(profile.age),
        occupationType: profile.occupationType,
        dependents: Number(profile.dependents),
        monthlyIncome: Number(profile.monthlyIncome),
        fixedExpenses: Number(profile.fixedExpenses),
        existingSavings: Number(profile.existingSavings),
        existingInvestments: Number(profile.existingInvestments),
        riskProfile: profile.riskProfile,
      };
      await api.put('/profile', payload);
      toast.success('Your changes have been saved!');
      fetchProfile();
    } catch (err) {
      const msg = err.response?.data?.message || 'Error updating profile.';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }
    try {
      setPasswordUpdating(true);
      await api.put('/auth/password', { currentPassword, newPassword });
      toast.success('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not change password.';
      toast.error(msg);
    } finally {
      setPasswordUpdating(false);
    }
  };

  const handleResetProfile = async () => {
    if (!window.confirm('Are you sure you want to reset your profile? You will need to complete onboarding setup again.')) {
      return;
    }
    try {
      await api.delete('/profile');
      toast.success('Profile reset. Taking you to setup...');
      await checkAuth();
      window.location.href = '/onboarding';
    } catch (err) {
      toast.error('Could not reset profile.');
    }
  };

  return (
    <PageWrapper
      title="Your Account & Money Settings"
      subtitle="Update your salary, savings, password, and how you invest."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Account Info & Password */}
        <div className="space-y-6">
          {/* User Card */}
          <div className="bg-white border border-[var(--blue-100)] rounded-3xl p-6 shadow-xs relative overflow-hidden">
            <CornerDecor variant="dots" position="top-right" size={50} opacity={0.3} />
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-[var(--blue-500)] text-white flex items-center justify-center font-bold text-2xl shadow-xs">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div>
                <h3 className="font-bold text-lg text-[var(--ink)]">{user?.name}</h3>
                <p className="text-xs text-[var(--muted)]">{user?.email}</p>
                <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-[var(--good)] text-[11px] font-semibold border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Active Member
                </div>
              </div>
            </div>

            <div className="border-t border-[var(--blue-100)] pt-4 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Role:</span>
                <span className="font-semibold text-[var(--ink)] capitalize">{user?.role || 'User'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Currency:</span>
                <span className="font-semibold text-[var(--ink)]">{user?.currency || 'INR (₹)'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Setup Status:</span>
                <span className={`font-semibold ${user?.onboardingComplete ? 'text-[var(--good)]' : 'text-[var(--warn)]'}`}>
                  {user?.onboardingComplete ? 'Complete' : 'Pending'}
                </span>
              </div>
            </div>
          </div>

          {/* Change Password Card */}
          <div className="bg-white border border-[var(--blue-100)] rounded-3xl p-6 shadow-xs relative overflow-hidden">
            <CornerDecor variant="arc" position="top-right" size={40} opacity={0.3} />
            <h4 className="font-bold text-sm text-[var(--ink)] flex items-center space-x-2 mb-4">
              <Lock className="w-4 h-4 text-[var(--blue-500)]" />
              <span>Change Password</span>
            </h4>
            <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
              <div>
                <label className="block text-[var(--ink)] font-semibold mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[var(--blue-100)] bg-[var(--bg)] text-[var(--ink)] outline-none focus:border-[var(--blue-500)]"
                />
              </div>
              <div>
                <label className="block text-[var(--ink)] font-semibold mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="At least 6 characters"
                  className="w-full px-3 py-2 rounded-xl border border-[var(--blue-100)] bg-[var(--bg)] text-[var(--ink)] outline-none focus:border-[var(--blue-500)]"
                />
              </div>
              <div>
                <label className="block text-[var(--ink)] font-semibold mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[var(--blue-100)] bg-[var(--bg)] text-[var(--ink)] outline-none focus:border-[var(--blue-500)]"
                />
              </div>
              <button
                type="submit"
                disabled={passwordUpdating}
                className="w-full py-2 px-4 rounded-xl text-white font-semibold bg-[var(--blue-500)] hover:bg-[var(--blue-700)] transition-colors shadow-xs disabled:opacity-60"
              >
                {passwordUpdating ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Financial Profile Parameters */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-[var(--blue-100)] rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
            <CornerDecor variant="blob" position="top-right" size={90} opacity={0.3} />
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--blue-100)]">
              <div>
                <h3 className="font-bold text-lg text-[var(--ink)] flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-[var(--blue-500)]" />
                  <span>Your Financial Numbers</span>
                </h3>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  Update these whenever your income, bills, or savings change.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetProfile}
                className="text-xs font-semibold text-[var(--bad)] hover:underline flex items-center space-x-1"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset Setup
              </button>
            </div>

            {loading ? (
              <div className="py-12 text-center text-sm text-[var(--muted)]">Loading your numbers...</div>
            ) : !profile ? (
              <div className="py-12 text-center">
                <p className="text-sm text-[var(--muted)] mb-4">No financial numbers saved yet.</p>
                <a
                  href="/onboarding"
                  className="inline-flex items-center px-4 py-2 rounded-xl bg-[var(--blue-500)] hover:bg-[var(--blue-700)] text-white text-xs font-semibold"
                >
                  Start Setup Wizard
                </a>
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--ink)] mb-1.5">
                      Age
                    </label>
                    <input
                      type="number"
                      min="18"
                      max="100"
                      value={profile.age || ''}
                      onChange={(e) => handleProfileChange('age', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[var(--blue-100)] bg-[var(--bg)] text-sm text-[var(--ink)] outline-none focus:border-[var(--blue-500)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--ink)] mb-1.5">
                      What You Do
                    </label>
                    <select
                      value={profile.occupationType || 'salaried'}
                      onChange={(e) => handleProfileChange('occupationType', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[var(--blue-100)] bg-[var(--bg)] text-sm text-[var(--ink)] outline-none"
                    >
                      <option value="student">Student</option>
                      <option value="salaried">Salaried Job</option>
                      <option value="self-employed">Self-Employed / Freelancer</option>
                      <option value="business">Business Owner</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--ink)] mb-1.5">
                      Monthly Take-Home Income (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={profile.monthlyIncome || ''}
                      onChange={(e) => handleProfileChange('monthlyIncome', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[var(--blue-100)] bg-[var(--bg)] text-sm text-[var(--ink)] outline-none focus:border-[var(--blue-500)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--ink)] mb-1.5">
                      Fixed Monthly Bills (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="500"
                      value={profile.fixedExpenses || ''}
                      onChange={(e) => handleProfileChange('fixedExpenses', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[var(--blue-100)] bg-[var(--bg)] text-sm text-[var(--ink)] outline-none focus:border-[var(--blue-500)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--ink)] mb-1.5">
                      Bank Balance & Cash (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={profile.existingSavings || ''}
                      onChange={(e) => handleProfileChange('existingSavings', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[var(--blue-100)] bg-[var(--bg)] text-sm text-[var(--ink)] outline-none focus:border-[var(--blue-500)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--ink)] mb-1.5">
                      Current Investments (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={profile.existingInvestments || ''}
                      onChange={(e) => handleProfileChange('existingInvestments', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[var(--blue-100)] bg-[var(--bg)] text-sm text-[var(--ink)] outline-none focus:border-[var(--blue-500)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--ink)] mb-1.5">
                      Dependents
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={profile.dependents || 0}
                      onChange={(e) => handleProfileChange('dependents', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[var(--blue-100)] bg-[var(--bg)] text-sm text-[var(--ink)] outline-none focus:border-[var(--blue-500)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--ink)] mb-1.5">
                      Investment Risk Preference
                    </label>
                    <select
                      value={profile.riskProfile || 'moderate'}
                      onChange={(e) => handleProfileChange('riskProfile', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[var(--blue-100)] bg-[var(--bg)] text-sm text-[var(--ink)] outline-none"
                    >
                      <option value="conservative">Safe & Steady (~7% p.a.)</option>
                      <option value="moderate">Balanced (~10–12% p.a.)</option>
                      <option value="aggressive">Growth Focused (~14–16% p.a.)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center px-6 py-2.5 rounded-xl text-white font-semibold bg-[var(--blue-500)] hover:bg-[var(--blue-700)] transition-colors shadow-xs text-sm disabled:opacity-60"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
