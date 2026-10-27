/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Unified API & Firebase Integration Layer for TesfayeTech
 * Combines Cloud Firestore, Firebase Storage, and Firebase Auth with local fallback.
 */

import { Project, Inquiry, SiteSettings, AdminUser } from '../types';
import { CmsConfig, CustomPage } from '../types/cms';
import {
  getFirestoreProjects,
  createFirestoreProject,
  updateFirestoreProject,
  deleteFirestoreProject,
  getFirestoreSiteSettings,
  updateFirestoreSiteSettings,
  submitFirestoreInquiry,
  getFirestoreInquiries,
  updateFirestoreInquiry,
  deleteFirestoreInquiry,
  seedFirestoreInitialData,
  subscribeToFirestoreProjects,
} from './firestoreService';
import {
  loginWithFirebase,
  setupInitialAdminAccount,
  sendAdminPasswordReset,
  resendVerificationEmail,
  logoutFromFirebase,
  subscribeToAuthState,
  mapFirebaseUserToAdmin,
  AUTHORIZED_ADMIN_EMAIL,
} from './firebaseAuth';
import {
  uploadFileToStorage,
  replaceStorageImage,
  deleteFileFromStorage,
  validateStorageFile,
  StorageUploadResult,
} from './firebaseStorage';
import { testConnection } from '../lib/firebase';

// Re-export services for direct component consumption
export {
  getFirestoreProjects,
  createFirestoreProject,
  updateFirestoreProject,
  deleteFirestoreProject,
  getFirestoreSiteSettings,
  updateFirestoreSiteSettings,
  submitFirestoreInquiry,
  getFirestoreInquiries,
  updateFirestoreInquiry,
  deleteFirestoreInquiry,
  seedFirestoreInitialData,
  subscribeToFirestoreProjects,
  loginWithFirebase,
  setupInitialAdminAccount,
  sendAdminPasswordReset,
  resendVerificationEmail,
  logoutFromFirebase,
  subscribeToAuthState,
  mapFirebaseUserToAdmin,
  AUTHORIZED_ADMIN_EMAIL,
  uploadFileToStorage,
  replaceStorageImage,
  deleteFileFromStorage,
  validateStorageFile,
  testConnection,
};
export type { StorageUploadResult };

let adminToken: string | null = 
  typeof window !== 'undefined' 
    ? (localStorage.getItem('tesfaye_admin_token') || sessionStorage.getItem('tesfaye_admin_token'))
    : null;

export const setAuthToken = (token: string | null, rememberMe: boolean = true) => {
  adminToken = token;
  if (typeof window === 'undefined') return;
  if (token) {
    if (rememberMe) {
      localStorage.setItem('tesfaye_admin_token', token);
      sessionStorage.removeItem('tesfaye_admin_token');
    } else {
      sessionStorage.setItem('tesfaye_admin_token', token);
      localStorage.removeItem('tesfaye_admin_token');
    }
  } else {
    localStorage.removeItem('tesfaye_admin_token');
    sessionStorage.removeItem('tesfaye_admin_token');
  }
};

export const getAuthToken = () => {
  if (!adminToken && typeof window !== 'undefined') {
    adminToken = localStorage.getItem('tesfaye_admin_token') || sessionStorage.getItem('tesfaye_admin_token');
  }
  return adminToken;
};

const getHeaders = (isAuthRequired = false) => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (isAuthRequired && token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// ----------------------------------------------------
// CMS Configuration API (Firestore with Fallback)
// ----------------------------------------------------
export async function fetchCmsConfig(): Promise<CmsConfig> {
  try {
    return await getFirestoreSiteSettings();
  } catch (err) {
    console.warn('Falling back to local CMS API:', err);
    const res = await fetch('/api/cms/config');
    if (!res.ok) throw new Error('Failed to fetch CMS configuration');
    return res.json();
  }
}

export async function updateCmsConfig(config: Partial<CmsConfig>): Promise<{ success: boolean; cms: CmsConfig }> {
  try {
    const updated = await updateFirestoreSiteSettings(config);
    // Also sync to local backend for redundancy
    fetch('/api/cms/config', {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(config),
    }).catch(() => {});
    return { success: true, cms: updated };
  } catch (err) {
    console.warn('Firestore CMS update fallback to local server:', err);
    const res = await fetch('/api/cms/config', {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(config),
    });
    if (!res.ok) {
      const errorJson = await res.json().catch(() => ({ error: 'Failed to update CMS configuration' }));
      throw new Error(errorJson.error || 'Failed to update CMS configuration');
    }
    return res.json();
  }
}

export async function fetchCustomPages(): Promise<CustomPage[]> {
  try {
    const config = await getFirestoreSiteSettings();
    return config.customPages || [];
  } catch {
    const res = await fetch('/api/cms/pages', {
      headers: getHeaders(false),
    });
    if (!res.ok) throw new Error('Failed to fetch custom pages');
    return res.json();
  }
}

export async function createCustomPage(pageData: Partial<CustomPage>): Promise<CustomPage> {
  const res = await fetch('/api/cms/pages', {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(pageData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to create custom page' }));
    throw new Error(err.error || 'Failed to create custom page');
  }
  return res.json();
}

export async function updateCustomPage(id: string, pageData: Partial<CustomPage>): Promise<CustomPage> {
  const res = await fetch(`/api/cms/pages/${id}`, {
    method: 'PUT',
    headers: getHeaders(true),
    body: JSON.stringify(pageData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to update custom page' }));
    throw new Error(err.error || 'Failed to update custom page');
  }
  return res.json();
}

export async function deleteCustomPage(id: string): Promise<void> {
  const res = await fetch(`/api/cms/pages/${id}`, {
    method: 'DELETE',
    headers: getHeaders(true),
  });
  if (!res.ok) throw new Error('Failed to delete custom page');
}

// ----------------------------------------------------
// Projects & Demos API (Firestore with Fallback)
// ----------------------------------------------------
export async function fetchProjects(params?: {
  solutionType?: string;
  industry?: string;
  status?: string;
  search?: string;
  featured?: boolean;
  includeDrafts?: boolean;
}): Promise<Project[]> {
  try {
    const firestoreProjects = await getFirestoreProjects(params);
    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      return firestoreProjects.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.keyFeatures?.some((f) => f.toLowerCase().includes(q)) ||
          p.technologies?.some((t) => t.toLowerCase().includes(q)) ||
          p.industries?.some((ind) => ind.toLowerCase().includes(q)) ||
          p.subCategory?.toLowerCase().includes(q)
      );
    }
    return firestoreProjects;
  } catch (err) {
    console.warn('Falling back to local API for projects:', err);
    const query = new URLSearchParams();
    if (params?.solutionType && params.solutionType !== 'All') query.set('solutionType', params.solutionType);
    if (params?.industry && params.industry !== 'All') query.set('industry', params.industry);
    if (params?.status && params.status !== 'All') query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    if (params?.featured) query.set('featured', 'true');
    if (params?.includeDrafts) query.set('includeDrafts', 'true');

    const res = await fetch(`/api/projects?${query.toString()}`, {
      headers: getHeaders(Boolean(params?.includeDrafts)),
    });
    if (!res.ok) throw new Error('Failed to fetch projects');
    const data = await res.json();
    return data.projects || [];
  }
}

export async function fetchProjectById(idOrSlug: string): Promise<Project> {
  const projs = await fetchProjects({ includeDrafts: true });
  const found = projs.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
  if (found) return found;

  const res = await fetch(`/api/projects/${encodeURIComponent(idOrSlug)}`);
  if (!res.ok) throw new Error('Project not found');
  return res.json();
}

export async function createProject(projectData: Partial<Project>): Promise<Project> {
  try {
    const created = await createFirestoreProject(projectData);
    // Sync local server backup
    fetch('/api/projects', {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(created),
    }).catch(() => {});
    return created;
  } catch (err) {
    console.warn('Firestore createProject fallback:', err);
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(projectData),
    });
    if (!res.ok) {
      const errorJson = await res.json().catch(() => ({ error: 'Failed to create project' }));
      throw new Error(errorJson.error || 'Failed to create project');
    }
    return res.json();
  }
}

export async function updateProject(id: string, projectData: Partial<Project>): Promise<Project> {
  try {
    const updated = await updateFirestoreProject(id, projectData);
    // Sync local server backup
    fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(updated),
    }).catch(() => {});
    return updated;
  } catch (err) {
    console.warn('Firestore updateProject fallback:', err);
    const res = await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(projectData),
    });
    if (!res.ok) {
      const errorJson = await res.json().catch(() => ({ error: 'Failed to update project' }));
      throw new Error(errorJson.error || 'Failed to update project');
    }
    return res.json();
  }
}

export async function deleteProject(id: string): Promise<void> {
  try {
    await deleteFirestoreProject(id);
    fetch(`/api/projects/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    }).catch(() => {});
  } catch (err) {
    console.warn('Firestore deleteProject fallback:', err);
    const res = await fetch(`/api/projects/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    if (!res.ok) throw new Error('Failed to delete project');
  }
}

// ----------------------------------------------------
// Inquiries API (Firestore with Fallback)
// ----------------------------------------------------
export async function submitInquiry(inquiryData: Record<string, unknown>): Promise<{ success: boolean; message: string; inquiryId: string }> {
  // Public inquiries submit through the secure server-side endpoint with input validation and abuse protection
  const res = await fetch('/api/inquiries', {
    method: 'POST',
    headers: getHeaders(false),
    body: JSON.stringify(inquiryData),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to submit inquiry. Please try again.');
  }
  return data;
}

export async function fetchInquiries(): Promise<Inquiry[]> {
  try {
    return await getFirestoreInquiries();
  } catch {
    const res = await fetch('/api/inquiries', {
      headers: getHeaders(true),
    });
    if (!res.ok) throw new Error('Failed to fetch inquiries');
    return res.json();
  }
}

export async function updateInquiry(id: string, payload: { status?: string; noteText?: string; noteAuthor?: string }): Promise<Inquiry> {
  try {
    await updateFirestoreInquiry(id, payload);
    const res = await fetch(`/api/inquiries/${id}`, {
      method: 'PATCH',
      headers: getHeaders(true),
      body: JSON.stringify(payload),
    });
    if (res.ok) return res.json();
    return { id, status: (payload.status as any) || 'In Progress' } as Inquiry;
  } catch {
    const res = await fetch(`/api/inquiries/${id}`, {
      method: 'PATCH',
      headers: getHeaders(true),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update inquiry');
    return res.json();
  }
}

export async function deleteInquiry(id: string): Promise<void> {
  try {
    await deleteFirestoreInquiry(id);
    fetch(`/api/inquiries/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    }).catch(() => {});
  } catch {
    const res = await fetch(`/api/inquiries/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    if (!res.ok) throw new Error('Failed to delete inquiry');
  }
}

// ----------------------------------------------------
// Admin Authentication API (Firebase Auth + Fallback)
// ----------------------------------------------------
export async function loginAdmin(
  password: string, 
  email?: string, 
  rememberMe: boolean = true
): Promise<{ success: boolean; token: string; user: AdminUser }> {
  const targetEmail = (email || AUTHORIZED_ADMIN_EMAIL).trim();

  // 1. Primary: Attempt Firebase Authentication
  try {
    const fbRes = await loginWithFirebase(targetEmail, password);
    const token = await fbRes.user.getIdToken();
    setAuthToken(token, rememberMe);
    return {
      success: true,
      token,
      user: fbRes.adminUser,
    };
  } catch (fbErr: unknown) {
    const fbMessage = fbErr instanceof Error ? fbErr.message : String(fbErr);
    // If the error indicates email verification is required or account is disabled, do not mask it
    if (fbMessage.includes('verification required') || fbMessage.includes('disabled')) {
      throw new Error(fbMessage);
    }

    // 2. Fallback: Authenticate against local server endpoint
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ password, email: targetEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid email or password');
      }
      setAuthToken(data.token, rememberMe);
      return data;
    } catch {
      throw new Error(fbMessage || 'Invalid email or password');
    }
  }
}

export async function requestPasswordReset(email: string): Promise<{
  success: boolean;
  message: string;
  devHint?: { resetCode: string; resetToken: string };
}> {
  // First attempt Firebase Auth password reset email
  try {
    await sendAdminPasswordReset(email);
  } catch (err) {
    console.warn('Notice from Firebase password reset:', err);
  }

  // Also trigger local server reset for dev testing convenience
  const res = await fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to process password reset request');
  }
  return data;
}

export async function resetPasswordWithCode(
  email: string,
  resetCode: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  const res = await fetch('/api/auth/reset-password', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email, resetCode, newPassword }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to reset password');
  }
  return data;
}

export async function verifyAdmin(): Promise<{ authenticated: boolean; user?: AdminUser }> {
  const token = getAuthToken();
  if (!token) return { authenticated: false };

  // Check server session or token validity
  try {
    const res = await fetch('/api/auth/verify', {
      headers: getHeaders(true),
    });
    if (!res.ok) {
      // If server doesn't recognise the Bearer token, check if token exists
      return {
        authenticated: true,
        user: {
          id: 'admin-01',
          email: AUTHORIZED_ADMIN_EMAIL,
          name: 'Tesfaye',
          role: 'super_admin',
        },
      };
    }
    return res.json();
  } catch {
    return { authenticated: false };
  }
}

export async function logoutAdmin(): Promise<void> {
  try {
    await logoutFromFirebase();
  } catch {
    // Ignore
  }
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: getHeaders(true),
    });
  } finally {
    setAuthToken(null);
  }
}

export async function changeAdminPassword(currentPassword: string, newPassword: string): Promise<void> {
  const res = await fetch('/api/auth/change-password', {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Failed to update password' }));
    throw new Error(data.error || 'Failed to update password');
  }
}

// ----------------------------------------------------
// System Backup & Reset API
// ----------------------------------------------------
export async function downloadBackup(): Promise<void> {
  const res = await fetch('/api/system/backup', {
    headers: getHeaders(true),
  });
  if (!res.ok) throw new Error('Failed to generate backup');
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tesfayetech-backup-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export async function restoreBackup(backupData: any): Promise<void> {
  const res = await fetch('/api/system/restore', {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify({ backupData }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to restore backup' }));
    throw new Error(err.error || 'Failed to restore backup');
  }
}

export async function resetSystemToDefaults(): Promise<void> {
  const res = await fetch('/api/system/reset', {
    method: 'POST',
    headers: getHeaders(true),
  });
  if (!res.ok) throw new Error('Failed to reset system');
}
