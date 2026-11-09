import React, { useState } from 'react';
import { CmsConfig, MetricItem, HomePageSectionVisibility } from '../../types/cms';
import { 
  Save, Eye, EyeOff, Plus, Trash2, ArrowUp, ArrowDown, 
  Upload, Sparkles, Layout, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { uploadFileToStorage } from '../../services/api';

interface HomepageManagerTabProps {
  cms: CmsConfig;
  onSaveCms: (partial: Partial<CmsConfig>, message?: string) => Promise<void>;
  saving: boolean;
}

export const HomepageManagerTab: React.FC<HomepageManagerTabProps> = ({
  cms,
  onSaveCms,
  saving,
}) => {
  const [homeState, setHomeState] = useState(cms.home);
  const [identityState, setIdentityState] = useState(cms.identity);
  const [activeSubTab, setActiveSubTab] = useState<'hero' | 'sections' | 'metrics' | 'headlines'>('hero');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const visibility = homeState.sectionVisibility || {
    hero: true,
    metrics: true,
    categories: true,
    featuredDemos: true,
    process: true,
    whyUs: true,
    testimonials: true,
    clients: true,
    faq: true,
    contactCta: true,
  };

  const toggleSection = (sectionKey: keyof HomePageSectionVisibility) => {
    setHomeState({
      ...homeState,
      sectionVisibility: {
        ...visibility,
        [sectionKey]: !visibility[sectionKey],
      },
    });
  };

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploading(true);

    try {
      const res = await uploadFileToStorage(file, 'branding');
      setHomeState({
        ...homeState,
        hero: {
          ...homeState.hero,
          imageUrl: res.downloadUrl,
        },
      });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to upload hero image.');
    } finally {
      setUploading(false);
    }
  };

  // Metrics editing
  const addMetric = () => {
    const newMetric: MetricItem = {
      id: 'm-' + Date.now(),
      value: '100%',
      label: 'New Achievement',
      subtext: 'Operational KPI',
    };
    setHomeState({
      ...homeState,
      metrics: [...(homeState.metrics || []), newMetric],
    });
  };

  const updateMetric = (id: string, updates: Partial<MetricItem>) => {
    setHomeState({
      ...homeState,
      metrics: (homeState.metrics || []).map((m) => (m.id === id ? { ...m, ...updates } : m)),
    });
  };

  const removeMetric = (id: string) => {
    setHomeState({
      ...homeState,
      metrics: (homeState.metrics || []).filter((m) => m.id !== id),
    });
  };

  const handleSave = async () => {
    await onSaveCms({
      home: homeState,
      identity: identityState,
    }, 'Homepage layout and hero content updated');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Top Bar with Subtabs & Save */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Homepage Content & Section Architecture</h2>
          <p className="text-xs text-slate-500">Configure hero graphics, section visibility, headlines, and statistics</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Publishing Changes...' : 'Save & Publish Homepage'}</span>
          </button>
        </div>
      </div>

      {/* Subtab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('hero')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeSubTab === 'hero' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Hero Banner & CTAs
        </button>
        <button
          onClick={() => setActiveSubTab('sections')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeSubTab === 'sections' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Section Visibility & Layout
        </button>
        <button
          onClick={() => setActiveSubTab('metrics')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeSubTab === 'metrics' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Statistics & Counters ({homeState.metrics?.length || 0})
        </button>
        <button
          onClick={() => setActiveSubTab('headlines')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeSubTab === 'headlines' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Section Headlines & Copy
        </button>
      </div>

      {/* ===================================================================== */}
      {/* 1. HERO EDITOR                                                        */}
      {/* ===================================================================== */}
      {activeSubTab === 'hero' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Hero Top Kicker / Badge Text
                </label>
                <input
                  type="text"
                  value={homeState.hero.badgeText}
                  onChange={(e) => setHomeState({
                    ...homeState,
                    hero: { ...homeState.hero, badgeText: e.target.value }
                  })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Primary Headline (H1)
                </label>
                <textarea
                  rows={3}
                  value={homeState.hero.headline}
                  onChange={(e) => setHomeState({
                    ...homeState,
                    hero: { ...homeState.hero, headline: e.target.value }
                  })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Subtitle Description
                </label>
                <textarea
                  rows={4}
                  value={homeState.hero.subtitle}
                  onChange={(e) => setHomeState({
                    ...homeState,
                    hero: { ...homeState.hero, subtitle: e.target.value }
                  })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Primary CTA Text
                  </label>
                  <input
                    type="text"
                    value={homeState.hero.primaryCtaText}
                    onChange={(e) => setHomeState({
                      ...homeState,
                      hero: { ...homeState.hero, primaryCtaText: e.target.value }
                    })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Secondary CTA Text
                  </label>
                  <input
                    type="text"
                    value={homeState.hero.secondaryCtaText}
                    onChange={(e) => setHomeState({
                      ...homeState,
                      hero: { ...homeState.hero, secondaryCtaText: e.target.value }
                    })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* Right: Hero Image Preview & Upload */}
            <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-700">
                Hero Featured Artwork / Mockup
              </label>

              <div className="relative border border-slate-200 rounded-2xl overflow-hidden bg-slate-100 aspect-video flex items-center justify-center">
                {homeState.hero.imageUrl ? (
                  <img
                    src={homeState.hero.imageUrl}
                    alt="Hero preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-slate-400">No image assigned</span>
                )}
              </div>

              <div>
                <label className="block text-2xs font-semibold text-slate-500 mb-1">
                  Direct Image URL
                </label>
                <input
                  type="text"
                  value={homeState.hero.imageUrl}
                  onChange={(e) => setHomeState({
                    ...homeState,
                    hero: { ...homeState.hero, imageUrl: e.target.value }
                  })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploading ? 'Uploading to Firebase Storage...' : 'Upload New Hero Graphic'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleHeroImageUpload}
                    className="hidden"
                  />
                </label>
                {uploadError && <p className="text-2xs text-red-600 mt-1">{uploadError}</p>}
              </div>

              <div>
                <label className="block text-2xs font-semibold text-slate-500 mb-1">
                  Artwork Caption
                </label>
                <input
                  type="text"
                  value={homeState.hero.imageCaption}
                  onChange={(e) => setHomeState({
                    ...homeState,
                    hero: { ...homeState.hero, imageCaption: e.target.value }
                  })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                />
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. SECTION VISIBILITY                                                 */}
      {/* ===================================================================== */}
      {activeSubTab === 'sections' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
          <p className="text-xs text-slate-500">
            Toggle visibility to display or hide sections on the live public homepage.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
            {[
              { key: 'hero', label: '1. Hero Banner Section' },
              { key: 'metrics', label: '2. Statistics & KPI Metrics' },
              { key: 'categories', label: '3. Specialized Solutions Grid' },
              { key: 'featuredDemos', label: '4. Featured Portfolio Prototypes' },
              { key: 'process', label: '5. 6-Stage Engineering Process' },
              { key: 'whyUs', label: '6. Why Choose TesfayeTech' },
              { key: 'testimonials', label: '7. Testimonials & Outcomes' },
              { key: 'clients', label: '8. Clients & Partners Logos' },
              { key: 'faq', label: '9. Frequently Asked Questions' },
              { key: 'contactCta', label: '10. Bottom Contact Banner' },
            ].map(({ key, label }) => {
              const isVis = visibility[key as keyof HomePageSectionVisibility];
              return (
                <div
                  key={key}
                  onClick={() => toggleSection(key as keyof HomePageSectionVisibility)}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer select-none ${
                    isVis 
                      ? 'bg-blue-50/60 border-blue-200 text-blue-900' 
                      : 'bg-slate-50 border-slate-200 text-slate-400 opacity-75'
                  }`}
                >
                  <span className="text-xs font-semibold">{label}</span>
                  {isVis ? (
                    <Eye className="w-4 h-4 text-blue-600" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 3. STATISTICS & COUNTERS                                              */}
      {/* ===================================================================== */}
      {activeSubTab === 'metrics' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Homepage Performance Metrics</h3>
            <button
              onClick={addMetric}
              className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Counter</span>
            </button>
          </div>

          <div className="space-y-3 pt-2">
            {(homeState.metrics || []).map((metric, idx) => (
              <div
                key={metric.id}
                className="p-4 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
              >
                <div className="sm:col-span-1 text-xs font-mono font-bold text-slate-400">
                  #{idx + 1}
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-3xs font-semibold text-slate-500 mb-0.5">Counter Value</label>
                  <input
                    type="text"
                    value={metric.value}
                    onChange={(e) => updateMetric(metric.id, { value: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-bold"
                  />
                </div>
                <div className="sm:col-span-4">
                  <label className="block text-3xs font-semibold text-slate-500 mb-0.5">Metric Label</label>
                  <input
                    type="text"
                    value={metric.label}
                    onChange={(e) => updateMetric(metric.id, { label: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-3xs font-semibold text-slate-500 mb-0.5">Subtext</label>
                  <input
                    type="text"
                    value={metric.subtext || ''}
                    onChange={(e) => updateMetric(metric.id, { subtext: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="sm:col-span-1 text-right">
                  <button
                    onClick={() => removeMetric(metric.id)}
                    className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 4. HEADLINES & COPY                                                   */}
      {/* ===================================================================== */}
      {activeSubTab === 'headlines' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
          
          {/* Featured Demos Header */}
          <div className="space-y-3 pb-4 border-b border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Featured Solution Prototypes Section
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-2xs font-semibold text-slate-600 mb-1">Kicker</label>
                <input
                  type="text"
                  value={homeState.featuredDemosSection.kicker}
                  onChange={(e) => setHomeState({
                    ...homeState,
                    featuredDemosSection: { ...homeState.featuredDemosSection, kicker: e.target.value }
                  })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-2xs font-semibold text-slate-600 mb-1">Title</label>
                <input
                  type="text"
                  value={homeState.featuredDemosSection.title}
                  onChange={(e) => setHomeState({
                    ...homeState,
                    featuredDemosSection: { ...homeState.featuredDemosSection, title: e.target.value }
                  })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-2xs font-semibold text-slate-600 mb-1">Description</label>
              <textarea
                rows={2}
                value={homeState.featuredDemosSection.description}
                onChange={(e) => setHomeState({
                  ...homeState,
                  featuredDemosSection: { ...homeState.featuredDemosSection, description: e.target.value }
                })}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          {/* Process Section Header */}
          <div className="space-y-3 pb-4 border-b border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              6-Stage Development Process Section
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-2xs font-semibold text-slate-600 mb-1">Title</label>
                <input
                  type="text"
                  value={homeState.processSection.title}
                  onChange={(e) => setHomeState({
                    ...homeState,
                    processSection: { ...homeState.processSection, title: e.target.value }
                  })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-2xs font-semibold text-slate-600 mb-1">Description</label>
                <input
                  type="text"
                  value={homeState.processSection.description}
                  onChange={(e) => setHomeState({
                    ...homeState,
                    processSection: { ...homeState.processSection, description: e.target.value }
                  })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Contact Banner Header */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Bottom Contact Banner
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-2xs font-semibold text-slate-600 mb-1">Headline</label>
                <input
                  type="text"
                  value={homeState.contactBanner.headline}
                  onChange={(e) => setHomeState({
                    ...homeState,
                    contactBanner: { ...homeState.contactBanner, headline: e.target.value }
                  })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-2xs font-semibold text-slate-600 mb-1">Description</label>
                <input
                  type="text"
                  value={homeState.contactBanner.description}
                  onChange={(e) => setHomeState({
                    ...homeState,
                    contactBanner: { ...homeState.contactBanner, description: e.target.value }
                  })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
