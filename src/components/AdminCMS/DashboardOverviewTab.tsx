import React from 'react';
import { 
  Project, Inquiry, AdminUser 
} from '../../types';
import { CmsConfig } from '../../types/cms';
import { 
  Layers, FileText, Briefcase, BookOpen, MessageSquare, 
  Users, Image as ImageIcon, Shield, Plus, ArrowRight, 
  CheckCircle2, Clock, Globe, Database, Sparkles, TrendingUp
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
  const publishedProjects = projects.filter((p) => p.published !== false);
  const publishedServices = (cms.services || []).filter((s) => s.published !== false);
  const publishedArticles = (cms.blogArticles || []).filter((a) => a.published !== false);
  const activeClients = (cms.clients || []).filter((c) => c.published !== false);
  const activeTestimonials = (cms.testimonials || cms.home?.testimonialsSection?.items || []).filter((t) => t.published !== false);
  const mediaCount = (cms.mediaLibrary || []).length;
  const newInquiries = inquiries.filter((i) => i.status === 'New');

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white border border-indigo-900/40 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-2xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>TesfayeTech Dynamic Enterprise CMS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Welcome back, {adminUser?.name || 'Tesfaye Teklu'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              All website sections, portfolio demos, services, media assets, client case studies, and inquiries are connected in real-time to Google Firebase.
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
              onClick={onNewProject}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/30 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Portfolio Project</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        
        <button
          onClick={() => onNavigateTab('portfolio')}
          className="p-4 bg-white border border-slate-200 rounded-2xl text-left hover:border-blue-400 hover:shadow-md transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <span className="text-3xs font-mono font-bold uppercase bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
              {publishedProjects.length} Live
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
            {projects.length}
          </div>
          <div className="text-xs font-medium text-slate-500 mt-0.5">Projects & Demos</div>
        </button>

        <button
          onClick={() => onNavigateTab('services')}
          className="p-4 bg-white border border-slate-200 rounded-2xl text-left hover:border-blue-400 hover:shadow-md transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <Briefcase className="w-5 h-5 text-indigo-600" />
            <span className="text-3xs font-mono font-bold uppercase bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded">
              {publishedServices.length} Active
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
            {(cms.services || []).length}
          </div>
          <div className="text-xs font-medium text-slate-500 mt-0.5">Services</div>
        </button>

        <button
          onClick={() => onNavigateTab('blog')}
          className="p-4 bg-white border border-slate-200 rounded-2xl text-left hover:border-blue-400 hover:shadow-md transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            <span className="text-3xs font-mono font-bold uppercase bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">
              {publishedArticles.length} Posts
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 group-hover:text-emerald-600 transition-colors">
            {(cms.blogArticles || []).length}
          </div>
          <div className="text-xs font-medium text-slate-500 mt-0.5">Blog Articles</div>
        </button>

        <button
          onClick={() => onNavigateTab('inquiries')}
          className="p-4 bg-white border border-slate-200 rounded-2xl text-left hover:border-blue-400 hover:shadow-md transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <MessageSquare className="w-5 h-5 text-amber-600" />
            {newInquiries.length > 0 && (
              <span className="text-3xs font-mono font-bold uppercase bg-amber-500 text-white px-1.5 py-0.5 rounded-full animate-pulse">
                {newInquiries.length} New
              </span>
            )}
          </div>
          <div className="text-2xl font-extrabold text-slate-900 group-hover:text-amber-600 transition-colors">
            {inquiries.length}
          </div>
          <div className="text-xs font-medium text-slate-500 mt-0.5">Client Inquiries</div>
        </button>

        <button
          onClick={() => onNavigateTab('clients')}
          className="p-4 bg-white border border-slate-200 rounded-2xl text-left hover:border-blue-400 hover:shadow-md transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <TrendingUp className="w-5 h-5 text-cyan-600" />
            <span className="text-3xs font-mono font-bold uppercase bg-cyan-50 text-cyan-700 px-1.5 py-0.5 rounded">
              Partners
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 group-hover:text-cyan-600 transition-colors">
            {activeClients.length}
          </div>
          <div className="text-xs font-medium text-slate-500 mt-0.5">Clients & Partners</div>
        </button>

        <button
          onClick={() => onNavigateTab('media_library')}
          className="p-4 bg-white border border-slate-200 rounded-2xl text-left hover:border-blue-400 hover:shadow-md transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <ImageIcon className="w-5 h-5 text-purple-600" />
            <span className="text-3xs font-mono font-bold uppercase bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded">
              Cloud
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 group-hover:text-purple-600 transition-colors">
            {mediaCount}
          </div>
          <div className="text-xs font-medium text-slate-500 mt-0.5">Media Assets</div>
        </button>

      </div>

      {/* Main Split: Recent Inquiries + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Recent Client Inquiries */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Prospective Inquiries</h2>
              <p className="text-xs text-slate-500">Latest quotation requests submitted through public forms</p>
            </div>
            <button
              onClick={() => onNavigateTab('inquiries')}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>View All ({inquiries.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {inquiries.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No inquiries received yet. Client submissions will appear here automatically.
            </div>
          ) : (
            <div className="space-y-3">
              {inquiries.slice(0, 5).map((inq) => (
                <div
                  key={inq.id}
                  onClick={() => onNavigateTab('inquiries')}
                  className="p-4 rounded-2xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50/70 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 truncate">
                        {inq.fullName}
                      </span>
                      {inq.companyName && (
                        <span className="text-2xs text-slate-500">· {inq.companyName}</span>
                      )}
                      <span className={`text-3xs font-semibold px-2 py-0.5 rounded-full ${
                        inq.status === 'New' 
                          ? 'bg-amber-100 text-amber-800' 
                          : inq.status === 'Won' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {inq.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 truncate max-w-lg">
                      {inq.projectDescription || 'No description provided.'}
                    </p>
                    <div className="flex items-center gap-3 text-3xs text-slate-400 font-mono">
                      <span>Budget: {inq.budgetRange}</span>
                      <span>·</span>
                      <span>{inq.solutionType}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-3xs text-slate-400 block">
                      {new Date(inq.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-2xs font-semibold text-blue-600 hover:underline">
                      Review Scope →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Quick Management Links & Status */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Quick Actions Panel */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Quick Management Actions
            </h3>
            <div className="space-y-2 pt-1">
              <button
                onClick={onNewProject}
                className="w-full p-2.5 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer border border-slate-200/60"
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>Add Project Prototype</span>
                </div>
                <Plus className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onNewService}
                className="w-full p-2.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer border border-slate-200/60"
              >
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-indigo-600" />
                  <span>Create Service Offering</span>
                </div>
                <Plus className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onNewBlog}
                className="w-full p-2.5 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer border border-slate-200/60"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  <span>Write Blog Article</span>
                </div>
                <Plus className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onNavigateTab('media_library')}
                className="w-full p-2.5 bg-slate-50 hover:bg-purple-50 hover:text-purple-600 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer border border-slate-200/60"
              >
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-purple-600" />
                  <span>Upload Media Files</span>
                </div>
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* System & Cloud Status */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-sm border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xs uppercase tracking-wider text-blue-400 font-mono font-semibold">
                Live Infrastructure
              </span>
              <span className="inline-flex items-center gap-1.5 text-3xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Operational
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>Database Engine:</span>
                <span className="font-mono text-white text-2xs">Cloud Firestore</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Asset Storage:</span>
                <span className="font-mono text-white text-2xs">Firebase Storage</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Security Model:</span>
                <span className="font-mono text-white text-2xs">ABAC Zero-Trust</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>CMS Version:</span>
                <span className="font-mono text-blue-400 text-2xs">v{cms.version || 1}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Last Published:</span>
                <span className="text-slate-400 text-3xs">
                  {new Date(cms.lastUpdated).toLocaleDateString()}
                </span>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('revisions_backup')}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl text-center transition cursor-pointer"
            >
              Revision History & Backups →
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
