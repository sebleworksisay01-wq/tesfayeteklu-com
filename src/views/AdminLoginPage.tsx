import React, { useState } from 'react';
import { 
  Shield, Key, Eye, EyeOff, Lock, Mail, ArrowLeft, 
  AlertCircle, CheckCircle2, RefreshCw, ArrowRight, Sparkles, UserPlus, Send
} from 'lucide-react';
import { GlobalSiteIdentity } from '../types/cms';
import {
  loginAdmin,
  requestPasswordReset,
  resetPasswordWithCode,
  setupInitialAdminAccount,
  resendVerificationEmail,
  sendAdminPasswordReset,
  AUTHORIZED_ADMIN_EMAIL,
} from '../services/api';

interface AdminLoginPageProps {
  identity?: GlobalSiteIdentity;
  onLoginSuccess: () => void;
  onReturnToSite: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  identity,
  onLoginSuccess,
  onReturnToSite,
}) => {
  // Login form state
  const [email, setEmail] = useState(AUTHORIZED_ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUnverified, setIsUnverified] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  // Initial Admin Account Setup state
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [setupPassword, setSetupPassword] = useState('');
  const [setupConfirm, setSetupConfirm] = useState('');
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupMessage, setSetupMessage] = useState<string | null>(null);
  const [setupError, setSetupError] = useState<string | null>(null);

  // Forgot password workflow state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<'request' | 'reset'>('request');
  const [forgotEmail, setForgotEmail] = useState(AUTHORIZED_ADMIN_EMAIL);
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const [devCodeHint, setDevCodeHint] = useState<string | null>(null);

  // Validation
  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsUnverified(false);
    setResendStatus(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Please provide your administrator email address.');
      return;
    }

    if (!validateEmail(cleanEmail)) {
      setError('Please enter a valid email address format.');
      return;
    }

    if (!password) {
      setError('Please enter your account password.');
      return;
    }

    setLoading(true);

    try {
      await loginAdmin(password, cleanEmail, rememberMe);
      onLoginSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid email or password';
      setError(msg);
      if (msg.toLowerCase().includes('verification required') || msg.toLowerCase().includes('unverified')) {
        setIsUnverified(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setResendStatus('Sending verification link...');
      const res = await resendVerificationEmail();
      setResendStatus(res.message);
    } catch (err) {
      setResendStatus(err instanceof Error ? err.message : 'Unable to resend verification.');
    }
  };

  const handleInitialSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSetupError(null);
    setSetupMessage(null);

    if (setupPassword.length < 8) {
      setSetupError('Password must be at least 8 characters in length.');
      return;
    }

    if (setupPassword !== setupConfirm) {
      setSetupError('Passwords do not match. Please re-enter.');
      return;
    }

    setSetupLoading(true);

    try {
      const res = await setupInitialAdminAccount(AUTHORIZED_ADMIN_EMAIL, setupPassword);
      setSetupMessage(res.message);
      setPassword(setupPassword);
      setTimeout(() => {
        setShowSetupModal(false);
      }, 4000);
    } catch (err) {
      setSetupError(err instanceof Error ? err.message : 'Failed to initialize administrator account.');
    } finally {
      setSetupLoading(false);
    }
  };

  const handleForgotPasswordRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotSuccess(null);
    setDevCodeHint(null);

    const cleanEmail = forgotEmail.trim();
    if (!cleanEmail || !validateEmail(cleanEmail)) {
      setForgotError('Please enter a valid administrator email address.');
      return;
    }

    setForgotLoading(true);

    try {
      // First, dispatch real Firebase Auth password reset email
      await sendAdminPasswordReset(cleanEmail);

      // Also trigger reset code workflow
      const res = await requestPasswordReset(cleanEmail);
      setForgotSuccess(res.message || 'Password reset instructions have been dispatched to your email.');
      if (res.devHint?.resetCode) {
        setDevCodeHint(res.devHint.resetCode);
        setResetCode(res.devHint.resetCode);
      }
      setForgotStep('reset');
    } catch (err: unknown) {
      setForgotError(err instanceof Error ? err.message : 'Unable to dispatch reset request.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);

    if (!resetCode.trim()) {
      setForgotError('Please enter the 6-digit verification code.');
      return;
    }

    if (newPassword.length < 8) {
      setForgotError('New password must contain at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setForgotError('New passwords do not match. Please re-enter.');
      return;
    }

    setForgotLoading(true);

    try {
      const res = await resetPasswordWithCode(forgotEmail.trim(), resetCode.trim(), newPassword);
      setForgotSuccess(res.message);
      setPassword(newPassword);
      setEmail(forgotEmail.trim());
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotStep('request');
        setForgotSuccess(null);
      }, 1800);
    } catch (err: unknown) {
      setForgotError(err instanceof Error ? err.message : 'Failed to reset password.');
    } finally {
      setForgotLoading(false);
    }
  };

  const companyName = identity?.companyName || 'TesfayeTech';
  const logoText = identity?.logoText || 'TesfayeTech';

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between relative overflow-hidden text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Background Decorative Tech Aesthetic */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.18),rgba(255,255,255,0))] pointer-events-none" />
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{
          backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <header className="relative z-10 w-full px-6 py-5 flex items-center justify-between max-w-7xl mx-auto">
        <button
          onClick={onReturnToSite}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Return to Public Website</span>
        </button>

        <div className="flex items-center gap-2 text-2xs text-slate-500 uppercase tracking-widest font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span>Firebase Auth Restricted</span>
        </div>
      </header>

      {/* Main Login Card Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-[440px]">
          
          {/* Card Wrapper */}
          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl overflow-hidden ring-1 ring-white/10 transition-all">
            
            {/* Card Header & Branding */}
            <div className="p-8 pb-6 text-center border-b border-slate-800/80 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-900/60">
              
              {/* Dynamic Logo */}
              <div className="flex justify-center mb-5">
                {identity?.logoUrl ? (
                  <img
                    src={identity.logoUrl}
                    alt={companyName}
                    className="h-10 w-auto object-contain"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 border border-blue-400/30">
                    <Shield className="w-7 h-7" />
                  </div>
                )}
              </div>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-2xs font-semibold uppercase tracking-wider mb-2">
                <Sparkles className="w-3 h-3" />
                <span>{logoText} Portal</span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-white">
                Administrator Login
              </h1>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Sign in to manage your website, projects, and content.
              </p>
            </div>

            {/* Error Notification Alert */}
            {error && (
              <div className="mx-6 mt-6 p-3.5 bg-red-950/50 border border-red-800/60 text-red-200 text-xs rounded-xl flex items-start gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1 leading-normal space-y-2">
                  <div>{error}</div>
                  {isUnverified && (
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      className="inline-flex items-center gap-1 text-2xs font-semibold text-blue-300 hover:text-blue-200 underline cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                      <span>Resend Verification Email</span>
                    </button>
                  )}
                  {resendStatus && (
                    <p className="text-2xs text-emerald-300 font-medium">{resendStatus}</p>
                  )}
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="p-6 sm:p-8 space-y-4.5">
              
              {/* Email Input Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Administrator Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder={AUTHORIZED_ADMIN_EMAIL}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-750 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                  />
                </div>
                <p className="text-2xs text-slate-500">
                  Must be the verified administrator account address ({AUTHORIZED_ADMIN_EMAIL}).
                </p>
              </div>

              {/* Password Input Field with Toggle */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(true);
                      setForgotError(null);
                      setForgotSuccess(null);
                    }}
                    className="text-2xs font-semibold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-11 py-2.5 bg-slate-950/70 border border-slate-750 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500/30 focus:ring-offset-0 transition"
                  />
                  <span>Remember me on this browser</span>
                </label>
              </div>

              {/* Submit Button with Loading Indicator */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-700 disabled:to-slate-800 disabled:text-slate-400 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4" />
                    <span>Sign In to Dashboard</span>
                  </>
                )}
              </button>

              {/* Security Notice */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-2xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Firebase Auth & Cloud Firestore</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSetupModal(true)}
                  className="text-blue-400 hover:text-blue-300 hover:underline cursor-pointer"
                >
                  First-Time Admin Setup
                </button>
              </div>
            </form>

          </div>

          {/* Subcard Help / Guidance */}
          <div className="mt-4 p-4 rounded-2xl bg-slate-900/50 border border-slate-800/60 text-center">
            <p className="text-2xs text-slate-400 leading-relaxed">
              Administrative access is strictly restricted to <span className="text-slate-200 font-medium">{AUTHORIZED_ADMIN_EMAIL}</span>. Public self-registration is permanently disabled.
            </p>
          </div>

        </div>
      </main>

      {/* Bottom Footer Note */}
      <footer className="relative z-10 w-full py-4 text-center text-2xs text-slate-500 max-w-7xl mx-auto px-6">
        <p>© {new Date().getFullYear()} {companyName}. All rights reserved. Target domain: tesfayeteklu.com.</p>
      </footer>

      {/* ========================================================================= */}
      {/* Initial Admin Setup Modal                                                 */}
      {/* ========================================================================= */}
      {showSetupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl relative text-left">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/20">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Initial Admin Account Setup</h3>
                  <p className="text-2xs text-slate-400">Initialize Firebase Auth for the authorized owner</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSetupModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {setupError && (
              <div className="mt-4 p-3 bg-red-950/60 border border-red-800 text-xs text-red-200 rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="flex-1">{setupError}</span>
              </div>
            )}

            {setupMessage && (
              <div className="mt-4 p-3 bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-200 rounded-xl flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="flex-1">{setupMessage}</span>
              </div>
            )}

            <form onSubmit={handleInitialSetupSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Authorized Owner Email (Pinned)
                </label>
                <input
                  type="email"
                  disabled
                  value={AUTHORIZED_ADMIN_EMAIL}
                  className="w-full px-3.5 py-2 bg-slate-950/40 border border-slate-800 rounded-xl text-xs text-slate-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Create Admin Password (Min. 8 chars)
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={setupPassword}
                  onChange={(e) => setSetupPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={setupConfirm}
                  onChange={(e) => setSetupConfirm(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSetupModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={setupLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  {setupLoading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <UserPlus className="w-3.5 h-3.5" />
                  )}
                  <span>{setupLoading ? 'Initializing...' : 'Create & Send Verification'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Forgot Password Modal Dialog                                              */}
      {/* ========================================================================= */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl relative text-left">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/20">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">
                    {forgotStep === 'request' ? 'Password Recovery' : 'Reset Administrator Password'}
                  </h3>
                  <p className="text-2xs text-slate-400">
                    {forgotStep === 'request' ? 'Request a password reset link' : 'Enter code and configure a new password'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotStep('request');
                  setForgotError(null);
                  setForgotSuccess(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {forgotError && (
              <div className="mt-4 p-3 bg-red-950/60 border border-red-800 text-xs text-red-200 rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="flex-1">{forgotError}</span>
              </div>
            )}

            {forgotSuccess && (
              <div className="mt-4 p-3 bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-200 rounded-xl flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="flex-1">{forgotSuccess}</span>
              </div>
            )}

            {devCodeHint && (
              <div className="mt-3 p-2.5 bg-blue-950/50 border border-blue-800/80 text-2xs text-blue-200 rounded-lg flex items-center justify-between">
                <span>Verification Code: <strong className="font-mono text-sm tracking-wider text-white ml-1">{devCodeHint}</strong></span>
                <span className="text-slate-400 text-3xs">(Valid for 30 minutes)</span>
              </div>
            )}

            {forgotStep === 'request' ? (
              <form onSubmit={handleForgotPasswordRequest} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Registered Administrator Email
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder={AUTHORIZED_ADMIN_EMAIL}
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  />
                  <p className="text-2xs text-slate-400 mt-1">
                    Password reset instructions will be sent to this email address.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 text-xs text-slate-400 hover:text-white transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    {forgotLoading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5" />
                    )}
                    <span>{forgotLoading ? 'Processing...' : 'Send Password Reset'}</span>
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPasswordSubmit} className="mt-4 space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    placeholder="123456"
                    className="w-full px-3.5 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-sm font-mono tracking-widest text-center text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    New Password (Min. 8 characters)
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-3.5 pr-10 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep('request')}
                    className="text-2xs text-slate-400 hover:text-white transition cursor-pointer"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    {forgotLoading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                    <span>{forgotLoading ? 'Updating Password...' : 'Save & Login'}</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
