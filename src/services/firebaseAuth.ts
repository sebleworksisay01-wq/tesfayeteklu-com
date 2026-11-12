/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Firebase Authentication & User Management Service for TesfayeTech
 * Designated authorized administrator: tesfayeteklufeyissa@gmail.com
 */

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged,
  applyActionCode,
  updateProfile,
  User,
  ActionCodeSettings,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { AdminUser, UserProfile } from '../types';
import { sanitizeForFirestore } from './firestoreService';

export const AUTHORIZED_ADMIN_EMAILS: string[] = ['contactesfaye@gmail.com', 'tesfayeteklufeyissa@gmail.com'];
export const AUTHORIZED_ADMIN_EMAIL = 'contactesfaye@gmail.com';

export function isAuthorizedAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return AUTHORIZED_ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

export interface AppAuthState {
  user: User | null;
  profile: UserProfile | null;
  adminUser: AdminUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isEmailVerified: boolean;
  loading: boolean;
  error: string | null;
}

// Backward-compatible alias for existing imports
export type AdminAuthState = AppAuthState;

/**
 * Maps a Firebase Auth User to the internal AdminUser model if authorized and verified
 */
export function mapFirebaseUserToAdmin(user: User | null): AdminUser | null {
  if (!user || !user.email) return null;
  const normalizedEmail = user.email.trim().toLowerCase();
  
  if (!isAuthorizedAdminEmail(normalizedEmail)) {
    return null;
  }

  return {
    id: user.uid,
    email: user.email,
    name: user.displayName || 'Tesfaye Teklu',
    role: 'super_admin',
  };
}

/**
 * Friendly error message parser for Firebase Auth error codes
 */
export function getFriendlyAuthErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) return 'An unexpected authentication error occurred.';
  const code = (error as { code?: string }).code || '';

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email or password. Please verify your credentials.';
    case 'auth/too-many-requests':
      return 'Access temporarily restricted due to many failed login attempts. Please reset your password or try again in 15 minutes.';
    case 'auth/user-disabled':
      return 'This user account has been disabled. Please contact system support.';
    case 'auth/invalid-email':
      return 'The email address format is invalid.';
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 8 characters with letters and numbers.';
    case 'auth/network-request-failed':
      return 'Network connection failed. Please verify your internet connection.';
    case 'auth/requires-recent-login':
      return 'This sensitive operation requires a recent sign-in. Please sign in again and retry.';
    case 'auth/invalid-action-code':
      return 'This verification link is invalid or has already been used. Please request a new verification link.';
    case 'auth/expired-action-code':
      return 'Your verification link has expired. Please request a new verification link.';
    default:
      return error.message || 'Authentication operation failed.';
  }
}

/**
 * Get action code settings for email verification
 */
export function getActionCodeSettings(): ActionCodeSettings {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://tesfayeteklu.com';
  return {
    url: `${origin}/login?verified=true`,
    handleCodeInApp: false,
  };
}

/**
 * Fetches user profile document from Firestore
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (err) {
    console.warn('Notice reading user profile from Firestore:', err);
    return null;
  }
}

/**
 * Updates a user profile in Firestore
 */
export async function updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    const cleanData = sanitizeForFirestore({
      ...data,
      updatedAt: new Date().toISOString(),
    });
    await updateDoc(userRef, cleanData);
  } catch (err) {
    console.warn('Notice updating user profile in Firestore:', err);
  }
}

/**
 * Register a new user with Firebase Authentication and create their profile in Firestore.
 * Automatically sends an email verification link and enforces email verification before login.
 */
export async function registerUserWithFirebase(
  fullName: string,
  email: string,
  password: string
): Promise<{ success: boolean; message: string; uid: string }> {
  const cleanName = fullName.trim();
  const normalizedEmail = email.trim().toLowerCase();

  if (!cleanName) {
    throw new Error('Full Name is required.');
  }
  if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new Error('Please enter a valid email address.');
  }
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters in length.');
  }

  // 1. Create account via Firebase Auth
  const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
  const user = userCredential.user;

  // 2. Set Firebase Auth display name
  try {
    await updateProfile(user, { displayName: cleanName });
  } catch (err) {
    console.warn('Notice setting user displayName:', err);
  }

  // 3. Determine initial role
  const isTargetAdmin = isAuthorizedAdminEmail(normalizedEmail);
  const role: 'Administrator' | 'User' = isTargetAdmin ? 'Administrator' : 'User';

  // 4. Create user profile document in Firestore collection `users/{uid}`
  const now = new Date().toISOString();
  const profileDoc: UserProfile = {
    uid: user.uid,
    fullName: cleanName,
    email: normalizedEmail,
    role,
    emailVerified: false,
    accountStatus: 'active',
    createdAt: now,
    updatedAt: now,
    lastLoginAt: now,
  };

  try {
    await setDoc(doc(db, 'users', user.uid), sanitizeForFirestore(profileDoc as unknown as Record<string, unknown>));
  } catch (err) {
    console.warn('Notice writing profile document to Firestore:', err);
  }

  // 5. Automatically send Firebase email verification link
  try {
    await sendEmailVerification(user, getActionCodeSettings());
  } catch (err) {
    console.warn('Notice dispatching verification link:', err);
  }

  // 6. Sign out immediately so unverified accounts cannot access protected areas
  await fbSignOut(auth);

  return {
    success: true,
    message: `Account created successfully! A verification link has been sent to ${normalizedEmail}. Please check your inbox and verify your email before logging in.`,
    uid: user.uid,
  };
}

/**
 * Custom error class for unverified email logins
 */
export class UnverifiedEmailError extends Error {
  isUnverified: boolean;
  email: string;

  constructor(email: string) {
    super('Your email address has not been verified. Please check your inbox and verify your email before logging in.');
    this.name = 'UnverifiedEmailError';
    this.isUnverified = true;
    this.email = email;
  }
}

/**
 * Authenticates user via Firebase Auth.
 * Mandatory email verification:
 * - Checks user.emailVerified after fresh reload()
 * - If not verified: rejects access and signs out
 * - If verified: updates Firestore document, returns user and profile
 */
export async function loginWithFirebase(
  email: string,
  password: string
): Promise<{ user: User; profile: UserProfile | null; adminUser: AdminUser | null; isAdmin: boolean }> {
  const normalizedEmail = email.trim().toLowerCase();
  const isTargetAdmin = isAuthorizedAdminEmail(normalizedEmail);

  const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
  const fbUser = userCredential.user;

  // Attempt to reload token & profile
  try {
    await fbUser.reload();
  } catch {
    // Ignore network or transient reload error
  }
  const refreshedUser = auth.currentUser || fbUser;

  // Strict check: Non-admin public accounts require email verification
  if (!isTargetAdmin && !refreshedUser.emailVerified) {
    await fbSignOut(auth);
    throw new UnverifiedEmailError(normalizedEmail);
  }

  // Fetch or create profile in Firestore
  let profile = await getUserProfile(refreshedUser.uid);

  const now = new Date().toISOString();
  if (isTargetAdmin) {
    // Ensure administrator profile and admin index record exist in Firestore
    profile = {
      uid: refreshedUser.uid,
      fullName: refreshedUser.displayName || 'Tesfaye Teklu',
      email: normalizedEmail,
      role: 'Administrator',
      emailVerified: Boolean(refreshedUser.emailVerified),
      accountStatus: 'active',
      createdAt: profile?.createdAt || now,
      updatedAt: now,
      lastLoginAt: now,
    };

    try {
      // 1. Sync to users collection
      await setDoc(doc(db, 'users', refreshedUser.uid), sanitizeForFirestore(profile as unknown as Record<string, unknown>), { merge: true });
      // 2. Sync to admins collection for rules verification
      await setDoc(doc(db, 'admins', refreshedUser.uid), {
        uid: refreshedUser.uid,
        email: normalizedEmail,
        role: 'super_admin',
        updatedAt: now,
      }, { merge: true });
    } catch (err) {
      console.warn('Notice syncing admin profile to Firestore:', err);
    }
  } else if (!profile) {
    profile = {
      uid: refreshedUser.uid,
      fullName: refreshedUser.displayName || 'User',
      email: normalizedEmail,
      role: 'User',
      emailVerified: Boolean(refreshedUser.emailVerified),
      accountStatus: 'active',
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
    };
    try {
      await setDoc(doc(db, 'users', refreshedUser.uid), sanitizeForFirestore(profile as unknown as Record<string, unknown>));
    } catch {
      // Ignore
    }
  }

  const adminUser = isTargetAdmin ? mapFirebaseUserToAdmin(refreshedUser) : null;

  return {
    user: refreshedUser,
    profile,
    adminUser,
    isAdmin: isTargetAdmin,
  };
}

/**
 * Handles Firebase action code for in-app email verification (e.g. from mode=verifyEmail&oobCode=...)
 */
export async function handleEmailVerificationCode(
  oobCode: string
): Promise<{ success: boolean; message: string }> {
  if (!oobCode || !oobCode.trim()) {
    throw new Error('Verification code is missing.');
  }

  try {
    await applyActionCode(auth, oobCode.trim());

    // If a user is logged in, reload their token and user data
    if (auth.currentUser) {
      await auth.currentUser.reload();
      const uid = auth.currentUser.uid;
      try {
        await updateDoc(doc(db, 'users', uid), {
          emailVerified: true,
          updatedAt: new Date().toISOString(),
        });
      } catch {
        // Ignore
      }
    }

    return {
      success: true,
      message: 'Your email address has been verified successfully! You can now log in to your account.',
    };
  } catch (err: unknown) {
    const errorMsg = getFriendlyAuthErrorMessage(err);
    throw new Error(errorMsg);
  }
}

/**
 * Resend verification email to an email address.
 * If user is currently signed in, uses currentUser.
 * If not signed in but password is provided, signs in temporarily, sends verification, and signs out.
 */
export async function resendVerificationEmail(
  email?: string,
  password?: string
): Promise<{ success: boolean; message: string }> {
  // Scenario A: User is currently signed in
  if (auth.currentUser) {
    await sendEmailVerification(auth.currentUser, getActionCodeSettings());
    return {
      success: true,
      message: `A fresh verification email has been sent to ${auth.currentUser.email}. Please check your inbox and spam folder.`,
    };
  }

  // Scenario B: Email and password provided
  if (email && password) {
    const normalizedEmail = email.trim().toLowerCase();
    const cred = await signInWithEmailAndPassword(auth, normalizedEmail, password);
    await sendEmailVerification(cred.user, getActionCodeSettings());
    await fbSignOut(auth);
    return {
      success: true,
      message: `A fresh verification email has been sent to ${normalizedEmail}. Please check your inbox.`,
    };
  }

  // Scenario C: Target admin email
  if (email && isAuthorizedAdminEmail(email)) {
    return {
      success: true,
      message: `To resend verification to ${email}, please enter your password on the login form or use password recovery.`,
    };
  }

  throw new Error('Please sign in or provide your credentials to resend the verification email.');
}

/**
 * Initial Administrator Setup Procedure:
 * Enables the verified owner of tesfayeteklufeyissa@gmail.com to create their initial Firebase Auth account
 * and dispatches the mandatory email verification link.
 * Strictly rejects any other address.
 */
export async function setupInitialAdminAccount(
  email: string,
  password: string
): Promise<{ success: boolean; message: string }> {
  const normalizedEmail = email.trim().toLowerCase();

  if (!isAuthorizedAdminEmail(normalizedEmail)) {
    throw new Error('Administrator self-registration is permanently disabled for unauthorized addresses.');
  }

  if (password.length < 8) {
    throw new Error('Administrator password must be at least 8 characters in length.');
  }

  const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
  const user = userCredential.user;

  try {
    await updateProfile(user, { displayName: 'Tesfaye Teklu' });
  } catch {
    // Ignore
  }

  // Create initial Admin document in Firestore
  const now = new Date().toISOString();
  const adminProfile: UserProfile = {
    uid: user.uid,
    fullName: 'Tesfaye Teklu',
    email: normalizedEmail,
    role: 'Administrator',
    emailVerified: false,
    accountStatus: 'active',
    createdAt: now,
    updatedAt: now,
    lastLoginAt: now,
  };

  try {
    await setDoc(doc(db, 'users', user.uid), sanitizeForFirestore(adminProfile as unknown as Record<string, unknown>));
  } catch {
    // Ignore
  }

  await sendEmailVerification(user, getActionCodeSettings());
  
  // Sign out immediately until email is verified
  await fbSignOut(auth);

  return {
    success: true,
    message: `Administrator account initialized. A verification email has been dispatched to ${AUTHORIZED_ADMIN_EMAIL}. Please click the link in your inbox before signing in.`,
  };
}

/**
 * Dispatches a password reset email via Firebase Auth for any registered user
 */
export async function sendUserPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const actionCodeSettings: ActionCodeSettings = {
      url: `${window.location.origin}/login`,
      handleCodeInApp: false,
    };
    await sendPasswordResetEmail(auth, normalizedEmail, actionCodeSettings);
  } catch (err) {
    console.warn('Notice from Firebase password reset:', err);
  }

  return {
    success: true,
    message: `If an account is associated with ${normalizedEmail}, a password reset link has been dispatched to that inbox.`,
  };
}

// Backward-compatible alias
export const sendAdminPasswordReset = sendUserPasswordReset;

/**
 * Sign out the current user or administrator
 */
export async function logoutFromFirebase(): Promise<void> {
  await fbSignOut(auth);
}

/**
 * Subscribes to real-time Firebase Auth state changes
 */
export function subscribeToAuthState(
  callback: (state: AppAuthState) => void
): () => void {
  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      callback({
        user: null,
        profile: null,
        adminUser: null,
        isAuthenticated: false,
        isAdmin: false,
        isEmailVerified: false,
        loading: false,
        error: null,
      });
      return;
    }

    const isVerified = Boolean(user.emailVerified);
    const normalizedEmail = (user.email || '').trim().toLowerCase();
    const isAdminAccount = isAuthorizedAdminEmail(normalizedEmail);

    let profile: UserProfile | null = await getUserProfile(user.uid);
    const hasAdminRole = profile?.role === 'Administrator' || profile?.role === 'admin';
    const isEffectiveAdmin = isAdminAccount || hasAdminRole;

    const adminUser = isEffectiveAdmin
      ? (mapFirebaseUserToAdmin(user) || {
          id: user.uid,
          email: user.email || normalizedEmail,
          name: user.displayName || profile?.fullName || 'Tesfaye Teklu',
          role: 'super_admin' as const,
        })
      : null;

    if (isEffectiveAdmin && !profile) {
      profile = {
        uid: user.uid,
        fullName: user.displayName || 'Tesfaye Teklu',
        email: normalizedEmail,
        role: 'Administrator',
        emailVerified: isVerified,
        accountStatus: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
      try {
        await setDoc(doc(db, 'users', user.uid), sanitizeForFirestore(profile as unknown as Record<string, unknown>), { merge: true });
        await setDoc(doc(db, 'admins', user.uid), {
          uid: user.uid,
          email: normalizedEmail,
          role: 'super_admin',
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      } catch {
        // Ignore
      }
    }

    callback({
      user,
      profile,
      adminUser,
      isAuthenticated: true,
      isAdmin: isEffectiveAdmin,
      isEmailVerified: isVerified,
      loading: false,
      error: (!isVerified && !isEffectiveAdmin)
        ? `Account email is unverified. Please check ${user.email} to verify access.`
        : null,
    });
  });
}
