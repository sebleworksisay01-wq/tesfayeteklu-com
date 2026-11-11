import React, { useState } from 'react';
import { CmsConfig, NavigationMenuItem } from '../../types/cms';
import { 
  Globe, FileText, Plus, Trash2, ArrowUp, ArrowDown, Save, 
  ExternalLink, CheckCircle2, Shield, Share2, Link as LinkIcon
} from 'lucide-react';

interface NavigationFooterManagerTabProps {
  cms: CmsConfig;
  onSaveCms: (partial: Partial<CmsConfig>, message?: string) => Promise<void>;
  saving: boolean;
}

export const NavigationFooterManagerTab: React.FC<NavigationFooterManagerTabProps> = ({
  cms,
  onSaveCms,
  saving,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'navigation' | 'footer'>('navigation');

  // Navigation State
  const [navItems, setNavItems] = useState<NavigationMenuItem[]>(
    cms.navigation?.items || [
      { id: 'nav-home', label: 'Home', tab: 'home', visible: true, order: 0 },
      { id: 'nav-services', label: 'Services', tab: 'services', visible: true, order: 1 },
      { id: 'nav-portfolio', label: 'Portfolio', tab: 'portfolio', visible: true, order: 2 },
      { id: 'nav-about', label: 'About', tab: 'about', visible: true, order: 3 },
      { id: 'nav-blog', label: 'Blog', tab: 'blog', visible: true, order: 4 },
      { id: 'nav-contact', label: 'Contact', tab: 'contact', visible: true, order: 5 },
    ]
  );
  const [ctaText, setCtaText] = useState(cms.navigation?.ctaButtonText || 'Get Started');
  const [ctaDestination, setCtaDestination] = useState(cms.navigation?.ctaDestination || 'inquiry');

  // Footer & Social Links State
  const [footerSummary, setFooterSummary] = useState(
    cms.identity?.footer?.summary || 
    'Professional software engineering, web application development, and digital transformation in Addis Ababa, Ethiopia.'
  );
  const [copyrightText, setCopyrightText] = useState(
    cms.identity?.footer?.copyrightText || 
    '© 2026 TesfayeTech Solutions. All rights reserved. Professional software engineering and digital transformation.'
  );
  const [socialLinks, setSocialLinks] = useState(
    cms.identity?.socialLinks || {
      linkedin: 'https://linkedin.com/company/tesfayetech',
      github: 'https://github.com/tesfayetech',
      twitter: 'https://twitter.com/tesfayetech',
      youtube: '',
      facebook: '',
      telegram: '',
      instagram: '',
    }
  );

  // New Link modal/input state
  const [newLabel, setNewLabel] = useState('');
  const [newTab, setNewTab] = useState('contact');
  const [newUrl, setNewUrl] = useState('');

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= navItems.length) return;
    const updated = [...navItems];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    // update order numbers
    updated.forEach((item, idx) => { item.order = idx; });
    setNavItems(updated);
  };

  const handleToggleVisibility = (id: string) => {
    const updated = navItems.map((item) =>
      item.id === id ? { ...item, visible: !item.visible } : item
    );
    setNavItems(updated);
  };

  const handleRemove = (id: string) => {
    setNavItems(navItems.filter((i) => i.id !== id));
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) return;

    const newItem: NavigationMenuItem = {
      id: `nav-${Date.now()}`,
      label: newLabel.trim(),
      tab: newTab,
      url: newUrl.trim() || undefined,
      isExternal: Boolean(newUrl.trim() && newUrl.startsWith('http')),
      visible: true,
      order: navItems.length,
    };

    setNavItems([...navItems, newItem]);
    setNewLabel('');
    setNewUrl('');
  };

  const handleSaveAll = async () => {
    const updatedNavigation = {
      ...cms.navigation,
      items: navItems,
      ctaButtonText: ctaText,
      ctaDestination,
    };

    const updatedIdentity = {
      ...cms.identity,
      socialLinks,
      footer: {
        ...cms.identity?.footer,
        summary: footerSummary,
        copyrightText,
        showTrustBadges: false,
      },
    };

    await onSaveCms(
      { navigation: updatedNavigation, identity: updatedIdentity },
      'Navigation menus, footer content, and social links successfully saved.'
    );
  };

  return (
    <div className="space-y-6 max-w-5xl animate-in fade-in duration-150">
      
      {/* Header Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
            <Globe className="w-3.5 h-3.5" />
            <span>Site Menus & Social Channels</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Navigation Menus & Footer Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mt-1">
            Customize header navigation links, reorder menu items, configure header call-to-action buttons, footer summaries, and social media channels.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs shrink-0 transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Publishing Changes...' : 'Save & Publish'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl p-1.5 gap-2 shadow-xs">
        <button
          onClick={() => setActiveSubTab('navigation')}
          className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeSubTab === 'navigation'
              ? 'bg-blue-50 text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Header Navigation Menu</span>
        </button>

        <button
          onClick={() => setActiveSubTab('footer')}
          className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeSubTab === 'footer'
              ? 'bg-blue-50 text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Footer & Social Media Links</span>
        </button>
      </div>

      {activeSubTab === 'navigation' ? (
        /* Header Navigation Tab */
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Current Menu Hierarchy & Order
              </span>
              <span className="text-2xs text-slate-500">
                Visible on desktop navbar and mobile drawer
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {navItems.map((item, index) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => handleMove(index, 'up')}
                        disabled={index === 0}
                        className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(index, 'down')}
                        disabled={index === navItems.length - 1}
                        className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        <span>{item.label}</span>
                        {item.isExternal && (
                          <span className="text-3xs bg-slate-100 text-slate-600 px-1 py-0.5 rounded font-mono">
                            External
                          </span>
                        )}
                      </div>
                      <div className="text-2xs text-slate-400 font-mono">
                        Target tab: {item.tab} {item.url ? `· ${item.url}` : ''}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleVisibility(item.id)}
                      className={`px-2.5 py-1 rounded text-2xs font-semibold cursor-pointer transition-colors ${
                        item.visible
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {item.visible ? 'Visible' : 'Hidden'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemove(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Navigation Link */}
            <form onSubmit={handleAddItem} className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1 w-full">
                <label className="block text-2xs font-semibold text-slate-700 mb-1">Link Label</label>
                <input
                  type="text"
                  placeholder="e.g. Case Studies"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div className="w-full sm:w-44">
                <label className="block text-2xs font-semibold text-slate-700 mb-1">Destination Tab</label>
                <select
                  value={newTab}
                  onChange={(e) => setNewTab(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="home">Home</option>
                  <option value="services">Services</option>
                  <option value="portfolio">Portfolio</option>
                  <option value="about">About Us</option>
                  <option value="blog">Blog</option>
                  <option value="contact">Contact</option>
                </select>
              </div>

              <div className="flex-1 w-full">
                <label className="block text-2xs font-semibold text-slate-700 mb-1">Optional External URL</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shrink-0 cursor-pointer"
              >
                Add Menu Item
              </button>
            </form>
          </div>

          {/* Header CTA Button Settings */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Header Action Button
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Button Text</label>
                <input
                  type="text"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Action / Destination</label>
                <select
                  value={ctaDestination}
                  onChange={(e) => setCtaDestination(e.target.value as any)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="inquiry">Open Project Inquiry Modal</option>
                  <option value="contact">Navigate to Contact Section</option>
                  <option value="custom">Custom URL</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Footer & Social Media Tab */
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Footer Description & Copyright
            </span>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Footer Brand Summary
              </label>
              <textarea
                rows={2}
                value={footerSummary}
                onChange={(e) => setFooterSummary(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Centered Copyright Notice
              </label>
              <input
                type="text"
                value={copyrightText}
                onChange={(e) => setCopyrightText(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Social Media Channels & Profiles
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">LinkedIn Company URL</label>
                <input
                  type="url"
                  value={socialLinks.linkedin || ''}
                  onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg"
                  placeholder="https://linkedin.com/company/..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">GitHub Organization URL</label>
                <input
                  type="url"
                  value={socialLinks.github || ''}
                  onChange={(e) => setSocialLinks({ ...socialLinks, github: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg"
                  placeholder="https://github.com/..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Twitter / X Profile URL</label>
                <input
                  type="url"
                  value={socialLinks.twitter || ''}
                  onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg"
                  placeholder="https://twitter.com/..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Telegram Channel / Contact</label>
                <input
                  type="url"
                  value={socialLinks.telegram || ''}
                  onChange={(e) => setSocialLinks({ ...socialLinks, telegram: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg"
                  placeholder="https://t.me/..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">YouTube Channel URL</label>
                <input
                  type="url"
                  value={socialLinks.youtube || ''}
                  onChange={(e) => setSocialLinks({ ...socialLinks, youtube: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg"
                  placeholder="https://youtube.com/@..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Facebook Page URL</label>
                <input
                  type="url"
                  value={socialLinks.facebook || ''}
                  onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg"
                  placeholder="https://facebook.com/..."
                />
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
