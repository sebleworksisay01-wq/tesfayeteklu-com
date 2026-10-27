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
import { InquiryModal } from './components/InquiryModal';
import { ProjectDetailModal } from './components/ProjectDetailModal';
import { InteractiveSimulatorModal } from './components/InteractiveSimulators';
import { AdminCMS } from './components/AdminCMS/AdminCMS';
import { AdminLoginPage } from './views/AdminLoginPage';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [cms, setCms] = useState<CmsConfig>(DEFAULT_CMS_CONFIG);
  const [loading, setLoading] = useState<boolean>(true);

  // URL Path & Admin Authentication State
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => Boolean(getAuthToken()));
  const [authChecking, setAuthChecking] = useState<boolean>(true);

  // Custom page slug state when viewing a CMS legal/custom page
  const [activeCustomPageSlug, setActiveCustomPageSlug] = useState<string | null>(null);

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

      if (path.startsWith('/page/')) {
        const slug = path.replace('/page/', '');
        setActiveCustomPageSlug(slug);
        setCurrentTab('custom-page');
      }
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

  const handleSelectTab = (tab: string) => {
    setActiveCustomPageSlug(null);
    setCurrentTab(tab);
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
          <HomeView
            projects={projects}
            cms={cms}
            onSelectTab={handleSelectTab}
            onRequestProject={handleOpenGeneralInquiry}
            onViewDetails={(proj) => setSelectedProjectDetail(proj)}
            onLaunchDemo={(proj) => setSimulatorProject(proj)}
            onRequestSimilar={handleOpenProjectInquiry}
          />
        )}

        {currentTab === 'websites' && (
          <PortfolioView
            projects={projects}
            defaultSolutionType="Website Design"
            title="Website Design & Digital Experience Portfolio"
            description="High-converting corporate company profiles, consulting websites, e-commerce storefronts, hotel booking engines, and responsive web portals."
            onViewDetails={(proj) => setSelectedProjectDetail(proj)}
            onLaunchDemo={(proj) => setSimulatorProject(proj)}
            onRequestSimilar={handleOpenProjectInquiry}
          />
        )}

        {currentTab === 'mobile' && (
          <PortfolioView
            projects={projects}
            defaultSolutionType="Mobile Application Development"
            title="Mobile Application Development Portfolio"
            description="Native iOS and Android mobile solutions including banking & payment apps, food ordering, healthcare appointment booking, loyalty platforms, and field logistics."
            onViewDetails={(proj) => setSelectedProjectDetail(proj)}
            onLaunchDemo={(proj) => setSimulatorProject(proj)}
            onRequestSimilar={handleOpenProjectInquiry}
          />
        )}

        {currentTab === 'webapps' && (
          <PortfolioView
            projects={projects}
            defaultSolutionType="All"
            title="Web Applications, ERP & Systems Marketplace"
            description="Mission-critical enterprise software, HRMS suites, inventory management systems, Point of Sale (POS) registers, clinic portals, and custom CRM platforms."
            onViewDetails={(proj) => setSelectedProjectDetail(proj)}
            onLaunchDemo={(proj) => setSimulatorProject(proj)}
            onRequestSimilar={handleOpenProjectInquiry}
          />
        )}

        {currentTab === 'industries' && (
          <IndustriesView
            projects={projects}
            industries={cms.industries}
            onSelectIndustry={(industry) => {
              setCurrentTab('webapps');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onRequestProject={handleOpenGeneralInquiry}
          />
        )}

        {currentTab === 'services' && (
          <ServicesView
            services={cms.services}
            onRequestQuoteForService={handleOpenServiceInquiry}
          />
        )}

        {currentTab === 'about' && (
          <AboutView
            onRequestProject={handleOpenGeneralInquiry}
          />
        )}

        {currentTab === 'contact' && (
          <ContactView
            identity={cms.identity}
            contactFormConfig={cms.contactForm}
            faqs={cms.home.faqSection?.faqs}
          />
        )}

        {currentTab === 'custom-page' && activeCustomPage && (
          <CustomPageView
            page={activeCustomPage}
            onBack={() => {
              setCurrentTab('home');
              window.history.pushState({}, '', '/');
            }}
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
