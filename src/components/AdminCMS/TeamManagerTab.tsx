import React, { useState } from 'react';
import { CmsConfig, TeamMemberItem } from '../../types/cms';
import { 
  Plus, Edit, Trash2, Save, Eye, EyeOff, Search, 
  Users, Sparkles, Upload, AlertCircle, Linkedin, Twitter, Github,
  X, Check, ArrowUp, ArrowDown
} from 'lucide-react';
import { uploadFileToStorage } from '../../services/api';

interface TeamManagerTabProps {
  cms: CmsConfig;
  onSaveCms: (partial: Partial<CmsConfig>, message?: string) => Promise<void>;
  saving: boolean;
}

export const TeamManagerTab: React.FC<TeamManagerTabProps> = ({
  cms,
  onSaveCms,
  saving,
}) => {
  const [team, setTeam] = useState<TeamMemberItem[]>(cms.teamMembers || []);
  const [editingMember, setEditingMember] = useState<Partial<TeamMemberItem> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const departments = ['All', 'Leadership', 'Engineering', 'Design', 'Product', 'Operations'];

  const filteredTeam = team.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.bio.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter === 'All' || m.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  const handleStartNew = () => {
    setEditingMember({
      id: `team-${Date.now()}`,
      name: '',
      role: 'Senior Cloud Engineer',
      department: 'Engineering',
      bio: '',
      photoUrl: '',
      socialLinks: {
        linkedin: 'https://linkedin.com/in/',
        github: 'https://github.com/',
        twitter: 'https://x.com/',
      },
      order: team.length + 1,
      published: true,
      createdAt: new Date().toISOString(),
    });
    setIsNew(true);
    setUploadError(null);
  };

  const handleStartEdit = (member: TeamMemberItem) => {
    setEditingMember({
      ...member,
      socialLinks: member.socialLinks || {},
    });
    setIsNew(false);
    setUploadError(null);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingMember) return;
    setUploadError(null);
    setUploadingPhoto(true);

    try {
      const res = await uploadFileToStorage(file, 'team');
      setEditingMember({
        ...editingMember,
        photoUrl: res.downloadUrl,
      });
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Photo upload failed');
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const handleSaveModal = async () => {
    if (!editingMember?.name || !editingMember?.role) {
      alert('Please enter member name and role.');
      return;
    }

    const completeMember: TeamMemberItem = {
      id: editingMember.id || `team-${Date.now()}`,
      name: editingMember.name,
      role: editingMember.role,
      department: editingMember.department || 'Engineering',
      bio: editingMember.bio || '',
      photoUrl: editingMember.photoUrl || '',
      socialLinks: editingMember.socialLinks || {},
      order: editingMember.order || team.length + 1,
      published: editingMember.published !== false,
      createdAt: editingMember.createdAt || new Date().toISOString(),
    };

    let updated: TeamMemberItem[];
    if (isNew) {
      updated = [...team, completeMember];
    } else {
      updated = team.map((m) => (m.id === completeMember.id ? completeMember : m));
    }

    setTeam(updated);
    setEditingMember(null);
    await onSaveCms({ teamMembers: updated }, `Team member "${completeMember.name}" saved.`);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remove this team member?')) return;
    const updated = team.filter((m) => m.id !== id);
    setTeam(updated);
    await onSaveCms({ teamMembers: updated }, 'Team member removed.');
  };

  const handleTogglePublish = async (id: string) => {
    const updated = team.map((m) => (m.id === id ? { ...m, published: !m.published } : m));
    setTeam(updated);
    await onSaveCms({ teamMembers: updated }, 'Visibility updated.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-2xs font-bold uppercase tracking-wider mb-1">
            <Users className="w-3 h-3" />
            Module 9 &bull; Talent & Leadership
          </div>
          <h2 className="text-xl font-bold text-slate-900">Team Members Management</h2>
          <p className="text-xs text-slate-500">
            Publish profiles for founders, principal cloud architects, technical leads, and engineering teams.
          </p>
        </div>
        <button
          onClick={handleStartNew}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Team Member
        </button>
      </div>

      {/* Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, role, or background..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-2xs font-semibold text-slate-500 uppercase">Department:</span>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-medium focus:outline-none"
          >
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <span className="text-2xs text-slate-400 ml-2">Total: {filteredTeam.length}</span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredTeam.map((member) => (
          <div
            key={member.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-all"
          >
            <div>
              <div className="relative aspect-square bg-slate-100 overflow-hidden border-b border-slate-100">
                {member.photoUrl ? (
                  <img
                    src={member.photoUrl}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-600 font-extrabold text-3xl">
                    {member.name.charAt(0)}
                  </div>
                )}
                
                <div className="absolute top-2.5 left-2.5">
                  <span className="px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-xs text-white text-2xs font-semibold">
                    {member.department}
                  </span>
                </div>

                <div className="absolute top-2.5 right-2.5">
                  <span
                    className={`px-2 py-0.5 rounded-full text-2xs font-bold ${
                      member.published !== false ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-200'
                    }`}
                  >
                    {member.published !== false ? 'Active' : 'Draft'}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{member.name}</h3>
                  <p className="text-2xs text-blue-600 font-medium">{member.role}</p>
                </div>
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {member.bio}
                </p>

                {/* Social icons */}
                <div className="flex items-center gap-2 pt-2 text-slate-400">
                  {member.socialLinks?.linkedin && (
                    <a href={member.socialLinks.linkedin} target="_blank" rel="noreferrer" className="hover:text-blue-600">
                      <Linkedin className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {member.socialLinks?.github && (
                    <a href={member.socialLinks.github} target="_blank" rel="noreferrer" className="hover:text-slate-800">
                      <Github className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {member.socialLinks?.twitter && (
                    <a href={member.socialLinks.twitter} target="_blank" rel="noreferrer" className="hover:text-sky-500">
                      <Twitter className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => handleTogglePublish(member.id)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                title="Toggle Status"
              >
                {member.published !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleStartEdit(member)}
                  className="px-2.5 py-1 text-2xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg flex items-center gap-1"
                >
                  <Edit className="w-3 h-3" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(member.id)}
                  className="p-1 text-slate-400 hover:text-red-600 rounded-lg"
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
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg my-8 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50/50">
              <h3 className="font-bold text-slate-900 text-sm">
                {isNew ? 'Add Team Member' : `Edit: ${editingMember.name}`}
              </h3>
              <button onClick={() => setEditingMember(null)} className="p-1 text-slate-400 hover:text-slate-700">
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
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={editingMember.name || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                    placeholder="e.g. Tesfaye Teklu"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Role / Title *
                  </label>
                  <input
                    type="text"
                    value={editingMember.role || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value })}
                    placeholder="Founder & Chief Cloud Architect"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Department
                </label>
                <select
                  value={editingMember.department || 'Engineering'}
                  onChange={(e) => setEditingMember({ ...editingMember, department: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                >
                  <option value="Leadership">Leadership</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Product">Product</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>

              <div>
                <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Professional Bio
                </label>
                <textarea
                  rows={3}
                  value={editingMember.bio || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, bio: e.target.value })}
                  placeholder="Specialization, enterprise background, credentials..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              {/* Photo Upload */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Photo Upload
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={uploadingPhoto}
                    className="w-full text-2xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-2xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                  {uploadingPhoto && <p className="text-2xs text-blue-600 mt-1">Uploading...</p>}
                </div>
                <div>
                  <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Or Direct Photo URL
                  </label>
                  <input
                    type="url"
                    value={editingMember.photoUrl || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, photoUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>

              {/* Social Links */}
              <div className="space-y-2 pt-2">
                <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider">
                  Social Profiles
                </label>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center gap-2">
                    <Linkedin className="w-4 h-4 text-slate-400" />
                    <input
                      type="url"
                      value={editingMember.socialLinks?.linkedin || ''}
                      onChange={(e) => setEditingMember({
                        ...editingMember,
                        socialLinks: { ...editingMember.socialLinks, linkedin: e.target.value }
                      })}
                      placeholder="LinkedIn URL"
                      className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Github className="w-4 h-4 text-slate-400" />
                    <input
                      type="url"
                      value={editingMember.socialLinks?.github || ''}
                      onChange={(e) => setEditingMember({
                        ...editingMember,
                        socialLinks: { ...editingMember.socialLinks, github: e.target.value }
                      })}
                      placeholder="GitHub URL"
                      className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Twitter className="w-4 h-4 text-slate-400" />
                    <input
                      type="url"
                      value={editingMember.socialLinks?.twitter || ''}
                      onChange={(e) => setEditingMember({
                        ...editingMember,
                        socialLinks: { ...editingMember.socialLinks, twitter: e.target.value }
                      })}
                      placeholder="Twitter / X URL"
                      className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={editingMember.published !== false}
                    onChange={(e) => setEditingMember({ ...editingMember, published: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  Published (Visible on About page)
                </label>
              </div>

            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-200 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setEditingMember(null)}
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
                {saving ? 'Saving...' : isNew ? 'Add Member' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
