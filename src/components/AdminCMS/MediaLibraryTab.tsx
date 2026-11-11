import React, { useState } from 'react';
import { CmsConfig, MediaItem } from '../../types/cms';
import { 
  Upload, Search, Filter, Image as ImageIcon, Copy, Check, 
  Trash2, ExternalLink, Eye, AlertCircle, FileText, Sparkles, X,
  Sliders, Star, Layout, Globe, Tag, CheckCircle2, Edit2, Save
} from 'lucide-react';
import { uploadFileToStorage, saveFirestoreMediaItem, deleteFirestoreMediaItem } from '../../services/api';

interface MediaLibraryTabProps {
  cms: CmsConfig;
  onSaveCms: (partial: Partial<CmsConfig>, message?: string) => Promise<void>;
  saving: boolean;
}

export const MediaLibraryTab: React.FC<MediaLibraryTabProps> = ({
  cms,
  onSaveCms,
  saving,
}) => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(cms.mediaLibrary || []);
  const [folderFilter, setFolderFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolderForUpload, setSelectedFolderForUpload] = useState<MediaItem['folder']>('projects');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);

  // Edit fields
  const [editName, setEditName] = useState('');
  const [editAltText, setEditAltText] = useState('');
  const [editCaption, setEditCaption] = useState('');
  const [editAssignedSection, setEditAssignedSection] = useState('General');

  const folders: ('All' | MediaItem['folder'])[] = ['All', 'branding', 'projects', 'blog', 'team', 'clients', 'documents'];

  const filteredMedia = mediaItems.filter((item) => {
    const matchesFolder = folderFilter === 'All' || item.folder === folderFilter;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.altText || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.assignedSection || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetFolder?: MediaItem['folder']) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadError(null);
    setUploading(true);
    setUploadProgress(0);

    const folderToUse = targetFolder || selectedFolderForUpload;

    try {
      const newItems: MediaItem[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 15 * 1024 * 1024) {
          throw new Error(`File ${file.name} exceeds 15MB limit.`);
        }

        const res = await uploadFileToStorage(file, folderToUse, (p) => {
          setUploadProgress(Math.round(((i + p / 100) / files.length) * 100));
        });

        const mediaItem: MediaItem = {
          id: `med-${Date.now()}-${i}`,
          name: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
          fileName: res.fileName,
          fileUrl: res.downloadUrl,
          fileType: file.type || 'image/webp',
          fileSize: file.size,
          folder: folderToUse,
          uploadedAt: new Date().toISOString(),
          altText: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
          caption: '',
          assignedSection: folderToUse === 'branding' ? 'Brand & Logo' : 'General',
        };

        newItems.push(mediaItem);
        await saveFirestoreMediaItem(mediaItem);
      }

      const updated = [...newItems, ...mediaItems];
      setMediaItems(updated);
      await onSaveCms({ mediaLibrary: updated }, `${newItems.length} media asset(s) saved to Media Library.`);
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(null);
      e.target.value = '';
    }
  };

  const handleCopyUrl = (item: MediaItem) => {
    navigator.clipboard.writeText(item.fileUrl);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDeleteItem = async (item: MediaItem) => {
    if (!window.confirm(`Delete "${item.name}" from Media Library? This action cannot be reversed.`)) return;
    try {
      await deleteFirestoreMediaItem(item.id);
      const updated = mediaItems.filter((m) => m.id !== item.id);
      setMediaItems(updated);
      await onSaveCms({ mediaLibrary: updated }, 'Media item removed.');
      if (previewItem?.id === item.id) setPreviewItem(null);
      if (editingItem?.id === item.id) setEditingItem(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Deletion failed');
    }
  };

  // Global Logo Replacement
  const handleSetGlobalLogo = async (item: MediaItem) => {
    const updatedIdentity = {
      ...cms.identity,
      logoUrl: item.fileUrl,
    };
    await onSaveCms(
      { identity: updatedIdentity },
      `Global company logo updated throughout header, footer, and brand cards.`
    );
  };

  // Global Favicon Replacement
  const handleSetFavicon = async (item: MediaItem) => {
    const updatedIdentity = {
      ...cms.identity,
      faviconUrl: item.fileUrl,
    };
    // Update link rel="icon" dynamically in DOM
    let iconLink = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (iconLink) iconLink.href = item.fileUrl;
    await onSaveCms(
      { identity: updatedIdentity },
      `Browser favicon icon updated successfully.`
    );
  };

  // Set Homepage Hero Banner
  const handleSetHomepageHero = async (item: MediaItem) => {
    const updatedHome = {
      ...cms.home,
      hero: {
        ...cms.home?.hero,
        imageUrl: item.fileUrl,
        imageCaption: item.caption || item.altText || cms.home?.hero?.imageCaption || 'TesfayeTech Digital Solutions',
      },
    };
    await onSaveCms(
      { home: updatedHome },
      `Homepage Hero Section banner artwork updated.`
    );
  };

  const handleOpenEditModal = (item: MediaItem) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditAltText(item.altText || '');
    setEditCaption(item.caption || '');
    setEditAssignedSection(item.assignedSection || 'General');
  };

  const handleSaveMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const updated = mediaItems.map((m) => {
      if (m.id === editingItem.id) {
        return {
          ...m,
          name: editName.trim(),
          altText: editAltText.trim(),
          caption: editCaption.trim(),
          assignedSection: editAssignedSection.trim(),
        };
      }
      return m;
    });

    setMediaItems(updated);
    await onSaveCms({ mediaLibrary: updated }, `Metadata for "${editName}" updated.`);
    setEditingItem(null);
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 KB';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6 max-w-6xl animate-in fade-in duration-150 text-left">
      
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Centralized Cloud Storage & Asset Manager</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Media Library & Logo Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mt-1">
            Upload from computer, replace company logo globally, configure browser favicons, manage hero artwork, and assign media assets with image ALT texts across the entire site.
          </p>
        </div>

        {/* Global Action Upload Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <label className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-2 cursor-pointer transition-colors shadow-xs">
            <Star className="w-4 h-4 text-amber-500" />
            <span>Replace Logo</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, 'branding')}
              disabled={uploading}
              className="hidden"
            />
          </label>

          <label className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs cursor-pointer transition-all">
            <Upload className="w-4 h-4" />
            <span>Upload Media Files</span>
            <input
              type="file"
              multiple
              accept="image/*,application/pdf"
              onChange={(e) => handleFileUpload(e)}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {uploadProgress !== null && (
        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-blue-900 mb-1.5">
            <span>Optimizing and uploading to Firebase Storage...</span>
            <span className="font-mono">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
            <div className="bg-blue-600 h-2 transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
          </div>
        </div>
      )}

      {uploadError && (
        <div className="p-3.5 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Filter and Folder Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by image name, ALT text, section, or filename..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {folders.map((f) => (
            <button
              key={f}
              onClick={() => setFolderFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer whitespace-nowrap ${
                folderFilter === f
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
          <span className="text-3xs text-slate-400 font-mono ml-2 whitespace-nowrap">
            {filteredMedia.length} items
          </span>
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredMedia.map((item) => {
          const isLogo = cms.identity?.logoUrl === item.fileUrl;
          const isHero = cms.home?.hero?.imageUrl === item.fileUrl;
          const isFavicon = cms.identity?.faviconUrl === item.fileUrl;

          return (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border shadow-xs overflow-hidden flex flex-col justify-between group transition-all ${
                isLogo || isHero 
                  ? 'border-blue-400 ring-2 ring-blue-500/20' 
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="relative aspect-square bg-slate-950/5 overflow-hidden flex items-center justify-center p-2">
                {item.fileType?.startsWith('image/') ? (
                  <img
                    src={item.fileUrl}
                    alt={item.altText || item.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-3 text-slate-400">
                    <FileText className="w-8 h-8 text-slate-400 mb-1" />
                    <span className="text-3xs uppercase font-bold">{item.fileType.split('/')[1] || 'DOC'}</span>
                  </div>
                )}

                {/* Badges on asset */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {isLogo && (
                    <span className="px-1.5 py-0.5 rounded-md bg-blue-600 text-white text-3xs font-bold uppercase shadow-xs">
                      Global Logo
                    </span>
                  )}
                  {isHero && (
                    <span className="px-1.5 py-0.5 rounded-md bg-purple-600 text-white text-3xs font-bold uppercase shadow-xs">
                      Hero Banner
                    </span>
                  )}
                  {isFavicon && (
                    <span className="px-1.5 py-0.5 rounded-md bg-emerald-600 text-white text-3xs font-bold uppercase shadow-xs">
                      Favicon
                    </span>
                  )}
                </div>

                {/* Hover overlay with action buttons */}
                <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-2 p-3 transition-opacity">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPreviewItem(item)}
                      className="p-2 bg-white/95 hover:bg-white text-slate-900 rounded-lg text-xs shadow-xs cursor-pointer"
                      title="Preview details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(item)}
                      className="p-2 bg-white/95 hover:bg-white text-slate-900 rounded-lg text-xs shadow-xs cursor-pointer"
                      title="Edit ALT text & details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(item)}
                      className="p-2 bg-white/95 hover:bg-white text-slate-900 rounded-lg text-xs shadow-xs cursor-pointer"
                      title="Copy URL"
                    >
                      {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item)}
                      className="p-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs shadow-xs cursor-pointer"
                      title="Delete asset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex flex-col gap-1 w-full mt-1">
                    {!isLogo && (
                      <button
                        type="button"
                        onClick={() => handleSetGlobalLogo(item)}
                        className="w-full py-1 px-2 bg-blue-600 hover:bg-blue-500 text-white text-3xs font-bold rounded cursor-pointer"
                      >
                        Set as Logo
                      </button>
                    )}
                    {!isHero && (
                      <button
                        type="button"
                        onClick={() => handleSetHomepageHero(item)}
                        className="w-full py-1 px-2 bg-slate-800 hover:bg-slate-700 text-white text-3xs font-bold rounded cursor-pointer"
                      >
                        Set as Hero
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Asset Info Card Footer */}
              <div className="p-3 border-t border-slate-100 space-y-1">
                <div className="font-bold text-slate-900 text-xs truncate" title={item.name}>
                  {item.name}
                </div>
                <div className="text-3xs text-slate-400 flex items-center justify-between font-mono">
                  <span>{formatFileSize(item.fileSize)}</span>
                  <span className="capitalize text-slate-500">{item.folder}</span>
                </div>
                {item.altText && (
                  <p className="text-3xs text-slate-500 truncate" title={`ALT: ${item.altText}`}>
                    ALT: {item.altText}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* Edit Metadata Modal (ALT Text, Caption, Assigned Section)                  */}
      {/* ========================================================================= */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Edit Asset Information & Image ALT Text</h3>
              <button onClick={() => setEditingItem(null)} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMetadata} className="space-y-3.5 text-left">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Image Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Image ALT Text (Accessibility & Google Image SEO)
                </label>
                <input
                  type="text"
                  required
                  value={editAltText}
                  onChange={(e) => setEditAltText(e.target.value)}
                  placeholder="e.g. TesfayeTech Enterprise Web Application Dashboard"
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Image Caption</label>
                <input
                  type="text"
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                  placeholder="Optional display caption beneath figure"
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Website Section</label>
                <select
                  value={editAssignedSection}
                  onChange={(e) => setEditAssignedSection(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="General">General Media</option>
                  <option value="Hero Section">Hero Banner Section</option>
                  <option value="Brand & Logo">Brand & Logo Header</option>
                  <option value="Services">Services Catalog</option>
                  <option value="Portfolio Case Studies">Portfolio Case Studies</option>
                  <option value="About Us & Leadership">About Us & Leadership</option>
                  <option value="Blog Posts">Blog Posts</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Metadata</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl space-y-4">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="truncate">
                <h3 className="font-bold text-slate-900 text-sm truncate">{previewItem.name}</h3>
                <p className="text-2xs text-slate-400 font-mono">{previewItem.fileName}</p>
              </div>
              <button onClick={() => setPreviewItem(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex items-center justify-center max-h-[60vh] bg-slate-950 overflow-hidden">
              <img
                src={previewItem.fileUrl}
                alt={previewItem.altText || previewItem.name}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <div className="p-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="text-slate-600 space-x-2">
                <span>Folder: <strong>{previewItem.folder}</strong></span>
                <span>&bull;</span>
                <span>Size: <strong>{formatFileSize(previewItem.fileSize)}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyUrl(previewItem)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-semibold"
                >
                  {copiedId === previewItem.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedId === previewItem.id ? 'URL Copied!' : 'Copy URL'}
                </button>
                <a
                  href={previewItem.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
