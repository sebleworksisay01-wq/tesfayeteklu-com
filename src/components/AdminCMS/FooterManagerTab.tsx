import React, { useState } from 'react';
import { CmsConfig, GlobalSiteIdentity } from '../../types/cms';
import { 
  Save, Layout, Globe, Linkedin, Github, Twitter, 
  Send, Youtube, Facebook, Instagram, ShieldCheck, CheckCircle2 
} from 'lucide-react';

interface FooterManagerTabProps {
  cms: CmsConfig;
  onSaveCms: (partial: Partial<CmsConfig>, message?: string) => Promise<void>;
  saving: boolean;
}

export const FooterManagerTab: React.FC<FooterManagerTabProps> = ({
  cms,
  onSaveCms,
  saving,
}) => {
  const [identity, setIdentity] = useState<GlobalSiteIdentity>(cms.identity);

  const handleSave = async () => {
    await onSaveCms(
      {
        identity,
      },
      'Footer configuration successfully updated.'
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-2xs font-bold uppercase tracking-wider mb-1">
            <Layout className="w-3 h-3" />
            Module 12 &bull; Site Footer & Social Links
          </div>
          <h2 className="text-xl font-bold text-slate-900">Footer Management</h2>
          <p className="text-xs text-slate-500">
            Customize the bottom footer summary, copyright statement, trust badges, and social network handles.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Publishing...' : 'Publish Footer'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Footer Text & Badges */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5">
            Footer Content & Legal Notice
          </h3>

          <div>
            <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Company Summary / Kicker
            </label>
            <textarea
              rows={3}
              value={identity.footer?.summary || ''}
              onChange={(e) => setIdentity({
                ...identity,
                footer: { ...identity.footer, summary: e.target.value }
              })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              placeholder="Enterprise software engineering, distributed systems, and modern cloud architecture..."
            />
          </div>

          <div>
            <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Copyright Notice
            </label>
            <input
              type="text"
              value={identity.footer?.copyrightText || ''}
              onChange={(e) => setIdentity({
                ...identity,
                footer: { ...identity.footer, copyrightText: e.target.value }
              })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              placeholder="&copy; 2026 TesfayeTech. All rights reserved."
            />
          </div>

          <div className="pt-2">
            <label className="inline-flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-800">
              <input
                type="checkbox"
                checked={identity.footer?.showTrustBadges ?? true}
                onChange={(e) => setIdentity({
                  ...identity,
                  footer: { ...identity.footer, showTrustBadges: e.target.checked }
                })}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              Show Enterprise Security & SSL Trust Badges in Footer
            </label>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5">
            Official Social Media Profiles
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Linkedin className="w-3.5 h-3.5 text-blue-600" />
                LinkedIn Profile URL
              </label>
              <input
                type="url"
                value={identity.socialLinks?.linkedin || ''}
                onChange={(e) => setIdentity({
                  ...identity,
                  socialLinks: { ...identity.socialLinks, linkedin: e.target.value }
                })}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                placeholder="https://linkedin.com/company/tesfayetech"
              />
            </div>

            <div>
              <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Github className="w-3.5 h-3.5 text-slate-900" />
                GitHub Organization URL
              </label>
              <input
                type="url"
                value={identity.socialLinks?.github || ''}
                onChange={(e) => setIdentity({
                  ...identity,
                  socialLinks: { ...identity.socialLinks, github: e.target.value }
                })}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                placeholder="https://github.com/tesfayetech"
              />
            </div>

            <div>
              <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Twitter className="w-3.5 h-3.5 text-sky-500" />
                Twitter / X Profile URL
              </label>
              <input
                type="url"
                value={identity.socialLinks?.twitter || ''}
                onChange={(e) => setIdentity({
                  ...identity,
                  socialLinks: { ...identity.socialLinks, twitter: e.target.value }
                })}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                placeholder="https://x.com/tesfayetech"
              />
            </div>

            <div>
              <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-sky-600" />
                Telegram Channel / Contact
              </label>
              <input
                type="url"
                value={identity.socialLinks?.telegram || ''}
                onChange={(e) => setIdentity({
                  ...identity,
                  socialLinks: { ...identity.socialLinks, telegram: e.target.value }
                })}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                placeholder="https://t.me/tesfayetech"
              />
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
