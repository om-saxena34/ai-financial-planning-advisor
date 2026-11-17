import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ThemeToggle from '../common/ThemeToggle';
import {
  Wallet,
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  Target,
  Calculator,
  Brain,
  Receipt,
  Sparkles,
  Sliders,
  BarChart3,
  Bot,
  Search,
  GraduationCap,
  UploadCloud,
  TrendingUp,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Life Plan', path: '/future-plan', icon: TrendingUp },
    { name: 'Expenses', path: '/transactions', icon: Receipt },
    { name: 'Goals', path: '/goals', icon: Target },
    { name: 'Ask Fin', path: '/chat', icon: Bot },
    { name: 'Tips for You', path: '/recommendations', icon: Sparkles },
    { name: 'What-If', path: '/what-if', icon: Sliders },
    { name: 'Student', path: '/student-planner', icon: GraduationCap },
    { name: 'Import CSV', path: '/statement-upload', icon: UploadCloud },
    { name: 'Calculators', path: '/calculators/sip', icon: Calculator },
    { name: 'Your Pattern', path: '/insights', icon: Brain },
  ];

  const isActive = (path) =>
    location.pathname === path || (path !== '/' && location.pathname.startsWith(path + '/'));

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-brand-100 shadow-subtle transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-brand-500 text-white flex items-center justify-center shadow-sm group-hover:bg-brand-600 transition-colors">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="font-heading font-bold text-xl tracking-tight text-ink">
                Fin<span className="text-brand-500">Wise</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          {isAuthenticated && (
            <div className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      active
                        ? 'text-brand-700 bg-brand-50 font-semibold shadow-xs'
                        : 'text-ink-secondary hover:text-ink hover:bg-brand-50/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Right actions: Search + Theme + Profile Dropdown or Sign In */}
          <div className="hidden lg:flex items-center space-x-3">
            <ThemeToggle />
            <button
              onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs text-muted hover:text-ink bg-brand-50/50 hover:bg-brand-50 border border-brand-100 transition-all cursor-pointer"
              title="Search or Jump to page (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-brand-500" />
              <span className="text-[11px] font-medium">Quick Search</span>
              <kbd className="text-[9px] font-mono bg-white border border-brand-100 px-1 py-0.2 rounded text-muted shadow-2xs">
                ⌘K
              </kbd>
            </button>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 p-1 rounded-full hover:bg-brand-50 border border-transparent hover:border-brand-100 transition-all"
                  aria-label="User menu"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center font-heading font-bold text-xs shadow-xs">
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-medium text-ink max-w-[120px] truncate">
                    {user?.name || 'My Account'}
                  </span>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-card border border-brand-100 py-1.5 z-50 animate-fade-in">
                    <div className="px-4 py-2 border-b border-brand-50">
                      <p className="text-xs font-bold text-ink">{user?.name || 'User'}</p>
                      <p className="text-[11px] text-muted truncate">{user?.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-xs text-ink hover:bg-brand-50 transition-colors"
                    >
                      <User className="w-3.5 h-3.5 mr-2 text-brand-500" /> Your Profile
                    </Link>
                    <Link
                      to="/model-metrics"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-xs text-brand-600 hover:bg-brand-50 transition-colors font-medium"
                    >
                      <BarChart3 className="w-3.5 h-3.5 mr-2" /> Model Details (Viva)
                    </Link>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center px-4 py-2 text-xs text-bad hover:bg-bad-bg transition-colors text-left"
                    >
                      <LogOut className="w-3.5 h-3.5 mr-2" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-ink-secondary hover:text-ink transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-xl shadow-xs transition-colors"
                >
                  Start Free
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button + theme */}
          <div className="flex lg:hidden items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-ink-secondary hover:bg-brand-50"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-brand-100 px-4 pt-2 pb-4 space-y-1 bg-white shadow-card">
          {isAuthenticated ? (
            <>
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium text-ink hover:bg-brand-50"
                  >
                    <Icon className="w-4 h-4 text-brand-500" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
              <div className="pt-2 border-t border-brand-100">
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium text-ink"
                >
                  <User className="w-4 h-4 text-brand-500" />
                  <span>Your Profile</span>
                </Link>
                <Link
                  to="/model-metrics"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium text-brand-600"
                >
                  <BarChart3 className="w-4 h-4 text-brand-500" />
                  <span>Model Details (Viva)</span>
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium text-bad text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-2 text-ink text-sm font-semibold"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-2 bg-brand-500 text-white rounded-xl text-sm font-semibold shadow-xs"
              >
                Start Free
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
