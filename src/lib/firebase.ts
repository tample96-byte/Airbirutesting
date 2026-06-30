import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

let firebaseConfig: any = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Try to load custom configuration from localStorage on the client side
let isCustomConfig = false;
if (typeof window !== 'undefined') {
  try {
    const stored = localStorage.getItem('biru_firebase_config');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.apiKey && parsed.projectId) {
        firebaseConfig = parsed;
        isCustomConfig = true;
      }
    }
  } catch (err) {
    console.error('Error loading config from localStorage:', err);
  }
}

export const isFirebaseConfigured = !!(firebaseConfig.apiKey && firebaseConfig.projectId);

let app: any = null;
let db: any = null;
let auth: any = null;

try {
  if (isFirebaseConfigured) {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
  }
} catch (e) {
  console.error("Firebase init error:", e);
}

export { db, auth, firebaseConfig, isCustomConfig };

/**
 * Parser that accepts a raw JSON string or a JS object snippet directly from the Firebase Console
 * and converts it into a clean config object.
 */
export function parseFirebaseConfigString(input: string): any {
  try {
    const trimmed = input.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      const parsed = JSON.parse(trimmed);
      if (parsed && parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    }
  } catch (e) {
    // Ignore and proceed to regex parsing
  }

  // Regex-based extractor for JS-object-like structures
  const config: any = {};
  const fields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  
  fields.forEach(field => {
    // Matches apiKey: "VALUE" or "apiKey": "VALUE" or 'apiKey': 'VALUE' with optional spaces and commas
    const regex = new RegExp(`["']?${field}["']?\\s*:\\s*["']([^"']+)["']`);
    const match = input.match(regex);
    if (match && match[1]) {
      config[field] = match[1].trim();
    }
  });

  if (config.apiKey && config.projectId) {
    return config;
  }
  return null;
}

export function saveClientFirebaseConfig(config: any): boolean {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('biru_firebase_config', JSON.stringify(config));
      return true;
    } catch (e) {
      console.error("Failed to save config:", e);
    }
  }
  return false;
}

export function clearClientFirebaseConfig(): boolean {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('biru_firebase_config');
      return true;
    } catch (e) {
      console.error("Failed to clear config:", e);
    }
  }
  return false;
}
