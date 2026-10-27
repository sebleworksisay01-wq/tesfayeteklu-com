/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Firebase Modular SDK Singleton Initialization Module
 * Project: tesfayeteklu-com
 */

import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD0IwWim2GP7vt_3BjuIXBQg3byfk3ov4U",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "tesfayeteklu-com.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "tesfayeteklu-com",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "tesfayeteklu-com.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "414838731101",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:414838731101:web:873d7070908a601445b8b4"
};

// Singleton initialization to prevent multiple Firebase app instances
const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);

// ----------------------------------------------------
// Firestore Error Context Handler (Standardized Diagnostics)
// ----------------------------------------------------
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const currentAuth = auth.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentAuth?.uid ?? null,
      email: currentAuth?.email ?? null,
      emailVerified: currentAuth?.emailVerified ?? null,
      isAnonymous: currentAuth?.isAnonymous ?? null,
      tenantId: currentAuth?.tenantId ?? null,
      providerInfo: currentAuth?.providerData?.map((p) => ({
        providerId: p.providerId,
        email: p.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('[Firestore Error Details]', JSON.stringify(errInfo, null, 2));
  throw new Error(JSON.stringify(errInfo));
}

// ----------------------------------------------------
// Firestore Connectivity Check
// ----------------------------------------------------
export async function testConnection(): Promise<boolean> {
  try {
    // Attempt connectivity validation against Firestore
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline or network blocked. Please check Firebase project configuration.');
      return false;
    }
    // Document non-existence is expected and still confirms network reachability to Firestore
    return true;
  }
}

export default app;
