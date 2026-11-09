import React, { useState } from 'react';
import { CmsConfig, ClientPartnerItem } from '../../types/cms';
import { 
  Plus, Edit, Trash2, Save, Eye, EyeOff, Search, 
  Building2, Sparkles, Upload, AlertCircle, ExternalLink,
  X, Check, ArrowUp, ArrowDown, Star
} from 'lucide-react';
import { uploadFileToStorage } from '../../services/api';

interface ClientsManagerTabProps {
  cms: CmsConfig;
  onSaveCms: (partial: Partial<CmsConfig>, message?: string) => Promise<void>;
  saving: boolean;
}

export const ClientsManagerTab: React.FC<ClientsManagerTabProps> = ({
  cms,
  onSaveCms,
  saving,
}) => {
  const [clients, setClients] = useState<ClientPartnerItem[]>(cms.clients || []);
  const [editingClient, setEditingClient] = useState<Partial<ClientPartnerItem> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const filteredClients = clients.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.industry.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'All' || c.partnershipType === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleStartNew = () => {
    setEditingClient({
      id: `client-${Date.now()}`,
      name: '',
      logoUrl: '',
      websiteUrl: 'https://',
      industry: 'Enterprise Software',
      partnershipType: 'Client',
      featured: true,
      order: clients.length + 1,
      published: true,
      createdAt: new Date().toISOString(),
    });
    setIsNew(true);
    setUploadError(null);
  };

  const handleStartEdit = (client: ClientPartnerItem) => {
    setEditingClient({ ...client });
    setIsNew(false);
    setUploadError(null);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingClient) return;
    setUploadError(null);
    setUploadingLogo(true);

    try {
      const res = await uploadFileToStorage(file, 'clients');
      setEditingClient({
        ...editingClient,
        logoUrl: res.downloadUrl,
      });
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Logo upload failed');
    } finally {
      setUploadingLogo(false);
      e.target.value = '';
    }
  };

  const handleSaveModal = async () => {
    if (!editingClient?.name) {
      alert('Please enter client or partner name.');
      return;
    }

    const completeClient: ClientPartnerItem = {
      id: editingClient.id || `client-${Date.now()}`,
      name: editingClient.name,
      logoUrl: editingClient.logoUrl || '',
      websiteUrl: editingClient.websiteUrl || '',
      industry: editingClient.industry || 'Technology',
      partnershipType: editingClient.partnershipType || 'Client',
      featured: editingClient.featured ?? true,
      order: editingClient.order || clients.length + 1,
      published: editingClient.published !== false,
      createdAt: editingClient.createdAt || new Date().toISOString(),
    };

    let updated: ClientPartnerItem[];
    if (isNew) {
      updated = [...clients, completeClient];
    } else {
      updated = clients.map((c) => (c.id === completeClient.id ? completeClient : c));
    }

    setClients(updated);
    setEditingClient(null);
    await onSaveCms({ clients: updated }, `Client "${completeClient.name}" saved.`);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this client/partner?')) return;
    const updated = clients.filter((c) => c.id !== id);
    setClients(updated);
    await onSaveCms({ clients: updated }, 'Client removed.');
  };

  const handleTogglePublish = async (id: string) => {
    const updated = clients.map((c) => (c.id === id ? { ...c, published: !c.published } : c));
    setClients(updated);
    await onSaveCms({ clients: updated }, 'Visibility updated.');
  };

  const handleToggleFeatured = async (id: string) => {
    const updated = clients.map((c) => (c.id === id ? { ...c, featured: !c.featured } : c));
    setClients(updated);
    await onSaveCms({ clients: updated }, 'Featured status updated.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-2xs font-bold uppercase tracking-wider mb-1">
            <Building2 className="w-3 h-3" />
            Module 8 &bull; Enterprise Ecosystem
          </div>
          <h2 className="text-xl font-bold text-slate-900">Clients & Partners Management</h2>
          <p className="text-xs text-slate-500">
            Manage partner logos, technology alliances, customer badges, and industries represented across East Africa and globally.
          </p>
        </div>
        <button
          onClick={handleStartNew}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Client / Partner
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search clients by name or industry..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-2xs font-semibold text-slate-500 uppercase">Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-medium focus:outline-none"
          >
            <option value="All">All Types</option>
            <option value="Client">Client</option>
            <option value="Tech Partner">Tech Partner</option>
            <option value="Certified Vendor">Certified Vendor</option>
          </select>
          <span className="text-2xs text-slate-400 ml-2">Total: {filteredClients.length}</span>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredClients.map((client) => (
          <div
            key={client.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between hover:border-slate-300 transition-all space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden p-1.5">
                  {client.logoUrl ? (
                    <img
                      src={client.logoUrl}
                      alt={client.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <Building2 className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{client.name}</h3>
                  <p className="text-2xs text-slate-500">{client.industry}</p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-3xs font-semibold">
                  {client.partnershipType}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-3xs font-bold ${
                    client.published !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {client.published !== false ? 'Live' : 'Draft'}
                </span>
              </div>
            </div>

            {client.websiteUrl && (
              <a
                href={client.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="text-2xs text-blue-600 hover:underline flex items-center gap-1 font-medium"
              >
                <span>{client.websiteUrl.replace(/^https?:\/\//, '')}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => handleToggleFeatured(client.id)}
                className={`flex items-center gap-1 text-2xs font-semibold ${
                  client.featured ? 'text-amber-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${client.featured ? 'fill-current' : ''}`} />
                {client.featured ? 'Featured' : 'Standard'}
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleTogglePublish(client.id)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                  title="Toggle Visibility"
                >
                  {client.published !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => handleStartEdit(client)}
                  className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg"
                  title="Edit"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(client.id)}
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

      {/* Edit / Create Modal */}
      {editingClient && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg my-8 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50/50">
              <h3 className="font-bold text-slate-900 text-sm">
                {isNew ? 'Add Client or Partner' : `Edit: ${editingClient.name}`}
              </h3>
              <button onClick={() => setEditingClient(null)} className="p-1 text-slate-400 hover:text-slate-700">
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

              <div>
                <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Client / Partner Name *
                </label>
                <input
                  type="text"
                  value={editingClient.name || ''}
                  onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })}
                  placeholder="e.g. Ethio Telecom"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Industry
                  </label>
                  <input
                    type="text"
                    value={editingClient.industry || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, industry: e.target.value })}
                    placeholder="Telecommunications"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Partnership Type
                  </label>
                  <select
                    value={editingClient.partnershipType || 'Client'}
                    onChange={(e) => setEditingClient({ ...editingClient, partnershipType: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  >
                    <option value="Client">Client</option>
                    <option value="Tech Partner">Tech Partner</option>
                    <option value="Certified Vendor">Certified Vendor</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Website URL
                </label>
                <input
                  type="url"
                  value={editingClient.websiteUrl || ''}
                  onChange={(e) => setEditingClient({ ...editingClient, websiteUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              {/* Logo Upload */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Logo File Upload
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={uploadingLogo}
                    className="w-full text-2xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-2xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                  {uploadingLogo && <p className="text-2xs text-blue-600 mt-1">Uploading...</p>}
                </div>
                <div>
                  <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Or Direct Logo URL
                  </label>
                  <input
                    type="url"
                    value={editingClient.logoUrl || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, logoUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={editingClient.featured ?? true}
                    onChange={(e) => setEditingClient({ ...editingClient, featured: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  Display in Logo Marquee
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={editingClient.published !== false}
                    onChange={(e) => setEditingClient({ ...editingClient, published: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  Published
                </label>
              </div>

            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-200 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setEditingClient(null)}
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
                {saving ? 'Saving...' : isNew ? 'Add Client' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
