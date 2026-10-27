/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Cloud Firestore Data Service for TesfayeTech
 * Collections: projects, siteSettings, inquiries, adminData
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Project, Inquiry } from '../types';
import { CmsConfig, CustomPage } from '../types/cms';
import { DEFAULT_CMS_CONFIG } from '../data/initialCmsData';
import { INITIAL_PROJECTS, INITIAL_INQUIRIES } from '../data/seedData';

// Collection identifiers
export const COLLECTIONS = {
  PROJECTS: 'projects',
  SITE_SETTINGS: 'siteSettings',
  INQUIRIES: 'inquiries',
  ADMIN_DATA: 'adminData',
} as const;

/**
 * Normalizes a Firestore document into the application Project type
 */
function normalizeProjectDoc(id: string, data: Record<string, unknown>): Project {
  // Gracefully handle ISO strings, Firestore Timestamps, or date objects
  const formatTimestamp = (val: unknown): string => {
    if (!val) return new Date().toISOString();
    if (val instanceof Timestamp) return val.toDate().toISOString();
    if (typeof (val as { toDate?: () => Date }).toDate === 'function') {
      return (val as { toDate: () => Date }).toDate().toISOString();
    }
    return String(val);
  };

  const name = String(data.name || data.title || 'Untitled Solution');
  const shortDescription = String(data.shortDescription || data.description || '');
  const solutionType = (data.solutionType || data.category || 'Website Design') as Project['solutionType'];
  const industries = Array.isArray(data.industries)
    ? (data.industries as string[])
    : Array.isArray(data.businessArea)
    ? (data.businessArea as string[])
    : typeof data.businessArea === 'string'
    ? [data.businessArea]
    : ['Professional and Consulting Services'];

  const thumbnail = String(
    data.thumbnail ||
    data.imageUrl ||
    '/src/assets/images/web_app_dashboard_1793079158006.jpg'
  );

  const screenshots = Array.isArray(data.screenshots) && data.screenshots.length > 0
    ? (data.screenshots as string[])
    : Array.isArray(data.gallery) && data.gallery.length > 0
    ? (data.gallery as string[])
    : [thumbnail];

  return {
    id,
    slug: String(data.slug || id),
    name,
    title: name,
    shortDescription,
    description: shortDescription,
    solutionType,
    category: solutionType,
    subCategory: String(data.subCategory || 'Enterprise Solution'),
    industries,
    businessArea: industries,
    overview: String(data.overview || shortDescription),
    businessProblem: String(data.businessProblem || 'Operational friction and workflow bottlenecks.'),
    proposedSolution: String(data.proposedSolution || 'Custom engineered software architecture.'),
    targetUsers: Array.isArray(data.targetUsers) ? (data.targetUsers as string[]) : ['Operations Staff', 'Customers'],
    keyFeatures: Array.isArray(data.keyFeatures) ? (data.keyFeatures as string[]) : ['Cloud-hosted scalable architecture', 'Responsive interface'],
    technologies: Array.isArray(data.technologies) ? (data.technologies as string[]) : ['React', 'TypeScript', 'Node.js'],
    status: (data.status || 'Live Demo') as Project['status'],
    featured: Boolean(data.featured),
    published: data.published !== undefined ? Boolean(data.published) : true,
    thumbnail,
    imageUrl: thumbnail,
    imagePath: typeof data.imagePath === 'string' ? data.imagePath : undefined,
    screenshots,
    gallery: screenshots,
    sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : 0,
    demoUrl: typeof data.demoUrl === 'string' ? data.demoUrl : '',
    interactiveSimulator: data.interactiveSimulator as Project['interactiveSimulator'],
    createdAt: formatTimestamp(data.createdAt),
    updatedAt: formatTimestamp(data.updatedAt),
  };
}

// ----------------------------------------------------
// 1. Projects Operations
// ----------------------------------------------------

/**
 * Fetches published projects for public visitors, or all projects for administrators
 */
export async function getFirestoreProjects(params?: {
  includeDrafts?: boolean;
  solutionType?: string;
  industry?: string;
  featured?: boolean;
}): Promise<Project[]> {
  try {
    const colRef = collection(db, COLLECTIONS.PROJECTS);
    let q = query(colRef);

    // If public visitor (or not requesting drafts), restrict to published items
    if (!params?.includeDrafts) {
      q = query(colRef, where('published', '==', true));
    }

    const snapshot = await getDocs(q);

    // If Firestore collection is empty, return initial seed data to prevent blank site
    if (snapshot.empty) {
      return INITIAL_PROJECTS.filter((p) => (params?.includeDrafts ? true : p.published));
    }

    let results = snapshot.docs.map((docSnap) =>
      normalizeProjectDoc(docSnap.id, docSnap.data())
    );

    // Client-side filtering for compound filters
    if (params?.solutionType && params.solutionType !== 'All') {
      results = results.filter((p) => p.solutionType === params.solutionType || p.category === params.solutionType);
    }
    if (params?.industry && params.industry !== 'All') {
      results = results.filter((p) => p.industries?.includes(params.industry!));
    }
    if (params?.featured) {
      results = results.filter((p) => p.featured);
    }

    return results;
  } catch (error) {
    console.warn('Falling back to local projects seed due to Firestore read notice:', error);
    return INITIAL_PROJECTS.filter((p) => (params?.includeDrafts ? true : p.published));
  }
}

/**
 * Subscribes to live project changes (for reactive public views & CMS)
 */
export function subscribeToFirestoreProjects(
  callback: (projects: Project[]) => void,
  includeDrafts = false
): () => void {
  const colRef = collection(db, COLLECTIONS.PROJECTS);
  const q = includeDrafts
    ? query(colRef)
    : query(colRef, where('published', '==', true));

  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        callback(INITIAL_PROJECTS.filter((p) => (includeDrafts ? true : p.published)));
      } else {
        const projs = snapshot.docs.map((docSnap) => normalizeProjectDoc(docSnap.id, docSnap.data()));
        callback(projs);
      }
    },
    (err) => {
      console.warn('Projects snapshot fallback listener:', err);
      callback(INITIAL_PROJECTS.filter((p) => (includeDrafts ? true : p.published)));
    }
  );
}

/**
 * Creates a new project record in Firestore
 */
export async function createFirestoreProject(project: Partial<Project>): Promise<Project> {
  const newId = project.id || 'proj-' + Date.now();
  const docRef = doc(db, COLLECTIONS.PROJECTS, newId);

  const cleanSlug = (project.slug || project.name || project.title || 'project')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const payload: Record<string, unknown> = {
    slug: cleanSlug,
    name: project.name || project.title || 'Untitled Project',
    title: project.title || project.name || 'Untitled Project',
    shortDescription: project.shortDescription || project.description || '',
    description: project.description || project.shortDescription || '',
    solutionType: project.solutionType || project.category || 'Website Design',
    category: project.category || project.solutionType || 'Website Design',
    subCategory: project.subCategory || 'General Solution',
    industries: project.industries || ['Professional and Consulting Services'],
    businessArea: project.businessArea || project.industries || ['Professional and Consulting Services'],
    overview: project.overview || project.shortDescription || '',
    businessProblem: project.businessProblem || 'Operational friction and workflow bottlenecks.',
    proposedSolution: project.proposedSolution || 'Custom engineered software architecture.',
    targetUsers: project.targetUsers || ['Operations Staff', 'Customers'],
    keyFeatures: project.keyFeatures || ['Scalable Cloud Architecture', 'High-speed Response'],
    technologies: project.technologies || ['React', 'TypeScript', 'Firebase'],
    status: project.status || 'Live Demo',
    featured: Boolean(project.featured),
    published: project.published !== undefined ? Boolean(project.published) : true,
    thumbnail: project.thumbnail || project.imageUrl || '/src/assets/images/web_app_dashboard_1793079158006.jpg',
    imageUrl: project.imageUrl || project.thumbnail || '/src/assets/images/web_app_dashboard_1793079158006.jpg',
    imagePath: project.imagePath || null,
    screenshots: project.screenshots || project.gallery || [],
    gallery: project.gallery || project.screenshots || [],
    sortOrder: project.sortOrder ?? 0,
    demoUrl: project.demoUrl || '',
    interactiveSimulator: project.interactiveSimulator || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(docRef, payload);
    return normalizeProjectDoc(newId, {
      ...payload,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${COLLECTIONS.PROJECTS}/${newId}`);
  }
}

/**
 * Updates an existing project in Firestore
 */
export async function updateFirestoreProject(id: string, updates: Partial<Project>): Promise<Project> {
  const docRef = doc(db, COLLECTIONS.PROJECTS, id);
  const payload: Record<string, unknown> = {
    ...updates,
    updatedAt: serverTimestamp(),
  };

  // Keep dual aliases synchronized
  if (updates.name) payload.title = updates.name;
  if (updates.title) payload.name = updates.title;
  if (updates.shortDescription) payload.description = updates.shortDescription;
  if (updates.description) payload.shortDescription = updates.description;
  if (updates.solutionType) payload.category = updates.solutionType;
  if (updates.category) payload.solutionType = updates.category;
  if (updates.thumbnail) payload.imageUrl = updates.thumbnail;
  if (updates.imageUrl) payload.thumbnail = updates.imageUrl;
  if (updates.screenshots) payload.gallery = updates.screenshots;
  if (updates.gallery) payload.screenshots = updates.gallery;

  try {
    await updateDoc(docRef, payload);
    const updatedSnap = await getDoc(docRef);
    if (!updatedSnap.exists()) throw new Error('Project not found after update.');
    return normalizeProjectDoc(id, updatedSnap.data());
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTIONS.PROJECTS}/${id}`);
  }
}

/**
 * Deletes a project from Firestore
 */
export async function deleteFirestoreProject(id: string): Promise<void> {
  const docRef = doc(db, COLLECTIONS.PROJECTS, id);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTIONS.PROJECTS}/${id}`);
  }
}

// ----------------------------------------------------
// 2. Site Settings & CMS Configuration
// ----------------------------------------------------

const SETTINGS_DOC_ID = 'current';

/**
 * Fetches website settings & CMS configuration from Firestore
 */
export async function getFirestoreSiteSettings(): Promise<CmsConfig> {
  try {
    const docRef = doc(db, COLLECTIONS.SITE_SETTINGS, SETTINGS_DOC_ID);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      return snap.data() as CmsConfig;
    }

    // If not yet saved in Firestore, return default seed config
    return DEFAULT_CMS_CONFIG;
  } catch (error) {
    console.warn('Falling back to default CMS config:', error);
    return DEFAULT_CMS_CONFIG;
  }
}

/**
 * Updates website settings & CMS configuration in Firestore
 */
export async function updateFirestoreSiteSettings(config: Partial<CmsConfig>): Promise<CmsConfig> {
  const docRef = doc(db, COLLECTIONS.SITE_SETTINGS, SETTINGS_DOC_ID);
  try {
    const current = await getFirestoreSiteSettings();
    const updated: CmsConfig = {
      ...current,
      ...config,
      version: (current.version || 1) + 1,
      lastUpdated: new Date().toISOString(),
    };
    await setDoc(docRef, updated, { merge: true });
    return updated;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTIONS.SITE_SETTINGS}/${SETTINGS_DOC_ID}`);
  }
}

// ----------------------------------------------------
// 3. Inquiries Operations
// ----------------------------------------------------

/**
 * Submits a new project inquiry or quote request
 */
export async function submitFirestoreInquiry(inquiryData: Record<string, unknown>): Promise<{ success: boolean; inquiryId: string }> {
  const newId = 'inq-' + Date.now();
  const docRef = doc(db, COLLECTIONS.INQUIRIES, newId);

  const payload = {
    ...inquiryData,
    id: newId,
    status: 'New',
    internalNotes: [],
    createdAt: serverTimestamp(),
  };

  try {
    await setDoc(docRef, payload);
    return { success: true, inquiryId: newId };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${COLLECTIONS.INQUIRIES}/${newId}`);
  }
}

/**
 * Fetches inquiries for administrator view
 */
export async function getFirestoreInquiries(): Promise<Inquiry[]> {
  try {
    const colRef = collection(db, COLLECTIONS.INQUIRIES);
    const snap = await getDocs(colRef);

    if (snap.empty) {
      return INITIAL_INQUIRIES;
    }

    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        fullName: String(data.fullName || ''),
        companyName: String(data.companyName || 'Independent'),
        email: String(data.email || ''),
        phone: String(data.phone || 'Not provided'),
        country: String(data.country || 'Unspecified'),
        solutionType: String(data.solutionType || 'General Consultation'),
        industry: String(data.industry || 'Professional Services'),
        projectDescription: String(data.projectDescription || ''),
        requiredFeatures: String(data.requiredFeatures || ''),
        budgetRange: String(data.budgetRange || 'Flexible'),
        expectedCompletionDate: String(data.expectedCompletionDate || 'Flexible'),
        preferredContactMethod: (data.preferredContactMethod || 'Email') as Inquiry['preferredContactMethod'],
        status: (data.status || 'New') as Inquiry['status'],
        internalNotes: Array.isArray(data.internalNotes) ? data.internalNotes : [],
        relatedProjectId: typeof data.relatedProjectId === 'string' ? data.relatedProjectId : undefined,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : String(data.createdAt || new Date().toISOString()),
      };
    });
  } catch (error) {
    console.warn('Falling back to local inquiries seed:', error);
    return INITIAL_INQUIRIES;
  }
}

/**
 * Updates status or adds notes to an inquiry
 */
export async function updateFirestoreInquiry(
  id: string,
  updates: { status?: string; noteText?: string; noteAuthor?: string }
): Promise<void> {
  const docRef = doc(db, COLLECTIONS.INQUIRIES, id);
  try {
    const snap = await getDoc(docRef);
    if (!snap.exists()) throw new Error('Inquiry not found');
    const existing = snap.data();

    const notes = Array.isArray(existing.internalNotes) ? [...existing.internalNotes] : [];
    if (updates.noteText) {
      notes.push({
        id: 'note-' + Date.now(),
        author: updates.noteAuthor || 'Admin',
        text: updates.noteText,
        date: new Date().toISOString(),
      });
    }

    const payload: Record<string, unknown> = {
      internalNotes: notes,
      updatedAt: serverTimestamp(),
    };
    if (updates.status) payload.status = updates.status;

    await updateDoc(docRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTIONS.INQUIRIES}/${id}`);
  }
}

/**
 * Deletes an inquiry
 */
export async function deleteFirestoreInquiry(id: string): Promise<void> {
  const docRef = doc(db, COLLECTIONS.INQUIRIES, id);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTIONS.INQUIRIES}/${id}`);
  }
}

// ----------------------------------------------------
// 4. Seeding Helper (One-Click Database Bootstrap)
// ----------------------------------------------------
export async function seedFirestoreInitialData(): Promise<{ projectsCount: number; settingsSaved: boolean }> {
  // 1. Seed site settings
  await setDoc(doc(db, COLLECTIONS.SITE_SETTINGS, SETTINGS_DOC_ID), DEFAULT_CMS_CONFIG);

  // 2. Seed projects
  let count = 0;
  for (const project of INITIAL_PROJECTS) {
    const docRef = doc(db, COLLECTIONS.PROJECTS, project.id);
    await setDoc(docRef, {
      ...project,
      title: project.name,
      description: project.shortDescription,
      category: project.solutionType,
      businessArea: project.industries,
      imageUrl: project.thumbnail,
      gallery: project.screenshots,
      sortOrder: count,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    count++;
  }

  return { projectsCount: count, settingsSaved: true };
}
