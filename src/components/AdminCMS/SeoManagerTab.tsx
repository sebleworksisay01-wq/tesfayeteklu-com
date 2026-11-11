import React, { useState } from 'react';
import { CmsConfig, SeoPageConfig } from '../../types/cms';
import { Project } from '../../types';
import {
  Save, Search, Globe, Share2, ExternalLink, CheckCircle2,
  AlertCircle, Smartphone, Monitor, Upload, ShieldCheck,
  FileCode, Check, Copy, Tag, Sparkles, Sliders, Layers,
  BookOpen, Briefcase, Eye, ChevronRight, AlertTriangle
} from 'lucide-react';
import { uploadFileToStorage } from '../../services/api';

interface SeoManagerTabProps {
  cms: CmsConfig;
  projects?: Project[];
  onSaveCms: (partial: Partial<CmsConfig>, message?: string) => Promise<void>;
  saving: boolean;
}

export const SeoManagerTab: React.FC<SeoManagerTabProps> = ({
  cms,
  projects = [],
  onSaveCms,
  saving,
}) => {
  const [targetCategory, setTargetCategory] = useState<'pages' | 'services' | 'projects' | 'blog'>('pages');
  const [selectedItemId, setSelectedItemId] = useState<string>('home');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [previewPlatform, setPreviewPlatform] = useState<'google' | 'facebook' | 'twitter'>('google');
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Local state copy
  const [seoState, setSeoState] = useState(cms.seo || {
    defaultTitle: 'TesfayeTech | Premier Software Engineering & Digital Solutions',
    titleTemplate: '%s | TesfayeTech',
    metaDescription: 'Custom web application development, mobile applications, and enterprise automation in Addis Ababa, Ethiopia.',
    keywords: 'Software Development Ethiopia, Web Applications Addis Ababa',
    ogImage: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
    canonicalUrl: 'https://tesfayeteklu.com',
    pages: []
  });

  // Build items list according to category
  const corePages = seoState.pages || [
    {
      id: 'home',
      name: 'Home',
      path: '/',
      title: 'TesfayeTech | Premier Software Engineering & Digital Solutions',
      metaDescription: 'Top-tier software development, enterprise web applications, and mobile apps in Addis Ababa, Ethiopia.',
      keywords: 'Web Development Ethiopia, Custom Software Addis Ababa',
      focusKeyword: 'Software Development Ethiopia',
      canonicalUrl: 'https://tesfayeteklu.com/',
      robots: 'index, follow' as const,
      ogImage: seoState.ogImage,
      ogType: 'website' as const,
      status: 'published' as const,
      targetType: 'page' as const,
    },
    {
      id: 'services',
      name: 'Services Overview',
      path: '/services',
      title: 'Enterprise Software & Development Services | TesfayeTech',
      metaDescription: 'Custom website design, mobile apps, web applications, and Telebirr payment integrations.',
      keywords: 'Software Services Addis Ababa, Telebirr integration Ethiopia',
      focusKeyword: 'Software Services Addis Ababa',
      canonicalUrl: 'https://tesfayeteklu.com/services',
      robots: 'index, follow' as const,
      ogImage: seoState.ogImage,
      ogType: 'website' as const,
      status: 'published' as const,
      targetType: 'page' as const,
    },
    {
      id: 'portfolio',
      name: 'Portfolio',
      path: '/portfolio',
      title: 'Portfolio & Interactive Demos | TesfayeTech Solutions',
      metaDescription: 'Browse our portfolio of custom software solutions, ERP systems, and web apps.',
      keywords: 'Software Portfolio Ethiopia, Web Demos Addis Ababa',
      focusKeyword: 'Software Portfolio Ethiopia',
      canonicalUrl: 'https://tesfayeteklu.com/portfolio',
      robots: 'index, follow' as const,
      status: 'published' as const,
      targetType: 'page' as const,
    },
    {
      id: 'blog',
      name: 'Blog & Articles',
      path: '/blog',
      title: 'Tech Insights & Software Architecture Blog | TesfayeTech',
      metaDescription: 'Latest technical guides, software development practices, and digital transformation in East Africa.',
      keywords: 'Tech Blog Ethiopia, Software Architecture Insights',
      focusKeyword: 'Tech Blog Ethiopia',
      canonicalUrl: 'https://tesfayeteklu.com/blog',
      robots: 'index, follow' as const,
      status: 'published' as const,
      targetType: 'page' as const,
    },
    {
      id: 'contact',
      name: 'Contact & Inquiries',
      path: '/contact',
      title: 'Contact TesfayeTech | Request a Project Consultation',
      metaDescription: 'Reach our software architecture team via DirectAdmin SMTP or direct phone for consultations.',
      keywords: 'Contact Software Developers Addis Ababa, Project Consultation Ethiopia',
      focusKeyword: 'Contact Software Developers',
      canonicalUrl: 'https://tesfayeteklu.com/contact',
      robots: 'index, follow' as const,
      status: 'published' as const,
      targetType: 'page' as const,
    }
  ];

  // Map services to SeoPageConfig shape
  const serviceItems: SeoPageConfig[] = (cms.services || []).map(s => ({
    id: `srv-${s.id}`,
    name: s.title,
    path: `/services/${s.slug}`,
    title: s.seoTitle || `${s.title} | TesfayeTech Solutions`,
    metaDescription: s.seoDescription || s.shortDescription,
    keywords: `${s.title}, software development Addis Ababa`,
    focusKeyword: s.title,
    canonicalUrl: `https://tesfayeteklu.com/services/${s.slug}`,
    robots: 'index, follow',
    ogImage: s.serviceImage || seoState.ogImage,
    status: s.published ? 'published' : 'draft',
    targetType: 'service',
  }));

  // Map projects to SeoPageConfig shape
  const projectItems: SeoPageConfig[] = projects.map(p => ({
    id: `proj-${p.id}`,
    name: p.name,
    path: `/portfolio/${p.slug}`,
    title: `${p.name} - Case Study | TesfayeTech`,
    metaDescription: p.shortDescription,
    keywords: p.technologies ? p.technologies.join(', ') : 'Software Demo',
    focusKeyword: p.name,
    canonicalUrl: `https://tesfayeteklu.com/portfolio/${p.slug}`,
    robots: 'index, follow',
    ogImage: p.imageUrl || p.thumbnail || seoState.ogImage,
    status: p.published !== false ? 'published' : 'draft',
    targetType: 'portfolio',
  }));

  // Map blog articles to SeoPageConfig shape
  const blogItems: SeoPageConfig[] = (cms.blogArticles || []).map(b => ({
    id: `blog-${b.id}`,
    name: b.title,
    path: `/blog/${b.slug}`,
    title: b.seoTitle || `${b.title} | TesfayeTech Blog`,
    metaDescription: b.seoDescription || b.excerpt,
    keywords: b.tags ? b.tags.join(', ') : 'Tech Blog',
    focusKeyword: b.focusKeyword || b.title.slice(0, 30),
    canonicalUrl: `https://tesfayeteklu.com/blog/${b.slug}`,
    robots: 'index, follow',
    ogImage: b.coverImage || seoState.ogImage,
    ogType: 'article',
    status: b.published ? 'published' : 'draft',
    targetType: 'blog',
  }));

  const activeCollection = 
    targetCategory === 'pages' ? corePages :
    targetCategory === 'services' ? serviceItems :
    targetCategory === 'projects' ? projectItems :
    blogItems;

  const currentItem: SeoPageConfig = 
    activeCollection.find(item => item.id === selectedItemId) || 
    activeCollection[0] || 
    corePages[0];

  const updateCurrentItem = (fields: Partial<SeoPageConfig>) => {
    if (targetCategory === 'pages') {
      const updatedPages = corePages.map(p => p.id === currentItem.id ? { ...p, ...fields } : p);
      setSeoState({ ...seoState, pages: updatedPages });
    } else {
      // Per-item updates can be saved to their respective parent arrays on save
      const updatedPages = [...(seoState.pages || [])];
      const existingIdx = updatedPages.findIndex(p => p.id === currentItem.id);
      if (existingIdx >= 0) {
        updatedPages[existingIdx] = { ...updatedPages[existingIdx], ...fields };
      } else {
        updatedPages.push({ ...currentItem, ...fields });
      }
      setSeoState({ ...seoState, pages: updatedPages });
    }
  };

  const handleSaveAll = async (isDraft = false) => {
    await onSaveCms(
      { seo: { ...seoState, lastUpdated: new Date().toISOString() } },
      isDraft ? 'SEO configurations saved as draft.' : 'SEO and metadata configurations published.'
    );
  };

  const handleOgImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const res = await uploadFileToStorage(file, 'branding');
      updateCurrentItem({ ogImage: res.downloadUrl, twitterImage: res.downloadUrl });
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Image upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // SEO Analysis Calculations
  const title = currentItem.title || '';
  const desc = currentItem.metaDescription || '';
  const focusKw = (currentItem.focusKeyword || '').toLowerCase().trim();
  const titleLen = title.length;
  const descLen = desc.length;

  const hasFocusInTitle = focusKw ? title.toLowerCase().includes(focusKw) : false;
  const hasFocusInDesc = focusKw ? desc.toLowerCase().includes(focusKw) : false;
  const hasFocusInUrl = focusKw ? currentItem.path.toLowerCase().includes(focusKw.replace(/\s+/g, '-')) : true;
  const isTitleOptimal = titleLen >= 30 && titleLen <= 60;
  const isDescOptimal = descLen >= 120 && descLen <= 160;
  const hasCanonicalHttps = (currentItem.canonicalUrl || '').startsWith('https://tesfayeteklu.com');
  const hasOgImage = Boolean(currentItem.ogImage);

  // Recommendations Generation
  const recommendations: string[] = [];
  if (titleLen < 30) {
    recommendations.push(`Title is too short (${titleLen} chars). Expand between 30–60 characters to optimize click-through rate.`);
  } else if (titleLen > 60) {
    recommendations.push(`Title is ${titleLen} characters and may be truncated by Google. Keep under 60 characters.`);
  }

  if (descLen < 120) {
    recommendations.push(`Meta description is too short (${descLen} chars). Elaborate with value propositions between 120–160 characters.`);
  } else if (descLen > 160) {
    recommendations.push(`Meta description is ${descLen} characters. Search engines will truncate past 160 characters.`);
  }

  if (focusKw && !hasFocusInTitle) {
    recommendations.push(`Focus keyword "${currentItem.focusKeyword}" is missing from the title tag. Place it near the beginning.`);
  }
  if (focusKw && !hasFocusInDesc) {
    recommendations.push(`Focus keyword "${currentItem.focusKeyword}" is not mentioned in the meta description.`);
  }
  if (!hasOgImage) {
    recommendations.push('Upload an OpenGraph image (1200x630) to generate rich social cards on LinkedIn, X, and Facebook.');
  }

  return (
    <div className="space-y-6 max-w-6xl animate-in fade-in duration-150 text-left">
      
      {/* Header Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
            <Search className="w-3.5 h-3.5" />
            <span>Dedicated SEO & Technical Metadata Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            SEO Management & Content Optimization
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mt-1">
            Configure search titles, meta descriptions, focus keywords, OpenGraph/Twitter cards, and Schema.org structured data per page, service, blog post, and portfolio project.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => handleSaveAll(true)}
            disabled={saving}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
          >
            Save as Draft
          </button>
          <button
            onClick={() => handleSaveAll(false)}
            disabled={saving}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Publishing...' : 'Publish SEO Settings'}</span>
          </button>
        </div>
      </div>

      {/* Category Tabs: Pages, Services, Portfolio, Blog */}
      <div className="flex border-b border-slate-200 bg-white rounded-2xl p-1.5 gap-2 shadow-xs">
        {[
          { key: 'pages', label: 'Website Pages', count: corePages.length, icon: Globe },
          { key: 'services', label: 'Services', count: serviceItems.length, icon: Briefcase },
          { key: 'projects', label: 'Portfolio Projects', count: projectItems.length, icon: Layers },
          { key: 'blog', label: 'Blog Articles', count: blogItems.length, icon: BookOpen },
        ].map((cat) => {
          const Icon = cat.icon;
          const isActive = targetCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => {
                setTargetCategory(cat.key as any);
                const collection = 
                  cat.key === 'pages' ? corePages :
                  cat.key === 'services' ? serviceItems :
                  cat.key === 'projects' ? projectItems :
                  blogItems;
                if (collection[0]) setSelectedItemId(collection[0].id);
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                isActive
                  ? 'bg-blue-50 text-blue-700 shadow-xs border border-blue-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{cat.label}</span>
              <span className={`text-3xs font-mono px-1.5 py-0.5 rounded ${isActive ? 'bg-blue-200/70 text-blue-900' : 'bg-slate-100 text-slate-500'}`}>
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Item Selector Dropdown */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 flex-1">
          <label className="text-xs font-bold text-slate-700 whitespace-nowrap">
            Configure SEO Target:
          </label>
          <select
            value={currentItem.id}
            onChange={(e) => setSelectedItemId(e.target.value)}
            className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            {activeCollection.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} ({item.path})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className={`px-2.5 py-1 rounded text-3xs font-semibold uppercase ${
            currentItem.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
          }`}>
            {currentItem.status || 'published'}
          </span>
          <a
            href={currentItem.path}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            title="Inspect live URL"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Main Grid: Form Editor (Left 7) + Live Previews & SEO Audit Panel (Right 5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Col: SEO Meta Fields */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4.5">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Page Metadata & Keywords
              </span>
              <span className="text-2xs text-slate-400 font-mono">
                Canonical: {currentItem.path}
              </span>
            </div>

            {/* Focus Keyword */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Focus Keyword
              </label>
              <input
                type="text"
                placeholder="e.g. Software Development Ethiopia"
                value={currentItem.focusKeyword || ''}
                onChange={(e) => updateCurrentItem({ focusKeyword: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
              />
              <p className="text-2xs text-slate-400 mt-1">
                Primary search query target used for algorithmic page density and snippet scoring.
              </p>
            </div>

            {/* Page Title */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  SEO Page Title Tag (`&lt;title&gt;`)
                </label>
                <span className={`text-3xs font-mono px-2 py-0.5 rounded font-bold ${
                  isTitleOptimal ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  {titleLen} / 60 chars {titleLen > 60 ? '(Will Truncate)' : ''}
                </span>
              </div>
              <input
                type="text"
                value={currentItem.title || ''}
                onChange={(e) => updateCurrentItem({ title: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
                placeholder="e.g. TesfayeTech | Software & Digital Solutions"
              />
            </div>

            {/* Search Engine Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Search Engine Display Title (Optional Override)
              </label>
              <input
                type="text"
                value={currentItem.searchEngineTitle || ''}
                onChange={(e) => updateCurrentItem({ searchEngineTitle: e.target.value })}
                placeholder="Leave blank to use default Page Title"
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            {/* Meta Description */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Meta Description (`&lt;meta name="description"&gt;`)
                </label>
                <span className={`text-3xs font-mono px-2 py-0.5 rounded font-bold ${
                  isDescOptimal ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  {descLen} / 160 chars {descLen > 160 ? '(Will Truncate)' : ''}
                </span>
              </div>
              <textarea
                rows={3}
                value={currentItem.metaDescription || ''}
                onChange={(e) => updateCurrentItem({ metaDescription: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 leading-relaxed"
                placeholder="120–160 character concise summary highlighting value, technologies, and calls to action..."
              />
            </div>

            {/* Target Keywords */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Additional SEO Keywords (Comma-separated)
              </label>
              <input
                type="text"
                value={currentItem.keywords || ''}
                onChange={(e) => updateCurrentItem({ keywords: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg"
                placeholder="Mobile Apps, Web Development, Cloud Solutions..."
              />
            </div>

            {/* Canonical URL & Robots */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Canonical URL
                </label>
                <input
                  type="url"
                  value={currentItem.canonicalUrl || ''}
                  onChange={(e) => updateCurrentItem({ canonicalUrl: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs font-mono border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Meta Robots Directives
                </label>
                <select
                  value={currentItem.robots || 'index, follow'}
                  onChange={(e) => updateCurrentItem({ robots: e.target.value as any })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="index, follow">index, follow (Allow Crawlers)</option>
                  <option value="noindex, follow">noindex, follow (Hide Page, Follow Links)</option>
                  <option value="noindex, nofollow">noindex, nofollow (Complete Disallow)</option>
                </select>
              </div>
            </div>

            {/* OpenGraph & Twitter Social Cards */}
            <div className="pt-3 border-t border-slate-100 space-y-4">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Social Media Sharing Cards (OpenGraph & Twitter / X)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    OpenGraph Title
                  </label>
                  <input
                    type="text"
                    value={currentItem.ogTitle || currentItem.title || ''}
                    onChange={(e) => updateCurrentItem({ ogTitle: e.target.value })}
                    placeholder="Title on Facebook, LinkedIn, Slack"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Twitter / X Card Title
                  </label>
                  <input
                    type="text"
                    value={currentItem.twitterTitle || currentItem.title || ''}
                    onChange={(e) => updateCurrentItem({ twitterTitle: e.target.value })}
                    placeholder="Title on Twitter / X card"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Social Sharing Image URL (1200 x 630px Recommended)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentItem.ogImage || ''}
                    onChange={(e) => updateCurrentItem({ ogImage: e.target.value, twitterImage: e.target.value })}
                    className="flex-1 px-3.5 py-2 text-xs border border-slate-300 rounded-lg"
                    placeholder="https://..."
                  />
                  <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shrink-0">
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
                {uploadError && <p className="text-2xs text-rose-600 mt-1">{uploadError}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Social Image ALT Text (Accessibility & Image SEO)
                </label>
                <input
                  type="text"
                  value={currentItem.imageAltText || ''}
                  onChange={(e) => updateCurrentItem({ imageAltText: e.target.value })}
                  placeholder="Descriptive caption for screen readers and Google Image search..."
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              {/* Structured Data Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Schema.org Structured Data Type
                </label>
                <select
                  value={currentItem.structuredDataType || (currentItem.targetType === 'blog' ? 'Article' : 'ProfessionalService')}
                  onChange={(e) => updateCurrentItem({ structuredDataType: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg bg-white font-mono"
                >
                  <option value="ProfessionalService">ProfessionalService (Addis Ababa Local SEO)</option>
                  <option value="Organization">Organization (Corporate Identity)</option>
                  <option value="WebApplication">WebApplication (Software Application)</option>
                  <option value="Article">Article / TechBlog</option>
                  <option value="SoftwareSourceCode">SoftwareSourceCode (Engineering Showcase)</option>
                </select>
              </div>

            </div>

          </div>
        </div>

        {/* Right Col: Live Previews & Actionable SEO Recommendations (Right 5) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Live Preview Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Live Result Previews
              </span>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setPreviewPlatform('google')}
                  className={`px-2.5 py-1 text-2xs font-bold rounded-md transition-all cursor-pointer ${
                    previewPlatform === 'google' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Google
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewPlatform('facebook')}
                  className={`px-2.5 py-1 text-2xs font-bold rounded-md transition-all cursor-pointer ${
                    previewPlatform === 'facebook' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Social
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewPlatform('twitter')}
                  className={`px-2.5 py-1 text-2xs font-bold rounded-md transition-all cursor-pointer ${
                    previewPlatform === 'twitter' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  X Card
                </button>
              </div>
            </div>

            {/* Google SERP Snippet */}
            {previewPlatform === 'google' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xs text-slate-400 font-mono">Google Search Result Snippet</span>
                  <div className="flex items-center gap-1 text-slate-400">
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('desktop')}
                      className={`p-1 rounded cursor-pointer ${previewDevice === 'desktop' ? 'text-blue-600 bg-blue-50' : ''}`}
                    >
                      <Monitor className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('mobile')}
                      className={`p-1 rounded cursor-pointer ${previewDevice === 'mobile' ? 'text-blue-600 bg-blue-50' : ''}`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 font-sans text-left space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-700">
                    <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                      T
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900 leading-none">TesfayeTech</span>
                      <span className="text-[11px] text-slate-500 truncate max-w-[240px]">
                        {currentItem.canonicalUrl}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-sm sm:text-base font-medium text-[#1a0dab] hover:underline cursor-pointer leading-snug line-clamp-2 pt-1">
                    {currentItem.searchEngineTitle || currentItem.title || 'TesfayeTech Solutions'}
                  </h3>

                  <p className="text-xs text-[#4d5156] leading-relaxed line-clamp-2">
                    {currentItem.metaDescription || 'No description entered yet.'}
                  </p>
                </div>
              </div>
            )}

            {/* Social Share Preview (Facebook / LinkedIn) */}
            {previewPlatform === 'facebook' && (
              <div className="border border-slate-200 rounded-xl overflow-hidden text-left">
                <div className="h-36 bg-slate-900 overflow-hidden relative">
                  {currentItem.ogImage ? (
                    <img src={currentItem.ogImage} alt="Social card" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                      No Image Configured
                    </div>
                  )}
                </div>
                <div className="p-3 bg-slate-50 border-t border-slate-200">
                  <div className="text-3xs uppercase font-bold text-slate-400">tesfayeteklu.com</div>
                  <div className="text-xs font-bold text-slate-900 line-clamp-1 mt-0.5">{currentItem.ogTitle || currentItem.title}</div>
                  <div className="text-2xs text-slate-500 line-clamp-2 mt-0.5">{currentItem.metaDescription}</div>
                </div>
              </div>
            )}

            {/* Twitter / X Card Preview */}
            {previewPlatform === 'twitter' && (
              <div className="border border-slate-200 rounded-2xl overflow-hidden text-left bg-slate-950 text-white p-3 space-y-2">
                <div className="h-36 bg-slate-900 rounded-xl overflow-hidden relative">
                  {currentItem.twitterImage || currentItem.ogImage ? (
                    <img src={currentItem.twitterImage || currentItem.ogImage} alt="Twitter card" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                      No Twitter Image
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-3xs text-slate-400">tesfayeteklu.com</div>
                  <div className="text-xs font-bold text-white line-clamp-1">{currentItem.twitterTitle || currentItem.title}</div>
                  <div className="text-2xs text-slate-400 line-clamp-2">{currentItem.metaDescription}</div>
                </div>
              </div>
            )}

          </div>

          {/* Actionable SEO Analysis Panel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>SEO Content Health & Analysis</span>
              </span>
              <span className={`text-2xs font-bold px-2 py-0.5 rounded ${
                recommendations.length === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {recommendations.length === 0 ? 'All Checks Passed' : `${recommendations.length} Suggestions`}
              </span>
            </div>

            {/* Checklist Items */}
            <div className="space-y-2 text-2xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <span className="text-slate-700">Title Tag Length (30–60 chars)</span>
                <span className={`font-bold flex items-center gap-1 ${isTitleOptimal ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {isTitleOptimal ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                  <span>{titleLen} chars</span>
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <span className="text-slate-700">Meta Description Length (120–160 chars)</span>
                <span className={`font-bold flex items-center gap-1 ${isDescOptimal ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {isDescOptimal ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                  <span>{descLen} chars</span>
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <span className="text-slate-700">Focus Keyword in Title Tag</span>
                <span className={`font-bold flex items-center gap-1 ${hasFocusInTitle ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {hasFocusInTitle ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                  <span>{hasFocusInTitle ? 'Present' : 'Missing'}</span>
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <span className="text-slate-700">Focus Keyword in Meta Description</span>
                <span className={`font-bold flex items-center gap-1 ${hasFocusInDesc ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {hasFocusInDesc ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                  <span>{hasFocusInDesc ? 'Present' : 'Missing'}</span>
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <span className="text-slate-700">Canonical HTTPS Tag</span>
                <span className={`font-bold flex items-center gap-1 ${hasCanonicalHttps ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {hasCanonicalHttps ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                  <span>{hasCanonicalHttps ? 'Valid' : 'Invalid'}</span>
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <span className="text-slate-700">Social OpenGraph Image</span>
                <span className={`font-bold flex items-center gap-1 ${hasOgImage ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {hasOgImage ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                  <span>{hasOgImage ? 'Configured' : 'Missing'}</span>
                </span>
              </div>
            </div>

            {/* Actionable Recommendations List */}
            {recommendations.length > 0 && (
              <div className="pt-2">
                <span className="text-3xs font-bold uppercase tracking-wider text-amber-800 block mb-1.5">
                  Actionable Recommendations:
                </span>
                <ul className="space-y-1.5">
                  {recommendations.map((rec, i) => (
                    <li key={i} className="text-2xs text-amber-900 bg-amber-50/80 border border-amber-200/80 p-2 rounded-lg flex items-start gap-1.5">
                      <ChevronRight className="w-3.5 h-3.5 shrink-0 text-amber-600 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};
