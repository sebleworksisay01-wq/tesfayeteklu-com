/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Firebase Authentication Service for TesfayeTech
 * Pinned authorized administrator: contactesfaye@gmail.com
 */

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged,
  User,
  ActionCodeSettings,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { AdminUser } from '../types';

export const AUTHORIZED_ADMIN_EMAIL = 'contactesfaye@gmail.com';

export interface AdminAuthState {
  user: User | null;
  adminUser: AdminUser | null;
  isAuthenticatedAdmin: boolean;
  isEmailVerified: boolean;
  hasAdminClaim: boolean;
  loading: boolean;
  error: string | null;
}

/**
 * Maps a Firebase Auth User to the internal AdminUser model if authorized and verified
 */
export function mapFirebaseUserToAdmin(user: User | null): AdminUser | null {
  if (!user || !user.email) return null;
  const normalizedEmail = user.email.trim().toLowerCase();
  
  if (normalizedEmail !== AUTHORIZED_ADMIN_EMAIL) {
    return null;
  }

  return {
    id: user.uid,
    email: user.email,
    name: user.displayName || 'Tesfaye',
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
      return 'This administrator account has been disabled. Please contact system support.';
    case 'auth/invalid-email':
      return 'The email address format is invalid.';
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 8 characters with letters, numbers, and symbols.';
    case 'auth/network-request-failed':
      return 'Network connection failed. Please verify your internet connection.';
    case 'auth/requires-recent-login':
      return 'This sensitive operation requires a recent sign-in. Please sign in again and retry.';
    default:
      return error.message || 'Authentication operation failed.';
  }
}

/**
 * Authenticates the administrator via Firebase Auth
 */
export async function loginWithFirebase(
  email: string,
  password: string
): Promise<{ user: User; adminUser: AdminUser }> {
  const normalizedEmail = email.trim().toLowerCase();

  // Strict check before contacting Firebase Auth
  if (normalizedEmail !== AUTHORIZED_ADMIN_EMAIL) {
    throw new Error('Invalid email or password.');
  }

  const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
  const fbUser = userCredential.user;

  // Strict check: account must be email verified for administrator access
  // Reload user to ensure latest verification state from server
  await fbUser.reload();
  const refreshedUser = auth.currentUser || fbUser;

  if (!refreshedUser.emailVerified) {
    // Optionally trigger a new verification email
    try {
      await sendEmailVerification(refreshedUser);
    } catch {
      // Ignored if rate-limited
    }
    throw new Error(
      `Email verification required. A verification link has been sent to ${AUTHORIZED_ADMIN_EMAIL}. Please verify your email before accessing the dashboard.`
    );
  }

  // Force token refresh from server to capture newly assigned custom claims
  const tokenResult = await refreshedUser.getIdTokenResult(true);
  const hasAdminClaim = Boolean(tokenResult.claims.admin === true);
  if (!hasAdminClaim) {
    console.warn(
      `[ADMIN CLAIM NOTICE] Account ${AUTHORIZED_ADMIN_EMAIL} is verified, but custom claim { admin: true } is not yet active on token. If administrative writes fail, run: npm run set-admin-claim`
    );
  }

  const admin = mapFirebaseUserToAdmin(refreshedUser);
  if (!admin) {
    await fbSignOut(auth);
    throw new Error('Unauthorized administrative account.');
  }

  return { user: refreshedUser, adminUser: admin };
}

/**
 * Initial Administrator Setup Procedure:
 * Enables the owner of contactesfaye@gmail.com to create their initial Firebase Auth account
 * and dispatches the mandatory email verification link.
 * Strictly rejects any other email.
 */
export async function setupInitialAdminAccount(
  email: string,
  password: string
): Promise<{ success: boolean; message: string }> {
  const normalizedEmail = email.trim().toLowerCase();

  if (normalizedEmail !== AUTHORIZED_ADMIN_EMAIL) {
    throw new Error('Administrator self-registration is permanently disabled for unauthorized addresses.');
  }

  if (password.length < 8) {
    throw new Error('Administrator password must be at least 8 characters in length.');
  }

  const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
  await sendEmailVerification(userCredential.user);
  
  // Sign out immediately until email is verified
  await fbSignOut(auth);

  return {
    success: true,
    message: `Administrator account initialized. A verification email has been dispatched to ${AUTHORIZED_ADMIN_EMAIL}. Please click the link in your inbox before signing in.`,
  };
}

/**
 * Dispatches a password reset email via Firebase Auth
 */
export async function sendAdminPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
  const normalizedEmail = email.trim().toLowerCase();

  // Always return uniform safe confirmation to prevent email enumeration
  const genericSuccess = {
    success: true,
    message: 'If an account is associated with this email address, a password reset link has been dispatched.',
  };

  if (normalizedEmail !== AUTHORIZED_ADMIN_EMAIL) {
    return genericSuccess;
  }

  try {
    const actionCodeSettings: ActionCodeSettings = {
      url: window.location.origin + '/admin/login',
      handleCodeInApp: false,
    };
    await sendPasswordResetEmail(auth, normalizedEmail, actionCodeSettings);
  } catch (err) {
    console.warn('Notice from Firebase password reset:', err);
  }

  return genericSuccess;
}

/**
 * Resends the verification email to the current administrator
 */
export async function resendVerificationEmail(): Promise<{ success: boolean; message: string }> {
  const current = auth.currentUser;
  if (!current) {
    throw new Error('No user is currently signed in to receive verification.');
  }
  await sendEmailVerification(current);
  return {
    success: true,
    message: `Verification email resent to ${current.email}. Please check your inbox and spam folder.`,
  };
}

/**
 * Sign out the current administrator
 */
export async function logoutFromFirebase(): Promise<void> {
  await fbSignOut(auth);
}

/**
 * Subscribes to real-time Firebase Auth state changes
 */
export function subscribeToAuthState(
  callback: (state: AdminAuthState) => void
): () => void {
  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      callback({
        user: null,
        adminUser: null,
        isAuthenticatedAdmin: false,
        isEmailVerified: false,
        hasAdminClaim: false,
        loading: false,
        error: null,
      });
      return;
    }

    const isVerified = Boolean(user.emailVerified);
    let hasAdminClaim = false;
    try {
      const idTokenResult = await user.getIdTokenResult();
      hasAdminClaim = Boolean(idTokenResult.claims.admin === true);
    } catch {
      hasAdminClaim = false;
    }

    const adminUser = mapFirebaseUserToAdmin(user);
    const isAuthAdmin = Boolean(adminUser && isVerified);

    callback({
      user,
      adminUser,
      isAuthenticatedAdmin: isAuthAdmin,
      isEmailVerified: isVerified,
      hasAdminClaim,
      loading: false,
      error: !isVerified
        ? `Account email is unverified. Please check ${user.email} to verify access.`
        : null,
    });
  });
}
