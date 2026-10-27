import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { GlobalSiteIdentity, NavigationConfig } from '../types/cms';

export type NavTab = 
  | 'home' 
  | 'websites' 
  | 'mobile' 
  | 'webapps' 
  | 'industries' 
  | 'services' 
  | 'about' 
  | 'contact';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onRequestProject: () => void;
  identity?: GlobalSiteIdentity;
  navigation?: NavigationConfig;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onRequestProject,
  identity,
  navigation
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (tab: string) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItems = (navigation?.items || [
    { id: 'nav-home', label: 'Home', tab: 'home', visible: true, order: 1 },
    { id: 'nav-websites', label: 'Website Design', tab: 'websites', visible: true, order: 2 },
    { id: 'nav-mobile', label: 'Mobile Apps', tab: 'mobile', visible: true, order: 3 },
    { id: 'nav-webapps', label: 'Web Applications', tab: 'webapps', visible: true, order: 4 },
    { id: 'nav-industries', label: 'Industries', tab: 'industries', visible: true, order: 5 },
    { id: 'nav-services', label: 'Services', tab: 'services', visible: true, order: 6 },
    { id: 'nav-about', label: 'About Us', tab: 'about', visible: true, order: 7 },
    { id: 'nav-contact', label: 'Contact', tab: 'contact', visible: true, order: 8 }
  ])
    .filter((item) => item.visible !== false)
    .sort((a, b) => a.order - b.order);

  const companyName = identity?.companyName || 'TesfayeTech';
  const logoText = identity?.logoText || 'TesfayeTech';
  const ctaText = navigation?.ctaButtonText || 'Request a Project';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      
      {/* Optional Top Announcement Bar configured in CMS */}
      {identity?.announcementBar?.enabled && identity.announcementBar.text && (
        <div className="bg-slate-900 text-white text-xs px-4 py-1.5 text-center flex items-center justify-center gap-2">
          <span>{identity.announcementBar.text}</span>
          {identity.announcementBar.linkText && (
            <button
              onClick={onRequestProject}
              className="text-blue-400 hover:text-blue-300 underline font-semibold ml-1 cursor-pointer"
            >
              {identity.announcementBar.linkText}
            </button>
          )}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-18">
          
          {/* Zone 1: Single text element wordmark (or configured logo image) */}
          <button
            onClick={() => handleNav('home')}
            className="flex items-center gap-2 text-left group focus:outline-none shrink-0"
          >
            {identity?.logoUrl ? (
              <img
                src={identity.logoUrl}
                alt={companyName}
                referrerPolicy="no-referrer"
                className="h-8 w-auto object-contain"
              />
            ) : (
              <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors whitespace-nowrap">
                {logoText.includes('Tech') ? (
                  <>
                    {logoText.replace('Tech', '')}
                    <span className="text-blue-600">Tech</span>
                  </>
                ) : (
                  logoText
                )}
              </span>
            )}
          </button>

          {/* Zone 2: Clean single-line text navigation links (Dynamic from CMS) */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.tab)}
                className={`hover:text-slate-900 transition-colors whitespace-nowrap py-1 ${
                  currentTab === item.tab ? 'text-blue-600 font-semibold' : ''
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Zone 3: 1 primary action - Strict Top Bar Contract (NO admin link displayed) */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onRequestProject}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all whitespace-nowrap shrink-0 shadow-sm shadow-blue-500/20"
            >
              {ctaText}
            </button>

            {/* Mobile Hamburger toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Collapsible Navigation Menu (NO admin links displayed) */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-1 shadow-lg animate-in slide-in-from-top-2 duration-200">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.tab)}
              className={`w-full text-left px-3 py-2.5 rounded-md text-sm font-medium ${
                currentTab === item.tab ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onRequestProject();
              }}
              className="w-full py-2.5 bg-blue-600 text-white font-semibold rounded-lg text-xs"
            >
              {ctaText}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
