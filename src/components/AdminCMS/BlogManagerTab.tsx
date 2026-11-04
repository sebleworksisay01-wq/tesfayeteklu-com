import React, { useState } from 'react';
import { CmsConfig, BlogArticle } from '../../types/cms';
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Search,
  Calendar,
  Clock,
  Tag,
  Save,
  X,
  Upload,
  ExternalLink
} from 'lucide-react';
import { uploadFileToStorage } from '../../services/api';

interface BlogManagerTabProps {
  cms: CmsConfig;
  onSaveCms: (partial: Partial<CmsConfig>, message?: string) => Promise<void>;
  saving: boolean;
}

export const BlogManagerTab: React.FC<BlogManagerTabProps> = ({
  cms,
  onSaveCms,
  saving
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingArticle, setEditingArticle] = useState<Partial<BlogArticle> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const articles = cms.blogArticles || [];

  const filteredArticles = articles.filter((a) =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStartCreate = () => {
    setIsNew(true);
    setEditingArticle({
      id: 'blog-' + Date.now(),
      slug: '',
      title: '',
      excerpt: '',
      content: '',
      category: 'Web Engineering',
      tags: ['Engineering', 'Software', 'Ethiopia'],
      author: 'Tesfaye Teklu',
      authorRole: 'Principal Software Architect',
      coverImage: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
      publishedDate: new Date().toISOString().split('T')[0],
      readingTime: '5 min read',
      published: true,
      featured: false,
      seoTitle: '',
      seoDescription: ''
    });
  };

  const handleStartEdit = (article: BlogArticle) => {
    setIsNew(false);
    setEditingArticle({ ...article });
  };

  const handleTogglePublish = async (articleId: string) => {
    const updated = articles.map((a) => (a.id === articleId ? { ...a, published: !a.published } : a));
    await onSaveCms({ blogArticles: updated }, 'Article publication status updated.');
  };

  const handleToggleFeatured = async (articleId: string) => {
    const updated = articles.map((a) => (a.id === articleId ? { ...a, featured: !a.featured } : a));
    await onSaveCms({ blogArticles: updated }, 'Featured article updated.');
  };

  const handleDelete = async (articleId: string) => {
    if (!window.confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      return;
    }
    const updated = articles.filter((a) => a.id !== articleId);
    await onSaveCms({ blogArticles: updated }, 'Article deleted successfully.');
  };

  const handleSaveArticle = async () => {
    if (!editingArticle || !editingArticle.title || !editingArticle.content) {
      alert('Please provide both title and content for the article.');
      return;
    }

    // Auto generate slug if empty
    let finalSlug = editingArticle.slug?.trim();
    if (!finalSlug) {
      finalSlug = editingArticle.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    const completeArticle: BlogArticle = {
      id: editingArticle.id || 'blog-' + Date.now(),
      slug: finalSlug,
      title: editingArticle.title,
      excerpt: editingArticle.excerpt || editingArticle.content.slice(0, 160) + '...',
      content: editingArticle.content,
      category: editingArticle.category || 'Web Engineering',
      tags: editingArticle.tags || ['Tech'],
      author: editingArticle.author || 'Tesfaye Teklu',
      authorRole: editingArticle.authorRole || 'Principal Software Architect',
      coverImage: editingArticle.coverImage || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
      publishedDate: editingArticle.publishedDate || new Date().toISOString().split('T')[0],
      readingTime: editingArticle.readingTime || '5 min read',
      published: editingArticle.published !== false,
      featured: Boolean(editingArticle.featured),
      seoTitle: editingArticle.seoTitle || `${editingArticle.title} | TesfayeTech`,
      seoDescription: editingArticle.seoDescription || editingArticle.excerpt || ''
    };

    let updatedArticles: BlogArticle[];
    if (isNew) {
      updatedArticles = [completeArticle, ...articles];
    } else {
      updatedArticles = articles.map((a) => (a.id === completeArticle.id ? completeArticle : a));
    }

    await onSaveCms({ blogArticles: updatedArticles }, isNew ? 'New article published successfully.' : 'Article updated successfully.');
    setEditingArticle(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingArticle) return;
    setUploadError(null);
    setUploading(true);
    try {
      const res = await uploadFileToStorage(file, 'projects');
      setEditingArticle({ ...editingArticle, coverImage: res.downloadUrl });
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Image upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Content & Tech Editorial Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Engineering Blog & Content Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mt-1">
            Author and publish in-depth technology blueprints, Telebirr payment integration tutorials, and Ethiopian enterprise software playbooks.
          </p>
        </div>

        <button
          onClick={handleStartCreate}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-blue-500/20 shrink-0 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Write New Article</span>
        </button>
      </div>

      {/* Articles List / Table Card */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search articles by title or category..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Total Articles: <strong className="text-slate-900">{articles.length}</strong> · Published: <strong className="text-emerald-600">{articles.filter(a => a.published).length}</strong>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 uppercase tracking-wider text-[11px] border-b border-slate-200">
                <th className="py-3 px-4 font-bold">Article Title</th>
                <th className="py-3 px-4 font-bold">Category</th>
                <th className="py-3 px-4 font-bold">Published Date</th>
                <th className="py-3 px-4 font-bold">Read Time</th>
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredArticles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No articles found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredArticles.map((article) => (
                  <tr key={article.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-bold text-slate-900 line-clamp-1">{article.title}</div>
                      <div className="text-[11px] text-slate-400 font-mono line-clamp-1">/blog/{article.slug}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold">
                        {article.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                      {article.publishedDate}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                      {article.readingTime}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <button
                        onClick={() => handleTogglePublish(article.id)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] cursor-pointer ${
                          article.published
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                        }`}
                      >
                        {article.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        <span>{article.published ? 'Published' : 'Draft'}</span>
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleToggleFeatured(article.id)}
                          className={`p-1.5 rounded-md cursor-pointer transition-colors ${
                            article.featured ? 'text-amber-500 bg-amber-50' : 'text-slate-400 hover:text-slate-600'
                          }`}
                          title={article.featured ? 'Featured post' : 'Mark as featured'}
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                        </button>
                        <button
                          onClick={() => handleStartEdit(article)}
                          className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 cursor-pointer transition-colors"
                          title="Edit article"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(article.id)}
                          className="p-1.5 rounded-md text-rose-500 hover:bg-rose-50 cursor-pointer transition-colors"
                          title="Delete article"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Article Editor Modal / Drawer */}
      {editingArticle && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {isNew ? 'Write New Blog Article' : 'Edit Blog Article'}
                </h3>
                <p className="text-xs text-slate-500">
                  Markdown formatting supported for headings, lists, and quotes.
                </p>
              </div>
              <button
                onClick={() => setEditingArticle(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Article Headline / Title</label>
                <input
                  type="text"
                  value={editingArticle.title || ''}
                  onChange={(e) => {
                    const title = e.target.value;
                    const autoSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                    setEditingArticle({
                      ...editingArticle,
                      title,
                      slug: isNew ? autoSlug : editingArticle.slug
                    });
                  }}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg text-slate-900 font-semibold"
                  placeholder="e.g. Building Modern E-Commerce Platforms in Ethiopia: Telebirr & CBE Birr Guide"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">URL Slug</label>
                  <div className="flex items-center">
                    <span className="px-2.5 py-2 bg-slate-100 border border-r-0 border-slate-300 rounded-l-lg text-slate-500 font-mono text-[11px]">
                      /blog/
                    </span>
                    <input
                      type="text"
                      value={editingArticle.slug || ''}
                      onChange={(e) => setEditingArticle({ ...editingArticle, slug: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-r-lg font-mono text-[11px]"
                      placeholder="telebirr-ecommerce-guide"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Category</label>
                  <select
                    value={editingArticle.category || 'Web Engineering'}
                    onChange={(e) => setEditingArticle({ ...editingArticle, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-medium"
                  >
                    <option value="Fintech & E-Commerce">Fintech & E-Commerce</option>
                    <option value="Enterprise Systems">Enterprise Systems</option>
                    <option value="Web Engineering">Web Engineering</option>
                    <option value="Mobile Development">Mobile Development</option>
                    <option value="Digital Transformation">Digital Transformation</option>
                    <option value="Cloud Architecture">Cloud Architecture</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Author Name</label>
                  <input
                    type="text"
                    value={editingArticle.author || ''}
                    onChange={(e) => setEditingArticle({ ...editingArticle, author: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Author Role</label>
                  <input
                    type="text"
                    value={editingArticle.authorRole || ''}
                    onChange={(e) => setEditingArticle({ ...editingArticle, authorRole: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Estimated Read Time</label>
                  <input
                    type="text"
                    value={editingArticle.readingTime || '5 min read'}
                    onChange={(e) => setEditingArticle({ ...editingArticle, readingTime: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    placeholder="e.g. 6 min read"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Cover Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editingArticle.coverImage || ''}
                    onChange={(e) => setEditingArticle({ ...editingArticle, coverImage: e.target.value })}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg"
                    placeholder="https://images.unsplash.com/..."
                  />
                  <label className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploading ? 'Uploading...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>
                {uploadError && <div className="text-2xs text-rose-600 mt-1">{uploadError}</div>}
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Short Excerpt (Search Snippet & Card Summary)</label>
                <textarea
                  rows={2}
                  value={editingArticle.excerpt || ''}
                  onChange={(e) => setEditingArticle({ ...editingArticle, excerpt: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="1-2 sentences summarizing the article's core takeaway..."
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Full Article Content (Markdown format)</label>
                <textarea
                  rows={10}
                  value={editingArticle.content || ''}
                  onChange={(e) => setEditingArticle({ ...editingArticle, content: e.target.value })}
                  className="w-full px-3.5 py-2.5 font-mono text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 leading-relaxed"
                  placeholder="Write article body here. Use ## for Section Title, ### for sub-headers, - for bullet lists..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Tags (Comma-separated)</label>
                  <input
                    type="text"
                    value={(editingArticle.tags || []).join(', ')}
                    onChange={(e) => setEditingArticle({
                      ...editingArticle,
                      tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean)
                    })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    placeholder="Telebirr, E-Commerce, Fintech"
                  />
                </div>

                <div className="flex items-center gap-6 pt-5">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                    <input
                      type="checkbox"
                      checked={editingArticle.published !== false}
                      onChange={(e) => setEditingArticle({ ...editingArticle, published: e.target.checked })}
                      className="rounded text-blue-600"
                    />
                    <span>Publish Immediately</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                    <input
                      type="checkbox"
                      checked={Boolean(editingArticle.featured)}
                      onChange={(e) => setEditingArticle({ ...editingArticle, featured: e.target.checked })}
                      className="rounded text-blue-600"
                    />
                    <span>Featured Article</span>
                  </label>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 flex items-center justify-end gap-3 bg-slate-50 rounded-b-2xl">
              <button
                onClick={() => setEditingArticle(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveArticle}
                disabled={saving}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm shadow-blue-500/20"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Save & Publish'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
