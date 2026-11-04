import React, { useState } from 'react';
import { CmsConfig, SeoPageConfig } from '../../types/cms';
import {
  Save,
  Search,
  Globe,
  Share2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Monitor,
  Upload,
  ShieldCheck,
  FileCode,
  MapPin
} from 'lucide-react';
import { uploadFileToStorage } from '../../services/api';

interface SeoManagerTabProps {
  cms: CmsConfig;
  onSaveCms: (partial: Partial<CmsConfig>, message?: string) => Promise<void>;
  saving: boolean;
}

export const SeoManagerTab: React.FC<SeoManagerTabProps> = ({
  cms,
  onSaveCms,
  saving
}) => {
  const [selectedPageId, setSelectedPageId] = useState<string>('home');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [socialPlatform, setSocialPlatform] = useState<'google' | 'facebook' | 'twitter'>('google');
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Local state copy for responsive editing
  const [seoState, setSeoState] = useState(cms.seo);

  const pages = seoState.pages || [];
  const selectedPage = pages.find((p) => p.id === selectedPageId) || pages[0] || {
    id: 'home',
    name: 'Home',
    path: '/',
    title: seoState.defaultTitle,
    metaDescription: seoState.metaDescription,
    keywords: seoState.keywords,
    canonicalUrl: 'https://tesfayeteklu.com/',
    robots: 'index, follow' as const,
    ogImage: seoState.ogImage,
    ogType: 'website' as const
  };

  const updateSelectedPage = (fields: Partial<SeoPageConfig>) => {
    const updatedPages = pages.map((p) => (p.id === selectedPage.id ? { ...p, ...fields } : p));
    setSeoState({
      ...seoState,
      pages: updatedPages
    });
  };

  const handleSaveAll = async () => {
    await onSaveCms({ seo: seoState }, 'SEO and metadata configurations successfully saved.');
  };

  const handleOgImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const res = await uploadFileToStorage(file, 'branding');
      updateSelectedPage({ ogImage: res.downloadUrl });
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Image upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // Length calculations for Google Snippet warnings
  const titleLength = (selectedPage.title || '').length;
  const descLength = (selectedPage.metaDescription || '').length;

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
            <Search className="w-3.5 h-3.5" />
            <span>Search Engine Optimization & Indexing Hub</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            SEO, Social Meta & Verification Manager
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mt-1">
            Configure per-page title tags, meta descriptions, canonical URLs, robots directives, and live Google Search & Social card previews for <strong className="text-slate-700">https://tesfayeteklu.com</strong>.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-blue-500/20 shrink-0 transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Publishing Changes...' : 'Save All SEO Settings'}</span>
        </button>
      </div>

      {/* Indexing Files Quick Status Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">robots.txt</div>
              <div className="text-[11px] text-slate-500">Allows public pages, blocks admin</div>
            </div>
          </div>
          <a
            href="/robots.txt"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 text-xs font-semibold flex items-center gap-1"
          >
            <span>Inspect</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">sitemap.xml</div>
              <div className="text-[11px] text-slate-500">11 core pages + blog articles</div>
            </div>
          </div>
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 text-xs font-semibold flex items-center gap-1"
          >
            <span>Inspect</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Addis Ababa Local SEO</div>
              <div className="text-[11px] text-slate-500">ProfessionalService Schema Active</div>
            </div>
          </div>
          <span className="text-2xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold">
            Valid
          </span>
        </div>
      </div>

      {/* Main Configuration Grid: Page Selector & Meta Editor + Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Page Selection & Form Fields (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
            
            {/* Page Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Select Website Page to Configure
              </label>
              <select
                value={selectedPage.id}
                onChange={(e) => setSelectedPageId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                {pages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.path})
                  </option>
                ))}
              </select>
            </div>

            {/* Page Title Tag */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Page Title Tag (`&lt;title&gt;`)
                </label>
                <span
                  className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                    titleLength >= 45 && titleLength <= 65
                      ? 'bg-emerald-50 text-emerald-700 font-bold'
                      : titleLength > 65
                      ? 'bg-amber-50 text-amber-700 font-bold'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {titleLength} / 60 chars {titleLength > 65 ? '(May Truncate in Google)' : ''}
                </span>
              </div>
              <input
                type="text"
                value={selectedPage.title}
                onChange={(e) => updateSelectedPage({ title: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                placeholder="e.g. TesfayeTech | Premier Software Development Company in Ethiopia"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Appears in search engine results and browser tabs. Recommended length: 50–60 characters.
              </p>
            </div>

            {/* Meta Description Tag */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Meta Description Tag (`&lt;meta name="description"&gt;`)
                </label>
                <span
                  className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                    descLength >= 120 && descLength <= 165
                      ? 'bg-emerald-50 text-emerald-700 font-bold'
                      : descLength > 165
                      ? 'bg-amber-50 text-amber-700 font-bold'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {descLength} / 160 chars {descLength > 165 ? '(May Truncate in Google)' : ''}
                </span>
              </div>
              <textarea
                rows={3}
                value={selectedPage.metaDescription}
                onChange={(e) => updateSelectedPage({ metaDescription: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 leading-relaxed"
                placeholder="Brief summary of page value proposition and services..."
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Summary displayed under page title in search results. Recommended length: 120–160 characters.
              </p>
            </div>

            {/* Canonical URL */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Canonical URL (`&lt;link rel="canonical"&gt;`)
              </label>
              <input
                type="url"
                value={selectedPage.canonicalUrl}
                onChange={(e) => updateSelectedPage({ canonicalUrl: e.target.value })}
                className="w-full px-3.5 py-2 text-xs font-mono border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                placeholder="https://tesfayeteklu.com/..."
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Prevents duplicate content penalties. Must point to canonical HTTPS domain `https://tesfayeteklu.com`.
              </p>
            </div>

            {/* Target Keywords */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Target Search Keywords (Comma-separated)
              </label>
              <input
                type="text"
                value={selectedPage.keywords}
                onChange={(e) => updateSelectedPage({ keywords: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                placeholder="Web Development Company in Ethiopia, Custom Software Addis Ababa..."
              />
            </div>

            {/* Robots Directive */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Robots Indexing Directive
              </label>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <label
                  className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                    selectedPage.robots === 'index, follow'
                      ? 'border-blue-500 bg-blue-50/50 text-blue-900 font-semibold'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="robots"
                    checked={selectedPage.robots === 'index, follow'}
                    onChange={() => updateSelectedPage({ robots: 'index, follow' })}
                    className="text-blue-600"
                  />
                  <div>
                    <div>index, follow</div>
                    <div className="text-[10px] text-slate-400 font-normal">Allow search engines to index & follow links</div>
                  </div>
                </label>

                <label
                  className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                    selectedPage.robots === 'noindex, nofollow'
                      ? 'border-amber-500 bg-amber-50/50 text-amber-900 font-semibold'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="robots"
                    checked={selectedPage.robots === 'noindex, nofollow'}
                    onChange={() => updateSelectedPage({ robots: 'noindex, nofollow' })}
                    className="text-amber-600"
                  />
                  <div>
                    <div>noindex, nofollow</div>
                    <div className="text-[10px] text-slate-400 font-normal">Hide this page from Google results</div>
                  </div>
                </label>
              </div>
            </div>

            {/* OpenGraph Social Image */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                OpenGraph Social Share Image URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={selectedPage.ogImage || ''}
                  onChange={(e) => updateSelectedPage({ ogImage: e.target.value })}
                  className="flex-1 px-3.5 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  placeholder="https://images.unsplash.com/... or uploaded asset"
                />
                <label className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shrink-0">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploading ? 'Uploading...' : 'Upload'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleOgImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
              {uploadError && <div className="text-2xs text-rose-600 mt-1">{uploadError}</div>}
            </div>

          </div>

          {/* Webmaster Tools & Verification Section */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Search Console & Webmaster Verification</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Google Search Console Verification Token / Content
              </label>
              <input
                type="text"
                value={seoState.googleSearchConsoleVerification || ''}
                onChange={(e) => setSeoState({ ...seoState, googleSearchConsoleVerification: e.target.value })}
                className="w-full px-3.5 py-2 text-xs font-mono border border-slate-300 rounded-lg"
                placeholder="google-site-verification=XXXXXXXXXXXXXXXXXXXXX"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Inserted as `&lt;meta name="google-site-verification" content="..."&gt;` in HTML head.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bing Webmaster Verification Token
              </label>
              <input
                type="text"
                value={seoState.bingVerification || ''}
                onChange={(e) => setSeoState({ ...seoState, bingVerification: e.target.value })}
                className="w-full px-3.5 py-2 text-xs font-mono border border-slate-300 rounded-lg"
                placeholder="msvalidate.01=XXXXXXXXXXXXXXXXXXXXX"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Google Analytics 4 (GA4) Measurement ID
              </label>
              <input
                type="text"
                value={seoState.googleAnalyticsId || ''}
                onChange={(e) => setSeoState({ ...seoState, googleAnalyticsId: e.target.value })}
                className="w-full px-3.5 py-2 text-xs font-mono border border-slate-300 rounded-lg"
                placeholder="G-XXXXXXXXXX"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Live Previews (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs sticky top-6">
            
            {/* Preview Platform Switcher */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Live Result Previews
              </span>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={() => setSocialPlatform('google')}
                  className={`px-2.5 py-1 text-2xs font-bold rounded-md transition-all cursor-pointer ${
                    socialPlatform === 'google' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Google SERP
                </button>
                <button
                  onClick={() => setSocialPlatform('facebook')}
                  className={`px-2.5 py-1 text-2xs font-bold rounded-md transition-all cursor-pointer ${
                    socialPlatform === 'facebook' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Social Card
                </button>
              </div>
            </div>

            {/* Google SERP Preview */}
            {socialPlatform === 'google' && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold text-slate-500">Google Search Result Snippet</span>
                  <div className="flex items-center gap-1 text-slate-400">
                    <button
                      onClick={() => setPreviewDevice('desktop')}
                      className={`p-1 rounded cursor-pointer ${previewDevice === 'desktop' ? 'text-blue-600 bg-blue-50' : ''}`}
                      title="Desktop view"
                    >
                      <Monitor className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setPreviewDevice('mobile')}
                      className={`p-1 rounded cursor-pointer ${previewDevice === 'mobile' ? 'text-blue-600 bg-blue-50' : ''}`}
                      title="Mobile view"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 font-sans text-left">
                  {/* Google Breadcrumb */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-700 mb-1">
                    <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                      T
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900 leading-none">TesfayeTech</span>
                      <span className="text-[11px] text-slate-500 leading-none mt-0.5 truncate max-w-[280px]">
                        {selectedPage.canonicalUrl}
                      </span>
                    </div>
                  </div>

                  {/* Google Title */}
                  <h3 className="text-base font-medium text-[#1a0dab] hover:underline cursor-pointer leading-snug mt-1.5 line-clamp-2">
                    {selectedPage.title || 'TesfayeTech | Software & Digital Solutions'}
                  </h3>

                  {/* Google Description */}
                  <p className="text-xs text-[#4d5156] mt-1 leading-relaxed line-clamp-2">
                    {selectedPage.metaDescription || 'Top-tier software development and digital solutions company in Addis Ababa, Ethiopia.'}
                  </p>
                </div>

                <div className="mt-4 p-3 rounded-lg bg-blue-50/60 border border-blue-100 text-xs text-blue-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>SEO Verification Status</span>
                  </div>
                  <div className="text-[11px] text-slate-600">
                    Title length: <strong className={titleLength > 65 ? 'text-amber-700' : 'text-emerald-700'}>{titleLength} chars</strong> · Description: <strong className={descLength > 165 ? 'text-amber-700' : 'text-emerald-700'}>{descLength} chars</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Social Share Preview (OpenGraph / Twitter) */}
            {socialPlatform === 'facebook' && (
              <div>
                <div className="text-[11px] font-semibold text-slate-500 mb-3">
                  OpenGraph Social Share Card Preview
                </div>

                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs text-left">
                  <div className="h-44 bg-slate-900 overflow-hidden relative">
                    {selectedPage.ogImage ? (
                      <img
                        src={selectedPage.ogImage}
                        alt="Social preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                        No OpenGraph Image configured
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-slate-50 border-t border-slate-200">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      tesfayeteklu.com
                    </div>
                    <div className="text-xs font-bold text-slate-900 line-clamp-1 mt-0.5">
                      {selectedPage.title}
                    </div>
                    <div className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                      {selectedPage.metaDescription}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Structured Schema.org Info */}
            <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-2">
              <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                Automated Structured Data Included
              </div>
              <ul className="space-y-1 text-[11px] text-slate-600">
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Schema.org <strong>Organization</strong> & Social profiles</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Schema.org <strong>ProfessionalService</strong> (Addis Ababa Local SEO)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Schema.org <strong>WebSite</strong> & SearchAction box</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Schema.org <strong>BreadcrumbList</strong> hierarchy</span>
                </li>
              </ul>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
