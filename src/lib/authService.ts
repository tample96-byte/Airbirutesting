'use client';

import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  type User, 
  type Auth 
} from 'firebase/auth';
import { auth as firestoreAuth, isFirebaseConfigured } from './firebase';

/**
 * Interface representing the structure of our Authentication Service.
 */
export interface FirebaseAuthService {
  loginWithGoogle: () => Promise<User>;
  logout: () => Promise<void>;
  subscribeToAuth: (callback: (user: User | null) => void) => () => void;
  getCurrentUser: () => User | null;
  isConfigured: () => boolean;
}

/**
 * Check if the Firebase configuration is fully available.
 */
export function isAuthReady(): boolean {
  return !!(isFirebaseConfigured && firestoreAuth);
}

/**
 * Handle Firebase Authentication errors gracefully and return descriptive messages.
 */
export function formatAuthError(error: any): string {
  if (!error) return 'Terjadi kesalahan otentikasi tidak dikenal.';
  
  const code = error.code || '';
  switch (code) {
    case 'auth/popup-closed-by-user':
      return 'Masuk dibatalkan karena jendela login Google ditutup sebelum selesai.';
    case 'auth/cancelled-popup-request':
      return 'Proses masuk dibatalkan karena adanya permintaan login baru.';
    case 'auth/popup-blocked':
      return 'Jendela popup diblokir oleh browser. Harap izinkan popup untuk situs ini.';
    case 'auth/operation-not-allowed':
      return 'Metode login Google belum diaktifkan di Firebase Console untuk proyek ini.';
    case 'auth/unauthorized-domain':
      return 'Domain aplikasi ini belum di-allowlist di Firebase Console -> Auth -> Settings.';
    case 'auth/network-request-failed':
      return 'Koneksi jaringan gagal. Harap periksa koneksi internet depot Anda.';
    default:
      return error.message || 'Terjadi kesalahan sistem saat mencoba masuk.';
  }
}

/**
 * Firebase Authentication Service to handle depot staff login.
 */
export const authService: FirebaseAuthService = {
  /**
   * Triggers a secure Google Sign-In popup.
   * If Firebase is not configured or fails, it will throw a formatted error.
   */
  async loginWithGoogle(): Promise<User> {
    if (!isFirebaseConfigured || !firestoreAuth) {
      throw new Error('Firebase belum dikonfigurasi. Harap atur koneksi Firebase terlebih dahulu.');
    }

    try {
      const provider = new GoogleAuthProvider();
      // Force account selection so that depot staff can easily switch between their operator accounts
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      const result = await signInWithPopup(firestoreAuth, provider);
      return result.user;
    } catch (error: any) {
      console.error('Firebase Auth Service Error (Google Login):', error);
      const friendlyMessage = formatAuthError(error);
      throw new Error(friendlyMessage);
    }
  },

  /**
   * Signs out the current depot staff user.
   */
  async logout(): Promise<void> {
    if (!firestoreAuth) return;
    try {
      await signOut(firestoreAuth);
    } catch (error) {
      console.error('Firebase Auth Service Error (Logout):', error);
      throw error;
    }
  },

  /**
   * Subscribes to changes in authentication state.
   * Returns an unsubscribe function to clean up listeners.
   */
  subscribeToAuth(callback: (user: User | null) => void): () => void {
    if (!firestoreAuth) {
      callback(null);
      return () => {};
    }
    return onAuthStateChanged(firestoreAuth, callback);
  },

  /**
   * Synchronously retrieves the currently logged in Firebase user.
   */
  getCurrentUser(): User | null {
    if (!firestoreAuth) return null;
    return firestoreAuth.currentUser;
  },

  /**
   * Checks if auth service has been configured with project keys.
   */
  isConfigured(): boolean {
    return isAuthReady();
  }
};
