import React from 'react';
import { Mail, Phone, MapPin, ArrowUpRight, MessageCircle } from 'lucide-react';
import { GlobalSiteIdentity, CustomPage } from '../types/cms';

interface FooterProps {
  identity?: GlobalSiteIdentity;
  customPages?: CustomPage[];
  onSelectTab: (tab: string) => void;
  onRequestProject: () => void;
  onOpenCustomPage?: (slug: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  identity,
  customPages = [],
  onSelectTab,
  onRequestProject,
  onOpenCustomPage
}) => {
  const currentYear = new Date().getFullYear();

  const companyName = identity?.companyName || 'TesfayeTech';
  const logoText = identity?.logoText || 'TesfayeTech';
  const footerSummary = identity?.footer?.summary || identity?.subtagline || 'Engineering high-performance websites, custom web applications, mobile platforms, and enterprise automation software designed to scale organizations.';
  const copyright = identity?.footer?.copyrightText || `© ${currentYear} ${companyName} Solutions. All rights reserved. Professional software engineering and digital transformation.`;

  const footerCustomPages = customPages.filter((p) => p.published && p.showInFooter);

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Brand & Mission Statement */}
          <div className="lg:col-span-1 space-y-4">
            <div className="text-xl font-bold text-white tracking-tight">
              {identity?.logoUrl ? (
                <img src={identity.logoUrl} alt={companyName} className="h-8 w-auto object-contain" />
              ) : (
                <span>
                  {logoText.includes('Tech') ? (
                    <>
                      {logoText.replace('Tech', '')}
                      <span className="text-blue-500">Tech</span>
                    </>
                  ) : (
                    logoText
                  )}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {footerSummary}
            </p>
            <div className="pt-2 text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="truncate">{identity?.email || 'info@tesfayetech.com'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>{identity?.phone || '+1 (800) 456-7890'}</span>
              </div>
              {identity?.whatsapp && (
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>WhatsApp: {identity.whatsapp}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="truncate">{identity?.address || 'Innovation Tower, Level 4'}</span>
              </div>
            </div>
          </div>

          {/* Solutions Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Solutions</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
              <li>
                <button
                  onClick={() => onSelectTab('websites')}
                  className="hover:text-white transition-colors text-left"
                >
                  Website Design
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('mobile')}
                  className="hover:text-white transition-colors text-left"
                >
                  Mobile Application Development
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('webapps')}
                  className="hover:text-white transition-colors text-left"
                >
                  Web Applications & ERP
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('industries')}
                  className="hover:text-white transition-colors text-left"
                >
                  Industry Demos
                </button>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Company</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
              <li>
                <button
                  onClick={() => onSelectTab('about')}
                  className="hover:text-white transition-colors text-left"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('services')}
                  className="hover:text-white transition-colors text-left"
                >
                  Services & Capabilities
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('contact')}
                  className="hover:text-white transition-colors text-left"
                >
                  Contact & Inquiries
                </button>
              </li>
              <li>
                <button
                  onClick={onRequestProject}
                  className="text-blue-400 hover:text-blue-300 transition-colors font-medium text-left flex items-center gap-1"
                >
                  Request a Project <ArrowUpRight className="w-3 h-3" />
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Custom Informational Pages */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Resources & Legal</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
              {footerCustomPages.length > 0 ? (
                footerCustomPages.map((page) => (
                  <li key={page.id}>
                    <button
                      onClick={() => onOpenCustomPage && onOpenCustomPage(page.slug)}
                      className="hover:text-white transition-colors text-left"
                    >
                      {page.title}
                    </button>
                  </li>
                ))
              ) : (
                <>
                  <li>
                    <button
                      onClick={() => onOpenCustomPage && onOpenCustomPage('privacy-policy')}
                      className="hover:text-white transition-colors text-left"
                    >
                      Privacy Policy
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => onOpenCustomPage && onOpenCustomPage('terms-of-service')}
                      className="hover:text-white transition-colors text-left"
                    >
                      Terms of Service
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>

        </div>

        {/* Quiet Bottom Subline (strictly no admin links) */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div>{copyright}</div>
          {identity?.footer?.showTrustBadges !== false && (
            <div className="flex items-center gap-4 text-xs">
              <span>Enterprise-Grade Security</span>
              <span aria-hidden="true">·</span>
              <span>REST API Persistence</span>
              <span aria-hidden="true">·</span>
              <span>WCAG AA Accessible</span>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};
