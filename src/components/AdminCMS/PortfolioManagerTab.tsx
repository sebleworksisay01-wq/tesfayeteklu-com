import React, { useState } from 'react';
import { Project, SolutionType, DemoStatus } from '../../types';
import { 
  Plus, Edit, Trash2, Save, Eye, EyeOff, Search, 
  ExternalLink, Sparkles, Upload, AlertCircle, Briefcase,
  X, Check, Star, Calendar, User, Tag, Layers, ArrowUp, ArrowDown
} from 'lucide-react';
import { uploadFileToStorage } from '../../services/api';

interface PortfolioManagerTabProps {
  projects: Project[];
  onSaveProject: (project: Partial<Project>, isNew: boolean) => Promise<void>;
  onDeleteProject: (projectId: string) => Promise<void>;
  saving: boolean;
}

export const PortfolioManagerTab: React.FC<PortfolioManagerTabProps> = ({
  projects,
  onSaveProject,
  onDeleteProject,
  saving,
}) => {
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [featureInput, setFeatureInput] = useState('');

  const categories = ['All', ...Array.from(new Set(projects.map((p) => p.category)))];

  const filteredProjects = projects.filter((p) => {
    const title = p.title || p.name || '';
    const summary = p.summary || p.shortDescription || p.description || '';
    const client = p.client || '';
    const tags = p.tags || p.technologies || [];

    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tags.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory || p.solutionType === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleStartNew = () => {
    setEditingProject({
      id: `proj-${Date.now()}`,
      title: '',
      name: '',
      category: 'Cloud Architecture',
      solutionType: 'Web Application Development',
      industry: 'Enterprise Technology',
      client: '',
      summary: '',
      description: '',
      problem: '',
      solution: '',
      targetUsers: ['Enterprise IT', 'Operations'],
      tags: ['React', 'TypeScript', 'Firebase', 'Cloud Run'],
      technologies: ['React', 'TypeScript', 'Firebase', 'Cloud Run'],
      features: ['Real-time sync', 'Zero-trust RBAC', 'Automated CI/CD'],
      keyFeatures: ['Real-time sync', 'Zero-trust RBAC', 'Automated CI/CD'],
      demoType: 'Interactive Architecture Showcase',
      status: 'Production Project',
      featured: false,
      published: true,
      imageUrl: '',
      thumbnail: '',
      demoUrl: '',
      sourceCodeUrl: '',
      completionDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setIsNew(true);
    setUploadError(null);
  };

  const handleStartEdit = (proj: Project) => {
    setEditingProject({ ...proj });
    setIsNew(false);
    setUploadError(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProject) return;
    setUploadError(null);
    setUploadingImage(true);

    try {
      const res = await uploadFileToStorage(file, 'projects');
      setEditingProject({
        ...editingProject,
        thumbnail: res.downloadUrl,
        imageUrl: res.downloadUrl,
      });
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleSaveModal = async () => {
    if (!editingProject?.title && !editingProject?.name) {
      alert('Please enter a project title');
      return;
    }

    const title = editingProject.title || editingProject.name || 'Untitled Project';
    const slug = editingProject.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    await onSaveProject(
      {
        ...editingProject,
        title,
        name: title,
        slug,
        updatedAt: new Date().toISOString(),
      },
      isNew
    );
    setEditingProject(null);
  };

  const handleToggleFeatured = async (proj: Project) => {
    await onSaveProject(
      {
        ...proj,
        featured: !proj.featured,
        updatedAt: new Date().toISOString(),
      },
      false
    );
  };

  const handleTogglePublish = async (proj: Project) => {
    await onSaveProject(
      {
        ...proj,
        published: proj.published === false ? true : false,
        updatedAt: new Date().toISOString(),
      },
      false
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-2xs font-bold uppercase tracking-wider mb-1">
            <Briefcase className="w-3 h-3" />
            Module 5 &bull; Portfolio & Case Studies
          </div>
          <h2 className="text-xl font-bold text-slate-900">Portfolio & Projects Management</h2>
          <p className="text-xs text-slate-500">
            Publish client case studies, live demo links, technical architecture deep-dives, and featured showcases.
          </p>
        </div>
        <button
          onClick={handleStartNew}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add New Project
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, client, or tech stack..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-2xs font-semibold text-slate-500 uppercase">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-medium focus:outline-none"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <span className="text-2xs text-slate-400 ml-2">
            Total: {filteredProjects.length}
          </span>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProjects.map((proj) => (
          <div
            key={proj.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-all"
          >
            <div>
              {/* Thumbnail / Header */}
              <div className="relative aspect-video bg-slate-100 overflow-hidden border-b border-slate-100">
                {proj.thumbnail || proj.imageUrl ? (
                  <img
                    src={proj.thumbnail || proj.imageUrl}
                    alt={proj.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-400 font-bold text-xs uppercase tracking-wider">
                    {proj.category}
                  </div>
                )}
                
                {/* Badges */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-xs text-white text-2xs font-medium">
                    {proj.category}
                  </span>
                  {proj.featured && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500 text-white text-2xs font-bold shadow-xs">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      Featured
                    </span>
                  )}
                </div>

                <div className="absolute top-2.5 right-2.5">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-bold ${
                      proj.published !== false
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-700 text-slate-200'
                    }`}
                  >
                    {proj.published !== false ? 'Live' : 'Draft'}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 space-y-2.5">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{proj.title || proj.name}</h3>
                  <p className="text-2xs text-slate-500">{proj.client ? `Client: ${proj.client}` : 'TesfayeTech R&D'}</p>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {proj.summary || proj.shortDescription || proj.description}
                </p>

                {/* Tech tags */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {(proj.tags || proj.technologies || []).slice(0, 4).map((t: string, idx: number) => (
                    <span key={idx} className="px-1.5 py-0.5 bg-slate-100 rounded text-3xs text-slate-600 font-medium">
                      {t}
                    </span>
                  ))}
                  {(proj.tags || proj.technologies || []).length > 4 && (
                    <span className="px-1.5 py-0.5 bg-slate-50 text-slate-400 rounded text-3xs">
                      +{((proj.tags || proj.technologies || []).length - 4)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleToggleFeatured(proj)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    proj.featured ? 'text-amber-500 hover:bg-amber-50' : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title={proj.featured ? 'Remove from Featured' : 'Mark as Featured'}
                >
                  <Star className={`w-4 h-4 ${proj.featured ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={() => handleTogglePublish(proj)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    proj.published !== false ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title={proj.published !== false ? 'Unpublish (draft)' : 'Publish to live website'}
                >
                  {proj.published !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleStartEdit(proj)}
                  className="px-2.5 py-1 text-2xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Edit className="w-3 h-3" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Delete project "${proj.title}"?`)) {
                      onDeleteProject(proj.id);
                    }
                  }}
                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Project"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Edit / Create Modal */}
      {editingProject && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl my-8 overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50/50">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {isNew ? 'Create Portfolio Case Study' : `Edit: ${editingProject.title}`}
                </h3>
                <p className="text-2xs text-slate-500">Document the client problem, architectural solution, and verification demo.</p>
              </div>
              <button
                onClick={() => setEditingProject(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {uploadError && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    value={editingProject.title || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                    placeholder="e.g. Telebirr High-Throughput Payment Gateway"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={editingProject.client || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, client: e.target.value })}
                    placeholder="e.g. Ethio Telecom / Commercial Bank"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
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
                    value={editingProject.category || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value as SolutionType })}
                    placeholder="Cloud Architecture"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Industry
                  </label>
                  <input
                    type="text"
                    value={editingProject.industry || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, industry: e.target.value })}
                    placeholder="Fintech & Banking"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Completion Date
                  </label>
                  <input
                    type="date"
                    value={editingProject.completionDate || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, completionDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Short Summary (Cards & Previews) *
                </label>
                <textarea
                  rows={2}
                  value={editingProject.summary || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, summary: e.target.value })}
                  placeholder="Concise overview highlighting high impact..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Problem Solved
                  </label>
                  <textarea
                    rows={3}
                    value={editingProject.problem || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, problem: e.target.value })}
                    placeholder="Legacy bottlenecks, transaction drops during peak loads..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Solution Implemented
                  </label>
                  <textarea
                    rows={3}
                    value={editingProject.solution || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, solution: e.target.value })}
                    placeholder="Event-driven cloud microservices with sub-50ms latency..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>

              {/* Thumbnail Upload */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Project Thumbnail Upload
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
                    Or Direct Thumbnail URL
                  </label>
                  <input
                    type="url"
                    value={editingProject.thumbnail || editingProject.imageUrl || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, thumbnail: e.target.value, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>

              {/* Demo URL & Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Live Demo / Simulation URL
                  </label>
                  <input
                    type="url"
                    value={editingProject.demoUrl || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, demoUrl: e.target.value })}
                    placeholder="https://tesfayeteklu.com/#demo"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Deployment Status
                  </label>
                  <select
                    value={editingProject.status || 'Live Deployment'}
                    onChange={(e) => setEditingProject({ ...editingProject, status: e.target.value as DemoStatus })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  >
                    <option value="Live Deployment">Live Deployment</option>
                    <option value="Interactive Prototype">Interactive Prototype</option>
                    <option value="Enterprise Pilot">Enterprise Pilot</option>
                    <option value="Production Verified">Production Verified</option>
                  </select>
                </div>
              </div>

              {/* Tech Stack Tags */}
              <div>
                <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Tech Stack Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Type technology and press Enter (e.g. Docker, Go, Redis)..."
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && tagInput.trim()) {
                        e.preventDefault();
                        const currentTags = editingProject.tags || editingProject.technologies || [];
                        if (!currentTags.includes(tagInput.trim())) {
                          const nextTags = [...currentTags, tagInput.trim()];
                          setEditingProject({
                            ...editingProject,
                            tags: nextTags,
                            technologies: nextTags,
                          });
                        }
                        setTagInput('');
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const currentTags = editingProject.tags || editingProject.technologies || [];
                      if (tagInput.trim() && !currentTags.includes(tagInput.trim())) {
                        const nextTags = [...currentTags, tagInput.trim()];
                        setEditingProject({
                          ...editingProject,
                          tags: nextTags,
                          technologies: nextTags,
                        });
                        setTagInput('');
                      }
                    }}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(editingProject.tags || editingProject.technologies || []).map((tag: string, i: number) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-2xs font-medium">
                      {tag}
                      <button
                        type="button"
                        onClick={() => {
                          const currentTags = editingProject.tags || editingProject.technologies || [];
                          const nextTags = currentTags.filter((_: string, idx: number) => idx !== i);
                          setEditingProject({
                            ...editingProject,
                            tags: nextTags,
                            technologies: nextTags,
                          });
                        }}
                        className="text-blue-400 hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6 pt-2">
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={editingProject.featured || false}
                    onChange={(e) => setEditingProject({ ...editingProject, featured: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  Mark as Featured on Homepage
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={editingProject.published !== false}
                    onChange={(e) => setEditingProject({ ...editingProject, published: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  Published (Live to public)
                </label>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-200 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setEditingProject(null)}
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
                {saving ? 'Saving...' : isNew ? 'Create Project' : 'Save Changes'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
