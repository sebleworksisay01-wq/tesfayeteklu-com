import React, { useState } from 'react';
import { CmsConfig, GlobalSiteIdentity, ThemeConfig } from '../../types/cms';
import { 
  Save, Settings, Sparkles, Upload, AlertCircle, 
  CheckCircle2, Palette, Globe, Layers, Bell
} from 'lucide-react';
import { uploadFileToStorage } from '../../services/api';

interface WebsiteSettingsTabProps {
  cms: CmsConfig;
  onSaveCms: (partial: Partial<CmsConfig>, message?: string) => Promise<void>;
  saving: boolean;
}

export const WebsiteSettingsTab: React.FC<WebsiteSettingsTabProps> = ({
  cms,
  onSaveCms,
  saving,
}) => {
  const [identity, setIdentity] = useState<GlobalSiteIdentity>(cms.identity);
  const [theme, setTheme] = useState<ThemeConfig>(
    cms.theme || {
      primaryColor: '#2563eb',
      secondaryColor: '#0f172a',
      accentColor: '#10b981',
      mode: 'light',
      fontFamily: 'plus_jakarta',
      buttonStyle: 'rounded-xl',
    }
  );

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploadingLogo(true);

    try {
      const res = await uploadFileToStorage(file, 'branding');
      setIdentity({
        ...identity,
        logoUrl: res.downloadUrl,
      });
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Logo upload failed');
    } finally {
      setUploadingLogo(false);
      e.target.value = '';
    }
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploadingFavicon(true);

    try {
      const res = await uploadFileToStorage(file, 'branding');
      setIdentity({
        ...identity,
        faviconUrl: res.downloadUrl,
      });
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Favicon upload failed');
    } finally {
      setUploadingFavicon(false);
      e.target.value = '';
    }
  };

  const handleSave = async () => {
    await onSaveCms(
      {
        identity,
        theme,
      },
      'Global website settings, branding, and theme updated successfully.'
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-2xs font-bold uppercase tracking-wider mb-1">
            <Settings className="w-3 h-3" />
            Module 15 &bull; Global Configuration
          </div>
          <h2 className="text-xl font-bold text-slate-900">Website Settings & Branding</h2>
          <p className="text-xs text-slate-500">
            Control business identity, logos, favicons, announcement banners, and visual design themes.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Publishing...' : 'Publish Settings'}
        </button>
      </div>

      {uploadError && (
        <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Brand Identity */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5 flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-600" />
            Enterprise Brand Identity
          </h3>

          <div>
            <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Company Name
            </label>
            <input
              type="text"
              value={identity.companyName || ''}
              onChange={(e) => setIdentity({ ...identity, companyName: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
            />
          </div>

          <div>
            <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Header Logo Text / Monogram
            </label>
            <input
              type="text"
              value={identity.logoText || ''}
              onChange={(e) => setIdentity({ ...identity, logoText: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
            />
          </div>

          <div>
            <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Primary Tagline
            </label>
            <input
              type="text"
              value={identity.tagline || ''}
              onChange={(e) => setIdentity({ ...identity, tagline: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
            />
          </div>

          <div>
            <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Secondary Description
            </label>
            <textarea
              rows={2}
              value={identity.subtagline || ''}
              onChange={(e) => setIdentity({ ...identity, subtagline: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
            />
          </div>

          {/* Logo & Favicon uploads */}
          <div className="pt-2 border-t border-slate-100 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Logo Image (Firebase Storage)
                </label>
                <div className="flex items-center gap-3">
                  {identity.logoUrl && (
                    <img src={identity.logoUrl} alt="Logo" className="w-10 h-10 object-contain rounded-lg border border-slate-200 bg-slate-50 p-1" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={uploadingLogo}
                    className="w-full text-2xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-2xs file:font-semibold file:bg-blue-50 file:text-blue-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Favicon (.ico or .png)
                </label>
                <div className="flex items-center gap-3">
                  {identity.faviconUrl && (
                    <img src={identity.faviconUrl} alt="Favicon" className="w-8 h-8 object-contain rounded-lg border border-slate-200 bg-slate-50 p-1" />
                  )}
                  <input
                    type="file"
                    accept="image/*,.ico"
                    onChange={handleFaviconUpload}
                    disabled={uploadingFavicon}
                    className="w-full text-2xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-2xs file:font-semibold file:bg-blue-50 file:text-blue-700"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Announcement Bar & Visual Theme */}
        <div className="space-y-6">
          
          {/* Announcement Bar */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-600" />
                Top Notification Banner
              </h3>
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={identity.announcementBar?.enabled || false}
                  onChange={(e) => setIdentity({
                    ...identity,
                    announcementBar: {
                      ...identity.announcementBar,
                      enabled: e.target.checked,
                      text: identity.announcementBar?.text || '⚡ Welcome to TesfayeTech: Building high-availability enterprise cloud platforms.',
                    }
                  })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                Enabled
              </label>
            </div>

            {identity.announcementBar?.enabled && (
              <div className="space-y-3">
                <div>
                  <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Announcement Message
                  </label>
                  <input
                    type="text"
                    value={identity.announcementBar?.text || ''}
                    onChange={(e) => setIdentity({
                      ...identity,
                      announcementBar: { ...identity.announcementBar, text: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Button / Action Text
                    </label>
                    <input
                      type="text"
                      value={identity.announcementBar?.linkText || ''}
                      onChange={(e) => setIdentity({
                        ...identity,
                        announcementBar: { ...identity.announcementBar, linkText: e.target.value }
                      })}
                      placeholder="Explore Solutions"
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Target Link
                    </label>
                    <input
                      type="text"
                      value={identity.announcementBar?.linkUrl || ''}
                      onChange={(e) => setIdentity({
                        ...identity,
                        announcementBar: { ...identity.announcementBar, linkUrl: e.target.value }
                      })}
                      placeholder="#services or /url"
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Theme & Palette */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5 flex items-center gap-2">
              <Palette className="w-4 h-4 text-blue-600" />
              Design Theme & Palette
            </h3>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Primary Accent
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={theme.primaryColor || '#2563eb'}
                    onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 p-0.5"
                  />
                  <span className="font-mono text-2xs uppercase text-slate-600 font-bold">{theme.primaryColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Secondary Dark
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={theme.secondaryColor || '#0f172a'}
                    onChange={(e) => setTheme({ ...theme, secondaryColor: e.target.value })}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 p-0.5"
                  />
                  <span className="font-mono text-2xs uppercase text-slate-600 font-bold">{theme.secondaryColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Accent Emerald
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={theme.accentColor || '#10b981'}
                    onChange={(e) => setTheme({ ...theme, accentColor: e.target.value })}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 p-0.5"
                  />
                  <span className="font-mono text-2xs uppercase text-slate-600 font-bold">{theme.accentColor}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Typography Font
                </label>
                <select
                  value={theme.fontFamily || 'plus_jakarta'}
                  onChange={(e) => setTheme({ ...theme, fontFamily: e.target.value as any })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="plus_jakarta">Plus Jakarta Sans</option>
                  <option value="inter">Inter Display</option>
                  <option value="system">System Native</option>
                </select>
              </div>

              <div>
                <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Button Radius
                </label>
                <select
                  value={theme.buttonStyle || 'rounded-xl'}
                  onChange={(e) => setTheme({ ...theme, buttonStyle: e.target.value as any })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="rounded-xl">Rounded XL (12px)</option>
                  <option value="rounded-lg">Rounded LG (8px)</option>
                  <option value="rounded-full">Pill / Rounded Full</option>
                </select>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
