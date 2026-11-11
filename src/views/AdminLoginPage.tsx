import React, { useState } from 'react';
import { 
  Shield, Key, Eye, EyeOff, Lock, Mail, ArrowLeft, 
  AlertCircle, RefreshCw, Sparkles, Send
} from 'lucide-react';
import { GlobalSiteIdentity } from '../types/cms';
import {
  loginAdmin,
  resendVerificationEmail,
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
                TesfayeTech Administrator
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
              </div>

              {/* Password Input Field with Toggle */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Password
                </label>
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
            </form>

          </div>

        </div>
      </main>

      {/* Bottom Footer Note */}
      <footer className="relative z-10 w-full py-4 text-center text-2xs text-slate-500 max-w-7xl mx-auto px-6">
        <p>© {new Date().getFullYear()} {companyName}. All rights reserved.</p>
      </footer>
    </div>
  );
};
