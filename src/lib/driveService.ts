'use client';

import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  type User 
} from 'firebase/auth';
import { auth as firebaseAuth, isFirebaseConfigured } from './firebase';
import { db, Sale, Preset } from './db';

// Cache the access token in memory (never in localStorage/sessionStorage for security)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const GOOGLE_DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/drive.file'
];

/**
 * Custom hook / subscription helper to listen to both Firebase Auth and get Google Access Token.
 */
export const initDriveAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  if (!firebaseAuth) {
    if (onAuthFailure) onAuthFailure();
    return () => {};
  }

  return onAuthStateChanged(firebaseAuth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // If we don't have a token, we clear state since we need an active token for Drive
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Handle Google Login with Google Drive scope.
 */
export async function loginWithGoogleDrive(): Promise<{ user: User; accessToken: string }> {
  if (!isFirebaseConfigured || !firebaseAuth) {
    throw new Error('Firebase Auth belum dikonfigurasi. Harap masukkan konfigurasi Firebase terlebih dahulu.');
  }

  try {
    isSigningIn = true;
    const provider = new GoogleAuthProvider();
    
    // Add required scopes
    provider.addScope('https://www.googleapis.com/auth/drive.file');
    provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
    provider.addScope('https://www.googleapis.com/auth/userinfo.email');

    // Force account selection for convenience
    provider.setCustomParameters({
      prompt: 'select_account'
    });

    const result = await signInWithPopup(firebaseAuth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    
    if (!credential?.accessToken) {
      throw new Error('Gagal mendapatkan Google Access Token dari login.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Drive Auth Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
}

/**
 * Sign out from Google Auth and clear in-memory token.
 */
export async function logoutGoogleDrive(): Promise<void> {
  if (!firebaseAuth) return;
  try {
    await signOut(firebaseAuth);
    cachedAccessToken = null;
  } catch (error) {
    console.error('Google Drive Logout Error:', error);
    throw error;
  }
}

/**
 * Retrieves the currently active Google Drive access token from memory.
 */
export function getDriveAccessToken(): string | null {
  return cachedAccessToken;
}

/**
 * Sets the active Google Drive access token manually (useful when setting up state).
 */
export function setDriveAccessToken(token: string | null): void {
  cachedAccessToken = token;
}

/**
 * Helper to fetch a file list from Google Drive searching for our backup file.
 */
async function findBackupFile(token: string): Promise<string | null> {
  const query = encodeURIComponent("name = 'biru_depot_water_backup.json' and trashed = false");
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`;
  
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      throw new Error(`Google Drive API returned status ${res.status}`);
    }

    const data = await res.json();
    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }
    return null;
  } catch (err) {
    console.error('Error finding backup file in Google Drive:', err);
    throw err;
  }
}

/**
 * Uploads/Updates backup data on Google Drive.
 */
export async function uploadBackupToDrive(token: string): Promise<{ success: boolean; fileId: string }> {
  try {
    // 1. Fetch current local data
    const localSales = await db.sales.toArray();
    const localPresets = await db.presets.toArray();

    const backupPayload = {
      sales: localSales,
      presets: localPresets,
      backupTime: new Date().toISOString(),
      app: 'Biru POS'
    };

    // 2. Check if backup file already exists
    let fileId = await findBackupFile(token);

    if (!fileId) {
      // Step A: Create file metadata
      const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'biru_depot_water_backup.json',
          mimeType: 'application/json'
        })
      });

      if (!createRes.ok) {
        throw new Error(`Gagal membuat metadata file di Google Drive: ${createRes.statusText}`);
      }

      const fileInfo = await createRes.json();
      fileId = fileInfo.id;
    }

    // Step B: Update the actual file contents (media)
    const uploadRes = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(backupPayload)
    });

    if (!uploadRes.ok) {
      throw new Error(`Gagal mengunggah isi file ke Google Drive: ${uploadRes.statusText}`);
    }

    return { success: true, fileId: fileId! };
  } catch (error: any) {
    console.error('Error uploading backup to Google Drive:', error);
    throw new Error(error.message || 'Terjadi kesalahan saat mengunggah backup ke Google Drive.');
  }
}

/**
 * Restores local Dexie DB data from Google Drive backup file.
 * Requires user confirmation for destructive update before calling!
 */
export async function restoreBackupFromDrive(token: string): Promise<{ success: boolean; salesCount: number; presetsCount: number }> {
  try {
    const fileId = await findBackupFile(token);
    if (!fileId) {
      throw new Error('File backup "biru_depot_water_backup.json" tidak ditemukan di Google Drive Anda. Harap buat backup terlebih dahulu.');
    }

    // Fetch the backup payload using alt=media
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      throw new Error(`Gagal mengunduh file backup dari Google Drive: ${res.statusText}`);
    }

    const payload = await res.json();
    if (!payload || (!payload.sales && !payload.presets)) {
      throw new Error('Data file backup tidak valid atau kosong.');
    }

    // Mutate and clear local DB
    await db.sales.clear();
    await db.presets.clear();

    let salesCount = 0;
    let presetsCount = 0;

    if (payload.sales && payload.sales.length > 0) {
      // Re-map date string to Date objects
      const parsedSales = payload.sales.map((s: any) => ({
        ...s,
        id: undefined, // Let auto-increment handle it to avoid primary key conflicts
        createdAt: new Date(s.createdAt)
      }));
      await db.sales.bulkAdd(parsedSales);
      salesCount = parsedSales.length;
    }

    if (payload.presets && payload.presets.length > 0) {
      const parsedPresets = payload.presets.map((p: any) => ({
        ...p,
        id: undefined
      }));
      await db.presets.bulkAdd(parsedPresets);
      presetsCount = parsedPresets.length;
    }

    return { success: true, salesCount, presetsCount };
  } catch (error: any) {
    console.error('Error restoring backup from Google Drive:', error);
    throw new Error(error.message || 'Gagal memulihkan backup dari Google Drive.');
  }
}
