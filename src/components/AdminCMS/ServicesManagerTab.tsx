import React, { useState } from 'react';
import { CmsConfig, ManagedService } from '../../types/cms';
import { 
  Plus, Edit, Trash2, Save, Eye, EyeOff, Search, 
  ArrowUp, ArrowDown, Layers, Sparkles, Upload, AlertCircle,
  CheckCircle2, X, Check, Code, Cpu, Shield, Globe, Smartphone,
  Database, Server, Cloud
} from 'lucide-react';
import { uploadFileToStorage } from '../../services/api';

interface ServicesManagerTabProps {
  cms: CmsConfig;
  onSaveCms: (partial: Partial<CmsConfig>, message?: string) => Promise<void>;
  saving: boolean;
}

const AVAILABLE_ICONS = [
  'Code', 'Cpu', 'Shield', 'Globe', 'Smartphone', 'Database', 'Server', 'Cloud', 'Sparkles', 'Layers'
];

export const ServicesManagerTab: React.FC<ServicesManagerTabProps> = ({
  cms,
  onSaveCms,
  saving,
}) => {
  const [servicesList, setServicesList] = useState<ManagedService[]>(cms.services || []);
  const [editingService, setEditingService] = useState<Partial<ManagedService> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [tempBenefit, setTempBenefit] = useState('');
  const [tempDeliverable, setTempDeliverable] = useState('');

  const categories = ['All', ...Array.from(new Set(servicesList.map((s) => s.serviceCategory || 'General')))];

  const filteredServices = servicesList.filter((s) => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'All' || s.serviceCategory === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleStartNew = () => {
    const newOrder = servicesList.length + 1;
    setEditingService({
      id: `svc-${Date.now()}`,
      title: '',
      slug: '',
      iconName: 'Code',
      shortDescription: '',
      fullDescription: '',
      serviceCategory: 'Engineering',
      serviceImage: '',
      features: [],
      benefits: ['High availability', 'Modern architecture', 'Automated testing'],
      deliverables: ['Production deployment', 'Architecture documentation', 'Code repository access'],
      quoteCtaText: 'Request Architecture Proposal',
      seoTitle: '',
      seoDescription: '',
      order: newOrder,
      published: true,
    });
    setIsNew(true);
    setUploadError(null);
  };

  const handleStartEdit = (svc: ManagedService) => {
    setEditingService({ ...svc });
    setIsNew(false);
    setUploadError(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingService) return;
    setUploadError(null);
    setUploadingImage(true);

    try {
      const res = await uploadFileToStorage(file, 'branding');
      setEditingService({
        ...editingService,
        serviceImage: res.downloadUrl,
      });
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Image upload failed');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleSaveModal = async () => {
    if (!editingService?.title) {
      alert('Please enter a service title');
      return;
    }

    const slug = editingService.slug || editingService.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const completeService: ManagedService = {
      id: editingService.id || `svc-${Date.now()}`,
      title: editingService.title,
      slug,
      iconName: editingService.iconName || 'Code',
      shortDescription: editingService.shortDescription || '',
      fullDescription: editingService.fullDescription || '',
      serviceCategory: editingService.serviceCategory || 'Engineering',
      serviceImage: editingService.serviceImage || '',
      features: editingService.features || [],
      benefits: editingService.benefits || [],
      deliverables: editingService.deliverables || [],
      quoteCtaText: editingService.quoteCtaText || 'Request Architecture Proposal',
      seoTitle: editingService.seoTitle || `${editingService.title} | TesfayeTech`,
      seoDescription: editingService.seoDescription || editingService.shortDescription || '',
      order: editingService.order || servicesList.length + 1,
      published: editingService.published !== false,
    };

    let updated: ManagedService[];
    if (isNew) {
      updated = [...servicesList, completeService];
    } else {
      updated = servicesList.map((s) => (s.id === completeService.id ? completeService : s));
    }

    setServicesList(updated);
    setEditingService(null);
    await onSaveCms({ services: updated }, `Service "${completeService.title}" successfully saved.`);
  };

  const handleDeleteService = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    const updated = servicesList.filter((s) => s.id !== id);
    setServicesList(updated);
    await onSaveCms({ services: updated }, 'Service deleted successfully.');
  };

  const handleTogglePublish = async (id: string) => {
    const updated = servicesList.map((s) => (s.id === id ? { ...s, published: !s.published } : s));
    setServicesList(updated);
    await onSaveCms({ services: updated }, 'Service visibility updated.');
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= servicesList.length) return;
    const copy = [...servicesList];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);

    // Re-index order
    const reindexed = copy.map((item, idx) => ({ ...item, order: idx + 1 }));
    setServicesList(reindexed);
    await onSaveCms({ services: reindexed }, 'Services order updated.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-2xs font-bold uppercase tracking-wider mb-1">
            <Layers className="w-3 h-3" />
            Module 4 &bull; Service Catalog
          </div>
          <h2 className="text-xl font-bold text-slate-900">Services Management</h2>
          <p className="text-xs text-slate-500">
            Publish unlimited engineering offerings, deliverables, technical capabilities, and SEO meta tags.
          </p>
        </div>
        <button
          onClick={handleStartNew}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add New Service
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, slug, or details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-2xs font-semibold text-slate-500 uppercase">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-medium focus:outline-none"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <span className="text-2xs text-slate-400 ml-2">
            Total: {filteredServices.length}
          </span>
        </div>
      </div>

      {/* Services Table / Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-2xs tracking-wider">
              <tr>
                <th className="py-3 px-4 w-12 text-center">Order</th>
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Slug</th>
                <th className="py-3 px-4">Deliverables</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No services found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredServices.map((service, index) => (
                  <tr key={service.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 text-center">
                      <div className="flex flex-col items-center justify-center gap-0.5">
                        <button
                          onClick={() => handleMoveOrder(index, 'up')}
                          disabled={index === 0}
                          className="p-0.5 text-slate-400 hover:text-slate-800 disabled:opacity-20"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <span className="font-mono text-2xs font-bold text-slate-500">{index + 1}</span>
                        <button
                          onClick={() => handleMoveOrder(index, 'down')}
                          disabled={index === filteredServices.length - 1}
                          className="p-0.5 text-slate-400 hover:text-slate-800 disabled:opacity-20"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {service.serviceImage ? (
                          <img
                            src={service.serviceImage}
                            alt={service.title}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                            {service.title.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-900">{service.title}</div>
                          <div className="text-slate-500 line-clamp-1 max-w-sm">{service.shortDescription}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-2xs font-medium">
                        {service.serviceCategory || 'General'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-2xs text-slate-500">
                      /{service.slug}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-slate-600 font-medium">
                        {(service.deliverables || []).length} items
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleTogglePublish(service.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-2xs font-bold ${
                          service.published !== false
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {service.published !== false ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {service.published !== false ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleStartEdit(service)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Service"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteService(service.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Service"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Service Edit / Create Modal */}
      {editingService && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl my-8 overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50/50">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {isNew ? 'Create New Engineering Service' : `Edit: ${editingService.title}`}
                </h3>
                <p className="text-2xs text-slate-500">Provide complete specifications, deliverables, and SEO tags.</p>
              </div>
              <button
                onClick={() => setEditingService(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              
              {uploadError && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Service Title *
                  </label>
                  <input
                    type="text"
                    value={editingService.title || ''}
                    onChange={(e) => {
                      const title = e.target.value;
                      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                      setEditingService({
                        ...editingService,
                        title,
                        slug: isNew ? slug : editingService.slug || slug,
                      });
                    }}
                    placeholder="e.g. Cloud Architecture & Migration"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    value={editingService.slug || ''}
                    onChange={(e) => setEditingService({ ...editingService, slug: e.target.value })}
                    placeholder="cloud-architecture"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={editingService.serviceCategory || ''}
                    onChange={(e) => setEditingService({ ...editingService, serviceCategory: e.target.value })}
                    placeholder="e.g. Engineering, AI, Cloud"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Icon Symbol
                  </label>
                  <select
                    value={editingService.iconName || 'Code'}
                    onChange={(e) => setEditingService({ ...editingService, iconName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  >
                    {AVAILABLE_ICONS.map((icon) => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <div className="flex items-center gap-4 mt-2">
                    <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="svc_published"
                        checked={editingService.published !== false}
                        onChange={() => setEditingService({ ...editingService, published: true })}
                      />
                      Published
                    </label>
                    <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="svc_published"
                        checked={editingService.published === false}
                        onChange={() => setEditingService({ ...editingService, published: false })}
                      />
                      Draft
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Short Description (Cards & Overviews) *
                </label>
                <textarea
                  rows={2}
                  value={editingService.shortDescription || ''}
                  onChange={(e) => setEditingService({ ...editingService, shortDescription: e.target.value })}
                  placeholder="Concise 1-2 sentence overview for catalog grids."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Detailed Description
                </label>
                <textarea
                  rows={4}
                  value={editingService.fullDescription || ''}
                  onChange={(e) => setEditingService({ ...editingService, fullDescription: e.target.value })}
                  placeholder="In-depth explanation of technical methodology, architecture stack, and client delivery model."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              {/* Service Image */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Service Image Upload
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="w-full text-2xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-2xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                  {uploadingImage && <p className="text-2xs text-blue-600 mt-1">Uploading...</p>}
                </div>
                <div>
                  <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Or Direct Image URL
                  </label>
                  <input
                    type="url"
                    value={editingService.serviceImage || ''}
                    onChange={(e) => setEditingService({ ...editingService, serviceImage: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>

              {/* Deliverables List */}
              <div>
                <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Deliverables & Outputs
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tempDeliverable}
                    onChange={(e) => setTempDeliverable(e.target.value)}
                    placeholder="e.g. Terraform infrastructure scripts"
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && tempDeliverable.trim()) {
                        e.preventDefault();
                        setEditingService({
                          ...editingService,
                          deliverables: [...(editingService.deliverables || []), tempDeliverable.trim()],
                        });
                        setTempDeliverable('');
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (tempDeliverable.trim()) {
                        setEditingService({
                          ...editingService,
                          deliverables: [...(editingService.deliverables || []), tempDeliverable.trim()],
                        });
                        setTempDeliverable('');
                      }
                    }}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(editingService.deliverables || []).map((del, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 rounded-md text-2xs text-slate-800">
                      {del}
                      <button
                        type="button"
                        onClick={() => {
                          setEditingService({
                            ...editingService,
                            deliverables: (editingService.deliverables || []).filter((_, idx) => idx !== i),
                          });
                        }}
                        className="text-slate-400 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* SEO Meta */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="text-2xs font-bold text-slate-700 uppercase tracking-wider block">Service Page SEO</span>
                <div>
                  <input
                    type="text"
                    value={editingService.seoTitle || ''}
                    onChange={(e) => setEditingService({ ...editingService, seoTitle: e.target.value })}
                    placeholder="SEO Title (e.g. Enterprise Cloud Engineering | TesfayeTech)"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <textarea
                    rows={2}
                    value={editingService.seoDescription || ''}
                    onChange={(e) => setEditingService({ ...editingService, seoDescription: e.target.value })}
                    placeholder="Meta description for search engine snippet..."
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-200 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setEditingService(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveModal}
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors"
              >
                {saving ? 'Saving...' : isNew ? 'Create Service' : 'Save Changes'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
