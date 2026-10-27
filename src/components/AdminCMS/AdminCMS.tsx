import React, { useState, useEffect } from 'react';
import { Project, Inquiry, AdminUser } from '../../types';
import { CmsConfig, CustomPage, ManagedService, ManagedIndustry } from '../../types/cms';
import { 
  fetchProjects, createProject, updateProject, deleteProject,
  fetchInquiries, updateInquiry, deleteInquiry,
  fetchCmsConfig, updateCmsConfig,
  createCustomPage, updateCustomPage, deleteCustomPage,
  loginAdmin, logoutAdmin, verifyAdmin, changeAdminPassword,
  downloadBackup, restoreBackup, resetSystemToDefaults,
  uploadFileToStorage, seedFirestoreInitialData,
} from '../../services/api';
import { 
  Shield, Key, LogOut, Plus, Edit, Trash2, CheckCircle2, 
  Search, Filter, Eye, EyeOff, Save, RefreshCw, MessageSquare, 
  FileText, Settings, Layers, Star, AlertCircle, X, 
  Layout, Globe, Smartphone, Code2, Sliders, Database, 
  Download, Upload, RotateCcw, Palette, UserCheck, Lock, ExternalLink,
  UploadCloud, ImageIcon
} from 'lucide-react';
import { INDUSTRIES_LIST } from '../../data/seedData';
import { AdminLoginPage } from '../../views/AdminLoginPage';

type AdminModule = 
  | 'dashboard'
  | 'identity'
  | 'home_builder'
  | 'navigation'
  | 'services'
  | 'portfolio'
  | 'categories'
  | 'industries'
  | 'pages'
  | 'inquiries'
  | 'seo'
  | 'theme'
  | 'users'
  | 'system';

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

  // Login form state
  const [emailInput, setEmailInput] = useState('admin@tesfayetech.com');
  const [passwordInput, setPasswordInput] = useState('TesfayeTech@Admin2026!');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  // Master Data State
  const [cms, setCms] = useState<CmsConfig | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Project Editor State
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const [isNewProject, setIsNewProject] = useState(false);

  // Custom Page Editor State
  const [editingPage, setEditingPage] = useState<Partial<CustomPage> | null>(null);
  const [isNewPage, setIsNewPage] = useState(false);

  // Service Editor State
  const [editingService, setEditingService] = useState<Partial<ManagedService> | null>(null);

  // Inquiry view State
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [inquirySearch, setInquirySearch] = useState('');
  const [inquiryFilter, setInquiryFilter] = useState('All');
  const [newNoteText, setNewNoteText] = useState('');

  // Password change state
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwMessage, setPwMessage] = useState<string | null>(null);

  // Firebase Storage upload states
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [seedingFirebase, setSeedingFirebase] = useState(false);

  const handleProjectThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProject) return;
    setUploadError(null);
    setUploadingImage(true);
    setUploadProgress(0);

    try {
      const res = await uploadFileToStorage(file, 'projects', (progress) => {
        setUploadProgress(progress);
      });
      setEditingProject({
        ...editingProject,
        thumbnail: res.downloadUrl,
        imageUrl: res.downloadUrl,
        imagePath: res.storagePath,
      });
      notify(`Image uploaded to Firebase Storage: ${res.fileName}`);
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploadingImage(false);
      setUploadProgress(null);
      e.target.value = '';
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !cms) return;
    setUploadError(null);
    setUploadingImage(true);
    setUploadProgress(0);

    try {
      const res = await uploadFileToStorage(file, 'branding', (progress) => {
        setUploadProgress(progress);
      });
      setCms({
        ...cms,
        identity: {
          ...cms.identity,
          logoUrl: res.downloadUrl,
        },
      });
      notify('Logo uploaded to Firebase Storage.');
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Logo upload failed');
    } finally {
      setUploadingImage(false);
      setUploadProgress(null);
      e.target.value = '';
    }
  };

  const handleSeedFirestore = async () => {
    if (!window.confirm('Populate Cloud Firestore with all categorized demo projects and site settings?')) return;
    setSeedingFirebase(true);
    try {
      const res = await seedFirestoreInitialData();
      notify(`Successfully seeded ${res.projectsCount} projects and site settings to Cloud Firestore!`);
      await loadMasterData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to seed Firestore');
    } finally {
      setSeedingFirebase(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await verifyAdmin();
      if (res.authenticated && res.user) {
        setIsAuthenticated(true);
        setAdminUser(res.user);
        loadMasterData();
      }
    } catch {
      setIsAuthenticated(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoggingIn(true);
    try {
      const res = await loginAdmin(passwordInput, emailInput);
      setIsAuthenticated(true);
      setAdminUser(res.user);
      loadMasterData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid credentials';
      setLoginError(message);
    } finally {
      setLoggingIn(false);
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

  // CMS Config Saver
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

  // --------------------------------------------------------------------------
  // Unauthenticated: Dedicated Admin Login Page
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // Authenticated Master CMS Layout
  // --------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900">
      
      {/* Top Admin CMS Header */}
      <header className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-extrabold text-sm shadow-md">
            TT
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight flex items-center gap-2">
              <span>TesfayeTech Central CMS</span>
              <span className="text-2xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-mono">v{cms?.version || 1}.0</span>
            </div>
            <div className="text-2xs text-slate-400">
              Logged in as {adminUser?.name || 'Administrator'} · All changes persist to backend storage
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
            <span>Preview Website</span>
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
        
        {/* Left CMS Navigation Drawer with 14 organized sections */}
        <nav className="w-64 bg-white border-r border-slate-200 p-3 space-y-0.5 overflow-y-auto shrink-0 text-xs">
          
          <div className="px-3 py-2 font-bold text-2xs uppercase tracking-wider text-slate-400">
            Overview & Core
          </div>
          <button
            onClick={() => { setActiveModule('dashboard'); setEditingProject(null); setEditingPage(null); }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeModule === 'dashboard' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Layout className="w-4 h-4" />
            <span>1. Dashboard</span>
          </button>
          <button
            onClick={() => { setActiveModule('identity'); setEditingProject(null); setEditingPage(null); }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeModule === 'identity' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>2. Site Identity & Brand</span>
          </button>
          <button
            onClick={() => { setActiveModule('home_builder'); setEditingProject(null); setEditingPage(null); }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeModule === 'home_builder' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>3. Home Page Builder</span>
          </button>
          <button
            onClick={() => { setActiveModule('navigation'); setEditingProject(null); setEditingPage(null); }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeModule === 'navigation' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>4. Navigation & Footer</span>
          </button>

          <div className="px-3 pt-3 pb-1 font-bold text-2xs uppercase tracking-wider text-slate-400">
            Solutions & Portfolio
          </div>
          <button
            onClick={() => { setActiveModule('services'); setEditingProject(null); setEditingPage(null); }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeModule === 'services' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Code2 className="w-4 h-4" />
              <span>5. Services Management</span>
            </span>
            <span className="text-2xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
              {cms?.services?.length || 9}
            </span>
          </button>
          <button
            onClick={() => { setActiveModule('portfolio'); setEditingProject(null); setEditingPage(null); }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeModule === 'portfolio' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Layers className="w-4 h-4" />
              <span>6. Demos & Portfolio</span>
            </span>
            <span className="text-2xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
              {projects.length}
            </span>
          </button>
          <button
            onClick={() => { setActiveModule('categories'); setEditingProject(null); setEditingPage(null); }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeModule === 'categories' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>7. Solution Categories</span>
          </button>
          <button
            onClick={() => { setActiveModule('industries'); setEditingProject(null); setEditingPage(null); }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeModule === 'industries' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Filter className="w-4 h-4" />
              <span>8. Industry Sectors</span>
            </span>
            <span className="text-2xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
              {cms?.industries?.length || 18}
            </span>
          </button>

          <div className="px-3 pt-3 pb-1 font-bold text-2xs uppercase tracking-wider text-slate-400">
            Content & Inquiries
          </div>
          <button
            onClick={() => { setActiveModule('pages'); setEditingProject(null); setEditingPage(null); }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeModule === 'pages' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <FileText className="w-4 h-4" />
              <span>9. Custom Pages</span>
            </span>
            <span className="text-2xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
              {cms?.customPages?.length || 2}
            </span>
          </button>
          <button
            onClick={() => { setActiveModule('inquiries'); setEditingProject(null); setEditingPage(null); }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeModule === 'inquiries' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <MessageSquare className="w-4 h-4" />
              <span>10. Inquiry Inbox</span>
            </span>
            <span className="text-2xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold font-mono">
              {inquiries.filter((i) => i.status === 'New').length} new
            </span>
          </button>

          <div className="px-3 pt-3 pb-1 font-bold text-2xs uppercase tracking-wider text-slate-400">
            System & Design
          </div>
          <button
            onClick={() => { setActiveModule('seo'); setEditingProject(null); setEditingPage(null); }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeModule === 'seo' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>11. SEO & Metadata</span>
          </button>
          <button
            onClick={() => { setActiveModule('theme'); setEditingProject(null); setEditingPage(null); }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeModule === 'theme' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>12. Theme & Layout</span>
          </button>
          <button
            onClick={() => { setActiveModule('users'); setEditingProject(null); setEditingPage(null); }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeModule === 'users' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>13. Users & Security</span>
          </button>
          <button
            onClick={() => { setActiveModule('system'); setEditingProject(null); setEditingPage(null); }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeModule === 'system' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>14. Backup & System</span>
          </button>

        </nav>

        {/* Right Dynamic Admin Content Panel */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          
          {/* ==========================================================
           * 1. DASHBOARD
           * ========================================================*/}
          {activeModule === 'dashboard' && cms && (
            <div className="space-y-6 max-w-6xl">
              <div>
                <h2 className="text-xl font-bold text-slate-900">CMS Administration Overview</h2>
                <p className="text-xs text-slate-500">Real-time status of public website content, demos, and prospective client inquiries</p>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-1 shadow-2xs">
                  <span className="text-xs text-slate-500 font-medium">Total Demos</span>
                  <div className="text-3xl font-extrabold font-mono text-slate-900">{projects.length}</div>
                  <div className="text-2xs text-emerald-600 font-medium">
                    {projects.filter(p => p.published).length} live · {projects.filter(p => !p.published).length} drafts
                  </div>
                </div>

                <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-1 shadow-2xs">
                  <span className="text-xs text-slate-500 font-medium">Client Inquiries</span>
                  <div className="text-3xl font-extrabold font-mono text-blue-600">{inquiries.length}</div>
                  <div className="text-2xs text-blue-700 font-medium">
                    {inquiries.filter(i => i.status === 'New').length} awaiting first review
                  </div>
                </div>

                <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-1 shadow-2xs">
                  <span className="text-xs text-slate-500 font-medium">Active Services</span>
                  <div className="text-3xl font-extrabold font-mono text-slate-900">{cms.services?.length || 9}</div>
                  <div className="text-2xs text-slate-500">All configured with quote CTAs</div>
                </div>

                <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-1 shadow-2xs">
                  <span className="text-xs text-slate-500 font-medium">Industry Sectors</span>
                  <div className="text-3xl font-extrabold font-mono text-slate-900">{cms.industries?.length || 18}</div>
                  <div className="text-2xs text-slate-500">Multi-industry classification active</div>
                </div>
              </div>

              {/* Quick Actions Grid */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Common Administration Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => { setActiveModule('home_builder'); }}
                    className="p-4 border border-slate-200 rounded-xl text-left hover:border-blue-500 hover:bg-blue-50/40 transition-all cursor-pointer"
                  >
                    <Sliders className="w-5 h-5 text-blue-600 mb-2" />
                    <div className="font-bold text-xs text-slate-900">Customize Home Page</div>
                    <div className="text-2xs text-slate-500 mt-1">Edit hero headline, reorder sections, update FAQs</div>
                  </button>

                  <button
                    onClick={() => {
                      setIsNewProject(true);
                      setEditingProject({
                        name: '',
                        solutionType: 'Web Application Development',
                        subCategory: 'Custom Business Software',
                        industries: ['Professional and Consulting Services'],
                        shortDescription: '',
                        status: 'Concept',
                        published: true,
                        featured: false,
                        keyFeatures: [],
                        technologies: ['React', 'TypeScript', 'Node.js'],
                        thumbnail: '/src/assets/images/web_app_dashboard_1793079158006.jpg',
                        screenshots: ['/src/assets/images/web_app_dashboard_1793079158006.jpg'],
                      });
                      setActiveModule('portfolio');
                    }}
                    className="p-4 border border-slate-200 rounded-xl text-left hover:border-blue-500 hover:bg-blue-50/40 transition-all cursor-pointer"
                  >
                    <Plus className="w-5 h-5 text-emerald-600 mb-2" />
                    <div className="font-bold text-xs text-slate-900">Add New Demo Project</div>
                    <div className="text-2xs text-slate-500 mt-1">Publish new web app, mobile prototype, or website</div>
                  </button>

                  <button
                    onClick={() => { setActiveModule('inquiries'); }}
                    className="p-4 border border-slate-200 rounded-xl text-left hover:border-blue-500 hover:bg-blue-50/40 transition-all cursor-pointer"
                  >
                    <MessageSquare className="w-5 h-5 text-amber-600 mb-2" />
                    <div className="font-bold text-xs text-slate-900">Process Inquiries</div>
                    <div className="text-2xs text-slate-500 mt-1">Review prospect briefs and add internal notes</div>
                  </button>
                </div>
              </div>

              {/* Recent Inquiries Preview */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Recent Inquiries</h3>
                  <button
                    onClick={() => setActiveModule('inquiries')}
                    className="text-xs text-blue-600 hover:underline cursor-pointer"
                  >
                    View All Inquiries →
                  </button>
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  {inquiries.slice(0, 3).map((inq) => (
                    <div key={inq.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900">{inq.fullName}</span>
                        <span className="text-slate-400"> ({inq.companyName}) · {inq.solutionType}</span>
                      </div>
                      <span className="text-2xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-semibold">
                        {inq.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==========================================================
           * 2. SITE IDENTITY & BRANDING
           * ========================================================*/}
          {activeModule === 'identity' && cms && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 max-w-4xl shadow-xs">
              <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Site Identity & Global Brand Settings</h2>
                  <p className="text-xs text-slate-500">Configure company naming, logos, contact endpoints, and social channels</p>
                </div>
                <button
                  onClick={() => saveCmsChanges({ identity: cms.identity })}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Saving...' : 'Save Identity'}</span>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Company Display Name</label>
                    <input
                      type="text"
                      value={cms.identity.companyName}
                      onChange={(e) => setCms({
                        ...cms,
                        identity: { ...cms.identity, companyName: e.target.value }
                      })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Brand Logo Text</label>
                    <input
                      type="text"
                      value={cms.identity.logoText}
                      onChange={(e) => setCms({
                        ...cms,
                        identity: { ...cms.identity, logoText: e.target.value }
                      })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <label className="block text-xs font-semibold text-slate-800">Custom Logo (Firebase Cloud Storage)</label>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-12 rounded-lg bg-slate-200 border border-slate-300 flex items-center justify-center overflow-hidden shrink-0">
                      {cms.identity.logoUrl ? (
                        <img src={cms.identity.logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <label className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition shadow-xs">
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>{uploadingImage ? 'Uploading...' : 'Upload Logo'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={uploadingImage}
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <input
                        type="text"
                        placeholder="Or enter direct logo URL / path (e.g. /src/assets/logo.png)"
                        value={cms.identity.logoUrl || ''}
                        onChange={(e) => setCms({
                          ...cms,
                          identity: { ...cms.identity, logoUrl: e.target.value }
                        })}
                        className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company Tagline</label>
                  <input
                    type="text"
                    value={cms.identity.tagline}
                    onChange={(e) => setCms({
                      ...cms,
                      identity: { ...cms.identity, tagline: e.target.value }
                    })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Footer & Brand Subtitle</label>
                  <textarea
                    rows={2}
                    value={cms.identity.subtagline}
                    onChange={(e) => setCms({
                      ...cms,
                      identity: { ...cms.identity, subtagline: e.target.value }
                    })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Email</label>
                    <input
                      type="email"
                      value={cms.identity.email}
                      onChange={(e) => setCms({
                        ...cms,
                        identity: { ...cms.identity, email: e.target.value }
                      })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={cms.identity.phone}
                      onChange={(e) => setCms({
                        ...cms,
                        identity: { ...cms.identity, phone: e.target.value }
                      })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp Business</label>
                    <input
                      type="text"
                      value={cms.identity.whatsapp || ''}
                      onChange={(e) => setCms({
                        ...cms,
                        identity: { ...cms.identity, whatsapp: e.target.value }
                      })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Physical Office Address</label>
                  <input
                    type="text"
                    value={cms.identity.address}
                    onChange={(e) => setCms({
                      ...cms,
                      identity: { ...cms.identity, address: e.target.value }
                    })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>

                {/* Announcement Bar */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Header Announcement Bar</span>
                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cms.identity.announcementBar?.enabled ?? false}
                        onChange={(e) => setCms({
                          ...cms,
                          identity: {
                            ...cms.identity,
                            announcementBar: { ...cms.identity.announcementBar, enabled: e.target.checked }
                          }
                        })}
                      />
                      <span>Enable on Public Header</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    placeholder="Announcement banner text..."
                    value={cms.identity.announcementBar?.text || ''}
                    onChange={(e) => setCms({
                      ...cms,
                      identity: {
                        ...cms.identity,
                        announcementBar: { ...cms.identity.announcementBar, text: e.target.value }
                      }
                    })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                  />
                </div>

                {/* Footer Copyright */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Copyright Notice Text</label>
                  <input
                    type="text"
                    value={cms.identity.footer?.copyrightText || ''}
                    onChange={(e) => setCms({
                      ...cms,
                      identity: {
                        ...cms.identity,
                        footer: { ...cms.identity.footer, copyrightText: e.target.value }
                      }
                    })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ==========================================================
           * 3. HOME PAGE BUILDER
           * ========================================================*/}
          {activeModule === 'home_builder' && cms && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-8 max-w-4xl shadow-xs">
              <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Home Page Builder</h2>
                  <p className="text-xs text-slate-500">Enable/disable sections, edit hero messaging, process steps, and FAQs</p>
                </div>
                <button
                  onClick={() => saveCmsChanges({ home: cms.home }, 'Home page updated successfully.')}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Publishing...' : 'Save & Publish Home Page'}</span>
                </button>
              </div>

              {/* Section Visibility Switches */}
              <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Section Visibility Controls</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                  {Object.entries(cms.home.sectionVisibility || {}).map(([secKey, isVis]) => (
                    <label key={secKey} className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-slate-300">
                      <input
                        type="checkbox"
                        checked={Boolean(isVis)}
                        onChange={(e) => {
                          setCms({
                            ...cms,
                            home: {
                              ...cms.home,
                              sectionVisibility: {
                                ...cms.home.sectionVisibility,
                                [secKey]: e.target.checked
                              }
                            }
                          });
                        }}
                      />
                      <span className="capitalize">{secKey.replace(/([A-Z])/g, ' $1')}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Hero Section Configuration */}
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-bold text-slate-900 border-b pb-2">Hero Section Content</h3>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Headline</label>
                  <input
                    type="text"
                    value={cms.home.hero.headline}
                    onChange={(e) => setCms({
                      ...cms,
                      home: { ...cms.home, hero: { ...cms.home.hero, headline: e.target.value } }
                    })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subheadline / Supporting Text</label>
                  <textarea
                    rows={2}
                    value={cms.home.hero.subtitle}
                    onChange={(e) => setCms({
                      ...cms,
                      home: { ...cms.home, hero: { ...cms.home.hero, subtitle: e.target.value } }
                    })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Primary CTA Button Label</label>
                    <input
                      type="text"
                      value={cms.home.hero.primaryCtaText}
                      onChange={(e) => setCms({
                        ...cms,
                        home: { ...cms.home, hero: { ...cms.home.hero, primaryCtaText: e.target.value } }
                      })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Secondary CTA Button Label</label>
                    <input
                      type="text"
                      value={cms.home.hero.secondaryCtaText}
                      onChange={(e) => setCms({
                        ...cms,
                        home: { ...cms.home, hero: { ...cms.home.hero, secondaryCtaText: e.target.value } }
                      })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Hero Image URL</label>
                  <input
                    type="text"
                    value={cms.home.hero.imageUrl}
                    onChange={(e) => setCms({
                      ...cms,
                      home: { ...cms.home, hero: { ...cms.home.hero, imageUrl: e.target.value } }
                    })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Statistics Strip Editor */}
              <div className="space-y-3 pt-4 border-t">
                <h3 className="text-sm font-bold text-slate-900">4-Column Proof Metrics Strip</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {cms.home.metrics.map((m, idx) => (
                    <div key={m.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={m.value}
                          placeholder="Value (e.g. 18+)"
                          onChange={(e) => {
                            const newM = [...cms.home.metrics];
                            newM[idx].value = e.target.value;
                            setCms({ ...cms, home: { ...cms.home, metrics: newM } });
                          }}
                          className="w-24 px-2 py-1 border border-slate-300 rounded bg-white font-mono font-bold"
                        />
                        <input
                          type="text"
                          value={m.label}
                          placeholder="Metric Label"
                          onChange={(e) => {
                            const newM = [...cms.home.metrics];
                            newM[idx].label = e.target.value;
                            setCms({ ...cms, home: { ...cms.home, metrics: newM } });
                          }}
                          className="flex-1 px-2 py-1 border border-slate-300 rounded bg-white font-medium"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Development Process Steps Editor */}
              <div className="space-y-3 pt-4 border-t">
                <h3 className="text-sm font-bold text-slate-900">6-Stage Development Process Steps</h3>
                <div className="space-y-2">
                  {cms.home.processSection.steps.map((st, idx) => (
                    <div key={st.id || idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs items-center">
                      <div className="sm:col-span-1 font-mono font-bold text-blue-600">{st.num}</div>
                      <input
                        type="text"
                        value={st.title}
                        onChange={(e) => {
                          const steps = [...cms.home.processSection.steps];
                          steps[idx].title = e.target.value;
                          setCms({ ...cms, home: { ...cms.home, processSection: { ...cms.home.processSection, steps } } });
                        }}
                        className="sm:col-span-3 px-2 py-1 border border-slate-300 rounded bg-white font-bold"
                      />
                      <input
                        type="text"
                        value={st.desc}
                        onChange={(e) => {
                          const steps = [...cms.home.processSection.steps];
                          steps[idx].desc = e.target.value;
                          setCms({ ...cms, home: { ...cms.home, processSection: { ...cms.home.processSection, steps } } });
                        }}
                        className="sm:col-span-8 px-2 py-1 border border-slate-300 rounded bg-white text-slate-600"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* FAQs Editor */}
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">FAQ Question & Answers</h3>
                  <button
                    type="button"
                    onClick={() => {
                      const faqs = [...cms.home.faqSection.faqs];
                      faqs.push({
                        id: 'faq-' + Date.now(),
                        q: 'New Question...',
                        a: 'Answer explanation...',
                        published: true
                      });
                      setCms({ ...cms, home: { ...cms.home, faqSection: { ...cms.home.faqSection, faqs } } });
                    }}
                    className="px-2.5 py-1 text-2xs bg-slate-900 text-white font-semibold rounded hover:bg-slate-800"
                  >
                    + Add FAQ
                  </button>
                </div>
                <div className="space-y-2">
                  {cms.home.faqSection.faqs.map((faq, idx) => (
                    <div key={faq.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5 text-xs">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={faq.q}
                          onChange={(e) => {
                            const faqs = [...cms.home.faqSection.faqs];
                            faqs[idx].q = e.target.value;
                            setCms({ ...cms, home: { ...cms.home, faqSection: { ...cms.home.faqSection, faqs } } });
                          }}
                          className="flex-1 px-2 py-1 border border-slate-300 rounded bg-white font-bold"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const faqs = cms.home.faqSection.faqs.filter((_, i) => i !== idx);
                            setCms({ ...cms, home: { ...cms.home, faqSection: { ...cms.home.faqSection, faqs } } });
                          }}
                          className="p-1 text-slate-400 hover:text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={faq.a}
                        onChange={(e) => {
                          const faqs = [...cms.home.faqSection.faqs];
                          faqs[idx].a = e.target.value;
                          setCms({ ...cms, home: { ...cms.home, faqSection: { ...cms.home.faqSection, faqs } } });
                        }}
                        className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-slate-600"
                      />
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ==========================================================
           * 4. NAVIGATION & FOOTER
           * ========================================================*/}
          {activeModule === 'navigation' && cms && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 max-w-4xl shadow-xs">
              <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Navigation Menu & Footer Configuration</h2>
                  <p className="text-xs text-slate-500">Configure public navigation link labels, order, visibility, and CTA actions</p>
                </div>
                <button
                  onClick={() => saveCmsChanges({ navigation: cms.navigation })}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Saving...' : 'Save Navigation'}</span>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Header Primary CTA Button Text</label>
                    <input
                      type="text"
                      value={cms.navigation.ctaButtonText}
                      onChange={(e) => setCms({
                        ...cms,
                        navigation: { ...cms.navigation, ctaButtonText: e.target.value }
                      })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">Order</th>
                        <th className="py-2.5 px-3">Tab ID</th>
                        <th className="py-2.5 px-3">Menu Label</th>
                        <th className="py-2.5 px-3 text-center">Visibility</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {cms.navigation.items.map((item, idx) => (
                        <tr key={item.id}>
                          <td className="py-2.5 px-3 w-16">
                            <input
                              type="number"
                              value={item.order}
                              onChange={(e) => {
                                const items = [...cms.navigation.items];
                                items[idx].order = parseInt(e.target.value, 10) || 1;
                                setCms({ ...cms, navigation: { ...cms.navigation, items } });
                              }}
                              className="w-12 px-1.5 py-0.5 border border-slate-300 rounded text-center font-mono"
                            />
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-500">{item.tab}</td>
                          <td className="py-2.5 px-3">
                            <input
                              type="text"
                              value={item.label}
                              onChange={(e) => {
                                const items = [...cms.navigation.items];
                                items[idx].label = e.target.value;
                                setCms({ ...cms, navigation: { ...cms.navigation, items } });
                              }}
                              className="px-2 py-1 border border-slate-300 rounded text-xs w-48 font-medium"
                            />
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={item.visible}
                              onChange={(e) => {
                                const items = [...cms.navigation.items];
                                items[idx].visible = e.target.checked;
                                setCms({ ...cms, navigation: { ...cms.navigation, items } });
                              }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================================
           * 5. SERVICES MANAGEMENT
           * ========================================================*/}
          {activeModule === 'services' && cms && (
            <div className="space-y-6 max-w-5xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Services Management ({cms.services?.length || 0})</h2>
                  <p className="text-xs text-slate-500">Add, edit, reorder, and configure public software services and deliverables</p>
                </div>
                <button
                  onClick={() => saveCmsChanges({ services: cms.services })}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Services</span>
                </button>
              </div>

              <div className="space-y-4">
                {cms.services.map((srv, idx) => (
                  <div key={srv.id} className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-400">0{idx + 1}</span>
                        <input
                          type="text"
                          value={srv.title}
                          onChange={(e) => {
                            const services = [...cms.services];
                            services[idx].title = e.target.value;
                            setCms({ ...cms, services });
                          }}
                          className="font-bold text-sm text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-blue-600 px-1 py-0.5"
                        />
                      </div>
                      <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={srv.published !== false}
                          onChange={(e) => {
                            const services = [...cms.services];
                            services[idx].published = e.target.checked;
                            setCms({ ...cms, services });
                          }}
                        />
                        <span>Published</span>
                      </label>
                    </div>

                    <textarea
                      rows={2}
                      value={srv.fullDescription}
                      onChange={(e) => {
                        const services = [...cms.services];
                        services[idx].fullDescription = e.target.value;
                        setCms({ ...cms, services });
                      }}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-600"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="font-semibold text-slate-700">Benefits (comma-separated):</span>
                        <input
                          type="text"
                          value={srv.benefits.join(', ')}
                          onChange={(e) => {
                            const services = [...cms.services];
                            services[idx].benefits = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                            setCms({ ...cms, services });
                          }}
                          className="w-full mt-1 px-2.5 py-1 text-2xs border border-slate-300 rounded"
                        />
                      </div>
                      <div>
                        <span className="font-semibold text-slate-700">Deliverables (comma-separated):</span>
                        <input
                          type="text"
                          value={srv.deliverables.join(', ')}
                          onChange={(e) => {
                            const services = [...cms.services];
                            services[idx].deliverables = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                            setCms({ ...cms, services });
                          }}
                          className="w-full mt-1 px-2.5 py-1 text-2xs border border-slate-300 rounded"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==========================================================
           * 6. DEMOS & PORTFOLIO MANAGEMENT
           * ========================================================*/}
          {activeModule === 'portfolio' && (
            <div className="space-y-6">
              {editingProject ? (
                /* Project Editor Form */
                <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 max-w-4xl shadow-xs">
                  <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {isNewProject ? 'Add Demo Project' : `Edit Demo: ${editingProject.name}`}
                      </h3>
                      <div className="text-xs text-slate-500">Configure solution details, multi-industry assignment, tech stack, and screenshots</div>
                    </div>
                    <button
                      onClick={() => setEditingProject(null)}
                      className="px-3 py-1.5 text-xs text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!editingProject?.name || !editingProject.solutionType) return;
                      try {
                        if (isNewProject) {
                          const created = await createProject(editingProject);
                          setProjects([created, ...projects]);
                          notify(`Created demo project: ${created.name}`);
                        } else if (editingProject.id) {
                          const updated = await updateProject(editingProject.id, editingProject);
                          setProjects(projects.map((p) => (p.id === updated.id ? updated : p)));
                          notify(`Updated demo project: ${updated.name}`);
                        }
                        setEditingProject(null);
                        if (onRefreshData) onRefreshData();
                      } catch (err: unknown) {
                        const message = err instanceof Error ? err.message : 'Error saving project';
                        alert(message);
                      }
                    }}
                    className="space-y-4 text-xs"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Project Name *</label>
                        <input
                          type="text"
                          required
                          value={editingProject.name || ''}
                          onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Solution Type *</label>
                        <select
                          value={editingProject.solutionType || 'Web Application Development'}
                          onChange={(e) => setEditingProject({ ...editingProject, solutionType: e.target.value as any })}
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                        >
                          <option value="Website Design">Website Design</option>
                          <option value="Mobile Application Development">Mobile Application Development</option>
                          <option value="Web Application Development">Web Application Development</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Subcategory</label>
                        <input
                          type="text"
                          value={editingProject.subCategory || ''}
                          onChange={(e) => setEditingProject({ ...editingProject, subCategory: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Demo Status</label>
                        <select
                          value={editingProject.status || 'Concept'}
                          onChange={(e) => setEditingProject({ ...editingProject, status: e.target.value as any })}
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                        >
                          <option value="Concept">Concept</option>
                          <option value="Interactive Prototype">Interactive Prototype</option>
                          <option value="Live Demo">Live Demo</option>
                          <option value="Production Project">Production Project</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Short Description (for Project Card) *</label>
                      <input
                        type="text"
                        required
                        value={editingProject.shortDescription || ''}
                        onChange={(e) => setEditingProject({ ...editingProject, shortDescription: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Business Problem</label>
                        <textarea
                          rows={2}
                          value={editingProject.businessProblem || ''}
                          onChange={(e) => setEditingProject({ ...editingProject, businessProblem: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Proposed Solution</label>
                        <textarea
                          rows={2}
                          value={editingProject.proposedSolution || ''}
                          onChange={(e) => setEditingProject({ ...editingProject, proposedSolution: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                        />
                      </div>
                    </div>

                    {/* Industries assignment */}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Assigned Business Industries (Select all that apply)
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-3 border border-slate-200 rounded-lg bg-slate-50 text-2xs">
                        {INDUSTRIES_LIST.map((ind) => {
                          const isAssigned = editingProject.industries?.includes(ind);
                          return (
                            <label key={ind} className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={Boolean(isAssigned)}
                                onChange={(e) => {
                                  const current = editingProject.industries || [];
                                  if (e.target.checked) {
                                    setEditingProject({ ...editingProject, industries: [...current, ind] });
                                  } else {
                                    setEditingProject({ ...editingProject, industries: current.filter((x) => x !== ind) });
                                  }
                                }}
                              />
                              <span className="truncate">{ind}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Features & Tech */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Key Features (comma-separated)</label>
                        <textarea
                          rows={2}
                          value={(editingProject.keyFeatures || []).join(', ')}
                          onChange={(e) => setEditingProject({
                            ...editingProject,
                            keyFeatures: e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                          })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Technologies (comma-separated)</label>
                        <textarea
                          rows={2}
                          value={(editingProject.technologies || []).join(', ')}
                          onChange={(e) => setEditingProject({
                            ...editingProject,
                            technologies: e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                          })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="flex items-center justify-between">
                        <label className="block font-semibold text-slate-800 text-xs">
                          Project Thumbnail & Cover Image (Firebase Storage)
                        </label>
                        {editingProject.imagePath && (
                          <span className="text-3xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Stored in Firebase: {editingProject.imagePath}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        {/* Live Image Preview */}
                        <div className="w-20 h-14 rounded-lg bg-slate-200 border border-slate-300 overflow-hidden shrink-0 flex items-center justify-center">
                          {editingProject.thumbnail || editingProject.imageUrl ? (
                            <img
                              src={editingProject.thumbnail || editingProject.imageUrl}
                              alt="Thumbnail preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-slate-400" />
                          )}
                        </div>

                        {/* File Upload Trigger */}
                        <div className="flex-1 space-y-1.5 w-full">
                          <div className="flex items-center gap-2">
                            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition shadow-xs">
                              <UploadCloud className="w-3.5 h-3.5" />
                              <span>{uploadingImage ? 'Uploading to Storage...' : 'Upload Image (Max 10MB)'}</span>
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                                disabled={uploadingImage}
                                onChange={handleProjectThumbnailUpload}
                                className="hidden"
                              />
                            </label>
                            {uploadingImage && uploadProgress !== null && (
                              <span className="text-xs font-mono text-blue-600 font-bold">{uploadProgress}%</span>
                            )}
                          </div>

                          {uploadProgress !== null && uploadingImage && (
                            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-blue-600 h-full transition-all duration-200"
                                style={{ width: `${uploadProgress}%` }}
                              />
                            </div>
                          )}

                          {uploadError && (
                            <p className="text-2xs text-red-600">{uploadError}</p>
                          )}

                          <div className="relative">
                            <input
                              type="text"
                              value={editingProject.thumbnail || ''}
                              onChange={(e) => setEditingProject({
                                ...editingProject,
                                thumbnail: e.target.value,
                                imageUrl: e.target.value,
                              })}
                              placeholder="Or enter direct image URL / path..."
                              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Interactive Sandbox Preset</label>
                        <select
                          value={editingProject.interactiveSimulator || ''}
                          onChange={(e) => setEditingProject({ ...editingProject, interactiveSimulator: (e.target.value || undefined) as any })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                        >
                          <option value="">None (Static Presentation)</option>
                          <option value="clinic">Clinic Appointment Engine</option>
                          <option value="pos">Retail Point of Sale Register</option>
                          <option value="hrms">PulseHR Enterprise Workforce</option>
                          <option value="corporate">Nexus Corporate Holding Portal</option>
                          <option value="ecommerce">Lumina E-Commerce Storefront</option>
                          <option value="hotel">Serengeti Hotel Direct Booking</option>
                        </select>
                      </div>
                    </div>

                    {/* Toggles */}
                    <div className="flex items-center gap-6 pt-2">
                      <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingProject.published ?? true}
                          onChange={(e) => setEditingProject({ ...editingProject, published: e.target.checked })}
                        />
                        <span>Published (Live on Public Portfolio)</span>
                      </label>
                      <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(editingProject.featured)}
                          onChange={(e) => setEditingProject({ ...editingProject, featured: e.target.checked })}
                        />
                        <span>Feature on Home Page</span>
                      </label>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => setEditingProject(null)}
                        className="px-4 py-2 text-slate-600 hover:text-slate-900 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm cursor-pointer"
                      >
                        Save Project Record
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                /* Projects List */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Demo Projects ({projects.length})</h2>
                      <p className="text-xs text-slate-500">Manage all live solutions, prototypes, drafts, and categories</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsNewProject(true);
                        setEditingProject({
                          name: '',
                          solutionType: 'Web Application Development',
                          subCategory: 'Custom Business Software',
                          industries: ['Professional and Consulting Services'],
                          shortDescription: '',
                          status: 'Concept',
                          published: true,
                          featured: false,
                          keyFeatures: [],
                          technologies: ['React', 'TypeScript', 'Node.js'],
                          thumbnail: '/src/assets/images/web_app_dashboard_1793079158006.jpg',
                          screenshots: ['/src/assets/images/web_app_dashboard_1793079158006.jpg'],
                        });
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create New Demo</span>
                    </button>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                        <tr>
                          <th className="py-3 px-4">Project Name</th>
                          <th className="py-3 px-4">Solution Type</th>
                          <th className="py-3 px-4">Primary Industry</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-center">Featured</th>
                          <th className="py-3 px-4 text-center">Visibility</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {projects.map((proj) => (
                          <tr key={proj.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-900">{proj.name}</div>
                              <div className="text-2xs text-slate-500 font-mono">{proj.slug}</div>
                            </td>
                            <td className="py-3 px-4 text-slate-600">{proj.solutionType}</td>
                            <td className="py-3 px-4 text-slate-600">{proj.industries?.[0] || 'Unassigned'}</td>
                            <td className="py-3 px-4">
                              <span className="font-semibold text-slate-700">{proj.status}</span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={async () => {
                                  const updated = await updateProject(proj.id, { featured: !proj.featured });
                                  setProjects(projects.map((p) => (p.id === updated.id ? updated : p)));
                                  notify(`Project "${proj.name}" featured state updated`);
                                }}
                                className={`p-1 rounded cursor-pointer ${proj.featured ? 'text-amber-500' : 'text-slate-300 hover:text-slate-500'}`}
                              >
                                <Star className={`w-4 h-4 ${proj.featured ? 'fill-amber-400' : ''}`} />
                              </button>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={async () => {
                                  const updated = await updateProject(proj.id, { published: !proj.published });
                                  setProjects(projects.map((p) => (p.id === updated.id ? updated : p)));
                                  notify(`Project "${proj.name}" is now ${updated.published ? 'Live' : 'Draft'}`);
                                }}
                                className={`text-2xs font-semibold px-2 py-0.5 rounded cursor-pointer ${
                                  proj.published ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                }`}
                              >
                                {proj.published ? 'Live' : 'Draft'}
                              </button>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => {
                                    setIsNewProject(false);
                                    setEditingProject({ ...proj });
                                  }}
                                  className="p-1.5 text-slate-600 hover:text-blue-600 rounded cursor-pointer"
                                  title="Edit Project"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={async () => {
                                    if (!window.confirm(`Delete "${proj.name}"?`)) return;
                                    await deleteProject(proj.id);
                                    setProjects(projects.filter((p) => p.id !== proj.id));
                                    notify(`Deleted ${proj.name}`);
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                                  title="Delete Project"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==========================================================
           * 7. SOLUTION CATEGORIES
           * ========================================================*/}
          {activeModule === 'categories' && cms && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 max-w-4xl shadow-xs">
              <div className="border-b border-slate-200 pb-4">
                <h2 className="text-lg font-bold text-slate-900">Solution Categories Configuration</h2>
                <p className="text-xs text-slate-500">Configure descriptions and headlines for the 3 primary disciplines</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Section Kicker</label>
                  <input
                    type="text"
                    value={cms.home.categoriesSection.kicker}
                    onChange={(e) => setCms({
                      ...cms,
                      home: { ...cms.home, categoriesSection: { ...cms.home.categoriesSection, kicker: e.target.value } }
                    })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Section Title</label>
                  <input
                    type="text"
                    value={cms.home.categoriesSection.title}
                    onChange={(e) => setCms({
                      ...cms,
                      home: { ...cms.home, categoriesSection: { ...cms.home.categoriesSection, title: e.target.value } }
                    })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Section Description</label>
                  <textarea
                    rows={2}
                    value={cms.home.categoriesSection.description}
                    onChange={(e) => setCms({
                      ...cms,
                      home: { ...cms.home, categoriesSection: { ...cms.home.categoriesSection, description: e.target.value } }
                    })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => saveCmsChanges({ home: cms.home }, 'Categories section updated.')}
                    disabled={saving}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer"
                  >
                    Save Category Content
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================================
           * 8. INDUSTRY SECTORS MANAGEMENT
           * ========================================================*/}
          {activeModule === 'industries' && cms && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 max-w-5xl shadow-xs">
              <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Industry Sectors ({cms.industries?.length || 18})</h2>
                  <p className="text-xs text-slate-500">Edit industry descriptions, page visibility, and assigned demo associations</p>
                </div>
                <button
                  onClick={() => saveCmsChanges({ industries: cms.industries }, 'Industry sectors saved.')}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Industries</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-1">
                {cms.industries.map((ind, idx) => (
                  <div key={ind.id} className="p-4 border border-slate-200 rounded-xl space-y-2 bg-slate-50 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{ind.name}</span>
                      <label className="flex items-center gap-1 text-2xs text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={ind.published !== false}
                          onChange={(e) => {
                            const industries = [...cms.industries];
                            industries[idx].published = e.target.checked;
                            setCms({ ...cms, industries });
                          }}
                        />
                        <span>Visible</span>
                      </label>
                    </div>
                    <textarea
                      rows={2}
                      value={ind.description}
                      onChange={(e) => {
                        const industries = [...cms.industries];
                        industries[idx].description = e.target.value;
                        setCms({ ...cms, industries });
                      }}
                      className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-slate-600 text-2xs"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==========================================================
           * 9. CUSTOM PAGES
           * ========================================================*/}
          {activeModule === 'pages' && cms && (
            <div className="space-y-6 max-w-4xl">
              {editingPage ? (
                /* Custom Page Editor */
                <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h3 className="text-base font-bold text-slate-900">
                      {isNewPage ? 'Create Custom Page' : `Edit Page: ${editingPage.title}`}
                    </h3>
                    <button
                      onClick={() => setEditingPage(null)}
                      className="text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!editingPage.title || !editingPage.slug) return;
                      try {
                        if (isNewPage) {
                          const created = await createCustomPage(editingPage);
                          setCms({ ...cms, customPages: [...cms.customPages, created] });
                          notify(`Created page: ${created.title}`);
                        } else if (editingPage.id) {
                          const updated = await updateCustomPage(editingPage.id, editingPage);
                          setCms({
                            ...cms,
                            customPages: cms.customPages.map(p => p.id === updated.id ? updated : p)
                          });
                          notify(`Updated page: ${updated.title}`);
                        }
                        setEditingPage(null);
                      } catch (err: unknown) {
                        alert(err instanceof Error ? err.message : 'Error saving page');
                      }
                    }}
                    className="space-y-4 text-xs"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Page Title *</label>
                        <input
                          type="text"
                          required
                          value={editingPage.title || ''}
                          onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">URL Slug *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. privacy-policy or security-compliance"
                          value={editingPage.slug || ''}
                          onChange={(e) => setEditingPage({ ...editingPage, slug: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Rich Markdown / Text Content</label>
                      <textarea
                        rows={8}
                        value={editingPage.content || ''}
                        onChange={(e) => setEditingPage({ ...editingPage, content: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
                      />
                    </div>

                    <div className="flex items-center gap-6 pt-2">
                      <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingPage.published ?? true}
                          onChange={(e) => setEditingPage({ ...editingPage, published: e.target.checked })}
                        />
                        <span>Published (Accessible to public visitors)</span>
                      </label>
                      <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(editingPage.showInFooter)}
                          onChange={(e) => setEditingPage({ ...editingPage, showInFooter: e.target.checked })}
                        />
                        <span>Show link in Footer</span>
                      </label>
                    </div>

                    <div className="pt-3 flex justify-end gap-3 border-t">
                      <button
                        type="button"
                        onClick={() => setEditingPage(null)}
                        className="px-4 py-2 text-slate-600 hover:text-slate-900 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg cursor-pointer"
                      >
                        Save Page
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                /* Pages List */
                <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Custom Content Pages ({cms.customPages?.length || 0})</h2>
                      <p className="text-xs text-slate-500">Legal notices, terms of service, policies, and company documentation</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsNewPage(true);
                        setEditingPage({
                          title: '',
                          slug: '',
                          content: '',
                          seoTitle: '',
                          seoDescription: '',
                          published: true,
                          showInFooter: true,
                        });
                      }}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Page</span>
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100 text-xs">
                    {(cms.customPages || []).map((page) => (
                      <div key={page.id} className="py-3 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900">{page.title}</div>
                          <div className="text-2xs text-slate-400 font-mono">/page/{page.slug}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-2xs px-2 py-0.5 rounded font-semibold ${
                            page.published ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {page.published ? 'Published' : 'Draft'}
                          </span>
                          <button
                            onClick={() => {
                              setIsNewPage(false);
                              setEditingPage({ ...page });
                            }}
                            className="p-1.5 text-slate-600 hover:text-blue-600 rounded cursor-pointer"
                            title="Edit Page"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={async () => {
                              if (!window.confirm(`Delete page "${page.title}"?`)) return;
                              await deleteCustomPage(page.id);
                              setCms({
                                ...cms,
                                customPages: cms.customPages.filter(p => p.id !== page.id)
                              });
                              notify(`Deleted ${page.title}`);
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                            title="Delete Page"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==========================================================
           * 10. INQUIRY INBOX
           * ========================================================*/}
          {activeModule === 'inquiries' && (
            <div className="space-y-4 max-w-6xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Project Inquiries Inbox ({inquiries.length})</h2>
                  <p className="text-xs text-slate-500">Incoming project specifications from prospective clients</p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search inquiries..."
                      value={inquirySearch}
                      onChange={(e) => setInquirySearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg w-48"
                    />
                  </div>
                  <select
                    value={inquiryFilter}
                    onChange={(e) => setInquiryFilter(e.target.value)}
                    className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
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
                <div className={`${selectedInquiry ? 'lg:col-span-7' : 'lg:col-span-12'} bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs`}>
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">Client & Company</th>
                        <th className="py-2.5 px-3">Solution Type</th>
                        <th className="py-2.5 px-3">Budget</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {inquiries
                        .filter(i => (inquiryFilter === 'All' || i.status === inquiryFilter))
                        .filter(i => !inquirySearch || i.fullName.toLowerCase().includes(inquirySearch.toLowerCase()) || i.companyName.toLowerCase().includes(inquirySearch.toLowerCase()))
                        .map((inq) => (
                          <tr
                            key={inq.id}
                            onClick={() => setSelectedInquiry(inq)}
                            className={`cursor-pointer transition-colors ${
                              selectedInquiry?.id === inq.id ? 'bg-blue-50/70' : 'hover:bg-slate-50'
                            }`}
                          >
                            <td className="py-3 px-3">
                              <div className="font-bold text-slate-900">{inq.fullName}</div>
                              <div className="text-2xs text-slate-500">{inq.companyName}</div>
                            </td>
                            <td className="py-3 px-3 text-slate-700 truncate max-w-[150px]">{inq.solutionType}</td>
                            <td className="py-3 px-3 font-mono text-2xs text-slate-600">{inq.budgetRange}</td>
                            <td className="py-3 px-3">
                              <span className={`text-2xs font-semibold px-2 py-0.5 rounded ${
                                inq.status === 'New' ? 'bg-blue-100 text-blue-800' :
                                inq.status === 'Won' ? 'bg-emerald-100 text-emerald-800' :
                                'bg-slate-100 text-slate-700'
                              }`}>
                                {inq.status}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  if (!window.confirm('Delete inquiry permanently?')) return;
                                  await deleteInquiry(inq.id);
                                  setInquiries(inquiries.filter(x => x.id !== inq.id));
                                  if (selectedInquiry?.id === inq.id) setSelectedInquiry(null);
                                  notify('Inquiry deleted.');
                                }}
                                className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* Selected Inquiry Detail Drawer */}
                {selectedInquiry && (
                  <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-2xs">
                    <div className="flex items-center justify-between border-b pb-3">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{selectedInquiry.fullName}</h4>
                        <div className="text-xs text-slate-500">{selectedInquiry.companyName} · {selectedInquiry.country}</div>
                      </div>
                      <button onClick={() => setSelectedInquiry(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <span className="font-semibold text-slate-700">Contact:</span>
                        <div className="text-slate-600">{selectedInquiry.email} · {selectedInquiry.phone}</div>
                        <div className="text-2xs text-slate-400">Preferred Channel: {selectedInquiry.preferredContactMethod}</div>
                      </div>

                      <div>
                        <span className="font-semibold text-slate-700">Client Brief:</span>
                        <p className="text-slate-700 mt-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                          {selectedInquiry.projectDescription}
                        </p>
                      </div>

                      {selectedInquiry.requiredFeatures && (
                        <div>
                          <span className="font-semibold text-slate-700">Features:</span>
                          <div className="text-slate-600">{selectedInquiry.requiredFeatures}</div>
                        </div>
                      )}

                      {/* Status Selector */}
                      <div>
                        <span className="font-semibold text-slate-700 block mb-1">Update Status:</span>
                        <div className="flex flex-wrap gap-1">
                          {(['New', 'Contacted', 'In Progress', 'Quoted', 'Won', 'Closed'] as const).map((st) => (
                            <button
                              key={st}
                              onClick={async () => {
                                const updated = await updateInquiry(selectedInquiry.id, { status: st });
                                setInquiries(inquiries.map(i => i.id === updated.id ? updated : i));
                                setSelectedInquiry(updated);
                                notify(`Status updated: ${st}`);
                              }}
                              className={`px-2 py-0.5 text-2xs font-semibold rounded cursor-pointer ${
                                selectedInquiry.status === st ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Internal Notes */}
                      <div className="pt-2 border-t">
                        <span className="font-semibold text-slate-700">Internal Architectural Notes:</span>
                        <div className="space-y-1.5 mt-2 max-h-36 overflow-y-auto">
                          {selectedInquiry.internalNotes?.map((note) => (
                            <div key={note.id} className="p-2 bg-slate-50 border border-slate-100 rounded text-2xs space-y-0.5">
                              <div className="flex justify-between text-slate-400">
                                <span className="font-semibold text-slate-700">{note.author}</span>
                                <span>{new Date(note.date).toLocaleDateString()}</span>
                              </div>
                              <p className="text-slate-600">{note.text}</p>
                            </div>
                          ))}
                        </div>
                        <form
                          onSubmit={async (e) => {
                            e.preventDefault();
                            if (!newNoteText.trim()) return;
                            const updated = await updateInquiry(selectedInquiry.id, {
                              noteText: newNoteText.trim(),
                              noteAuthor: adminUser?.name || 'Administrator',
                            });
                            setInquiries(inquiries.map(i => i.id === updated.id ? updated : i));
                            setSelectedInquiry(updated);
                            setNewNoteText('');
                            notify('Appended note.');
                          }}
                          className="mt-2 flex gap-1.5"
                        >
                          <input
                            type="text"
                            placeholder="Add confidential team note..."
                            value={newNoteText}
                            onChange={(e) => setNewNoteText(e.target.value)}
                            className="flex-1 px-2.5 py-1 text-xs border border-slate-300 rounded"
                          />
                          <button
                            type="submit"
                            className="px-3 py-1 bg-slate-900 text-white text-xs font-semibold rounded hover:bg-slate-800 cursor-pointer"
                          >
                            Add
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==========================================================
           * 11. SEO SETTINGS
           * ========================================================*/}
          {activeModule === 'seo' && cms && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 max-w-4xl shadow-xs">
              <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Search Engine Optimization (SEO) & Social Cards</h2>
                  <p className="text-xs text-slate-500">Configure global metadata, OpenGraph tags, and search engine previews</p>
                </div>
                <button
                  onClick={() => saveCmsChanges({ seo: cms.seo }, 'SEO settings saved.')}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save SEO</span>
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Default Page Title Tag</label>
                  <input
                    type="text"
                    value={cms.seo.defaultTitle}
                    onChange={(e) => setCms({ ...cms, seo: { ...cms.seo, defaultTitle: e.target.value } })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Meta Description Tag</label>
                  <textarea
                    rows={2}
                    value={cms.seo.metaDescription}
                    onChange={(e) => setCms({ ...cms, seo: { ...cms.seo, metaDescription: e.target.value } })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">SEO Target Keywords</label>
                  <input
                    type="text"
                    value={cms.seo.keywords}
                    onChange={(e) => setCms({ ...cms, seo: { ...cms.seo, keywords: e.target.value } })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">OpenGraph Social Share Image URL</label>
                  <input
                    type="text"
                    value={cms.seo.ogImage}
                    onChange={(e) => setCms({ ...cms, seo: { ...cms.seo, ogImage: e.target.value } })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ==========================================================
           * 12. THEME & LAYOUT SETTINGS
           * ========================================================*/}
          {activeModule === 'theme' && cms && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 max-w-4xl shadow-xs">
              <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Theme & Layout Appearance</h2>
                  <p className="text-xs text-slate-500">Customize brand color palette, button border radii, and visual styling</p>
                </div>
                <button
                  onClick={() => saveCmsChanges({ theme: cms.theme }, 'Theme settings applied.')}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Theme</span>
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Primary Brand Accent</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={cms.theme.primaryColor || '#2563eb'}
                        onChange={(e) => setCms({ ...cms, theme: { ...cms.theme, primaryColor: e.target.value } })}
                        className="w-9 h-9 rounded cursor-pointer border border-slate-300 p-0.5"
                      />
                      <input
                        type="text"
                        value={cms.theme.primaryColor || '#2563eb'}
                        onChange={(e) => setCms({ ...cms, theme: { ...cms.theme, primaryColor: e.target.value } })}
                        className="flex-1 px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Secondary Slate Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={cms.theme.secondaryColor || '#0f172a'}
                        onChange={(e) => setCms({ ...cms, theme: { ...cms.theme, secondaryColor: e.target.value } })}
                        className="w-9 h-9 rounded cursor-pointer border border-slate-300 p-0.5"
                      />
                      <input
                        type="text"
                        value={cms.theme.secondaryColor || '#0f172a'}
                        onChange={(e) => setCms({ ...cms, theme: { ...cms.theme, secondaryColor: e.target.value } })}
                        className="flex-1 px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Button Radius Style</label>
                    <select
                      value={cms.theme.buttonStyle || 'rounded-xl'}
                      onChange={(e) => setCms({ ...cms, theme: { ...cms.theme, buttonStyle: e.target.value as any } })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="rounded-md">Subtle (rounded-md)</option>
                      <option value="rounded-lg">Standard (rounded-lg)</option>
                      <option value="rounded-xl">Modern Soft (rounded-xl)</option>
                      <option value="rounded-full">Pill (rounded-full)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================================
           * 13. USER & PERMISSION MANAGEMENT
           * ========================================================*/}
          {activeModule === 'users' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 max-w-xl shadow-xs">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-lg font-bold text-slate-900">User Credentials & Security</h2>
                <p className="text-xs text-slate-500">Update administrative password and manage system access</p>
              </div>

              {pwMessage && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
                  {pwMessage}
                </div>
              )}

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setPwMessage(null);
                  if (newPw !== confirmPw) {
                    setPwMessage('New passwords do not match');
                    return;
                  }
                  try {
                    await changeAdminPassword(currentPw, newPw);
                    setPwMessage('Password updated successfully.');
                    setCurrentPw('');
                    setNewPw('');
                    setConfirmPw('');
                  } catch (err: unknown) {
                    setPwMessage(err instanceof Error ? err.message : 'Error changing password');
                  }
                }}
                className="space-y-4 text-xs"
              >
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    required
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">New Password (Min 6 chars)</label>
                  <input
                    type="password"
                    required
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg cursor-pointer"
                >
                  Change Admin Password
                </button>
              </form>
            </div>
          )}

          {/* ==========================================================
           * 14. SYSTEM SETTINGS, BACKUP & RESTORE
           * ========================================================*/}
          {activeModule === 'system' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 max-w-3xl shadow-xs">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-lg font-bold text-slate-900">System Backup, Restore & Reset</h2>
                <p className="text-xs text-slate-500">Export complete JSON database, restore previous versions, or factory reset</p>
              </div>

              <div className="space-y-6 text-xs">
                {/* Cloud Firestore Seeding */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-blue-950">Bootstrap Cloud Firestore Database</h4>
                      <span className="text-3xs font-mono bg-blue-200 text-blue-900 px-1.5 py-0.5 rounded font-bold">tesfayeteklu-com</span>
                    </div>
                    <p className="text-blue-700 mt-0.5">
                      Sync and populate the live Firestore database with all 30 categorized demo projects, industries, and site settings.
                    </p>
                  </div>
                  <button
                    onClick={handleSeedFirestore}
                    disabled={seedingFirebase}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold rounded-lg flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${seedingFirebase ? 'animate-spin' : ''}`} />
                    <span>{seedingFirebase ? 'Seeding...' : 'Seed to Firestore'}</span>
                  </button>
                </div>

                {/* Backup */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-slate-900">Download Full JSON Backup</h4>
                    <p className="text-slate-500 mt-0.5">Exports all CMS configurations, projects, custom pages, and inquiries to a single file.</p>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        await downloadBackup();
                        notify('Backup file generated and downloaded.');
                      } catch (err: unknown) {
                        alert(err instanceof Error ? err.message : 'Error generating backup');
                      }
                    }}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Backup</span>
                  </button>
                </div>

                {/* Restore */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div>
                    <h4 className="font-bold text-slate-900">Restore from JSON Backup</h4>
                    <p className="text-slate-500 mt-0.5">Upload a previously exported backup file to restore website state.</p>
                  </div>
                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = async (evt) => {
                        try {
                          const parsed = JSON.parse(evt.target?.result as string);
                          await restoreBackup(parsed);
                          notify('System restored successfully.');
                          loadMasterData();
                        } catch (err: unknown) {
                          alert('Failed to parse or restore backup: ' + (err instanceof Error ? err.message : String(err)));
                        }
                      };
                      reader.readAsText(file);
                    }}
                    className="text-xs text-slate-600 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>

                {/* Reset to Factory Defaults */}
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-red-900">Reset to Factory Default Data</h4>
                    <p className="text-red-700 mt-0.5">Re-seeds all projects, services, industries, and settings to original state.</p>
                  </div>
                  <button
                    onClick={async () => {
                      if (!window.confirm('WARNING: This will reset all customized content, projects, and inquiries back to default seed data. Proceed?')) return;
                      try {
                        await resetSystemToDefaults();
                        notify('Reset completed.');
                        loadMasterData();
                      } catch (err: unknown) {
                        alert(err instanceof Error ? err.message : 'Error resetting system');
                      }
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset to Defaults</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
};
