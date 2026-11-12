/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Project, UserProfile } from './types';
import { CmsConfig, CustomPage, BlogArticle } from './types/cms';
import { 
  fetchProjects, 
  fetchCmsConfig, 
  verifyAdmin, 
  getAuthToken, 
  testConnection, 
  subscribeToAuthState,
  logoutAdmin,
  AUTHORIZED_ADMIN_EMAIL,
  isAuthorizedAdminEmail,
} from './services/api';
import { DEFAULT_CMS_CONFIG } from './data/initialCmsData';
import { INITIAL_PROJECTS } from './data/seedData';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeView } from './views/HomeView';
import { PortfolioView } from './views/PortfolioView';
import { IndustriesView } from './views/IndustriesView';
import { ServicesView } from './views/ServicesView';
import { AboutView } from './views/AboutView';
import { ContactView } from './views/ContactView';
import { CustomPageView } from './views/CustomPageView';
import { BlogView } from './views/BlogView';
import { BlogPostView } from './views/BlogPostView';
import { NotFoundView } from './views/NotFoundView';
import { SEOHead } from './components/SEOHead';
import { InquiryModal } from './components/InquiryModal';
import { ProjectDetailModal } from './components/ProjectDetailModal';
import { InteractiveSimulatorModal } from './components/InteractiveSimulators';
import { AdminCMS } from './components/AdminCMS/AdminCMS';
import { AuthPage } from './views/AuthPage';
import { AdminLoginPage } from './views/AdminLoginPage';
import { AccountView } from './views/AccountView';
import { Shield, ArrowLeft } from 'lucide-react';

export default function App() {
  // Helper to parse path into tab and slugs
  const parsePath = (path: string) => {
    if (path === '/' || path === '') return { tab: 'home', blogSlug: null, pageSlug: null };
    if (path === '/blog' || path === '/blog/') return { tab: 'blog', blogSlug: null, pageSlug: null };
    if (path.startsWith('/blog/')) {
      const slug = path.replace('/blog/', '').split('/')[0];
      return { tab: 'blog-post', blogSlug: slug, pageSlug: null };
    }
    if (path.startsWith('/page/')) {
      const slug = path.replace('/page/', '').split('/')[0];
      return { tab: 'custom-page', blogSlug: null, pageSlug: slug };
    }
    if (path === '/about' || path === '/about/') return { tab: 'about', blogSlug: null, pageSlug: null };
    if (path === '/services' || path === '/services/') return { tab: 'services', blogSlug: null, pageSlug: null };
    if (path === '/services/website-design' || path === '/websites') return { tab: 'websites', blogSlug: null, pageSlug: null };
    if (path === '/services/mobile-apps' || path === '/mobile') return { tab: 'mobile', blogSlug: null, pageSlug: null };
    if (path === '/services/web-applications' || path === '/webapps') return { tab: 'webapps', blogSlug: null, pageSlug: null };
    if (path === '/portfolio' || path === '/portfolio/') return { tab: 'webapps', blogSlug: null, pageSlug: null };
    if (path === '/contact' || path === '/contact/') return { tab: 'contact', blogSlug: null, pageSlug: null };
    if (path === '/login' || path === '/login/') return { tab: 'login', blogSlug: null, pageSlug: null };
    if (path === '/register' || path === '/register/') return { tab: 'register', blogSlug: null, pageSlug: null };
    if (path === '/account' || path === '/account/') return { tab: 'account', blogSlug: null, pageSlug: null };
    if (path.startsWith('/admin')) return { tab: 'admin', blogSlug: null, pageSlug: null };
    return { tab: 'not-found', blogSlug: null, pageSlug: null };
  };

  const initialRoute = parsePath(window.location.pathname);
  const [currentTab, setCurrentTab] = useState<string>(initialRoute.tab);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [cms, setCms] = useState<CmsConfig>(DEFAULT_CMS_CONFIG);
  const [loading, setLoading] = useState<boolean>(true);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => Boolean(getAuthToken()));
  const [authChecking, setAuthChecking] = useState<boolean>(true);

  // URL Path State
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname);

  // Slugs for dynamic routes
  const [activeCustomPageSlug, setActiveCustomPageSlug] = useState<string | null>(initialRoute.pageSlug);
  const [activeBlogSlug, setActiveBlogSlug] = useState<string | null>(initialRoute.blogSlug);

  // Modals state
  const [inquiryModalOpen, setInquiryModalOpen] = useState<boolean>(false);
  const [prefillProject, setPrefillProject] = useState<Project | null>(null);
  const [prefillService, setPrefillService] = useState<string | undefined>(undefined);
  const [selectedProjectDetail, setSelectedProjectDetail] = useState<Project | null>(null);
  const [simulatorProject, setSimulatorProject] = useState<Project | null>(null);

  useEffect(() => {
    testConnection().catch(() => {});
    loadMasterData();
    checkAdmin();

    // Real-time listener for Firebase authentication state
    const unsubscribeAuth = subscribeToAuthState((authState) => {
      setCurrentUser(authState.user);
      setUserProfile(authState.profile);
      if (authState.isAdmin) {
        setIsAdmin(true);
        setIsAdminLoggedIn(true);
      } else if (!getAuthToken()) {
        setIsAdmin(false);
        setIsAdminLoggedIn(false);
      }
      setAuthChecking(false);
    });

    // Listen to browser URL changes
    const handlePopState = () => {
      const path = window.location.pathname;
      setCurrentPath(path);
      const parsed = parsePath(path);
      setCurrentTab(parsed.tab);
      setActiveBlogSlug(parsed.blogSlug);
      setActiveCustomPageSlug(parsed.pageSlug);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      unsubscribeAuth();
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Update dynamic page title from CMS configuration
  useEffect(() => {
    if (cms?.seo?.defaultTitle) {
      document.title = cms.seo.defaultTitle;
    }
  }, [cms]);

  const loadMasterData = async () => {
    try {
      setLoading(true);
      const [cmsData, projData] = await Promise.all([
        fetchCmsConfig().catch(() => DEFAULT_CMS_CONFIG),
        fetchProjects({ includeDrafts: false }).catch(() => INITIAL_PROJECTS)
      ]);
      if (cmsData) setCms(cmsData);
      if (projData && projData.length > 0) setProjects(projData);
    } catch (err) {
      console.warn('Notice loading CMS state:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkAdmin = async () => {
    try {
      const res = await verifyAdmin();
      if (res.authenticated && res.user && isAuthorizedAdminEmail(res.user.email)) {
        setIsAdminLoggedIn(true);
        setIsAdmin(true);
      }
    } catch {
      // Ignore
    } finally {
      setAuthChecking(false);
    }
  };

  const navigateToAdmin = () => {
    window.history.pushState({}, '', '/admin');
    setCurrentPath('/admin');
    setCurrentTab('admin');
  };

  const navigateToLogin = () => {
    window.history.pushState({}, '', '/login');
    setCurrentPath('/login');
    setCurrentTab('login');
  };

  const navigateToRegister = () => {
    window.history.pushState({}, '', '/register');
    setCurrentPath('/register');
    setCurrentTab('register');
  };

  const navigateToAccount = () => {
    window.history.pushState({}, '', '/account');
    setCurrentPath('/account');
    setCurrentTab('account');
  };

  const exitAdmin = () => {
    window.history.pushState({}, '', '/');
    setCurrentPath('/');
    setCurrentTab('home');
  };

  const handleLogout = async () => {
    await logoutAdmin();
    setCurrentUser(null);
    setUserProfile(null);
    setIsAdmin(false);
    setIsAdminLoggedIn(false);
    exitAdmin();
  };

  const getRoutePath = (tab: string, blogSlug?: string | null, pageSlug?: string | null) => {
    switch (tab) {
      case 'home': return '/';
      case 'websites': return '/services/website-design';
      case 'mobile': return '/services/mobile-apps';
      case 'webapps': return '/services/web-applications';
      case 'services': return '/services';
      case 'about': return '/about';
      case 'contact': return '/contact';
      case 'blog': return '/blog';
      case 'blog-post': return blogSlug ? `/blog/${blogSlug}` : '/blog';
      case 'portfolio': return '/portfolio';
      case 'custom-page': return pageSlug ? `/page/${pageSlug}` : '/';
      case 'login': return '/login';
      case 'register': return '/register';
      case 'account': return '/account';
      default: return '/';
    }
  };

  const handleSelectTab = (tab: string) => {
    setActiveCustomPageSlug(null);
    setActiveBlogSlug(null);
    setCurrentTab(tab);
    const targetPath = getRoutePath(tab);
    window.history.pushState({}, '', targetPath);
    setCurrentPath(targetPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectArticle = (article: BlogArticle) => {
    setActiveBlogSlug(article.slug);
    setCurrentTab('blog-post');
    const targetPath = `/blog/${article.slug}`;
    window.history.pushState({}, '', targetPath);
    setCurrentPath(targetPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenCustomPage = (slug: string) => {
    setActiveCustomPageSlug(slug);
    setCurrentTab('custom-page');
    window.history.pushState({}, '', `/page/${slug}`);
    setCurrentPath(`/page/${slug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenGeneralInquiry = () => {
    setPrefillProject(null);
    setPrefillService(undefined);
    setInquiryModalOpen(true);
  };

  const handleOpenProjectInquiry = (project: Project) => {
    setPrefillProject(project);
    setPrefillService(undefined);
    setInquiryModalOpen(true);
  };

  const handleOpenServiceInquiry = (serviceName: string) => {
    setPrefillProject(null);
    setPrefillService(serviceName);
    setInquiryModalOpen(true);
  };

  // ---------------------------------------------------------------------------
  // Dedicated Route: Login / Register Pages
  // ---------------------------------------------------------------------------
  if (currentTab === 'login' || currentTab === 'register' || currentPath === '/login' || currentPath === '/register') {
    return (
      <AuthPage
        initialMode={currentTab === 'register' || currentPath === '/register' ? 'register' : 'login'}
        identity={cms.identity}
        onLoginSuccess={(profile, userIsAdmin) => {
          if (userIsAdmin) {
            setIsAdmin(true);
            setIsAdminLoggedIn(true);
            navigateToAdmin();
          } else {
            navigateToAccount();
          }
        }}
        onReturnToSite={exitAdmin}
      />
    );
  }

  // ---------------------------------------------------------------------------
  // Dedicated Route: Admin CMS Dashboard or Login Gate
  // ---------------------------------------------------------------------------
  if (currentTab === 'admin' || currentPath.startsWith('/admin') || window.location.hash === '#admin') {
    // If not authenticated admin
    if (!isAdmin || !isAdminLoggedIn) {
      if (authChecking) {
        return (
          <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300 text-xs gap-3">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="font-medium tracking-wide text-slate-400">Loading TesfayeTech Administrator CMS...</p>
          </div>
        );
      }

      // If logged in as non-admin user
      if (currentUser && !isAdmin) {
        return (
          <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100">
            <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                <Shield className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-white">Access Restricted</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                You are currently signed in as <strong className="text-white">{currentUser.email}</strong>. The Administrator CMS is restricted to verified <strong className="text-white">{AUTHORIZED_ADMIN_EMAIL}</strong>.
              </p>
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={navigateToAccount}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Go to My Account
                </button>
                <button
                  onClick={exitAdmin}
                  className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Return to Public Site
                </button>
              </div>
            </div>
          </div>
        );
      }

      // Not logged in: Show dedicated AdminLoginPage (sign-in only, no registration)
      return (
        <AdminLoginPage
          identity={cms.identity}
          onLoginSuccess={() => {
            setIsAdmin(true);
            setIsAdminLoggedIn(true);
            navigateToAdmin();
          }}
          onReturnToSite={exitAdmin}
        />
      );
    }

    // Authenticated Admin: Render Admin CMS
    return (
      <AdminCMS
        onExit={exitAdmin}
        onLogout={handleLogout}
        onPreviewPublicSite={() => {
          setCurrentPath('/');
          setCurrentTab('home');
          window.history.pushState({}, '', '/');
        }}
        onRefreshData={loadMasterData}
      />
    );
  }

  const activeCustomPage = (cms?.customPages || []).find((p) => p.slug === activeCustomPageSlug);
  const activeArticle = (cms?.blogArticles || []).find((a) => a.slug === activeBlogSlug);
  const getPageConfig = (pageId: string) => (cms?.seo?.pages || []).find((p) => p.id === pageId);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
      
      {/* Top Banner when an admin is previewing the live site */}
      {isAdmin && (
        <div className="bg-slate-900 text-white text-xs px-4 py-1.5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold">Administrator Preview Mode</span>
            <span className="text-slate-400">· Changes published in CMS are live</span>
          </div>
          <button
            onClick={navigateToAdmin}
            className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-0.5 rounded font-semibold transition-colors cursor-pointer"
          >
            Return to CMS Dashboard →
          </button>
        </div>
      )}

      {/* Universal Public Top Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        onRequestProject={handleOpenGeneralInquiry}
        onOpenLogin={navigateToLogin}
        onOpenRegister={navigateToRegister}
        onOpenAccount={navigateToAccount}
        onOpenAdminCMS={navigateToAdmin}
        onLogout={handleLogout}
        currentUser={currentUser}
        userProfile={userProfile}
        isAdmin={isAdmin}
        identity={cms.identity}
        navigation={cms.navigation}
      />

      {/* Main Dynamic View Content */}
      <main className="flex-1 pb-16">
        {currentTab === 'home' && (
          <>
            <SEOHead
              pageConfig={getPageConfig('home')}
              identity={cms.identity}
            />
            <HomeView
              projects={projects}
              cms={cms}
              onSelectTab={handleSelectTab}
              onRequestProject={handleOpenGeneralInquiry}
              onViewDetails={(proj) => setSelectedProjectDetail(proj)}
              onLaunchDemo={(proj) => setSimulatorProject(proj)}
              onRequestSimilar={handleOpenProjectInquiry}
            />
          </>
        )}

        {currentTab === 'websites' && (
          <>
            <SEOHead
              pageConfig={getPageConfig('websites')}
              identity={cms.identity}
              breadcrumbs={[
                { name: 'Home', url: '/' },
                { name: 'Website Design', url: '/services/website-design' }
              ]}
            />
            <PortfolioView
              projects={projects}
              defaultSolutionType="Website Design"
              title="Website Design & Digital Experience Portfolio"
              description="High-converting corporate company profiles, consulting websites, e-commerce storefronts, hotel booking engines, and responsive web portals."
              onViewDetails={(proj) => setSelectedProjectDetail(proj)}
              onLaunchDemo={(proj) => setSimulatorProject(proj)}
              onRequestSimilar={handleOpenProjectInquiry}
            />
          </>
        )}

        {currentTab === 'mobile' && (
          <>
            <SEOHead
              pageConfig={getPageConfig('mobile')}
              identity={cms.identity}
              breadcrumbs={[
                { name: 'Home', url: '/' },
                { name: 'Mobile Apps', url: '/services/mobile-apps' }
              ]}
            />
            <PortfolioView
              projects={projects}
              defaultSolutionType="Mobile Application Development"
              title="Mobile Application Development Portfolio"
              description="Native iOS and Android mobile solutions including banking & payment apps, food ordering, healthcare appointment booking, loyalty platforms, and field logistics."
              onViewDetails={(proj) => setSelectedProjectDetail(proj)}
              onLaunchDemo={(proj) => setSimulatorProject(proj)}
              onRequestSimilar={handleOpenProjectInquiry}
            />
          </>
        )}

        {(currentTab === 'webapps' || currentTab === 'portfolio') && (
          <>
            <SEOHead
              pageConfig={getPageConfig(currentTab === 'portfolio' ? 'portfolio' : 'webapps')}
              identity={cms.identity}
              breadcrumbs={[
                { name: 'Home', url: '/' },
                {
                  name: currentTab === 'portfolio' ? 'Portfolio' : 'Web Applications & ERP',
                  url: currentTab === 'portfolio' ? '/portfolio' : '/services/web-applications'
                }
              ]}
            />
            <PortfolioView
              projects={projects}
              defaultSolutionType="All"
              title="Web Applications, ERP & Systems Marketplace"
              description="Mission-critical enterprise software, HRMS suites, inventory management systems, Point of Sale (POS) registers, clinic portals, and custom CRM platforms."
              onViewDetails={(proj) => setSelectedProjectDetail(proj)}
              onLaunchDemo={(proj) => setSimulatorProject(proj)}
              onRequestSimilar={handleOpenProjectInquiry}
            />
          </>
        )}

        {currentTab === 'industries' && (
          <IndustriesView
            projects={projects}
            industries={cms.industries}
            onSelectIndustry={() => {
              handleSelectTab('webapps');
            }}
            onRequestProject={handleOpenGeneralInquiry}
          />
        )}

        {currentTab === 'services' && (
          <>
            <SEOHead
              pageConfig={getPageConfig('services')}
              identity={cms.identity}
              breadcrumbs={[
                { name: 'Home', url: '/' },
                { name: 'Services', url: '/services' }
              ]}
            />
            <ServicesView
              services={cms.services}
              onRequestQuoteForService={handleOpenServiceInquiry}
            />
          </>
        )}

        {currentTab === 'about' && (
          <>
            <SEOHead
              pageConfig={getPageConfig('about')}
              identity={cms.identity}
              breadcrumbs={[
                { name: 'Home', url: '/' },
                { name: 'About Us', url: '/about' }
              ]}
            />
            <AboutView
              onRequestProject={handleOpenGeneralInquiry}
              cms={cms}
            />
          </>
        )}

        {currentTab === 'contact' && (
          <>
            <SEOHead
              pageConfig={getPageConfig('contact')}
              identity={cms.identity}
              breadcrumbs={[
                { name: 'Home', url: '/' },
                { name: 'Contact', url: '/contact' }
              ]}
            />
            <ContactView
              identity={cms.identity}
              contactFormConfig={cms.contactForm}
              faqs={cms.home.faqSection?.faqs}
            />
          </>
        )}

        {currentTab === 'blog' && (
          <BlogView
            articles={cms.blogArticles || []}
            onSelectArticle={handleSelectArticle}
            onRequestProject={handleOpenGeneralInquiry}
          />
        )}

        {currentTab === 'blog-post' && (
          activeArticle ? (
            <BlogPostView
              article={activeArticle}
              allArticles={cms.blogArticles || []}
              onBackToBlog={() => handleSelectTab('blog')}
              onSelectArticle={handleSelectArticle}
              onRequestProject={handleOpenGeneralInquiry}
            />
          ) : (
            <NotFoundView
              onGoHome={() => handleSelectTab('home')}
              onSelectTab={handleSelectTab}
              onRequestProject={handleOpenGeneralInquiry}
            />
          )
        )}

        {currentTab === 'custom-page' && activeCustomPage && (
          <>
            <SEOHead
              title={`${activeCustomPage.title} | TesfayeTech`}
              description={activeCustomPage.seoDescription}
              canonicalPath={`/page/${activeCustomPage.slug}`}
              breadcrumbs={[
                { name: 'Home', url: '/' },
                { name: activeCustomPage.title, url: `/page/${activeCustomPage.slug}` }
              ]}
            />
            <CustomPageView
              page={activeCustomPage}
              onBack={() => handleSelectTab('home')}
              onRequestProject={handleOpenGeneralInquiry}
            />
          </>
        )}

        {/* My Account Protected View */}
        {currentTab === 'account' && (
          currentUser ? (
            <AccountView
              user={currentUser}
              profile={userProfile}
              isAdmin={isAdmin}
              identity={cms.identity}
              onLaunchAdminCMS={navigateToAdmin}
              onRequestProject={handleOpenGeneralInquiry}
              onLogout={handleLogout}
              onProfileUpdated={(updated) => setUserProfile(updated)}
            />
          ) : (
            <div className="py-20 text-center max-w-md mx-auto px-4">
              <Shield className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h2 className="text-xl font-bold text-slate-900">Sign in to Access Account</h2>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Please log in or register to view your verified profile and project management details.
              </p>
              <button
                onClick={navigateToLogin}
                className="px-5 py-2.5 bg-blue-600 text-white text-xs font-semibold rounded-xl shadow-sm hover:bg-blue-700 cursor-pointer"
              >
                Go to Login
              </button>
            </div>
          )
        )}

        {currentTab === 'not-found' && (
          <NotFoundView
            onGoHome={() => handleSelectTab('home')}
            onSelectTab={handleSelectTab}
            onRequestProject={handleOpenGeneralInquiry}
          />
        )}
      </main>

      {/* Universal Quiet Footer (NO admin link displayed) */}
      <Footer
        identity={cms.identity}
        customPages={cms.customPages}
        onSelectTab={handleSelectTab}
        onRequestProject={handleOpenGeneralInquiry}
        onOpenCustomPage={handleOpenCustomPage}
      />

      {/* Global Modals */}

      {/* 1. Project Inquiry Modal */}
      <InquiryModal
        isOpen={inquiryModalOpen}
        onClose={() => {
          setInquiryModalOpen(false);
          setPrefillProject(null);
          setPrefillService(undefined);
        }}
        prefillProject={prefillProject}
        prefillService={prefillService}
        onSuccess={() => {
          loadMasterData();
        }}
      />

      {/* 2. Project Detail Specification Modal */}
      <ProjectDetailModal
        project={selectedProjectDetail}
        onClose={() => setSelectedProjectDetail(null)}
        onLaunchDemo={(p) => {
          setSelectedProjectDetail(null);
          setSimulatorProject(p);
        }}
        onRequestCustomization={(p) => {
          setSelectedProjectDetail(null);
          handleOpenProjectInquiry(p);
        }}
        relatedProjects={
          selectedProjectDetail
            ? projects.filter(
                (p) =>
                  p.id !== selectedProjectDetail.id &&
                  p.solutionType === selectedProjectDetail.solutionType
              )
            : []
        }
        onSelectProject={(p) => setSelectedProjectDetail(p)}
      />

      {/* 3. Interactive Sandbox Simulator Modal */}
      {simulatorProject && (
        <InteractiveSimulatorModal
          projectName={simulatorProject.name}
          simulatorType={simulatorProject.interactiveSimulator || 'clinic'}
          onClose={() => setSimulatorProject(null)}
          onRequestQuote={() => {
            const p = simulatorProject;
            setSimulatorProject(null);
            handleOpenProjectInquiry(p);
          }}
        />
      )}

    </div>
  );
}
