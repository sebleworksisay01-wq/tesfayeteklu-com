import React, { useState, useEffect } from 'react';
import { 
  Shield, Key, Eye, EyeOff, Lock, Mail, ArrowLeft, 
  AlertCircle, CheckCircle2, RefreshCw, ArrowRight, Sparkles, UserPlus, 
  Send, User as UserIcon, Check, Clock
} from 'lucide-react';
import { GlobalSiteIdentity } from '../types/cms';
import {
  loginWithFirebase,
  registerUserWithFirebase,
  sendUserPasswordReset,
  resendVerificationEmail,
  handleEmailVerificationCode,
  AUTHORIZED_ADMIN_EMAIL,
  UnverifiedEmailError,
} from '../services/api';
import { UserProfile } from '../types';

interface AuthPageProps {
  initialMode?: 'login' | 'register';
  identity?: GlobalSiteIdentity;
  onLoginSuccess: (profile: UserProfile | null, isAdmin: boolean) => void;
  onReturnToSite: () => void;
  verificationCode?: string | null;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = 'login',
  identity,
  onLoginSuccess,
  onReturnToSite,
  verificationCode,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Unverified email handling
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  // Registration form state
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccessMessage, setRegSuccessMessage] = useState<string | null>(null);

  // Forgot password modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const [forgotCooldown, setForgotCooldown] = useState<number>(0);

  // In-app Email Verification Code processing
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Countdown timer for resend verification email cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Countdown timer for forgot password cooldown
  useEffect(() => {
    if (forgotCooldown <= 0) return;
    const timer = setInterval(() => {
      setForgotCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [forgotCooldown]);

  // Process verification link parameters if present in URL
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const code = verificationCode || searchParams.get('oobCode');
    const action = searchParams.get('mode');

    if (code && (action === 'verifyEmail' || !action)) {
      handleVerifyAction(code);
    }
  }, [verificationCode]);

  const handleVerifyAction = async (code: string) => {
    setVerifyingCode(true);
    setVerificationResult(null);
    try {
      const res = await handleEmailVerificationCode(code);
      setVerificationResult({
        success: true,
        message: res.message || 'Your email address has been verified successfully! You can now log in.',
      });
      setMode('login');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Your request to verify your email has expired or the link has already been used.';
      setVerificationResult({
        success: false,
        message: msg,
      });
    } finally {
      setVerifyingCode(false);
    }
  };

  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  // ---------------------------------------------------------------------------
  // Login Handler
  // ---------------------------------------------------------------------------
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setUnverifiedEmail(null);
    setResendStatus(null);

    const cleanEmail = loginEmail.trim().toLowerCase();
    if (!cleanEmail || !validateEmail(cleanEmail)) {
      setLoginError('Please enter a valid email address.');
      return;
    }
    if (!loginPassword) {
      setLoginError('Please enter your account password.');
      return;
    }

    setLoginLoading(true);

    try {
      const authResult = await loginWithFirebase(cleanEmail, loginPassword);
      onLoginSuccess(authResult.profile, authResult.isAdmin);
    } catch (err: unknown) {
      if (err instanceof UnverifiedEmailError) {
        setUnverifiedEmail(cleanEmail);
        setLoginError('Your email address has not been verified. Please check your inbox and verify your email before logging in.');
      } else {
        const msg = err instanceof Error ? err.message : 'Invalid email or password.';
        if (msg.toLowerCase().includes('verification required') || msg.toLowerCase().includes('unverified')) {
          setUnverifiedEmail(cleanEmail);
          setLoginError('Your email address has not been verified. Please check your inbox and verify your email before logging in.');
        } else {
          setLoginError(msg);
        }
      }
    } finally {
      setLoginLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Resend Verification Email with 60-Second Cooldown
  // ---------------------------------------------------------------------------
  const handleResendVerification = async () => {
    if (resendCooldown > 0) return;
    const targetEmail = unverifiedEmail || loginEmail.trim().toLowerCase() || regEmail.trim().toLowerCase();
    if (!targetEmail || !validateEmail(targetEmail)) {
      setResendStatus('Please enter your email address to receive verification.');
      return;
    }

    setResendLoading(true);
    setResendStatus(null);

    try {
      const res = await resendVerificationEmail(targetEmail, loginPassword || regPassword);
      setResendStatus(res.message);
      // Initiate 60-second cooldown
      setResendCooldown(60);
    } catch (err: unknown) {
      setResendStatus(err instanceof Error ? err.message : 'Failed to resend verification link.');
    } finally {
      setResendLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Registration Handler
  // ---------------------------------------------------------------------------
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setRegSuccessMessage(null);

    const cleanName = regFullName.trim();
    const cleanEmail = regEmail.trim().toLowerCase();

    if (!cleanName) {
      setRegError('Please provide your full name.');
      return;
    }

    if (!cleanEmail || !validateEmail(cleanEmail)) {
      setRegError('Please enter a valid email address.');
      return;
    }

    if (regPassword.length < 8) {
      setRegError('Password must contain at least 8 characters with letters and numbers.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match. Please re-enter your password.');
      return;
    }

    setRegLoading(true);

    try {
      const res = await registerUserWithFirebase(cleanName, cleanEmail, regPassword);
      setRegSuccessMessage(res.message);
      setUnverifiedEmail(cleanEmail);
      setLoginEmail(cleanEmail);
      setLoginPassword(regPassword);
      setResendCooldown(60);
      // Auto-switch to login tab after 3 seconds
      setTimeout(() => {
        setMode('login');
      }, 4000);
    } catch (err: unknown) {
      setRegError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setRegLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Forgot Password Handler
  // ---------------------------------------------------------------------------
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotSuccess(null);

    const cleanEmail = forgotEmail.trim().toLowerCase();
    if (!cleanEmail || !validateEmail(cleanEmail)) {
      setForgotError('Please enter a valid email address.');
      return;
    }

    setForgotLoading(true);

    try {
      const res = await sendUserPasswordReset(cleanEmail);
      setForgotSuccess(res.message || 'Password reset link dispatched.');
      setForgotCooldown(60);
    } catch (err: unknown) {
      setForgotError(err instanceof Error ? err.message : 'Unable to dispatch reset email.');
    } finally {
      setForgotLoading(false);
    }
  };

  const companyName = identity?.companyName || 'TesfayeTech';
  const logoText = identity?.logoText || 'TesfayeTech';

  // Password strength calculation for registration
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: 'Empty', color: 'bg-slate-700' };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 12) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-red-500' };
    if (score <= 3) return { score: 2, label: 'Fair', color: 'bg-amber-500' };
    if (score <= 4) return { score: 3, label: 'Good', color: 'bg-blue-500' };
    return { score: 4, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(regPassword);

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

        <div className="flex items-center gap-2 text-2xs text-slate-400 uppercase tracking-wider font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Firebase Authentication Active</span>
        </div>
      </header>

      {/* Main Form Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-[460px]">

          {/* In-App Verification Banner / Feedback Modal */}
          {verifyingCode && (
            <div className="mb-4 p-4 rounded-2xl bg-blue-950/70 border border-blue-800 text-blue-200 text-xs flex items-center gap-3 animate-in fade-in">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-400 shrink-0" />
              <span>Verifying your email verification link with Firebase...</span>
            </div>
          )}

          {verificationResult && (
            <div className={`mb-4 p-4 rounded-2xl border text-xs flex items-start gap-3 animate-in fade-in ${
              verificationResult.success 
                ? 'bg-emerald-950/70 border-emerald-800 text-emerald-200' 
                : 'bg-amber-950/70 border-amber-800 text-amber-200'
            }`}>
              {verificationResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-2 flex-1">
                <div className="font-semibold">{verificationResult.message}</div>
                {!verificationResult.success && (
                  <div className="pt-1">
                    <p className="text-2xs text-amber-300">
                      Need a new verification link? Enter your email and click Resend below:
                    </p>
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={resendCooldown > 0 || resendLoading}
                      className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600/30 hover:bg-amber-600/50 text-amber-100 rounded-lg text-2xs font-semibold cursor-pointer transition"
                    >
                      <Send className="w-3 h-3" />
                      <span>{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Verification Email'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Card Wrapper */}
          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl overflow-hidden ring-1 ring-white/10 transition-all">
            
            {/* Card Header & Branding */}
            <div className="p-8 pb-5 text-center border-b border-slate-800/80 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-900/60">
              
              <div className="flex justify-center mb-4">
                {identity?.logoUrl ? (
                  <img
                    src={identity.logoUrl}
                    alt={companyName}
                    className="h-10 w-auto object-contain"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 border border-blue-400/30">
                    <Shield className="w-6 h-6" />
                  </div>
                )}
              </div>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-2xs font-semibold uppercase tracking-wider mb-2">
                <Sparkles className="w-3 h-3" />
                <span>{logoText} Portal</span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-white">
                {mode === 'login' ? 'Sign In to Account' : 'Create New Account'}
              </h1>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {mode === 'login' 
                  ? 'Access your projects, client dashboard, and administration tools.'
                  : 'Join TesfayeTech to collaborate, track project deliveries, and request proposals.'}
              </p>

              {/* Mode Toggle Tabs */}
              <div className="mt-5 grid grid-cols-2 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setLoginError(null);
                    setRegError(null);
                  }}
                  className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    mode === 'login'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setLoginError(null);
                    setRegError(null);
                  }}
                  className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    mode === 'register'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Register
                </button>
              </div>

            </div>

            {/* ================================================================= */}
            {/* LOGIN TAB FORM                                                    */}
            {/* ================================================================= */}
            {mode === 'login' && (
              <div className="p-6 sm:p-8 space-y-4.5">
                
                {/* Unverified Email Alert Notice */}
                {loginError && (
                  <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 animate-in fade-in ${
                    unverifiedEmail 
                      ? 'bg-amber-950/60 border-amber-800/80 text-amber-200' 
                      : 'bg-red-950/50 border-red-800/60 text-red-200'
                  }`}>
                    <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${unverifiedEmail ? 'text-amber-400' : 'text-red-400'}`} />
                    <div className="flex-1 leading-normal space-y-2">
                      <div>{loginError}</div>
                      
                      {unverifiedEmail && (
                        <div className="pt-1.5 border-t border-amber-800/50 space-y-2">
                          <p className="text-2xs text-amber-300">
                            A verification link was sent to <strong className="text-white">{unverifiedEmail}</strong>.
                          </p>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleResendVerification}
                              disabled={resendCooldown > 0 || resendLoading}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-2xs font-semibold rounded-lg transition cursor-pointer"
                            >
                              {resendLoading ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <Send className="w-3 h-3" />
                              )}
                              <span>
                                {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend Verification Email'}
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setUnverifiedEmail(null);
                                setLoginError(null);
                              }}
                              className="text-2xs text-slate-400 hover:text-white underline cursor-pointer"
                            >
                              Dismiss
                            </button>
                          </div>
                          {resendStatus && (
                            <p className="text-2xs text-emerald-300 font-medium">{resendStatus}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  
                  {/* Email Field */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        autoComplete="email"
                        value={loginEmail}
                        onChange={(e) => {
                          setLoginEmail(e.target.value);
                          if (loginError) setLoginError(null);
                        }}
                        placeholder="you@domain.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-750 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Password Field with Show/Hide */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-slate-300">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setShowForgotModal(true);
                          setForgotEmail(loginEmail);
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
                        type={showLoginPassword ? 'text' : 'password'}
                        required
                        autoComplete="current-password"
                        value={loginPassword}
                        onChange={(e) => {
                          setLoginPassword(e.target.value);
                          if (loginError) setLoginError(null);
                        }}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-11 py-2.5 bg-slate-950/70 border border-slate-750 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me */}
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

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-700 disabled:to-slate-800 disabled:text-slate-400 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    {loginLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Verifying Credentials...</span>
                      </>
                    ) : (
                      <>
                        <Key className="w-4 h-4" />
                        <span>Sign In</span>
                      </>
                    )}
                  </button>

                  {/* Bottom Switcher */}
                  <div className="pt-3 text-center text-xs text-slate-400">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('register');
                        setLoginError(null);
                      }}
                      className="text-blue-400 hover:text-blue-300 font-semibold underline cursor-pointer ml-1"
                    >
                      Register Now
                    </button>
                  </div>

                </form>

              </div>
            )}

            {/* ================================================================= */}
            {/* REGISTER TAB FORM                                                 */}
            {/* ================================================================= */}
            {mode === 'register' && (
              <div className="p-6 sm:p-8 space-y-4.5">
                
                {regError && (
                  <div className="p-3.5 bg-red-950/50 border border-red-800/60 text-red-200 text-xs rounded-xl flex items-start gap-2.5 animate-in fade-in duration-200">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span>{regError}</span>
                  </div>
                )}

                {regSuccessMessage && (
                  <div className="p-4 bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs rounded-xl space-y-2 animate-in fade-in duration-200">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div className="font-semibold leading-relaxed">{regSuccessMessage}</div>
                    </div>
                    <div className="pt-2 border-t border-emerald-800/50 flex items-center justify-between">
                      <span className="text-2xs text-emerald-300">
                        Check your inbox and click the verification link.
                      </span>
                      <button
                        type="button"
                        onClick={handleResendVerification}
                        disabled={resendCooldown > 0}
                        className="text-2xs underline font-semibold text-white hover:text-emerald-100 cursor-pointer"
                      >
                        {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend link'}
                      </button>
                    </div>
                  </div>
                )}

                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={regFullName}
                        onChange={(e) => setRegFullName(e.target.value)}
                        placeholder="Abebe Kebede"
                        className="w-full pl-10 pr-4 py-2 bg-slate-950/70 border border-slate-750 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Email Address */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        autoComplete="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="you@domain.com"
                        className="w-full pl-10 pr-4 py-2 bg-slate-950/70 border border-slate-750 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Password (min. 8 characters)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        minLength={8}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-11 py-2 bg-slate-950/70 border border-slate-750 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                      >
                        {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {regPassword && (
                      <div className="pt-1 space-y-1">
                        <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden flex gap-1">
                          <div className={`h-full flex-1 ${strength.score >= 1 ? strength.color : 'bg-slate-800'}`} />
                          <div className={`h-full flex-1 ${strength.score >= 2 ? strength.color : 'bg-slate-800'}`} />
                          <div className={`h-full flex-1 ${strength.score >= 3 ? strength.color : 'bg-slate-800'}`} />
                          <div className={`h-full flex-1 ${strength.score >= 4 ? strength.color : 'bg-slate-800'}`} />
                        </div>
                        <div className="flex justify-between text-3xs text-slate-400">
                          <span>Password Strength: <strong className="text-white">{strength.label}</strong></span>
                          <span>Letters & Numbers Required</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type="password"
                        required
                        minLength={8}
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-4 py-2 bg-slate-950/70 border border-slate-750 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={regLoading}
                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-700 disabled:to-slate-800 disabled:text-slate-400 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer mt-3"
                  >
                    {regLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Creating Account & Dispatching Verification...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Create Account</span>
                      </>
                    )}
                  </button>

                  {/* Bottom Switcher */}
                  <div className="pt-3 text-center text-xs text-slate-400">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setRegError(null);
                      }}
                      className="text-blue-400 hover:text-blue-300 font-semibold underline cursor-pointer ml-1"
                    >
                      Sign In Here
                    </button>
                  </div>

                </form>

              </div>
            )}

            {/* Bottom Card Footer Security Info */}
            <div className="p-4 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between text-2xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                <span>Mandatory Email Verification Enforced</span>
              </div>
              <span className="text-slate-400 font-mono text-3xs">
                Admin: {AUTHORIZED_ADMIN_EMAIL.split('@')[0]}
              </span>
            </div>

          </div>

          {/* Subcard Informational Note */}
          <div className="mt-4 p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800/60 text-center">
            <p className="text-2xs text-slate-400 leading-relaxed">
              New accounts require email verification before system access is granted. Administrator privileges are strictly reserved for verified <span className="text-slate-200 font-medium">{AUTHORIZED_ADMIN_EMAIL}</span>.
            </p>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-4 text-center text-2xs text-slate-500 max-w-7xl mx-auto px-6">
        <p>© {new Date().getFullYear()} {companyName}. All rights reserved. Target domain: tesfayeteklu.com.</p>
      </footer>

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
                  <h3 className="font-bold text-white text-sm">Reset Your Password</h3>
                  <p className="text-2xs text-slate-400">Receive a password recovery link in your inbox</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(false);
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

            <form onSubmit={handleForgotSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Your Account Email Address
                </label>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
                <p className="text-2xs text-slate-400 mt-1">
                  We will send a secure password reset link to this address.
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
                  disabled={forgotLoading || forgotCooldown > 0}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  {forgotLoading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {forgotCooldown > 0 ? `Wait ${forgotCooldown}s` : 'Send Reset Link'}
                  </span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
