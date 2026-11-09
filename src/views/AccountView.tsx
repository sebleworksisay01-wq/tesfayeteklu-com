import React, { useState } from 'react';
import { 
  User as UserIcon, Shield, CheckCircle2, Mail, Calendar, 
  LayoutDashboard, LogOut, FileText, ArrowRight, Save, RefreshCw, Key
} from 'lucide-react';
import { User } from 'firebase/auth';
import { UserProfile } from '../types';
import { GlobalSiteIdentity } from '../types/cms';
import { updateUserProfile, sendUserPasswordReset } from '../services/api';

interface AccountViewProps {
  user: User;
  profile: UserProfile | null;
  isAdmin: boolean;
  identity?: GlobalSiteIdentity;
  onLaunchAdminCMS: () => void;
  onRequestProject: () => void;
  onLogout: () => void;
  onProfileUpdated?: (updatedProfile: UserProfile) => void;
}

export const AccountView: React.FC<AccountViewProps> = ({
  user,
  profile,
  isAdmin,
  identity,
  onLaunchAdminCMS,
  onRequestProject,
  onLogout,
  onProfileUpdated,
}) => {
  const [fullName, setFullName] = useState(profile?.fullName || user.displayName || '');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Password reset from account
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [resetLoading, setResetLoading] = useState(false);

  const displayName = fullName || user.displayName || user.email?.split('@')[0] || 'User';
  const email = profile?.email || user.email || '';
  const memberSince = profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }) : 'Recently';

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      await updateUserProfile(user.uid, { fullName: fullName.trim() });
      setSaveSuccess(true);
      setIsEditing(false);
      if (onProfileUpdated && profile) {
        onProfileUpdated({
          ...profile,
          fullName: fullName.trim(),
        });
      }
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleSendPasswordReset = async () => {
    if (!email) return;
    setResetLoading(true);
    setResetMessage(null);
    try {
      const res = await sendUserPasswordReset(email);
      setResetMessage(res.message);
    } catch {
      setResetMessage('Unable to send password reset at this time.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="py-12 sm:py-16 bg-slate-50 flex-1">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Breadcrumb / Back button */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              My Account
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage your personal credentials, verification status, and project workflows.
            </p>
          </div>
          
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Profile Summary Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-md uppercase">
                {displayName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                    {displayName}
                  </h2>
                  {isAdmin ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      <Shield className="w-3 h-3 text-indigo-600" />
                      <span>Administrator</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      Client Account
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{email}</span>
                </p>
              </div>
            </div>

            {/* Email Verification Status Badge */}
            <div className="flex flex-col sm:items-end gap-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Email Verified</span>
              </span>
              <span className="text-2xs text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>Member since {memberSince}</span>
              </span>
            </div>

          </div>

          {/* Action Callout if Administrator */}
          {isAdmin && (
            <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg border border-indigo-800/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
                  <LayoutDashboard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Administrator Content Management System</h3>
                  <p className="text-xs text-indigo-200">
                    You have verified administrative authority over projects, inquiries, themes, and SEO.
                  </p>
                </div>
              </div>
              <button
                onClick={onLaunchAdminCMS}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm transition whitespace-nowrap cursor-pointer"
              >
                <span>Launch Admin CMS</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Profile Details & Quick Actions Grid */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Card: Account Information */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Profile Information
                </h3>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-xs text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                  >
                    Edit Name
                  </button>
                )}
              </div>

              {saveSuccess && (
                <p className="text-xs text-emerald-600 font-medium">Profile name updated successfully.</p>
              )}
              {saveError && (
                <p className="text-xs text-red-600">{saveError}</p>
              )}

              {isEditing ? (
                <form onSubmit={handleSaveProfile} className="space-y-3">
                  <div>
                    <label className="block text-2xs font-semibold text-slate-600 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      {saving ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                      <span>Save</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-2.5 text-xs">
                  <div>
                    <span className="text-slate-400 block text-2xs">Full Name</span>
                    <span className="font-semibold text-slate-800">{displayName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-2xs">Email Address</span>
                    <span className="font-semibold text-slate-800">{email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-2xs">Firebase User ID</span>
                    <span className="font-mono text-3xs text-slate-500 break-all">{user.uid}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Right Card: Security & Password */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Security & Authentication
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Your credentials and sessions are securely encrypted through Google Firebase Authentication.
                </p>

                {resetMessage && (
                  <p className="text-xs text-emerald-600 font-medium mt-3 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                    {resetMessage}
                  </p>
                )}
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleSendPasswordReset}
                  disabled={resetLoading}
                  className="w-full py-2 px-3 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Key className="w-3.5 h-3.5 text-slate-500" />
                  <span>{resetLoading ? 'Sending Reset Link...' : 'Send Password Reset Email'}</span>
                </button>

                <button
                  type="button"
                  onClick={onRequestProject}
                  className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Request a New Project Proposal</span>
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
