import React, { useState } from 'react';
import { CmsConfig, CustomPage } from '../../types/cms';
import { 
  FileText, Plus, Eye, Edit2, Trash2, Globe, CheckCircle2, 
  AlertCircle, ArrowUpRight, Search, Save, X, ExternalLink,
  Layers, Shield, FileCheck, Sliders, ToggleLeft, ToggleRight
} from 'lucide-react';

interface WebsitePagesManagerTabProps {
  cms: CmsConfig;
  onSaveCms: (partial: Partial<CmsConfig>, message?: string) => Promise<void>;
  saving: boolean;
  onNavigateTab: (tabId: string) => void;
  onPreviewSite: () => void;
}

interface StandardPageItem {
  id: string;
  title: string;
  path: string;
  type: 'core' | 'service_hub' | 'legal' | 'custom';
  description: string;
  published: boolean;
  sectionCount?: number;
  lastUpdated?: string;
  managerTab?: string;
}

export const WebsitePagesManagerTab: React.FC<WebsitePagesManagerTabProps> = ({
  cms,
  onSaveCms,
  saving,
  onNavigateTab,
  onPreviewSite,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'core' | 'custom' | 'legal'>('all');
  
  // Custom Page Modal state
  const [editingCustomPage, setEditingCustomPage] = useState<CustomPage | null>(null);
  const [isNewPage, setIsNewPage] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalSlug, setModalSlug] = useState('');
  const [modalContent, setModalContent] = useState('');
  const [modalSeoTitle, setModalSeoTitle] = useState('');
  const [modalSeoDescription, setModalSeoDescription] = useState('');
  const [modalPublished, setModalPublished] = useState(true);
  const [modalShowInFooter, setModalShowInFooter] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const customPages = cms.customPages || [];

  const standardPages: StandardPageItem[] = [
    {
      id: 'page-home',
      title: 'Homepage',
      path: '/',
      type: 'core',
      description: 'Main landing page: Hero banner, metrics, service categories, featured demos, why us, and contact banner.',
      published: true,
      sectionCount: 10,
      managerTab: 'homepage'
    },
    {
      id: 'page-services',
      title: 'Services & Solutions',
      path: '/services',
      type: 'core',
      description: 'Comprehensive software engineering capabilities, deliverables, and service quotation requests.',
      published: true,
      sectionCount: (cms.services || []).length,
      managerTab: 'services'
    },
    {
      id: 'page-portfolio',
      title: 'Portfolio & Interactive Demos',
      path: '/portfolio',
      type: 'core',
      description: 'Showcase of deployed web applications, mobile apps, architecture case studies, and live demos.',
      published: true,
      managerTab: 'portfolio'
    },
    {
      id: 'page-about',
      title: 'About Us & Leadership',
      path: '/about',
      type: 'core',
      description: 'Company history, mission, core values, architectural philosophies, and founder profile.',
      published: true,
      managerTab: 'homepage'
    },
    {
      id: 'page-blog',
      title: 'Blog & Technical Articles',
      path: '/blog',
      type: 'core',
      description: 'Engineering insights, digital transformation guides, and tech analysis articles.',
      published: true,
      sectionCount: (cms.blogArticles || []).length,
      managerTab: 'blog'
    },
    {
      id: 'page-contact',
      title: 'Contact Us & Project Inquiries',
      path: '/contact',
      type: 'core',
      description: 'DirectAdmin SMTP contact gateway, project brief submission, direct lines, and FAQs.',
      published: true,
      managerTab: 'contact'
    },
    {
      id: 'page-privacy',
      title: 'Privacy Policy',
      path: '/page/privacy-policy',
      type: 'legal',
      description: 'Data security standards, client privacy commitments, and intellectual property rights.',
      published: customPages.some(p => p.slug === 'privacy-policy' ? p.published : true),
    },
    {
      id: 'page-terms',
      title: 'Terms of Service',
      path: '/page/terms-of-service',
      type: 'legal',
      description: 'Commercial software engagement terms, milestones, SLA warranties, and delivery standards.',
      published: customPages.some(p => p.slug === 'terms-of-service' ? p.published : true),
    }
  ];

  // Convert custom pages to page item format
  const mappedCustomPages: StandardPageItem[] = customPages.map(cp => ({
    id: cp.id,
    title: cp.title,
    path: `/page/${cp.slug}`,
    type: cp.slug === 'privacy-policy' || cp.slug === 'terms-of-service' ? 'legal' : 'custom',
    description: cp.seoDescription || cp.content.slice(0, 120) + '...',
    published: cp.published,
    lastUpdated: cp.updatedAt
  }));

  // Merge unique pages
  const combinedPages = [
    ...standardPages.filter(sp => !mappedCustomPages.some(m => m.path === sp.path)),
    ...mappedCustomPages
  ];

  const filteredPages = combinedPages.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (filterType === 'all') return true;
    if (filterType === 'core') return p.type === 'core';
    if (filterType === 'custom') return p.type === 'custom';
    if (filterType === 'legal') return p.type === 'legal';
    return true;
  });

  const handleOpenNewPageModal = () => {
    setIsNewPage(true);
    setEditingCustomPage(null);
    setModalTitle('');
    setModalSlug('');
    setModalContent('');
    setModalSeoTitle('');
    setModalSeoDescription('');
    setModalPublished(true);
    setModalShowInFooter(true);
    setFormError(null);
  };

  const handleOpenEditPageModal = (pageItem: StandardPageItem) => {
    const existing = customPages.find(p => `/page/${p.slug}` === pageItem.path || p.id === pageItem.id);
    if (existing) {
      setIsNewPage(false);
      setEditingCustomPage(existing);
      setModalTitle(existing.title);
      setModalSlug(existing.slug);
      setModalContent(existing.content);
      setModalSeoTitle(existing.seoTitle);
      setModalSeoDescription(existing.seoDescription);
      setModalPublished(existing.published);
      setModalShowInFooter(existing.showInFooter);
      setFormError(null);
    } else {
      // Create new custom record for this page
      setIsNewPage(true);
      setEditingCustomPage(null);
      setModalTitle(pageItem.title);
      setModalSlug(pageItem.path.replace('/page/', '').replace('/', ''));
      setModalContent(`# ${pageItem.title}\n\n${pageItem.description}`);
      setModalSeoTitle(`${pageItem.title} | TesfayeTech`);
      setModalSeoDescription(pageItem.description);
      setModalPublished(pageItem.published);
      setModalShowInFooter(true);
      setFormError(null);
    }
  };

  const handleSavePageModal = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanTitle = modalTitle.trim();
    let cleanSlug = modalSlug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    if (!cleanTitle) {
      setFormError('Page title is required.');
      return;
    }
    if (!cleanSlug) {
      cleanSlug = cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    const now = new Date().toISOString();
    let updatedCustomPages: CustomPage[];

    if (isNewPage || !editingCustomPage) {
      // Check for slug duplication
      if (customPages.some(p => p.slug === cleanSlug)) {
        setFormError(`A page with slug "${cleanSlug}" already exists. Please choose a unique slug.`);
        return;
      }
      const newPage: CustomPage = {
        id: `page-${Date.now()}`,
        title: cleanTitle,
        slug: cleanSlug,
        content: modalContent,
        seoTitle: modalSeoTitle || `${cleanTitle} | TesfayeTech`,
        seoDescription: modalSeoDescription || modalContent.slice(0, 150),
        published: modalPublished,
        showInFooter: modalShowInFooter,
        updatedAt: now
      };
      updatedCustomPages = [...customPages, newPage];
    } else {
      updatedCustomPages = customPages.map(p => {
        if (p.id === editingCustomPage.id) {
          return {
            ...p,
            title: cleanTitle,
            slug: cleanSlug,
            content: modalContent,
            seoTitle: modalSeoTitle || `${cleanTitle} | TesfayeTech`,
            seoDescription: modalSeoDescription || modalContent.slice(0, 150),
            published: modalPublished,
            showInFooter: modalShowInFooter,
            updatedAt: now
          };
        }
        return p;
      });
    }

    await onSaveCms({ customPages: updatedCustomPages }, `Page "${cleanTitle}" successfully updated.`);
    setEditingCustomPage(null);
  };

  const handleTogglePublish = async (pageItem: StandardPageItem) => {
    const existing = customPages.find(p => `/page/${p.slug}` === pageItem.path || p.id === pageItem.id);
    if (existing) {
      const updated = customPages.map(p => p.id === existing.id ? { ...p, published: !p.published, updatedAt: new Date().toISOString() } : p);
      await onSaveCms({ customPages: updated }, `Page "${existing.title}" ${!existing.published ? 'published' : 'unpublished'}.`);
    } else {
      // If core page, inform user
      if (pageItem.type === 'core') {
        alert('Core navigation pages (Home, Services, Portfolio, Contact, Blog) are essential for public visitors. You can adjust their sections in their respective builder tabs.');
      }
    }
  };

  const handleDeleteCustomPage = async (pageId: string, pageTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete the custom page "${pageTitle}"? This cannot be undone.`)) return;
    const updated = customPages.filter(p => p.id !== pageId);
    await onSaveCms({ customPages: updated }, `Custom page "${pageTitle}" deleted.`);
  };

  return (
    <div className="space-y-6 max-w-6xl animate-in fade-in duration-150">
      
      {/* Header Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
            <FileText className="w-3.5 h-3.5" />
            <span>Centralized Page & Layout Architecture</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Website Pages & Section Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mt-1">
            Manage all public pages, custom landing pages, policy documents, and per-page layouts across <strong className="text-slate-700">tesfayeteklu.com</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleOpenNewPageModal}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Custom Page</span>
          </button>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search pages by title, URL path, or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(['all', 'core', 'custom', 'legal'] as const).map((ft) => (
            <button
              key={ft}
              onClick={() => setFilterType(ft)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer whitespace-nowrap ${
                filterType === ft
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {ft === 'all' ? 'All Pages' : `${ft} Pages`}
            </button>
          ))}
        </div>
      </div>

      {/* Pages Table / Card Grid */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="divide-y divide-slate-100">
          {filteredPages.map((page) => {
            const isCustom = page.type === 'custom' || customPages.some(cp => `/page/${cp.slug}` === page.path);
            const customRecord = customPages.find(cp => `/page/${cp.slug}` === page.path || cp.id === page.id);

            return (
              <div 
                key={page.id} 
                className="p-5 sm:p-6 hover:bg-slate-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-sm text-slate-900 truncate">
                      {page.title}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-3xs font-mono font-bold uppercase ${
                      page.type === 'core' 
                        ? 'bg-blue-50 text-blue-700' 
                        : page.type === 'legal'
                        ? 'bg-purple-50 text-purple-700'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      {page.type}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-3xs font-semibold flex items-center gap-1 ${
                      page.published 
                        ? 'bg-emerald-100/70 text-emerald-800' 
                        : 'bg-amber-100/70 text-amber-800'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${page.published ? 'bg-emerald-600' : 'bg-amber-600'}`} />
                      <span>{page.published ? 'Published' : 'Draft'}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                    <span className="text-blue-600 font-medium">{page.path}</span>
                    {page.sectionCount !== undefined && (
                      <span className="text-slate-400">· {page.sectionCount} Managed Sections</span>
                    )}
                    {page.lastUpdated && (
                      <span className="text-slate-400">· Updated {new Date(page.lastUpdated).toLocaleDateString()}</span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-1 max-w-2xl leading-relaxed">
                    {page.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                  {page.managerTab ? (
                    <button
                      onClick={() => onNavigateTab(page.managerTab!)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
                      title="Open dedicated builder"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Configure Sections</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenEditPageModal(page)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
                      title="Edit content & layout"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Content</span>
                    </button>
                  )}

                  <button
                    onClick={() => onNavigateTab('seo')}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
                    title="Configure SEO & Social metadata"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Page SEO</span>
                  </button>

                  <a
                    href={page.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                    title="View live page"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  {isCustom && customRecord && (
                    <button
                      onClick={() => handleDeleteCustomPage(customRecord.id, customRecord.title)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete page"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Custom Page Create / Edit Modal                                           */}
      {/* ========================================================================= */}
      { (isNewPage || editingCustomPage) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {isNewPage ? 'Create Custom Website Page' : `Edit Page: ${editingCustomPage?.title}`}
                  </h3>
                  <p className="text-2xs text-slate-500">
                    Configure headings, content body, URL slug, and metadata
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => { setIsNewPage(false); setEditingCustomPage(null); }}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSavePageModal} className="space-y-4 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Page Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Enterprise Security Architecture"
                    value={modalTitle}
                    onChange={(e) => {
                      setModalTitle(e.target.value);
                      if (isNewPage) {
                        setModalSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                      }
                    }}
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    URL Slug (e.g. /page/your-slug) <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center">
                    <span className="px-2.5 py-2 bg-slate-100 border border-r-0 border-slate-300 rounded-l-lg text-2xs text-slate-500 font-mono">
                      /page/
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="custom-topic"
                      value={modalSlug}
                      onChange={(e) => setModalSlug(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-r-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Page Content (Markdown / Text Format) <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={8}
                  required
                  placeholder="## Section Heading&#10;&#10;Write comprehensive page paragraphs, bullet lists, or specifications..."
                  value={modalContent}
                  onChange={(e) => setModalContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    SEO Meta Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Title Tag for Google SERP"
                    value={modalSeoTitle}
                    onChange={(e) => setModalSeoTitle(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    SEO Meta Description
                  </label>
                  <input
                    type="text"
                    placeholder="120-160 character snippet..."
                    value={modalSeoDescription}
                    onChange={(e) => setModalSeoDescription(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={modalPublished}
                    onChange={(e) => setModalPublished(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span>Published (Live for visitors and search crawlers)</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={modalShowInFooter}
                    onChange={(e) => setModalShowInFooter(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span>Display link in website footer navigation</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setIsNewPage(false); setEditingCustomPage(null); }}
                  className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs cursor-pointer transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save & Publish Page'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
