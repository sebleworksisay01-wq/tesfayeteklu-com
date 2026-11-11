import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, User as UserIcon, Shield, ChevronDown, LogOut, LayoutDashboard, UserCheck } from 'lucide-react';
import { User } from 'firebase/auth';
import { GlobalSiteIdentity, NavigationConfig } from '../types/cms';
import { UserProfile } from '../types';

export type NavTab = 
  | 'home' 
  | 'websites' 
  | 'mobile' 
  | 'webapps' 
  | 'industries' 
  | 'services' 
  | 'about' 
  | 'contact'
  | 'blog'
  | 'account'
  | 'login'
  | 'register';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onRequestProject: () => void;
  onOpenLogin: () => void;
  onOpenRegister?: () => void;
  onOpenAccount?: () => void;
  onOpenAdminCMS?: () => void;
  onLogout?: () => void;
  currentUser?: User | null;
  userProfile?: UserProfile | null;
  isAdmin?: boolean;
  identity?: GlobalSiteIdentity;
  navigation?: NavigationConfig;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onRequestProject,
  onOpenLogin,
  onOpenRegister,
  onOpenAccount,
  onOpenAdminCMS,
  onLogout,
  currentUser,
  userProfile,
  isAdmin = false,
  identity,
  navigation
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleNav = (tab: string) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Top header navigation exclusions: Website Design, Mobile Apps, Web Applications
  const REMOVED_HEADER_TABS = new Set(['websites', 'mobile', 'webapps', 'industries']);
  const REMOVED_HEADER_LABELS = [
    'website design',
    'mobile apps',
    'mobile application',
    'web applications',
    'web application',
    'industries',
  ];

  const baseItems = navigation?.items ? [...navigation.items] : [
    { id: 'nav-home', label: 'Home', tab: 'home', visible: true, order: 1 },
    { id: 'nav-services', label: 'Services', tab: 'services', visible: true, order: 2 },
    { id: 'nav-about', label: 'About Us', tab: 'about', visible: true, order: 3 },
    { id: 'nav-blog', label: 'Blog', tab: 'blog', visible: true, order: 4 },
    { id: 'nav-contact', label: 'Contact', tab: 'contact', visible: true, order: 5 }
  ];

  const navItems = baseItems
    .filter((item) => {
      if (item.visible === false) return false;
      if (REMOVED_HEADER_TABS.has(item.tab.toLowerCase())) return false;
      const lowerLabel = (item.label || '').trim().toLowerCase();
      if (REMOVED_HEADER_LABELS.some((removed) => lowerLabel === removed)) return false;
      return true;
    })
    .sort((a, b) => a.order - b.order);

  const companyName = identity?.companyName || 'TesfayeTech';
  const logoText = identity?.logoText || 'TesfayeTech';
  const ctaText = navigation?.ctaButtonText || 'Request a Project';

  const userDisplayName = userProfile?.fullName || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'My Account';
  const userEmail = userProfile?.email || currentUser?.email || '';

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
        <div className="flex items-center justify-between gap-4 md:gap-8 h-18">
          
          {/* Zone 1: Single text element wordmark (or configured logo image) */}
          <button
            onClick={() => handleNav('home')}
            className="flex items-center gap-2 text-left group focus:outline-none shrink-0 cursor-pointer"
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

          {/* Zone 2: Clean single-line text navigation links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.tab)}
                className={`hover:text-slate-900 transition-colors whitespace-nowrap py-1 cursor-pointer ${
                  currentTab === item.tab ? 'text-blue-600 font-semibold' : ''
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Zone 3: Authentication & Primary Action */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            
            {/* User Profile Menu (when authenticated) */}
            {currentUser && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-medium transition-all shadow-2xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  aria-expanded={userDropdownOpen}
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-2xs uppercase">
                    {userDisplayName.charAt(0)}
                  </div>
                  <span className="max-w-[100px] sm:max-w-[130px] truncate font-semibold text-slate-900">
                    {userDisplayName}
                  </span>
                  {isAdmin && (
                    <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-3xs font-semibold bg-indigo-100 text-indigo-700">
                      Admin
                    </span>
                  )}
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 transition-transform duration-200" style={{ transform: userDropdownOpen ? 'rotate(180deg)' : 'none' }} />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    
                    {/* User Identity Info */}
                    <div className="px-4 py-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {userDisplayName.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {userDisplayName}
                          </p>
                          <p className="text-2xs text-slate-500 truncate">
                            {userEmail}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 text-3xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          <UserCheck className="w-3 h-3 text-emerald-600" />
                          <span>Verified Account</span>
                        </span>
                        {isAdmin && (
                          <span className="inline-flex items-center gap-1 text-3xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                            <Shield className="w-3 h-3 text-indigo-600" />
                            <span>Administrator</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Menu Options */}
                    <div className="py-1">
                      {/* My Account */}
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          if (onOpenAccount) onOpenAccount();
                          else handleNav('account');
                        }}
                        className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        <span>My Account</span>
                      </button>

                      {/* Admin CMS (ADMINISTRATOR ONLY) */}
                      {isAdmin && onOpenAdminCMS && (
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onOpenAdminCMS();
                          }}
                          className="w-full px-4 py-2 text-left text-xs font-semibold text-indigo-600 hover:bg-indigo-50/70 flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <LayoutDashboard className="w-4 h-4 text-indigo-500" />
                          <span>Admin CMS</span>
                        </button>
                      )}
                    </div>

                    {/* Sign Out */}
                    <div className="pt-1 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          if (onLogout) onLogout();
                        }}
                        className="w-full px-4 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>

                  </div>
                )}
              </div>
            )}

            {/* Request a Project Primary CTA Button */}
            <button
              onClick={onRequestProject}
              className="px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all whitespace-nowrap shrink-0 shadow-sm shadow-blue-500/20 cursor-pointer"
            >
              {ctaText}
            </button>

            {/* Mobile Hamburger toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Collapsible Navigation Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-2 shadow-lg animate-in slide-in-from-top-2 duration-200">
          
          {/* Mobile Auth Status Block */}
          {/* Mobile Auth Status Block (when authenticated) */}
          {currentUser && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {userDisplayName.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 truncate">{userDisplayName}</div>
                  <div className="text-2xs text-slate-500 truncate">{userEmail}</div>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200/60 grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenAccount) onOpenAccount();
                    else handleNav('account');
                  }}
                  className="py-1.5 px-2 bg-white border border-slate-200 rounded-lg text-2xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                  <span>My Account</span>
                </button>
                {isAdmin && onOpenAdminCMS ? (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAdminCMS();
                    }}
                    className="py-1.5 px-2 bg-indigo-600 text-white rounded-lg text-2xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-white" />
                    <span>Admin CMS</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (onLogout) onLogout();
                    }}
                    className="py-1.5 px-2 bg-red-50 border border-red-200 rounded-lg text-2xs font-semibold text-red-600 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-500" />
                    <span>Sign Out</span>
                  </button>
                )}
              </div>
              {isAdmin && (
                <div className="mt-2 text-right">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (onLogout) onLogout();
                    }}
                    className="text-3xs text-red-600 hover:underline cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Navigation Links */}
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.tab)}
              className={`w-full text-left px-3 py-2.5 rounded-md text-sm font-medium cursor-pointer ${
                currentTab === item.tab ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}

          {/* CTA In Mobile */}
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onRequestProject();
              }}
              className="w-full py-2.5 bg-blue-600 text-white font-semibold rounded-lg text-xs cursor-pointer shadow-sm"
            >
              {ctaText}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
