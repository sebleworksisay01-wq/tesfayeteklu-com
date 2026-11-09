import React, { useState } from 'react';
import { CmsConfig, AboutUsConfig, AboutValueItem, AboutAchievementItem } from '../../types/cms';
import { 
  Save, Sparkles, Plus, Trash2, Upload, AlertCircle, 
  CheckCircle2, Compass, Eye, ShieldCheck, Cpu, Award
} from 'lucide-react';
import { uploadFileToStorage } from '../../services/api';

interface AboutUsManagerTabProps {
  cms: CmsConfig;
  onSaveCms: (partial: Partial<CmsConfig>, message?: string) => Promise<void>;
  saving: boolean;
}

export const AboutUsManagerTab: React.FC<AboutUsManagerTabProps> = ({
  cms,
  onSaveCms,
  saving,
}) => {
  const [aboutState, setAboutState] = useState<AboutUsConfig>(
    cms.aboutUs || {
      title: 'Engineering Scalable Digital Ecosystems for Africa & Global Scale',
      subtitle: 'TesfayeTech is a premier software engineering and cloud architecture firm.',
      badgeText: 'About TesfayeTech',
      mission: 'To empower organizations across Ethiopia, East Africa, and globally with resilient software architectures.',
      vision: 'To be the benchmark technology partner transforming African enterprises into world-class digital competitors.',
      companyStory: 'Founded by Tesfaye Teklu, TesfayeTech was established to bridge enterprise-grade cloud capabilities with rapid software delivery.',
      corePillars: [],
      achievements: [],
      technicalCapabilities: [],
    }
  );

  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'pillars' | 'achievements' | 'tech'>('overview');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploading(true);

    try {
      const res = await uploadFileToStorage(file, 'branding');
      setAboutState({
        ...aboutState,
        bannerImage: res.downloadUrl,
      });
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Banner upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSave = async () => {
    await onSaveCms(
      {
        aboutUs: {
          ...aboutState,
          updatedAt: new Date().toISOString(),
        },
      },
      'About Us page content successfully updated and published.'
    );
  };

  // Core Pillars helpers
  const handleAddPillar = () => {
    const newPillar: AboutValueItem = {
      id: `pillar-${Date.now()}`,
      title: 'Architectural Excellence',
      description: 'Designing fault-tolerant, horizontally scalable distributed backends.',
      iconName: 'ShieldCheck',
    };
    setAboutState({
      ...aboutState,
      corePillars: [...(aboutState.corePillars || []), newPillar],
    });
  };

  const handleUpdatePillar = (id: string, updates: Partial<AboutValueItem>) => {
    setAboutState({
      ...aboutState,
      corePillars: (aboutState.corePillars || []).map((p) => (p.id === id ? { ...p, ...updates } : p)),
    });
  };

  const handleDeletePillar = (id: string) => {
    setAboutState({
      ...aboutState,
      corePillars: (aboutState.corePillars || []).filter((p) => p.id !== id),
    });
  };

  // Achievements helpers
  const handleAddAchievement = () => {
    const newAch: AboutAchievementItem = {
      id: `ach-${Date.now()}`,
      metric: '99.99%',
      label: 'Production Uptime SLA Across Enterprise Deployments',
    };
    setAboutState({
      ...aboutState,
      achievements: [...(aboutState.achievements || []), newAch],
    });
  };

  const handleUpdateAchievement = (id: string, updates: Partial<AboutAchievementItem>) => {
    setAboutState({
      ...aboutState,
      achievements: (aboutState.achievements || []).map((a) => (a.id === id ? { ...a, ...updates } : a)),
    });
  };

  const handleDeleteAchievement = (id: string) => {
    setAboutState({
      ...aboutState,
      achievements: (aboutState.achievements || []).filter((a) => a.id !== id),
    });
  };

  // Tech capabilities helpers
  const handleAddTech = () => {
    setAboutState({
      ...aboutState,
      technicalCapabilities: [
        ...(aboutState.technicalCapabilities || []),
        { category: 'Cloud & DevOps', technologies: 'Google Cloud, Docker, Kubernetes, Terraform, CI/CD' },
      ],
    });
  };

  const handleUpdateTech = (index: number, key: 'category' | 'technologies', val: string) => {
    const list = [...(aboutState.technicalCapabilities || [])];
    list[index] = { ...list[index], [key]: val };
    setAboutState({ ...aboutState, technicalCapabilities: list });
  };

  const handleDeleteTech = (index: number) => {
    setAboutState({
      ...aboutState,
      technicalCapabilities: (aboutState.technicalCapabilities || []).filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Top Banner & Save Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-2xs font-bold uppercase tracking-wider mb-1">
            <Compass className="w-3 h-3" />
            Module 3 &bull; Dynamic Content
          </div>
          <h2 className="text-xl font-bold text-slate-900">About Us Page Management</h2>
          <p className="text-xs text-slate-500">
            Control the mission, vision, narrative, core pillars, verified metrics, and tech stacks displayed on the public About page.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Publishing Changes...' : 'Publish About Us'}
        </button>
      </div>

      {uploadError && (
        <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Sub tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeSubTab === 'overview'
              ? 'bg-blue-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Company Story & Vision
        </button>
        <button
          onClick={() => setActiveSubTab('pillars')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'pillars'
              ? 'bg-blue-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Core Pillars ({aboutState.corePillars?.length || 0})
        </button>
        <button
          onClick={() => setActiveSubTab('achievements')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'achievements'
              ? 'bg-blue-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          Achievements ({aboutState.achievements?.length || 0})
        </button>
        <button
          onClick={() => setActiveSubTab('tech')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'tech'
              ? 'bg-blue-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          Tech Capabilities ({aboutState.technicalCapabilities?.length || 0})
        </button>
      </div>

      {/* Subtab 1: Story & Vision */}
      {activeSubTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Page Badge Text
              </label>
              <input
                type="text"
                value={aboutState.badgeText || ''}
                onChange={(e) => setAboutState({ ...aboutState, badgeText: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. About TesfayeTech"
              />
            </div>

            <div>
              <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Main Page Title
              </label>
              <input
                type="text"
                value={aboutState.title || ''}
                onChange={(e) => setAboutState({ ...aboutState, title: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Page Subtitle
              </label>
              <textarea
                rows={2}
                value={aboutState.subtitle || ''}
                onChange={(e) => setAboutState({ ...aboutState, subtitle: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mission Statement
                </label>
                <textarea
                  rows={4}
                  value={aboutState.mission || ''}
                  onChange={(e) => setAboutState({ ...aboutState, mission: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Vision Statement
                </label>
                <textarea
                  rows={4}
                  value={aboutState.vision || ''}
                  onChange={(e) => setAboutState({ ...aboutState, vision: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Company Narrative & Story
              </label>
              <textarea
                rows={5}
                value={aboutState.companyStory || ''}
                onChange={(e) => setAboutState({ ...aboutState, companyStory: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Banner Image Card */}
          <div className="space-y-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">About Banner Image</h3>
              {aboutState.bannerImage ? (
                <div className="rounded-xl overflow-hidden border border-slate-200 relative group aspect-video bg-slate-100">
                  <img
                    src={aboutState.bannerImage}
                    alt="About banner preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <button
                      onClick={() => setAboutState({ ...aboutState, bannerImage: '' })}
                      className="px-3 py-1.5 bg-red-600 text-white text-2xs rounded-lg font-medium hover:bg-red-700"
                    >
                      Remove Banner
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center text-slate-400">
                  <p className="text-xs">No banner image set</p>
                </div>
              )}

              <div className="mt-4">
                <label className="block text-2xs font-semibold text-slate-600 mb-1">Upload New Banner</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerUpload}
                  disabled={uploading}
                  className="w-full text-2xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-2xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
                {uploading && <p className="text-2xs text-blue-600 mt-1">Uploading to Firebase Storage...</p>}
              </div>

              <div className="mt-4">
                <label className="block text-2xs font-semibold text-slate-600 mb-1">Or Direct Image URL</label>
                <input
                  type="url"
                  value={aboutState.bannerImage || ''}
                  onChange={(e) => setAboutState({ ...aboutState, bannerImage: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl">
              <p className="text-2xs text-blue-900 leading-relaxed">
                Tip: High-resolution horizontal photos (1920x1080) showcasing modern software engineering workspaces work best.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 2: Core Pillars */}
      {activeSubTab === 'pillars' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Core Engineering Pillars</h3>
              <p className="text-xs text-slate-500">Values and foundational principles that drive all client deliverables.</p>
            </div>
            <button
              onClick={handleAddPillar}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Pillar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {(aboutState.corePillars || []).map((pillar, idx) => (
              <div key={pillar.id || idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider">Pillar #{idx + 1}</span>
                  <button
                    onClick={() => handleDeletePillar(pillar.id)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div>
                  <label className="block text-2xs font-semibold text-slate-600 mb-1">Title</label>
                  <input
                    type="text"
                    value={pillar.title}
                    onChange={(e) => handleUpdatePillar(pillar.id, { title: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-2xs font-semibold text-slate-600 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={pillar.description}
                    onChange={(e) => handleUpdatePillar(pillar.id, { description: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subtab 3: Achievements */}
      {activeSubTab === 'achievements' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Key Achievements & Track Record</h3>
              <p className="text-xs text-slate-500">Verified impact metrics displayed in the milestones highlight grid.</p>
            </div>
            <button
              onClick={handleAddAchievement}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Milestone
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {(aboutState.achievements || []).map((ach, idx) => (
              <div key={ach.id || idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider">Milestone #{idx + 1}</span>
                  <button
                    onClick={() => handleDeleteAchievement(ach.id)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div>
                  <label className="block text-2xs font-semibold text-slate-600 mb-1">Metric Value</label>
                  <input
                    type="text"
                    value={ach.metric}
                    onChange={(e) => handleUpdateAchievement(ach.id, { metric: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-extrabold text-blue-600 text-center"
                    placeholder="e.g. 50+"
                  />
                </div>
                <div>
                  <label className="block text-2xs font-semibold text-slate-600 mb-1">Label</label>
                  <input
                    type="text"
                    value={ach.label}
                    onChange={(e) => handleUpdateAchievement(ach.id, { label: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800"
                    placeholder="e.g. Projects Delivered"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subtab 4: Tech Capabilities */}
      {activeSubTab === 'tech' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Technical Capabilities</h3>
              <p className="text-xs text-slate-500">Domain stacks and architectural frameworks mastered by TesfayeTech.</p>
            </div>
            <button
              onClick={handleAddTech}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Capability Category
            </button>
          </div>

          <div className="space-y-3 pt-2">
            {(aboutState.technicalCapabilities || []).map((tech, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="w-full md:w-1/3">
                  <label className="block text-2xs font-semibold text-slate-600 mb-1">Category Name</label>
                  <input
                    type="text"
                    value={tech.category}
                    onChange={(e) => handleUpdateTech(idx, 'category', e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900"
                    placeholder="e.g. Cloud & Serverless"
                  />
                </div>
                <div className="w-full md:w-2/3">
                  <label className="block text-2xs font-semibold text-slate-600 mb-1">Frameworks & Technologies</label>
                  <input
                    type="text"
                    value={tech.technologies}
                    onChange={(e) => handleUpdateTech(idx, 'technologies', e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800"
                    placeholder="e.g. Google Cloud, Firebase, Docker, PostgreSQL"
                  />
                </div>
                <button
                  onClick={() => handleDeleteTech(idx)}
                  className="p-2 text-slate-400 hover:text-red-600 rounded transition-colors self-end md:self-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
