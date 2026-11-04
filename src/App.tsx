/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Project } from './types';
import { CmsConfig, CustomPage } from './types/cms';
import { fetchProjects, fetchCmsConfig, verifyAdmin, getAuthToken, testConnection, subscribeToAuthState } from './services/api';
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
import { AdminLoginPage } from './views/AdminLoginPage';
import { BlogArticle } from './types/cms';

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
    if (path.startsWith('/admin')) return { tab: 'admin', blogSlug: null, pageSlug: null };
    return { tab: 'not-found', blogSlug: null, pageSlug: null };
  };

  const initialRoute = parsePath(window.location.pathname);
  const [currentTab, setCurrentTab] = useState<string>(initialRoute.tab);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [cms, setCms] = useState<CmsConfig>(DEFAULT_CMS_CONFIG);
  const [loading, setLoading] = useState<boolean>(true);

  // URL Path & Admin Authentication State
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => Boolean(getAuthToken()));
  const [authChecking, setAuthChecking] = useState<boolean>(true);

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
      if (authState.isAuthenticatedAdmin) {
        setIsAdminLoggedIn(true);
      }
      setAuthChecking(false);
    });

    // Listen to browser URL changes (e.g. forward/back buttons or history changes)
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
      setAuthChecking(true);
      const res = await verifyAdmin();
      setIsAdminLoggedIn(Boolean(res.authenticated));
    } catch {
      setIsAdminLoggedIn(false);
    } finally {
      setAuthChecking(false);
    }
  };

  const navigateToAdmin = () => {
    window.history.pushState({}, '', '/admin');
    setCurrentPath('/admin');
  };

  const navigateToAdminLogin = () => {
    window.history.pushState({}, '', '/admin/login');
    setCurrentPath('/admin/login');
  };

  const exitAdmin = () => {
    window.history.pushState({}, '', '/');
    setCurrentPath('/');
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
  // Secure Admin Routing Logic
  // ---------------------------------------------------------------------------
  const isExplicitAdminLogin = currentPath === '/admin/login';
  const isExplicitAdminDashboard = currentPath === '/admin' || window.location.hash === '#admin';

  if (isExplicitAdminLogin) {
    // If already authenticated, redirect to /admin dashboard
    if (isAdminLoggedIn) {
      window.history.replaceState({}, '', '/admin');
      return (
        <AdminCMS
          onExit={exitAdmin}
          onLogout={() => {
            setIsAdminLoggedIn(false);
            navigateToAdminLogin();
          }}
          onPreviewPublicSite={() => {
            setCurrentPath('/');
            window.history.pushState({}, '', '/');
          }}
          onRefreshData={loadMasterData}
        />
      );
    }

    // Unauthenticated: render the dedicated Administrator Login Page
    return (
      <AdminLoginPage
        identity={cms.identity}
        onLoginSuccess={() => {
          setIsAdminLoggedIn(true);
          window.history.pushState({}, '', '/admin');
          setCurrentPath('/admin');
        }}
        onReturnToSite={exitAdmin}
      />
    );
  }

  if (isExplicitAdminDashboard) {
    // If unauthenticated (and finished checking), redirect to /admin/login
    if (!isAdminLoggedIn && !authChecking) {
      window.history.replaceState({}, '', '/admin/login');
      return (
        <AdminLoginPage
          identity={cms.identity}
          onLoginSuccess={() => {
            setIsAdminLoggedIn(true);
            window.history.pushState({}, '', '/admin');
            setCurrentPath('/admin');
          }}
          onReturnToSite={exitAdmin}
        />
      );
    }

    // Authenticated: Render Admin CMS Dashboard
    return (
      <AdminCMS
        onExit={exitAdmin}
        onLogout={() => {
          setIsAdminLoggedIn(false);
          navigateToAdminLogin();
        }}
        onPreviewPublicSite={() => {
          setCurrentPath('/');
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
      {isAdminLoggedIn && (
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

      {/* Universal Public Top Navigation Bar (NO admin links displayed to regular visitors) */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        onRequestProject={handleOpenGeneralInquiry}
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
