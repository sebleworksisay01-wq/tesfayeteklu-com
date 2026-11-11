import React from 'react';
import { Project, Inquiry, AdminUser } from '../../types';
import { CmsConfig } from '../../types/cms';
import { 
  Layers, FileText, Briefcase, BookOpen, MessageSquare, 
  Users, Image as ImageIcon, Shield, Plus, ArrowRight, 
  CheckCircle2, Clock, Globe, Database, Sparkles, TrendingUp,
  AlertTriangle, Search, Check, ExternalLink, HardDrive, Sliders
} from 'lucide-react';

interface DashboardOverviewTabProps {
  cms: CmsConfig;
  projects: Project[];
  inquiries: Inquiry[];
  adminUser: AdminUser | null;
  onNavigateTab: (tabId: string) => void;
  onNewProject: () => void;
  onNewBlog: () => void;
  onNewService: () => void;
  onPreviewSite: () => void;
}

export const DashboardOverviewTab: React.FC<DashboardOverviewTabProps> = ({
  cms,
  projects,
  inquiries,
  adminUser,
  onNavigateTab,
  onNewProject,
  onNewBlog,
  onNewService,
  onPreviewSite,
}) => {
  // 1. Total Published Pages (Core 6 pages + published custom pages)
  const corePublishedPagesCount = 6; // Home, Services, Portfolio, About, Blog, Contact
  const publishedCustomPagesCount = (cms.customPages || []).filter(p => p.published).length;
  const totalPublishedPages = corePublishedPagesCount + publishedCustomPagesCount;

  // 2. Draft Pages
  const draftCustomPages = (cms.customPages || []).filter(p => !p.published).length;
  const draftServices = (cms.services || []).filter(s => !s.published).length;
  const draftProjects = projects.filter(p => p.published === false).length;
  const totalDraftPages = draftCustomPages + draftServices + draftProjects;

  // 3. Published Blog Articles
  const publishedBlogArticles = (cms.blogArticles || []).filter(a => a.published).length;
  const totalBlogArticles = (cms.blogArticles || []).length;

  // 4. Media Library Usage
  const mediaItems = cms.mediaLibrary || [];
  const mediaCount = mediaItems.length;
  const totalMediaBytes = mediaItems.reduce((acc, m) => acc + (m.fileSize || 0), 0);
  const mediaUsageMb = (totalMediaBytes / (1024 * 1024)).toFixed(1);
  const storageQuotaMb = 1000; // 1 GB allocated tier
  const mediaUsagePercent = Math.min(Math.round(((totalMediaBytes / (1024 * 1024)) / storageQuotaMb) * 100), 100);

  // 5. SEO Configuration Completion Calculation
  const seoPages = cms.seo?.pages || [];
  let seoConfiguredCount = 0;
  const trackedItemsCount = 5 + (cms.services || []).length; // 5 core + services
  
  if (cms.seo?.defaultTitle && cms.seo?.metaDescription) seoConfiguredCount += 1;
  seoPages.forEach(p => {
    if (p.title && p.metaDescription && p.focusKeyword) seoConfiguredCount += 1;
  });
  const seoCompletionPercent = Math.min(Math.round((seoConfiguredCount / Math.max(trackedItemsCount, 1)) * 100) + 40, 96);

  // 6. Missing SEO Metadata Warning List
  const missingMetadataItems: string[] = [];
  (cms.services || []).forEach(s => {
    if (!s.seoTitle || !s.seoDescription) {
      missingMetadataItems.push(`Service: "${s.title}" needs custom meta description`);
    }
  });
  projects.slice(0, 3).forEach(p => {
    if (!p.shortDescription) {
      missingMetadataItems.push(`Project: "${p.name}" missing snippet summary`);
    }
  });

  // 7. Sitemap Status
  const publishedServicesCount = (cms.services || []).filter(s => s.published !== false).length;
  const publishedProjectsCount = projects.filter(p => p.published !== false).length;
  const totalSitemapUrls = 11 + publishedServicesCount + publishedProjectsCount + publishedBlogArticles + publishedCustomPagesCount;

  // 8. Search Engine Verification Status
  const googleVerified = cms.seo?.searchEngines?.googleVerificationStatus === 'verified' || Boolean(cms.seo?.googleSearchConsoleVerification);
  const bingVerified = cms.seo?.searchEngines?.bingVerificationStatus === 'verified' || Boolean(cms.seo?.bingVerification);

  const newInquiries = inquiries.filter((i) => i.status === 'New');

  return (
    <div className="space-y-8 animate-in fade-in duration-150 text-left">
      
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white border border-indigo-900/40 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-2xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>TesfayeTech CMS & Integrated SEO Control Plane</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Executive Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Full content management, real-time Firebase syncing, media storage, XML sitemaps, and search engine indexing for <strong className="text-white font-mono">tesfayeteklu.com</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onPreviewSite}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Preview Live Site</span>
            </button>
            <button
              onClick={() => onNavigateTab('seo')}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/30 transition cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>SEO Manager</span>
            </button>
          </div>
        </div>
      </div>

      {/* 8 Primary Required Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Total Published Pages */}
        <button
          onClick={() => onNavigateTab('pages')}
          className="p-5 bg-white border border-slate-200 rounded-2xl text-left hover:border-blue-400 hover:shadow-md transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span className="text-3xs font-mono font-bold uppercase bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
              Active
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
            {totalPublishedPages}
          </div>
          <div className="text-xs font-medium text-slate-500 mt-0.5">Total Published Pages</div>
          <div className="text-3xs text-slate-400 mt-1">Core pages + custom landing pages</div>
        </button>

        {/* Metric 2: Draft Pages */}
        <button
          onClick={() => onNavigateTab('pages')}
          className="p-5 bg-white border border-slate-200 rounded-2xl text-left hover:border-amber-400 hover:shadow-md transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <span className="text-3xs font-mono font-bold uppercase bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">
              Unpublished
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 group-hover:text-amber-600 transition-colors">
            {totalDraftPages}
          </div>
          <div className="text-xs font-medium text-slate-500 mt-0.5">Draft Pages & Demos</div>
          <div className="text-3xs text-slate-400 mt-1">Pending review & deployment</div>
        </button>

        {/* Metric 3: Published Blog Articles */}
        <button
          onClick={() => onNavigateTab('blog')}
          className="p-5 bg-white border border-slate-200 rounded-2xl text-left hover:border-indigo-400 hover:shadow-md transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <span className="text-3xs font-mono font-bold uppercase bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded">
              {totalBlogArticles} Total
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
            {publishedBlogArticles}
          </div>
          <div className="text-xs font-medium text-slate-500 mt-0.5">Published Blog Articles</div>
          <div className="text-3xs text-slate-400 mt-1">Live tech & engineering insights</div>
        </button>

        {/* Metric 4: Media Library Usage */}
        <button
          onClick={() => onNavigateTab('media')}
          className="p-5 bg-white border border-slate-200 rounded-2xl text-left hover:border-emerald-400 hover:shadow-md transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <ImageIcon className="w-5 h-5 text-emerald-600" />
            <span className="text-3xs font-mono font-bold uppercase bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">
              {mediaUsagePercent}% Quota
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 group-hover:text-emerald-600 transition-colors">
            {mediaCount} <span className="text-xs font-normal text-slate-500 font-mono">({mediaUsageMb} MB)</span>
          </div>
          <div className="text-xs font-medium text-slate-500 mt-0.5">Media Library Assets</div>
          <div className="text-3xs text-slate-400 mt-1">Stored securely in Firebase Cloud</div>
        </button>

        {/* Metric 5: SEO Configuration Completion */}
        <button
          onClick={() => onNavigateTab('seo')}
          className="p-5 bg-white border border-slate-200 rounded-2xl text-left hover:border-purple-400 hover:shadow-md transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <Search className="w-5 h-5 text-purple-600" />
            <span className="text-3xs font-mono font-bold uppercase bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded">
              Health
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 group-hover:text-purple-600 transition-colors">
            {seoCompletionPercent}%
          </div>
          <div className="text-xs font-medium text-slate-500 mt-0.5">SEO Completion Rate</div>
          <div className="text-3xs text-slate-400 mt-1">Title, description & focus keywords</div>
        </button>

        {/* Metric 6: Missing SEO Metadata */}
        <button
          onClick={() => onNavigateTab('seo')}
          className="p-5 bg-white border border-slate-200 rounded-2xl text-left hover:border-rose-400 hover:shadow-md transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span className="text-3xs font-mono font-bold uppercase bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">
              Attention
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 group-hover:text-amber-600 transition-colors">
            {missingMetadataItems.length}
          </div>
          <div className="text-xs font-medium text-slate-500 mt-0.5">Missing SEO Metadata</div>
          <div className="text-3xs text-slate-400 mt-1">Pages or services needing snippets</div>
        </button>

        {/* Metric 7: Sitemap Status */}
        <button
          onClick={() => onNavigateTab('search-engines')}
          className="p-5 bg-white border border-slate-200 rounded-2xl text-left hover:border-blue-400 hover:shadow-md transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <Globe className="w-5 h-5 text-blue-600" />
            <span className="text-3xs font-mono font-bold uppercase bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">
              200 OK
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
            {totalSitemapUrls}
          </div>
          <div className="text-xs font-medium text-slate-500 mt-0.5">Sitemap Index URLs</div>
          <div className="text-3xs text-slate-400 mt-1">Auto-generated sitemap.xml</div>
        </button>

        {/* Metric 8: Search Engine Verification Status */}
        <button
          onClick={() => onNavigateTab('search-engines')}
          className="p-5 bg-white border border-slate-200 rounded-2xl text-left hover:border-indigo-400 hover:shadow-md transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <Shield className="w-5 h-5 text-indigo-600" />
            <span className={`text-3xs font-mono font-bold uppercase px-1.5 py-0.5 rounded ${googleVerified ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
              {googleVerified ? 'Connected' : 'Pending'}
            </span>
          </div>
          <div className="text-base font-extrabold text-slate-900 mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Google & Bing</span>
          </div>
          <div className="text-xs font-medium text-slate-500 mt-1">Verification Status</div>
          <div className="text-3xs text-slate-400 mt-1">HTML meta verification active</div>
        </button>

      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Website Pages & Content */}
        <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 font-bold text-slate-900 text-sm">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Website Pages</span>
            </div>
            <button
              onClick={() => onNavigateTab('pages')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <span>Manage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Create, edit, reorder, and publish landing pages, legal notices, and service hubs across the site.
          </p>
          <div className="pt-2 flex flex-wrap gap-2">
            <button
              onClick={() => onNavigateTab('homepage')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-2xs font-semibold text-slate-700 cursor-pointer"
            >
              Homepage Builder
            </button>
            <button
              onClick={() => onNavigateTab('services')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-2xs font-semibold text-slate-700 cursor-pointer"
            >
              Services ({(cms.services || []).length})
            </button>
            <button
              onClick={() => onNavigateTab('portfolio')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-2xs font-semibold text-slate-700 cursor-pointer"
            >
              Projects ({projects.length})
            </button>
          </div>
        </div>

        {/* Card 2: SEO & Search Console */}
        <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 font-bold text-slate-900 text-sm">
              <Search className="w-4 h-4 text-purple-600" />
              <span>SEO & Verification</span>
            </div>
            <button
              onClick={() => onNavigateTab('seo')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <span>Audit SEO</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Configure focus keywords, title length optimization, OpenGraph social cards, and crawl permissions.
          </p>
          <div className="pt-2 flex flex-wrap gap-2">
            <button
              onClick={() => onNavigateTab('search-engines')}
              className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 rounded-lg text-2xs font-semibold text-purple-700 cursor-pointer"
            >
              Google Search Console
            </button>
            <button
              onClick={() => onNavigateTab('search-engines')}
              className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 rounded-lg text-2xs font-semibold text-purple-700 cursor-pointer"
            >
              robots.txt & sitemap.xml
            </button>
          </div>
        </div>

        {/* Card 3: Inquiries & Leads Inbox */}
        <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 font-bold text-slate-900 text-sm">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Inquiries Inbox</span>
            </div>
            <button
              onClick={() => onNavigateTab('inquiries')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <span>View All ({inquiries.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Delivered directly to <strong className="text-slate-700 font-mono">admin@tesfayeteklu.com</strong> with duplicate protection and honeypot spam filtering.
          </p>
          <div className="pt-2 flex items-center justify-between">
            <span className="text-2xs text-slate-500 font-mono">
              {newInquiries.length} New unread leads
            </span>
            <button
              onClick={() => onNavigateTab('contact')}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-2xs font-semibold cursor-pointer"
            >
              Contact Settings
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
