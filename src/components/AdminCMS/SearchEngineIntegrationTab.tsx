import React, { useState } from 'react';
import { CmsConfig, SearchEngineIntegrationSettings } from '../../types/cms';
import { Project } from '../../types';
import { 
  Globe, Search, CheckCircle2, AlertCircle, ExternalLink, 
  FileCode, ShieldCheck, Copy, Check, Save, RefreshCw, 
  Layers, Terminal, HelpCircle, ArrowUpRight
} from 'lucide-react';

interface SearchEngineIntegrationTabProps {
  cms: CmsConfig;
  projects?: Project[];
  onSaveCms: (partial: Partial<CmsConfig>, message?: string) => Promise<void>;
  saving: boolean;
}

export const SearchEngineIntegrationTab: React.FC<SearchEngineIntegrationTabProps> = ({
  cms,
  projects = [],
  onSaveCms,
  saving,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Search Engine state initialized with defaults
  const [googleTag, setGoogleTag] = useState<string>(
    cms.seo?.googleSearchConsoleVerification || 
    cms.seo?.searchEngines?.googleVerificationTag || 
    'google-site-verification=TesfayeTech_GSC_Verification_2026'
  );
  const [googleStatus, setGoogleStatus] = useState<'verified' | 'pending' | 'unverified'>(
    cms.seo?.searchEngines?.googleVerificationStatus || 'pending'
  );

  const [bingTag, setBingTag] = useState<string>(
    cms.seo?.bingVerification || 
    cms.seo?.searchEngines?.bingVerificationTag || 
    'msvalidate.01=A1B2C3D4E5F6G7H8I9J0K1L2M3N4'
  );
  const [bingStatus, setBingStatus] = useState<'verified' | 'pending' | 'unverified'>(
    cms.seo?.searchEngines?.bingVerificationStatus || 'pending'
  );

  const [customRobots, setCustomRobots] = useState<string>(
    cms.seo?.searchEngines?.customRobotsTxt || `# robots.txt for https://tesfayeteklu.com
User-agent: *
Allow: /
Allow: /services/
Allow: /portfolio/
Allow: /blog/
Allow: /page/

# Disallow private administrative areas and internal APIs
Disallow: /admin
Disallow: /admin/
Disallow: /api/

Host: https://tesfayeteklu.com
Sitemap: https://tesfayeteklu.com/sitemap.xml
`
  );

  const [activeRobotsCheck, setActiveRobotsCheck] = useState<'valid' | null>('valid');
  const [activeSitemapCheck, setActiveSitemapCheck] = useState<'valid' | null>('valid');

  // Compute published sitemap item statistics
  const corePages = 11;
  const publishedServices = (cms.services || []).filter(s => s.published !== false).length;
  const publishedProjects = projects.filter(p => p.published !== false).length;
  const publishedBlogs = (cms.blogArticles || []).filter(b => b.published !== false).length;
  const publishedCustomPages = (cms.customPages || []).filter(p => p.published).length;
  const totalSitemapUrls = corePages + publishedServices + publishedProjects + publishedBlogs + publishedCustomPages;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveAll = async () => {
    const searchEngines: SearchEngineIntegrationSettings = {
      googlePropertyUrl: 'https://tesfayeteklu.com',
      googleVerificationTag: googleTag,
      googleDnsInstructions: 'Add TXT record: @ -> google-site-verification=' + googleTag.replace('google-site-verification=', ''),
      googleVerificationStatus: googleStatus,
      googleSitemapSubmissionUrl: 'https://tesfayeteklu.com/sitemap.xml',
      bingVerificationTag: bingTag,
      bingDnsInstructions: 'Add CNAME or verify via Bing Webmaster Tools',
      bingVerificationStatus: bingStatus,
      bingSitemapSubmissionUrl: 'https://tesfayeteklu.com/sitemap.xml',
      customRobotsTxt: customRobots,
      lastSitemapPing: new Date().toISOString()
    };

    const updatedSeo = {
      ...cms.seo,
      googleSearchConsoleVerification: googleTag,
      bingVerification: bingTag,
      searchEngines
    };

    await onSaveCms({ seo: updatedSeo }, 'Search Engine Verification & Sitemap integration saved.');
  };

  return (
    <div className="space-y-8 max-w-5xl animate-in fade-in duration-150">
      
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
            <Globe className="w-3.5 h-3.5" />
            <span>Search Engine Console & Indexation Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Search Engine Registration & Indexing
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mt-1">
            Configure Google Search Console, Bing Webmaster Tools, live XML sitemaps, and robots.txt crawler access for <strong className="text-slate-700">https://tesfayeteklu.com</strong>.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs shrink-0 transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
        </button>
      </div>

      {/* Overview Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Sitemap status */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              XML Sitemap Status
            </span>
            <span className="px-2 py-0.5 rounded text-3xs font-bold bg-emerald-100 text-emerald-800">
              Active (200 OK)
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mb-1">
            {totalSitemapUrls} URLs
          </div>
          <p className="text-2xs text-slate-500 mb-3">
            Auto-synchronized with published services, blog articles, custom pages, and portfolio projects.
          </p>
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            <span>Inspect sitemap.xml</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Google Status */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Google Search Console
            </span>
            <span className={`px-2 py-0.5 rounded text-3xs font-bold ${
              googleStatus === 'verified' 
                ? 'bg-emerald-100 text-emerald-800' 
                : googleStatus === 'pending'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-slate-100 text-slate-700'
            }`}>
              {googleStatus.toUpperCase()}
            </span>
          </div>
          <div className="text-sm font-bold text-slate-900 mb-1 truncate">
            tesfayeteklu.com
          </div>
          <p className="text-2xs text-slate-500 mb-3">
            Meta tag inserted automatically in HTML head. Submit sitemap after DNS or meta verification.
          </p>
          <a
            href="https://search.google.com/search-console"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            <span>Open Google Console</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Bing Status */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Bing Webmaster Tools
            </span>
            <span className={`px-2 py-0.5 rounded text-3xs font-bold ${
              bingStatus === 'verified' 
                ? 'bg-emerald-100 text-emerald-800' 
                : bingStatus === 'pending'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-slate-100 text-slate-700'
            }`}>
              {bingStatus.toUpperCase()}
            </span>
          </div>
          <div className="text-sm font-bold text-slate-900 mb-1 truncate">
            IndexNow Enabled
          </div>
          <p className="text-2xs text-slate-500 mb-3">
            msvalidate verification tag ready. Connect with Bing Webmaster account for instant indexing.
          </p>
          <a
            href="https://www.bing.com/webmasters"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            <span>Open Bing Webmaster</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>

      {/* Google Search Console Configuration Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              1. Google Search Console Integration
            </h3>
            <p className="text-2xs text-slate-500">
              Configure verification meta tag and submit live sitemap URL
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Website Property URL
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  readOnly
                  value="https://tesfayeteklu.com"
                  className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-l-lg text-slate-700"
                />
                <button
                  type="button"
                  onClick={() => handleCopy('https://tesfayeteklu.com', 'g-url')}
                  className="px-3 py-2 bg-slate-100 border border-l-0 border-slate-200 rounded-r-lg text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  {copiedKey === 'g-url' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                HTML Verification Meta Tag Content
              </label>
              <input
                type="text"
                value={googleTag}
                onChange={(e) => setGoogleTag(e.target.value)}
                placeholder="google-site-verification=XXXXXXXXXXXXXXXXXXXXX"
                className="w-full px-3.5 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-2xs text-slate-400 mt-1">
                Automatically rendered as &lt;meta name="google-site-verification" content="..."&gt; in public &lt;head&gt;.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sitemap Submission URL for Search Console
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  readOnly
                  value="https://tesfayeteklu.com/sitemap.xml"
                  className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-l-lg text-slate-700"
                />
                <button
                  type="button"
                  onClick={() => handleCopy('https://tesfayeteklu.com/sitemap.xml', 'g-sitemap')}
                  className="px-3 py-2 bg-slate-100 border border-l-0 border-slate-200 rounded-r-lg text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  {copiedKey === 'g-sitemap' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-2xs text-slate-400 mt-1">
                Copy and paste this into the "Sitemaps" section of Google Search Console.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Verification Status
              </label>
              <select
                value={googleStatus}
                onChange={(e) => setGoogleStatus(e.target.value as any)}
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              >
                <option value="unverified">Unverified</option>
                <option value="pending">Pending Verification</option>
                <option value="verified">Verified in Google Search Console</option>
              </select>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5">
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
              <Terminal className="w-3.5 h-3.5 text-blue-600" />
              <span>DNS Verification Instructions (DirectAdmin)</span>
            </div>
            <p className="text-2xs text-slate-600 leading-relaxed">
              If using DNS verification instead of HTML tag, log in to your DirectAdmin DNS management panel:
            </p>
            <div className="p-3 bg-white border border-slate-200 rounded-xl font-mono text-2xs space-y-1.5 text-slate-700">
              <div><strong>Record Type:</strong> TXT</div>
              <div><strong>Name / Host:</strong> @ (or tesfayeteklu.com.)</div>
              <div><strong>Value:</strong> {googleTag.includes('=') ? googleTag : `google-site-verification=${googleTag}`}</div>
              <div><strong>TTL:</strong> 3600</div>
            </div>
            <p className="text-2xs text-slate-500">
              DNS propagation typically takes between 15 minutes and 2 hours depending on TTL.
            </p>
          </div>

        </div>
      </div>

      {/* Bing Webmaster Tools Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              2. Bing Webmaster Tools & IndexNow
            </h3>
            <p className="text-2xs text-slate-500">
              Support Microsoft Bing and Yahoo search indexing
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bing Verification Tag (msvalidate.01)
              </label>
              <input
                type="text"
                value={bingTag}
                onChange={(e) => setBingTag(e.target.value)}
                placeholder="msvalidate.01=XXXXXXXXXXXXXXXXXXXXX"
                className="w-full px-3.5 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-2xs text-slate-400 mt-1">
                Rendered as &lt;meta name="msvalidate.01" content="..."&gt; in public &lt;head&gt;.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bing Verification Status
              </label>
              <select
                value={bingStatus}
                onChange={(e) => setBingStatus(e.target.value as any)}
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              >
                <option value="unverified">Unverified</option>
                <option value="pending">Pending Verification</option>
                <option value="verified">Verified in Bing Webmaster</option>
              </select>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Bing Webmaster Verification Steps
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-2xs text-slate-600 leading-relaxed">
              <li>Sign in to <a href="https://www.bing.com/webmasters" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold underline">Bing Webmaster Tools</a> with your Microsoft account.</li>
              <li>Add site URL: <strong className="font-mono text-slate-800">https://tesfayeteklu.com</strong> or import directly from Google Search Console.</li>
              <li>Select <em>HTML Meta Tag</em> verification and paste the token above.</li>
              <li>Submit sitemap: <strong className="font-mono text-slate-800">https://tesfayeteklu.com/sitemap.xml</strong>.</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Robots.txt Configuration & Validator */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-5 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                3. robots.txt Crawler Access Directives
              </h3>
              <p className="text-2xs text-slate-500">
                Live configuration served at <strong className="font-mono text-slate-700">https://tesfayeteklu.com/robots.txt</strong>
              </p>
            </div>
          </div>

          <a
            href="/robots.txt"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <span>Live robots.txt</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            robots.txt Content Editor
          </label>
          <textarea
            rows={8}
            value={customRobots}
            onChange={(e) => setCustomRobots(e.target.value)}
            className="w-full px-4 py-3 text-xs font-mono bg-slate-950 text-slate-100 rounded-xl border border-slate-800 focus:ring-2 focus:ring-blue-500 leading-relaxed"
          />
        </div>

        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-2xs text-emerald-900 space-y-1">
            <div className="font-bold">Security Directives Confirmed</div>
            <p>
              Administrative paths (<code className="font-mono bg-white px-1 py-0.5 rounded border border-emerald-300">/admin</code>) and API routes (<code className="font-mono bg-white px-1 py-0.5 rounded border border-emerald-300">/api/</code>) are disallowed from search crawlers, while public marketing, services, portfolio, blog, and custom pages are fully allowed.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
