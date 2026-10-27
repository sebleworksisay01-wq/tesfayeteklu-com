/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Firebase Cloud Storage Service for TesfayeTech
 * Handles secure file uploads, progress tracking, validation, replacement, and deletion
 */

import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  UploadTask,
  UploadTaskSnapshot,
} from 'firebase/storage';
import { storage } from '../lib/firebase';

export interface StorageUploadResult {
  downloadUrl: string;
  storagePath: string;
  fileName: string;
  fileSize: number;
  contentType: string;
}

export interface UploadProgressCallback {
  (progressPercent: number, snapshot: UploadTaskSnapshot): void;
}

// Allowed MIME types
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
];

export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
];

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 Megabytes

/**
 * Validates a file before starting upload
 */
export function validateStorageFile(file: File, options?: { allowDocuments?: boolean }): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }

  // Size limit check
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File size exceeds the 10 MB limit (${sizeMb} MB). Please select a smaller file.`,
    };
  }

  // MIME type check
  const allowed = options?.allowDocuments
    ? [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES]
    : ALLOWED_IMAGE_TYPES;

  if (!allowed.includes(file.type)) {
    return {
      valid: false,
      error: `Unsupported file type (${file.type || 'unknown'}). Allowed formats: JPG, PNG, WebP, SVG, GIF${options?.allowDocuments ? ', PDF' : ''}.`,
    };
  }

  return { valid: true };
}

/**
 * Generates a safe, collision-resistant storage path
 */
export function generateStoragePath(folder: 'projects' | 'branding' | 'documents', originalName: string): string {
  const cleanName = originalName.toLowerCase().replace(/[^a-z0-9.]+/g, '-').replace(/^-|-$/g, '');
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${folder}/${timestamp}_${randomSuffix}_${cleanName}`;
}

/**
 * Uploads a file to Firebase Cloud Storage with progress reporting
 */
export function uploadFileToStorage(
  file: File,
  folder: 'projects' | 'branding' | 'documents' = 'projects',
  onProgress?: UploadProgressCallback
): Promise<StorageUploadResult> {
  return new Promise((resolve, reject) => {
    // 1. Validation
    const validation = validateStorageFile(file, { allowDocuments: folder === 'documents' });
    if (!validation.valid) {
      return reject(new Error(validation.error));
    }

    // 2. Reference & Metadata
    const storagePath = generateStoragePath(folder, file.name);
    const storageRef = ref(storage, storagePath);
    const metadata = {
      contentType: file.type,
      customMetadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
      },
    };

    // 3. Upload Task
    const uploadTask: UploadTask = uploadBytesResumable(storageRef, file, metadata);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        if (onProgress) {
          onProgress(percent, snapshot);
        }
      },
      (error) => {
        console.error('Firebase Storage upload failed:', error);
        reject(new Error(`Upload failed: ${error.message}`));
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({
            downloadUrl,
            storagePath,
            fileName: file.name,
            fileSize: file.size,
            contentType: file.type,
          });
        } catch (err: unknown) {
          reject(new Error(`Failed to retrieve download URL: ${err instanceof Error ? err.message : String(err)}`));
        }
      }
    );
  });
}

/**
 * Deletes an asset from Firebase Cloud Storage by its storage path
 */
export async function deleteFileFromStorage(storagePath: string): Promise<void> {
  if (!storagePath) return;
  try {
    const fileRef = ref(storage, storagePath);
    await deleteObject(fileRef);
  } catch (error) {
    console.warn(`Notice while deleting storage file (${storagePath}):`, error);
  }
}

/**
 * Replaces an existing image asset:
 * 1. Uploads the new image
 * 2. Only deletes the previous storage object after new upload completes
 */
export async function replaceStorageImage(
  newFile: File,
  oldStoragePath?: string,
  folder: 'projects' | 'branding' = 'projects',
  onProgress?: UploadProgressCallback
): Promise<StorageUploadResult> {
  // 1. Upload new file first
  const result = await uploadFileToStorage(newFile, folder, onProgress);

  // 2. Clean up old asset safely in background
  if (oldStoragePath && oldStoragePath.startsWith(folder)) {
    deleteFileFromStorage(oldStoragePath).catch((err) => {
      console.warn('Could not remove previous asset from storage:', err);
    });
  }

  return result;
}
