import React, { useState, useEffect } from 'react';
import { 
  Users, Shield, CheckCircle2, AlertCircle, RefreshCw, 
  Search, Lock, Mail, Clock, ShieldAlert, Sparkles 
} from 'lucide-react';
import { getFirestoreUsers, updateFirestoreUser, AUTHORIZED_ADMIN_EMAIL } from '../../services/api';

interface FirestoreUserDoc {
  id: string;
  uid?: string;
  email: string;
  displayName?: string;
  name?: string;
  role?: string;
  emailVerified?: boolean;
  createdAt?: any;
  lastLoginAt?: any;
  status?: string;
}

export const UserManagerTab: React.FC = () => {
  const [users, setUsers] = useState<FirestoreUserDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    setActionMessage(null);
    try {
      const rawData = await getFirestoreUsers();
      const mappedData: FirestoreUserDoc[] = rawData.map((u: any) => ({
        id: u.uid || u.id || `usr-${Math.random()}`,
        uid: u.uid,
        email: u.email,
        name: u.fullName || u.name || u.displayName,
        displayName: u.displayName || u.fullName,
        role: u.role,
        emailVerified: u.emailVerified,
        status: u.accountStatus || u.status || 'Active',
        createdAt: u.createdAt,
        lastLoginAt: u.lastLoginAt,
      }));

      // Ensure the authorized admin is included in the list
      const adminExists = mappedData.some((u) => u.email?.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase());
      if (!adminExists) {
        mappedData.unshift({
          id: 'admin-pinned',
          email: AUTHORIZED_ADMIN_EMAIL,
          name: 'Tesfaye Teklu',
          role: 'Administrator',
          emailVerified: true,
          status: 'Active',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        });
      }
      setUsers(mappedData);
    } catch (err: unknown) {
      console.warn('Could not load Firestore users directly:', err);
      // Fallback display
      setUsers([
        {
          id: 'admin-pinned',
          email: AUTHORIZED_ADMIN_EMAIL,
          name: 'Tesfaye Teklu',
          role: 'Administrator',
          emailVerified: true,
          status: 'Active',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (userId: string, userEmail: string, newRole: string) => {
    if (userEmail?.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase() && newRole !== 'admin' && newRole !== 'Administrator') {
      alert(`The designated super administrator (${AUTHORIZED_ADMIN_EMAIL}) role cannot be changed.`);
      return;
    }

    setUpdatingId(userId);
    try {
      await updateFirestoreUser(userId, { role: newRole as any });
      setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      setActionMessage(`Updated role for ${userEmail} to ${newRole}.`);
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update role');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.name || u.displayName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'All' || (u.role || 'user').toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-2xs font-bold uppercase tracking-wider mb-1">
            <Shield className="w-3 h-3" />
            Module 16 &bull; Zero-Trust Access Control
          </div>
          <h2 className="text-xl font-bold text-slate-900">User & Access Management</h2>
          <p className="text-xs text-slate-500">
            Audit registered accounts, verified emails, and assign administrator privileges backed by Cloud Firestore.
          </p>
        </div>
        <button
          onClick={loadUsers}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Users
        </button>
      </div>

      {actionMessage && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by user email or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-2xs font-semibold text-slate-500 uppercase">Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-medium focus:outline-none"
          >
            <option value="All">All Roles</option>
            <option value="admin">Administrators</option>
            <option value="editor">Editors</option>
            <option value="user">Standard Users</option>
          </select>
          <span className="text-2xs text-slate-400 ml-2">Total: {filteredUsers.length}</span>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-2xs tracking-wider">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email Verification</th>
                <th className="py-3 px-4">Assigned Role</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4 text-right">Access Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No registered users found matching the query.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isSuperAdmin = u.email?.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase();

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                            isSuperAdmin ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {(u.name || u.displayName || u.email || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{u.name || u.displayName || 'Registered Client'}</span>
                              {isSuperAdmin && (
                                <span className="px-1.5 py-0.2 rounded bg-indigo-50 border border-indigo-200 text-indigo-700 text-3xs font-extrabold uppercase">
                                  Super Admin
                                </span>
                              )}
                            </div>
                            <div className="text-2xs text-slate-500 font-mono">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {u.emailVerified ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-2xs font-semibold border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-2xs font-semibold border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Pending Verification
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-md text-2xs font-bold capitalize ${
                          u.role === 'admin'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : u.role === 'editor'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {u.role || 'User'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-2xs text-slate-500">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {isSuperAdmin ? (
                          <span className="text-2xs font-semibold text-slate-400 italic">
                            Protected Super Administrator
                          </span>
                        ) : (
                          <select
                            value={u.role || 'user'}
                            disabled={updatingId === u.id}
                            onChange={(e) => handleRoleChange(u.id, u.email, e.target.value)}
                            className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-2xs font-medium text-slate-800"
                          >
                            <option value="user">User (Standard)</option>
                            <option value="editor">Editor (Content only)</option>
                            <option value="admin">Administrator (Full CMS)</option>
                          </select>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
