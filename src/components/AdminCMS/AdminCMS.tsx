import React, { useState, useEffect } from 'react';
import { Project, Inquiry, AdminUser } from '../../types';
import { CmsConfig } from '../../types/cms';
import { 
  fetchProjects, createProject, updateProject, deleteProject,
  fetchInquiries, updateInquiry, deleteInquiry,
  fetchCmsConfig, updateCmsConfig,
  loginAdmin, logoutAdmin, verifyAdmin, changeAdminPassword,
  downloadBackup, restoreBackup, resetSystemToDefaults,
} from '../../services/api';
import { auth } from '../../lib/firebase';
import { 
  isAuthorizedAdminEmail, 
  mapFirebaseUserToAdmin, 
  subscribeToAuthState 
} from '../../services/firebaseAuth';
import { 
  Shield, Key, LogOut, CheckCircle2, 
  Search, Filter, Eye, EyeOff, Save, RefreshCw, MessageSquare, 
  FileText, Settings, Layers, Star, AlertCircle, X, 
  Layout, Globe, Smartphone, Code2, Sliders, Database, 
  Download, Upload, RotateCcw, Palette, UserCheck, Lock, ExternalLink,
  ImageIcon, BookOpen, Building2, Users, Compass, Phone, MessageSquareQuote, History
} from 'lucide-react';
import { AdminLoginPage } from '../../views/AdminLoginPage';

// CMS Tab Components - 14 Standard Modules + Extended Suite
import { DashboardOverviewTab } from './DashboardOverviewTab';
import { WebsitePagesManagerTab } from './WebsitePagesManagerTab';
import { HomepageManagerTab } from './HomepageManagerTab';
import { ServicesManagerTab } from './ServicesManagerTab';
import { PortfolioManagerTab } from './PortfolioManagerTab';
import { BlogManagerTab } from './BlogManagerTab';
import { MediaLibraryTab } from './MediaLibraryTab';
import { SeoManagerTab } from './SeoManagerTab';
import { SearchEngineIntegrationTab } from './SearchEngineIntegrationTab';
import { NavigationFooterManagerTab } from './NavigationFooterManagerTab';
import { ContactInfoManagerTab } from './ContactInfoManagerTab';
import { WebsiteSettingsTab } from './WebsiteSettingsTab';
import { UserManagerTab } from './UserManagerTab';
import { AuditLogsManagerTab } from './AuditLogsManagerTab';

// Extended modular editors
import { AboutUsManagerTab } from './AboutUsManagerTab';
import { TestimonialsManagerTab } from './TestimonialsManagerTab';
import { ClientsManagerTab } from './ClientsManagerTab';
import { TeamManagerTab } from './TeamManagerTab';
import { NavigationManagerTab } from './NavigationManagerTab';
import { FooterManagerTab } from './FooterManagerTab';
import { RevisionsBackupTab } from './RevisionsBackupTab';

export type AdminModule = 
  | 'dashboard'          // 1. Dashboard (overview, updates, status)
  | 'pages'              // 2. Website Pages (list, add/edit/delete/reorder)
  | 'homepage'           // 3. Homepage Builder (hero, sections, ordering)
  | 'services'           // 4. Services Management
  | 'portfolio'          // 5. Portfolio Management
  | 'blog'               // 6. Blog Management
  | 'media'              // 7. Media Library
  | 'seo'                // 8. SEO Management
  | 'search-engines'     // 9. Search Engine Integration
  | 'navigation-footer'  // 10. Navigation & Footer
  | 'contact'            // 11. Contact Information
  | 'settings'           // 12. Site Settings
  | 'users'              // 13. User Management
  | 'audit-logs'         // 14. Audit Logs
  // Extended Modules & Workflows
  | 'about'              // About Us section
  | 'testimonials'       // Testimonials
  | 'clients'            // Clients and Partners
  | 'team'               // Team Members
  | 'navigation'         // Standalone Navigation Menu
  | 'footer'             // Standalone Footer
  | 'revisions'          // Content Revisions & Snapshots
  | 'inquiries';         // Direct Leads & Inquiries Inbox

interface AdminCMSProps {
  onExit: () => void;
  onPreviewPublicSite: () => void;
  onRefreshData?: () => void;
  onLogout?: () => void;
}

export const AdminCMS: React.FC<AdminCMSProps> = ({
  onExit,
  onPreviewPublicSite,
  onRefreshData,
  onLogout,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [activeModule, setActiveModule] = useState<AdminModule>('dashboard');

  // Master Data State
  const [cms, setCms] = useState<CmsConfig | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Inquiry view State
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [inquirySearch, setInquirySearch] = useState('');
  const [inquiryFilter, setInquiryFilter] = useState('All');
  const [newNoteText, setNewNoteText] = useState('');

  useEffect(() => {
    checkAuth();
    const unsubscribe = subscribeToAuthState((state) => {
      if (state.isAdmin && state.adminUser) {
        setIsAuthenticated(true);
        setAdminUser(state.adminUser);
      }
    });
    return () => unsubscribe();
  }, []);

  const checkAuth = async () => {
    // 1. Direct check of current Firebase Auth state
    if (auth.currentUser && isAuthorizedAdminEmail(auth.currentUser.email)) {
      setIsAuthenticated(true);
      setAdminUser(mapFirebaseUserToAdmin(auth.currentUser));
      loadMasterData();
      return;
    }

    try {
      const res = await verifyAdmin();
      if (res.authenticated && res.user && isAuthorizedAdminEmail(res.user.email)) {
        setIsAuthenticated(true);
        setAdminUser(res.user);
        loadMasterData();
      }
    } catch {
      setIsAuthenticated(false);
    }
  };

  const handleLogout = async () => {
    await logoutAdmin();
    setIsAuthenticated(false);
    setAdminUser(null);
    if (onLogout) {
      onLogout();
    } else {
      onExit();
    }
  };

  const loadMasterData = async () => {
    setLoading(true);
    try {
      const [cmsData, projData, inqData] = await Promise.all([
        fetchCmsConfig(),
        fetchProjects({ includeDrafts: true }),
        fetchInquiries()
      ]);
      setCms(cmsData);
      setProjects(projData);
      setInquiries(inqData);
    } catch (err) {
      console.error('Failed to load master CMS data:', err);
    } finally {
      setLoading(false);
    }
  };

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Central CMS Config Saver
  const saveCmsChanges = async (updatedConfig: Partial<CmsConfig>, successNotice = 'Configuration saved to backend.') => {
    if (!cms) return;
    setSaving(true);
    try {
      const res = await updateCmsConfig(updatedConfig);
      setCms(res.cms);
      notify(successNotice);
      if (onRefreshData) onRefreshData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save changes';
      alert(message);
    } finally {
      setSaving(false);
    }
  };

  // Project Saver / Deleter
  const handleSaveProject = async (projectData: Partial<Project>, isNew: boolean) => {
    setSaving(true);
    try {
      if (isNew) {
        const created = await createProject(projectData);
        setProjects([created, ...projects]);
        notify(`Created demo project: ${created.title || created.name}`);
      } else if (projectData.id) {
        const updated = await updateProject(projectData.id, projectData);
        setProjects(projects.map((p) => (p.id === updated.id ? updated : p)));
        notify(`Updated demo project: ${updated.title || updated.name}`);
      }
      if (onRefreshData) onRefreshData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error saving project');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteProject(projectId);
      setProjects(projects.filter((p) => p.id !== projectId));
      notify('Project deleted successfully.');
      if (onRefreshData) onRefreshData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete project');
    }
  };

  // Inquiry Status Handler
  const handleUpdateInquiryStatus = async (id: string, status: Inquiry['status']) => {
    try {
      const updated = await updateInquiry(id, { status });
      setInquiries(inquiries.map((i) => (i.id === id ? updated : i)));
      if (selectedInquiry?.id === id) {
        setSelectedInquiry(updated);
      }
      notify(`Inquiry marked as ${status}`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const handleAddInquiryNote = async (id: string) => {
    if (!newNoteText.trim() || !selectedInquiry) return;
    try {
      const updated = await updateInquiry(id, { 
        noteText: newNoteText.trim(),
        noteAuthor: adminUser?.name || 'Administrator',
      });
      setInquiries(inquiries.map((i) => (i.id === id ? updated : i)));
      setSelectedInquiry(updated);
      setNewNoteText('');
      notify('Note appended to inquiry record.');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to add note');
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    if (!window.confirm('Delete this inquiry record?')) return;
    try {
      await deleteInquiry(id);
      setInquiries(inquiries.filter((i) => i.id !== id));
      if (selectedInquiry?.id === id) setSelectedInquiry(null);
      notify('Inquiry record deleted.');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete inquiry');
    }
  };

  // Unauthenticated State
  if (!isAuthenticated) {
    return (
      <AdminLoginPage
        identity={cms?.identity}
        onLoginSuccess={() => {
          checkAuth();
        }}
        onReturnToSite={onExit}
      />
    );
  }

  // Filtered Inquiries
  const filteredInquiries = inquiries.filter((inq) => {
    const clientName = inq.clientName || inq.fullName || '';
    const company = inq.company || inq.companyName || '';
    const matchesSearch = clientName.toLowerCase().includes(inquirySearch.toLowerCase()) ||
      (inq.email || '').toLowerCase().includes(inquirySearch.toLowerCase()) ||
      company.toLowerCase().includes(inquirySearch.toLowerCase());
    const matchesStatus = inquiryFilter === 'All' || inq.status === inquiryFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 font-sans">
      
      {/* Top Admin CMS Header */}
      <header className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-extrabold text-sm shadow-md">
            TT
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight flex items-center gap-2">
              <span>TesfayeTech Enterprise CMS &amp; SEO Engine</span>
              <span className="text-2xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-mono">14 Modules Active</span>
            </div>
            <div className="text-2xs text-slate-400">
              Authenticated: {adminUser?.email || 'contactesfaye@gmail.com'} &bull; Cloud Firestore Active
            </div>
          </div>
        </div>

        {/* Status Toast */}
        {toastMessage && (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-emerald-950/90 text-emerald-300 border border-emerald-700/60 rounded-md text-xs animate-in fade-in">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={onPreviewPublicSite}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-slate-200 transition-colors cursor-pointer"
            title="Preview Live Public Website"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
            <span>View Website</span>
          </button>

          <button
            onClick={loadMasterData}
            title="Reload CMS Data from Server"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1 px-3 py-1.5 bg-red-950/60 hover:bg-red-900 text-xs font-semibold rounded-lg text-red-300 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main CMS Layout Body */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left CMS Navigation Drawer with 14 Standard Sections */}
        <nav className="w-68 bg-white border-r border-slate-200 p-3 space-y-1 overflow-y-auto shrink-0 text-xs">
          
          {/* Quick Actions Panel */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 mb-2">
            <div className="text-3xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center justify-between">
              <span>Quick Actions</span>
              <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded font-mono text-3xs font-semibold">Ready</span>
            </div>
            <div className="grid grid-cols-2 gap-1 text-2xs">
              <button
                onClick={onPreviewPublicSite}
                className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-blue-700 hover:border-blue-300 font-medium transition cursor-pointer"
                title="Open Public Website"
              >
                <ExternalLink className="w-3 h-3 text-blue-600 shrink-0" />
                <span className="truncate">View Site</span>
              </button>
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-300 font-medium transition cursor-pointer"
                title="Inspect XML Sitemap"
              >
                <Globe className="w-3 h-3 text-emerald-600 shrink-0" />
                <span className="truncate">Sitemap</span>
              </a>
              <button
                onClick={() => {
                  loadMasterData();
                  notify('CMS memory cache cleared and reloaded.');
                }}
                className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-indigo-700 hover:border-indigo-300 font-medium transition cursor-pointer"
                title="Clear Website Cache"
              >
                <RefreshCw className="w-3 h-3 text-indigo-600 shrink-0" />
                <span className="truncate">Clear Cache</span>
              </button>
              <button
                onClick={() => setActiveModule('media')}
                className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-purple-700 hover:border-purple-300 font-medium transition cursor-pointer"
                title="Upload Media Files Directly"
              >
                <Upload className="w-3 h-3 text-purple-600 shrink-0" />
                <span className="truncate">Upload</span>
              </button>
            </div>
          </div>

          {/* Section: Main 14 Navigation Modules */}
          <div className="px-2 py-1 font-bold text-3xs uppercase tracking-wider text-slate-400">
            Core CMS Modules (1–14)
          </div>

          {/* 1. Dashboard */}
          <button
            onClick={() => setActiveModule('dashboard')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeModule === 'dashboard' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Layout className="w-4 h-4 text-blue-600" />
              <span>1. Dashboard</span>
            </span>
          </button>

          {/* 2. Website Pages */}
          <button
            onClick={() => setActiveModule('pages')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeModule === 'pages' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>2. Website Pages</span>
            </span>
            <span className="text-2xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
              {8 + (cms?.customPages?.length || 0)}
            </span>
          </button>

          {/* 3. Homepage Builder */}
          <button
            onClick={() => setActiveModule('homepage')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeModule === 'homepage' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Sliders className="w-4 h-4 text-sky-600" />
              <span>3. Homepage Builder</span>
            </span>
          </button>

          {/* 4. Services Management */}
          <button
            onClick={() => setActiveModule('services')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeModule === 'services' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Code2 className="w-4 h-4 text-emerald-600" />
              <span>4. Services Management</span>
            </span>
            <span className="text-2xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
              {cms?.services?.length || 0}
            </span>
          </button>

          {/* 5. Portfolio Management */}
          <button
            onClick={() => setActiveModule('portfolio')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeModule === 'portfolio' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Layers className="w-4 h-4 text-violet-600" />
              <span>5. Portfolio Management</span>
            </span>
            <span className="text-2xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
              {projects.length}
            </span>
          </button>

          {/* 6. Blog Management */}
          <button
            onClick={() => setActiveModule('blog')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeModule === 'blog' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span>6. Blog Management</span>
            </span>
            <span className="text-2xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold font-mono">
              {cms?.blogArticles?.length || 0}
            </span>
          </button>

          {/* 7. Media Library */}
          <button
            onClick={() => setActiveModule('media')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeModule === 'media' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <ImageIcon className="w-4 h-4 text-teal-600" />
              <span>7. Media Library</span>
            </span>
            <span className="text-2xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
              {cms?.mediaLibrary?.length || 0}
            </span>
          </button>

          {/* 8. SEO Management */}
          <button
            onClick={() => setActiveModule('seo')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeModule === 'seo' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Search className="w-4 h-4 text-rose-600" />
              <span>8. SEO Management</span>
            </span>
            <span className="text-2xs bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded font-medium">
              Meta/OG
            </span>
          </button>

          {/* 9. Search Engine Integration */}
          <button
            onClick={() => setActiveModule('search-engines')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeModule === 'search-engines' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Globe className="w-4 h-4 text-emerald-600" />
              <span>9. Search Engine Integration</span>
            </span>
            <span className="text-2xs bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-medium">
              GSC/Bing
            </span>
          </button>

          {/* 10. Navigation & Footer */}
          <button
            onClick={() => setActiveModule('navigation-footer')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeModule === 'navigation-footer' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Globe className="w-4 h-4 text-cyan-600" />
              <span>10. Navigation & Footer</span>
            </span>
          </button>

          {/* 11. Contact Information */}
          <button
            onClick={() => setActiveModule('contact')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeModule === 'contact' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-orange-600" />
              <span>11. Contact Information</span>
            </span>
          </button>

          {/* 12. Site Settings */}
          <button
            onClick={() => setActiveModule('settings')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeModule === 'settings' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Settings className="w-4 h-4 text-slate-700" />
              <span>12. Site Settings</span>
            </span>
          </button>

          {/* 13. User Management */}
          <button
            onClick={() => setActiveModule('users')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeModule === 'users' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span>13. User Management</span>
            </span>
          </button>

          {/* 14. Audit Logs */}
          <button
            onClick={() => setActiveModule('audit-logs')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeModule === 'audit-logs' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <History className="w-4 h-4 text-purple-600" />
              <span>14. Audit Logs</span>
            </span>
            <span className="text-2xs bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded font-mono">
              {(cms?.auditLogs || []).length + (cms?.revisions || []).length}
            </span>
          </button>

          {/* Direct Leads & Inquiries Inbox Highlight */}
          <div className="pt-2 pb-1">
            <button
              onClick={() => setActiveModule('inquiries')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition-all cursor-pointer shadow-xs ${
                activeModule === 'inquiries' 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/20' 
                  : 'bg-blue-50/70 border border-blue-200/80 text-blue-900 hover:bg-blue-100/70'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 shrink-0" />
                <span>Inquiries Inbox</span>
              </span>
              <span className={`text-2xs px-2 py-0.5 rounded-full font-bold font-mono ${
                activeModule === 'inquiries' ? 'bg-white text-blue-700' : 'bg-blue-600 text-white'
              }`}>
                {inquiries.filter((i) => i.status === 'New').length} new
              </span>
            </button>
          </div>

          {/* Supplemental Section Editors */}
          <details className="pt-1 text-slate-500">
            <summary className="px-2 py-1 font-bold text-3xs uppercase tracking-wider text-slate-400 cursor-pointer hover:text-slate-600">
              Additional Section Editors
            </summary>
            <div className="pt-1 space-y-0.5 pl-1">
              <button
                onClick={() => setActiveModule('about')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md font-medium text-2xs transition-colors cursor-pointer ${
                  activeModule === 'about' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>About Us Editor</span>
              </button>
              <button
                onClick={() => setActiveModule('testimonials')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md font-medium text-2xs transition-colors cursor-pointer ${
                  activeModule === 'testimonials' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <MessageSquareQuote className="w-3.5 h-3.5" />
                <span>Testimonials &amp; Reviews</span>
              </button>
              <button
                onClick={() => setActiveModule('clients')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md font-medium text-2xs transition-colors cursor-pointer ${
                  activeModule === 'clients' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Clients &amp; Partners</span>
              </button>
              <button
                onClick={() => setActiveModule('team')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md font-medium text-2xs transition-colors cursor-pointer ${
                  activeModule === 'team' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Leadership &amp; Team</span>
              </button>
              <button
                onClick={() => setActiveModule('revisions')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md font-medium text-2xs transition-colors cursor-pointer ${
                  activeModule === 'revisions' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Snapshot Backups</span>
              </button>
            </div>
          </details>

        </nav>

        {/* Right Dynamic Admin Content Panel */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          
          {/* Module 1: Dashboard Overview */}
          {activeModule === 'dashboard' && cms && (
            <DashboardOverviewTab
              cms={cms}
              projects={projects}
              inquiries={inquiries}
              adminUser={adminUser}
              onNavigateTab={(tab) => setActiveModule(tab as AdminModule)}
              onNewProject={() => setActiveModule('portfolio')}
              onNewBlog={() => setActiveModule('blog')}
              onNewService={() => setActiveModule('services')}
              onPreviewSite={onPreviewPublicSite}
            />
          )}

          {/* Module 2: Website Pages */}
          {activeModule === 'pages' && cms && (
            <WebsitePagesManagerTab
              cms={cms}
              onSaveCms={saveCmsChanges}
              saving={saving}
              onNavigateTab={(tab) => setActiveModule(tab as AdminModule)}
              onPreviewSite={onPreviewPublicSite}
            />
          )}

          {/* Module 3: Homepage Builder */}
          {activeModule === 'homepage' && cms && (
            <HomepageManagerTab
              cms={cms}
              onSaveCms={saveCmsChanges}
              saving={saving}
            />
          )}

          {/* Module 3: About Us Management */}
          {activeModule === 'about' && cms && (
            <AboutUsManagerTab
              cms={cms}
              onSaveCms={saveCmsChanges}
              saving={saving}
            />
          )}

          {/* Module 4: Services Management */}
          {activeModule === 'services' && cms && (
            <ServicesManagerTab
              cms={cms}
              onSaveCms={saveCmsChanges}
              saving={saving}
            />
          )}

          {/* Module 5: Portfolio and Projects Management */}
          {activeModule === 'portfolio' && (
            <PortfolioManagerTab
              projects={projects}
              onSaveProject={handleSaveProject}
              onDeleteProject={handleDeleteProject}
              saving={saving}
            />
          )}

          {/* Module 6: Blog and News Management */}
          {activeModule === 'blog' && cms && (
            <BlogManagerTab
              cms={cms}
              onSaveCms={saveCmsChanges}
              saving={saving}
            />
          )}

          {/* Module 7: Testimonials Management */}
          {activeModule === 'testimonials' && cms && (
            <TestimonialsManagerTab
              cms={cms}
              onSaveCms={saveCmsChanges}
              saving={saving}
            />
          )}

          {/* Module 8: Clients and Partners Management */}
          {activeModule === 'clients' && cms && (
            <ClientsManagerTab
              cms={cms}
              onSaveCms={saveCmsChanges}
              saving={saving}
            />
          )}

          {/* Module 9: Team Members Management */}
          {activeModule === 'team' && cms && (
            <TeamManagerTab
              cms={cms}
              onSaveCms={saveCmsChanges}
              saving={saving}
            />
          )}

          {/* Module 10: Contact Information Management */}
          {activeModule === 'contact' && cms && (
            <ContactInfoManagerTab
              cms={cms}
              onSaveCms={saveCmsChanges}
              saving={saving}
            />
          )}

          {/* Module 11: Navigation Menu Management */}
          {activeModule === 'navigation' && cms && (
            <NavigationManagerTab
              cms={cms}
              onSaveCms={saveCmsChanges}
              saving={saving}
            />
          )}

          {/* Module 12: Footer Management */}
          {activeModule === 'footer' && cms && (
            <FooterManagerTab
              cms={cms}
              onSaveCms={saveCmsChanges}
              saving={saving}
            />
          )}

          {/* Module 13: Media Library */}
          {activeModule === 'media' && cms && (
            <MediaLibraryTab
              cms={cms}
              onSaveCms={saveCmsChanges}
              saving={saving}
            />
          )}

          {/* Module 8: SEO Management */}
          {activeModule === 'seo' && cms && (
            <SeoManagerTab
              cms={cms}
              onSaveCms={saveCmsChanges}
              saving={saving}
            />
          )}

          {/* Module 9: Search Engine Integration */}
          {activeModule === 'search-engines' && cms && (
            <SearchEngineIntegrationTab
              cms={cms}
              projects={projects}
              onSaveCms={saveCmsChanges}
              saving={saving}
            />
          )}

          {/* Module 10: Navigation & Footer */}
          {activeModule === 'navigation-footer' && cms && (
            <NavigationFooterManagerTab
              cms={cms}
              onSaveCms={saveCmsChanges}
              saving={saving}
            />
          )}

          {/* Module 12: Site Settings */}
          {activeModule === 'settings' && cms && (
            <WebsiteSettingsTab
              cms={cms}
              onSaveCms={saveCmsChanges}
              saving={saving}
            />
          )}

          {/* Module 13: User Management */}
          {activeModule === 'users' && (
            <UserManagerTab />
          )}

          {/* Module 14: Audit Logs */}
          {activeModule === 'audit-logs' && cms && (
            <AuditLogsManagerTab
              cms={cms}
              onRefreshData={loadMasterData}
            />
          )}

          {/* Extended Module: Content Backup and Revision History */}
          {activeModule === 'revisions' && cms && (
            <RevisionsBackupTab
              cms={cms}
              onSaveCms={saveCmsChanges}
              onRefreshData={loadMasterData}
              saving={saving}
            />
          )}

          {/* Dedicated Inquiries Inbox */}
          {activeModule === 'inquiries' && (
            <div className="space-y-4 max-w-6xl animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Project Inquiries Inbox ({inquiries.length})</h2>
                  <p className="text-xs text-slate-500">Incoming architectural project specifications from prospective clients</p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search inquiries..."
                      value={inquirySearch}
                      onChange={(e) => setInquirySearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg w-48 text-slate-900"
                    />
                  </div>
                  <select
                    value={inquiryFilter}
                    onChange={(e) => setInquiryFilter(e.target.value)}
                    className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                  >
                    <option value="All">All Statuses</option>
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Quoted">Quoted</option>
                    <option value="Won">Won</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className={`${selectedInquiry ? 'lg:col-span-7' : 'lg:col-span-12'} bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm`}>
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-2xs tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Client</th>
                        <th className="py-3 px-4">Project Scope</th>
                        <th className="py-3 px-4">Budget (ETB)</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredInquiries.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-400">
                            No inquiries found matching your filters.
                          </td>
                        </tr>
                      ) : (
                        filteredInquiries.map((inq) => (
                          <tr
                            key={inq.id}
                            onClick={() => setSelectedInquiry(inq)}
                            className={`cursor-pointer transition-colors ${
                              selectedInquiry?.id === inq.id ? 'bg-blue-50/70' : 'hover:bg-slate-50'
                            }`}
                          >
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-slate-900">{inq.clientName || inq.fullName}</div>
                              <div className="text-2xs text-slate-500">{inq.company || inq.companyName || inq.email}</div>
                            </td>
                            <td className="py-3.5 px-4 font-medium text-slate-800">
                              {inq.projectType || inq.solutionType}
                            </td>
                            <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                              {inq.budgetRange || 'Flexible'}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-3xs font-bold uppercase ${
                                inq.status === 'New' ? 'bg-blue-100 text-blue-800' :
                                inq.status === 'Contacted' ? 'bg-amber-100 text-amber-800' :
                                inq.status === 'Won' ? 'bg-emerald-100 text-emerald-800' :
                                'bg-slate-100 text-slate-700'
                              }`}>
                                {inq.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => handleDeleteInquiry(inq.id)}
                                className="p-1 text-slate-400 hover:text-red-600 rounded"
                                title="Delete"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Selected Inquiry Detail Panel */}
                {selectedInquiry && (
                  <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{selectedInquiry.clientName || selectedInquiry.fullName}</h3>
                        <p className="text-2xs text-slate-500">{selectedInquiry.email} &bull; {selectedInquiry.phone}</p>
                      </div>
                      <button
                        onClick={() => setSelectedInquiry(null)}
                        className="text-slate-400 hover:text-slate-700 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">Scope Description</span>
                        <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl mt-1 border border-slate-200/60">
                          {selectedInquiry.projectDescription || selectedInquiry.description}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-2xs">
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          <span className="text-slate-400 block">Target Timeline</span>
                          <span className="font-bold text-slate-800">{selectedInquiry.expectedCompletionDate || selectedInquiry.timeline || 'Immediate'}</span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          <span className="text-slate-400 block">Budget Allocation</span>
                          <span className="font-bold text-slate-800">{selectedInquiry.budgetRange || 'Flexible'}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Update Status</span>
                        <div className="flex flex-wrap gap-1.5">
                          {(['New', 'Contacted', 'In Progress', 'Quoted', 'Won', 'Closed'] as Inquiry['status'][]).map((st) => (
                            <button
                              key={st}
                              onClick={() => handleUpdateInquiryStatus(selectedInquiry.id, st)}
                              className={`px-2.5 py-1 rounded-lg text-2xs font-semibold transition-colors ${
                                selectedInquiry.status === st
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Internal Notes */}
                      <div className="pt-2 border-t border-slate-100">
                        <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Internal Notes</span>
                        {(selectedInquiry.notes || (selectedInquiry.internalNotes && selectedInquiry.internalNotes.length > 0)) && (
                          <pre className="text-2xs text-slate-600 bg-slate-50 p-2.5 rounded-lg whitespace-pre-wrap font-sans mb-2 border border-slate-200">
                            {selectedInquiry.notes || selectedInquiry.internalNotes?.map((n) => `[${n.author}] ${n.text}`).join('\n')}
                          </pre>
                        )}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Add internal meeting note..."
                            value={newNoteText}
                            onChange={(e) => setNewNoteText(e.target.value)}
                            className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddInquiryNote(selectedInquiry.id);
                            }}
                          />
                          <button
                            onClick={() => handleAddInquiryNote(selectedInquiry.id)}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
                          >
                            Add
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
};
