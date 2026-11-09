import React, { useState } from 'react';
import { CmsConfig, NavigationConfig, NavigationMenuItem } from '../../types/cms';
import { 
  Save, Plus, Trash2, ArrowUp, ArrowDown, Eye, EyeOff, 
  Menu, Compass, ExternalLink, Sparkles, CheckCircle2
} from 'lucide-react';

interface NavigationManagerTabProps {
  cms: CmsConfig;
  onSaveCms: (partial: Partial<CmsConfig>, message?: string) => Promise<void>;
  saving: boolean;
}

export const NavigationManagerTab: React.FC<NavigationManagerTabProps> = ({
  cms,
  onSaveCms,
  saving,
}) => {
  const [navConfig, setNavConfig] = useState<NavigationConfig>(
    cms.navigation || {
      items: [
        { id: 'nav-home', label: 'Home', tab: 'home', visible: true, order: 1 },
        { id: 'nav-services', label: 'Services', tab: 'services', visible: true, order: 2 },
        { id: 'nav-about', label: 'About', tab: 'about', visible: true, order: 3 },
        { id: 'nav-contact', label: 'Contact', tab: 'contact', visible: true, order: 4 },
      ],
      ctaButtonText: 'Start a Project',
      ctaDestination: 'inquiry',
      customCtaUrl: '',
    }
  );

  const [editingItem, setEditingItem] = useState<NavigationMenuItem | null>(null);

  const handleSave = async () => {
    await onSaveCms(
      {
        navigation: navConfig,
      },
      'Navigation menu configuration successfully updated.'
    );
  };

  const handleAddItem = () => {
    const newItem: NavigationMenuItem = {
      id: `nav-${Date.now()}`,
      label: 'New Link',
      tab: 'custom',
      url: '',
      isExternal: false,
      visible: true,
      order: navConfig.items.length + 1,
    };
    setNavConfig({
      ...navConfig,
      items: [...navConfig.items, newItem],
    });
  };

  const handleUpdateItem = (id: string, updates: Partial<NavigationMenuItem>) => {
    setNavConfig({
      ...navConfig,
      items: navConfig.items.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    });
  };

  const handleDeleteItem = (id: string) => {
    if (navConfig.items.length <= 1) {
      alert('You must maintain at least one navigation menu item.');
      return;
    }
    setNavConfig({
      ...navConfig,
      items: navConfig.items.filter((item) => item.id !== id),
    });
  };

  const handleMoveOrder = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= navConfig.items.length) return;
    const copy = [...navConfig.items];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);

    const reindexed = copy.map((it, idx) => ({ ...it, order: idx + 1 }));
    setNavConfig({
      ...navConfig,
      items: reindexed,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-2xs font-bold uppercase tracking-wider mb-1">
            <Menu className="w-3 h-3" />
            Module 11 &bull; Header & Navigation
          </div>
          <h2 className="text-xl font-bold text-slate-900">Navigation Menu Management</h2>
          <p className="text-xs text-slate-500">
            Control the top header navigation links, custom external routes, ordering, and the global call-to-action button.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Publishing...' : 'Publish Navigation'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Navigation Items Table / List */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Header Menu Links</h3>
            <button
              onClick={handleAddItem}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Link
            </button>
          </div>

          <div className="space-y-2.5">
            {navConfig.items.map((item, index) => (
              <div
                key={item.id}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 hover:bg-slate-100/60 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="flex flex-col">
                    <button
                      onClick={() => handleMoveOrder(index, 'up')}
                      disabled={index === 0}
                      className="p-0.5 text-slate-400 hover:text-slate-800 disabled:opacity-20"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleMoveOrder(index, 'down')}
                      disabled={index === navConfig.items.length - 1}
                      className="p-0.5 text-slate-400 hover:text-slate-800 disabled:opacity-20"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="font-mono text-2xs font-bold text-slate-400 w-4">{index + 1}</span>
                </div>

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => handleUpdateItem(item.id, { label: e.target.value })}
                    className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900"
                    placeholder="Menu Label"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={item.tab || item.url || ''}
                      onChange={(e) => handleUpdateItem(item.id, { tab: e.target.value, url: e.target.value })}
                      className="flex-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-600"
                      placeholder="tab or /url"
                    />
                    <label className="inline-flex items-center gap-1 text-3xs text-slate-500 whitespace-nowrap cursor-pointer">
                      <input
                        type="checkbox"
                        checked={item.isExternal || false}
                        onChange={(e) => handleUpdateItem(item.id, { isExternal: e.target.checked })}
                        className="rounded"
                      />
                      Ext
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleUpdateItem(item.id, { visible: !item.visible })}
                    className={`p-1.5 rounded-lg transition-colors ${
                      item.visible ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400 bg-slate-200'
                    }`}
                    title={item.visible ? 'Visible' : 'Hidden'}
                  >
                    {item.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                    title="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Global CTA Settings */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5">
            Header Call-to-Action
          </h3>

          <div>
            <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              CTA Button Label
            </label>
            <input
              type="text"
              value={navConfig.ctaButtonText || ''}
              onChange={(e) => setNavConfig({ ...navConfig, ctaButtonText: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
              placeholder="e.g. Start a Project"
            />
          </div>

          <div>
            <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Action Destination
            </label>
            <select
              value={navConfig.ctaDestination || 'inquiry'}
              onChange={(e) => setNavConfig({ ...navConfig, ctaDestination: e.target.value as any })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
            >
              <option value="inquiry">Open Project Proposal Modal (Inquiry)</option>
              <option value="contact">Navigate to Contact Section</option>
              <option value="custom">Custom URL</option>
            </select>
          </div>

          {navConfig.ctaDestination === 'custom' && (
            <div>
              <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Custom Target URL
              </label>
              <input
                type="url"
                value={navConfig.customCtaUrl || ''}
                onChange={(e) => setNavConfig({ ...navConfig, customCtaUrl: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                placeholder="https://..."
              />
            </div>
          )}

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-2xs text-slate-600 leading-relaxed">
            The header CTA is prominently displayed in the top right next to user authentication menus across all screen sizes.
          </div>
        </div>

      </div>

    </div>
  );
};
