import React, { useState } from 'react';
import { CmsConfig, TestimonialItem } from '../../types/cms';
import { 
  Plus, Edit, Trash2, Save, Eye, EyeOff, Search, 
  Star, Sparkles, Upload, AlertCircle, MessageSquareQuote,
  X, Check, ArrowUp, ArrowDown
} from 'lucide-react';
import { uploadFileToStorage } from '../../services/api';

interface TestimonialsManagerTabProps {
  cms: CmsConfig;
  onSaveCms: (partial: Partial<CmsConfig>, message?: string) => Promise<void>;
  saving: boolean;
}

export const TestimonialsManagerTab: React.FC<TestimonialsManagerTabProps> = ({
  cms,
  onSaveCms,
  saving,
}) => {
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(
    cms.testimonials || cms.home?.testimonialsSection?.items || []
  );
  const [editingItem, setEditingItem] = useState<Partial<TestimonialItem> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const filteredTestimonials = testimonials.filter((t) =>
    t.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.quote.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartNew = () => {
    setEditingItem({
      id: `testim-${Date.now()}`,
      author: '',
      role: 'Chief Technology Officer',
      company: '',
      quote: '',
      avatarUrl: '',
      rating: 5,
      metric: '99.99% Production Uptime',
      featured: true,
      published: true,
      order: testimonials.length + 1,
      createdAt: new Date().toISOString(),
    });
    setIsNew(true);
    setUploadError(null);
  };

  const handleStartEdit = (item: TestimonialItem) => {
    setEditingItem({ ...item });
    setIsNew(false);
    setUploadError(null);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingItem) return;
    setUploadError(null);
    setUploadingImage(true);

    try {
      const res = await uploadFileToStorage(file, 'branding');
      setEditingItem({
        ...editingItem,
        avatarUrl: res.downloadUrl,
      });
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Avatar upload failed');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleSaveModal = async () => {
    if (!editingItem?.author || !editingItem?.quote) {
      alert('Please fill in Author name and Review quote.');
      return;
    }

    const completeItem: TestimonialItem = {
      id: editingItem.id || `testim-${Date.now()}`,
      author: editingItem.author,
      role: editingItem.role || 'Executive Leader',
      company: editingItem.company || 'Enterprise Partner',
      quote: editingItem.quote,
      avatarUrl: editingItem.avatarUrl || '',
      rating: editingItem.rating || 5,
      metric: editingItem.metric || '',
      featured: editingItem.featured ?? true,
      published: editingItem.published !== false,
      order: editingItem.order || testimonials.length + 1,
      createdAt: editingItem.createdAt || new Date().toISOString(),
    };

    let updated: TestimonialItem[];
    if (isNew) {
      updated = [...testimonials, completeItem];
    } else {
      updated = testimonials.map((t) => (t.id === completeItem.id ? completeItem : t));
    }

    setTestimonials(updated);
    setEditingItem(null);

    // Sync to both top-level testimonials and home.testimonialsSection.items for compatibility
    await onSaveCms(
      {
        testimonials: updated,
        home: {
          ...cms.home,
          testimonialsSection: {
            ...cms.home.testimonialsSection,
            items: updated,
          },
        },
      },
      `Testimonial from ${completeItem.author} saved.`
    );
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this testimonial?')) return;
    const updated = testimonials.filter((t) => t.id !== id);
    setTestimonials(updated);
    await onSaveCms(
      {
        testimonials: updated,
        home: {
          ...cms.home,
          testimonialsSection: {
            ...cms.home.testimonialsSection,
            items: updated,
          },
        },
      },
      'Testimonial deleted.'
    );
  };

  const handleTogglePublish = async (id: string) => {
    const updated = testimonials.map((t) => (t.id === id ? { ...t, published: !t.published } : t));
    setTestimonials(updated);
    await onSaveCms({ testimonials: updated }, 'Visibility updated.');
  };

  const handleToggleFeatured = async (id: string) => {
    const updated = testimonials.map((t) => (t.id === id ? { ...t, featured: !t.featured } : t));
    setTestimonials(updated);
    await onSaveCms({ testimonials: updated }, 'Featured status updated.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-2xs font-bold uppercase tracking-wider mb-1">
            <MessageSquareQuote className="w-3 h-3" />
            Module 7 &bull; Social Proof
          </div>
          <h2 className="text-xl font-bold text-slate-900">Testimonials Management</h2>
          <p className="text-xs text-slate-500">
            Showcase enterprise endorsements, executive quotes, star ratings, and measurable operational impact.
          </p>
        </div>
        <button
          onClick={handleStartNew}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Testimonial
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by client name, company, or quote..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <span className="text-2xs text-slate-400">Total: {filteredTestimonials.length}</span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTestimonials.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between hover:border-slate-300 transition-all space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: item.rating || 5 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <div className="flex items-center gap-1.5">
                  {item.featured && (
                    <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-3xs font-bold border border-amber-200">
                      Featured
                    </span>
                  )}
                  <span
                    className={`px-2 py-0.5 rounded text-3xs font-bold ${
                      item.published !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.published !== false ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>

              <blockquote className="text-xs text-slate-700 italic leading-relaxed line-clamp-4">
                &ldquo;{item.quote}&rdquo;
              </blockquote>

              {item.metric && (
                <div className="inline-block px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-2xs font-bold">
                  {item.metric}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {item.avatarUrl ? (
                  <img
                    src={item.avatarUrl}
                    alt={item.author}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                    {item.author.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="font-bold text-slate-900 text-xs">{item.author}</div>
                  <div className="text-3xs text-slate-500">{item.role}, {item.company}</div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleToggleFeatured(item.id)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    item.featured ? 'text-amber-500 hover:bg-amber-50' : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title="Toggle Featured"
                >
                  <Star className={`w-3.5 h-3.5 ${item.featured ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={() => handleTogglePublish(item.id)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                  title="Toggle Visibility"
                >
                  {item.published !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => handleStartEdit(item)}
                  className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg"
                  title="Edit"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl my-8 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50/50">
              <h3 className="font-bold text-slate-900 text-sm">
                {isNew ? 'Add Client Testimonial' : `Edit Testimonial: ${editingItem.author}`}
              </h3>
              <button onClick={() => setEditingItem(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {uploadError && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    value={editingItem.author || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, author: e.target.value })}
                    placeholder="e.g. Dr. Yohannes Berhanu"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Company / Organization *
                  </label>
                  <input
                    type="text"
                    value={editingItem.company || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, company: e.target.value })}
                    placeholder="e.g. East Africa Health Network"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Job Title / Role
                  </label>
                  <input
                    type="text"
                    value={editingItem.role || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, role: e.target.value })}
                    placeholder="e.g. VP of Infrastructure"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Star Rating (1 - 5)
                  </label>
                  <select
                    value={editingItem.rating || 5}
                    onChange={(e) => setEditingItem({ ...editingItem, rating: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  >
                    <option value={5}>5 Stars (Exceptional)</option>
                    <option value={4}>4 Stars (Very Good)</option>
                    <option value={3}>3 Stars (Good)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Testimonial Quote *
                </label>
                <textarea
                  rows={4}
                  value={editingItem.quote || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, quote: e.target.value })}
                  placeholder="The client's exact review highlighting technical reliability and business impact..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Key Metric Highlight
                </label>
                <input
                  type="text"
                  value={editingItem.metric || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, metric: e.target.value })}
                  placeholder="e.g. 99.99% Uptime, +340% throughput"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              {/* Avatar Upload */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Client Avatar Upload
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={uploadingImage}
                    className="w-full text-2xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-2xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                  {uploadingImage && <p className="text-2xs text-blue-600 mt-1">Uploading...</p>}
                </div>
                <div>
                  <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Or Avatar URL
                  </label>
                  <input
                    type="url"
                    value={editingItem.avatarUrl || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, avatarUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={editingItem.featured || false}
                    onChange={(e) => setEditingItem({ ...editingItem, featured: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  Featured on Homepage
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={editingItem.published !== false}
                    onChange={(e) => setEditingItem({ ...editingItem, published: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  Published
                </label>
              </div>

            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-200 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveModal}
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs"
              >
                {saving ? 'Saving...' : isNew ? 'Add Testimonial' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
