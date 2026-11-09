import React, { useState } from 'react';
import { CmsConfig, MediaItem } from '../../types/cms';
import { 
  Upload, Search, Filter, Image as ImageIcon, Copy, Check, 
  Trash2, ExternalLink, Eye, AlertCircle, FileText, Sparkles, X
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

  const folders: ('All' | MediaItem['folder'])[] = ['All', 'projects', 'branding', 'team', 'clients', 'blog', 'documents'];

  const filteredMedia = mediaItems.filter((item) => {
    const matchesFolder = folderFilter === 'All' || item.folder === folderFilter;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.altText || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadError(null);
    setUploading(true);
    setUploadProgress(0);

    try {
      const newItems: MediaItem[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`File ${file.name} exceeds 10MB limit.`);
        }

        const res = await uploadFileToStorage(file, selectedFolderForUpload, (p) => {
          setUploadProgress(Math.round(((i + p / 100) / files.length) * 100));
        });

        const mediaItem: MediaItem = {
          id: `med-${Date.now()}-${i}`,
          name: file.name.replace(/\.[^/.]+$/, ''),
          fileName: res.fileName,
          fileUrl: res.downloadUrl,
          fileType: file.type || 'image/jpeg',
          fileSize: file.size,
          folder: selectedFolderForUpload,
          uploadedAt: new Date().toISOString(),
          altText: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        };

        newItems.push(mediaItem);
        await saveFirestoreMediaItem(mediaItem);
      }

      const updated = [...newItems, ...mediaItems];
      setMediaItems(updated);
      await onSaveCms({ mediaLibrary: updated }, `${newItems.length} file(s) uploaded successfully.`);
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
    if (!window.confirm(`Delete "${item.name}" from Media Library?`)) return;
    try {
      await deleteFirestoreMediaItem(item.id);
      const updated = mediaItems.filter((m) => m.id !== item.id);
      setMediaItems(updated);
      await onSaveCms({ mediaLibrary: updated }, 'Media item removed.');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Deletion failed');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-2xs font-bold uppercase tracking-wider mb-1">
            <ImageIcon className="w-3 h-3" />
            Module 13 &bull; Cloud Assets & Storage
          </div>
          <h2 className="text-xl font-bold text-slate-900">Media Library Management</h2>
          <p className="text-xs text-slate-500">
            Upload, browse, and organize images and documents stored securely in Google Firebase Storage.
          </p>
        </div>

        {/* Upload Controls */}
        <div className="flex items-center gap-2">
          <select
            value={selectedFolderForUpload}
            onChange={(e) => setSelectedFolderForUpload(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
          >
            <option value="projects">Folder: Projects</option>
            <option value="branding">Folder: Branding & Logo</option>
            <option value="team">Folder: Team</option>
            <option value="clients">Folder: Clients & Partners</option>
            <option value="blog">Folder: Blog</option>
            <option value="documents">Folder: Documents</option>
          </select>

          <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-sm cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>Upload Files</span>
            <input
              type="file"
              multiple
              accept="image/*,application/pdf"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {uploadProgress !== null && (
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between text-xs font-semibold text-blue-900 mb-1">
            <span>Uploading to Firebase Storage...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
            <div className="bg-blue-600 h-2 transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
          </div>
        </div>
      )}

      {uploadError && (
        <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by asset name, filename, or alt text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Folder filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {folders.map((f) => (
            <button
              key={f}
              onClick={() => setFolderFilter(f)}
              className={`px-3 py-1 rounded-lg text-2xs font-semibold transition-colors capitalize whitespace-nowrap ${
                folderFilter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
          <span className="text-2xs text-slate-400 ml-2 whitespace-nowrap">
            {filteredMedia.length} assets
          </span>
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {filteredMedia.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between group hover:border-slate-400 transition-all"
          >
            <div className="relative aspect-square bg-slate-100 overflow-hidden flex items-center justify-center">
              {item.fileType?.startsWith('image/') ? (
                <img
                  src={item.fileUrl}
                  alt={item.altText || item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-3 text-slate-400">
                  <FileText className="w-8 h-8 text-slate-400 mb-1" />
                  <span className="text-3xs uppercase font-bold">{item.fileType.split('/')[1] || 'DOC'}</span>
                </div>
              )}

              {/* Hover actions overlay */}
              <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 transition-opacity">
                <button
                  onClick={() => setPreviewItem(item)}
                  className="p-1.5 bg-white/90 hover:bg-white text-slate-900 rounded-lg text-xs"
                  title="Preview"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleCopyUrl(item)}
                  className="p-1.5 bg-white/90 hover:bg-white text-slate-900 rounded-lg text-xs"
                  title="Copy CDN URL"
                >
                  {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => handleDeleteItem(item)}
                  className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-slate-900/75 backdrop-blur-xs text-white text-3xs font-medium capitalize">
                {item.folder}
              </span>
            </div>

            <div className="p-2.5">
              <div className="font-bold text-slate-900 text-2xs truncate" title={item.name}>
                {item.name}
              </div>
              <div className="text-3xs text-slate-400 flex items-center justify-between mt-0.5">
                <span>{formatFileSize(item.fileSize)}</span>
                <button
                  onClick={() => handleCopyUrl(item)}
                  className="text-blue-600 hover:underline flex items-center gap-0.5"
                >
                  {copiedId === item.id ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl space-y-4">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div className="truncate">
                <h3 className="font-bold text-slate-900 text-sm truncate">{previewItem.name}</h3>
                <p className="text-2xs text-slate-500 font-mono">{previewItem.fileName}</p>
              </div>
              <button onClick={() => setPreviewItem(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex items-center justify-center max-h-[60vh] bg-slate-900 overflow-hidden">
              <img
                src={previewItem.fileUrl}
                alt={previewItem.altText || previewItem.name}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
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
                  {copiedId === previewItem.id ? 'CDN URL Copied!' : 'Copy Download URL'}
                </button>
                <a
                  href={previewItem.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open in New Tab
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
