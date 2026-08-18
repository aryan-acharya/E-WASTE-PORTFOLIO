import { initializeApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  doc, 
  query,
  getDocs,
  where,
  orderBy
} from 'firebase/firestore';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { Assignment, AdminUser } from '../types';
import { ELEVEN_ACTIVITIES_DATA } from './data/assignments';
import firebaseConfig from '../../firebase-applet-config.json';

// Configured admin email from environment or default
export const ADMIN_EMAIL = (
  ((import.meta as any).env?.VITE_ADMIN_EMAIL as string) || 
  'aryanacharya0211@gmail.com'
).toLowerCase().trim();

// Initialize Firebase App singleton
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Export Firestore database instance with configured database ID
export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Export Firebase Auth
export const auth = getAuth(app);

// Export Firebase Storage
export const storage = getStorage(app);

const ASSIGNMENTS_COLLECTION = 'assignments';

/**
 * Check if the given email has Administrator privileges
 */
export function isUserAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.toLowerCase().trim() === ADMIN_EMAIL;
}

/**
 * Subscribe to Auth State changes and map to AdminUser
 */
export function subscribeToAuthState(callback: (user: AdminUser | null) => void) {
  return onAuthStateChanged(auth, (firebaseUser: User | null) => {
    if (!firebaseUser) {
      callback(null);
      return;
    }

    const email = firebaseUser.email || null;
    callback({
      uid: firebaseUser.uid,
      email: email,
      displayName: firebaseUser.displayName || email?.split('@')[0] || 'Admin',
      photoURL: firebaseUser.photoURL || null,
      isAdmin: isUserAdmin(email)
    });
  });
}

/**
 * Sign in using Google Auth Popup
 */
export async function loginWithGoogle(): Promise<AdminUser> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: 'select_account'
  });
  const result = await signInWithPopup(auth, provider);
  const email = result.user.email || null;
  return {
    uid: result.user.uid,
    email: email,
    displayName: result.user.displayName || email?.split('@')[0] || 'Admin',
    photoURL: result.user.photoURL || null,
    isAdmin: isUserAdmin(email)
  };
}

/**
 * Sign in with Email and Password
 */
export async function loginWithEmail(emailInput: string, passwordInput: string): Promise<AdminUser> {
  const result = await signInWithEmailAndPassword(auth, emailInput, passwordInput);
  const email = result.user.email || null;
  return {
    uid: result.user.uid,
    email: email,
    displayName: result.user.displayName || email?.split('@')[0] || 'Admin',
    photoURL: result.user.photoURL || null,
    isAdmin: isUserAdmin(email)
  };
}

/**
 * Sign out of current session
 */
export async function logoutUser(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Upload PDF document to Firebase Storage (or fallback to Data URL / permanent URL)
 */
export async function uploadPdfDocument(file: File): Promise<{ pdfUrl: string; fileSize: string }> {
  const mb = (file.size / (1024 * 1024)).toFixed(1);
  const fileSize = `${mb} MB`;

  // 1. Try uploading to Firebase Storage for permanent public cloud URL
  try {
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `assignments/${timestamp}_${sanitizedFileName}`;
    const storageReference = ref(storage, storagePath);

    const snapshot = await uploadBytes(storageReference, file, {
      contentType: file.type || 'application/pdf',
      customMetadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString()
      }
    });

    const downloadUrl = await getDownloadURL(snapshot.ref);
    return { pdfUrl: downloadUrl, fileSize };
  } catch (storageError) {
    console.warn('Firebase Storage upload failed or not provisioned, checking data URL fallback:', storageError);

    // 2. If under 700 KB, encode as Base64 Data URL for direct Firestore inline persistence
    if (file.size <= 700 * 1024) {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      });
      return { pdfUrl: dataUrl, fileSize };
    }

    // 3. If file is larger and storage failed, throw helpful error requesting a direct public URL
    throw new Error(
      'Cloud storage is currently unreachable for this direct file. Please provide a direct PDF URL (e.g. from Vercel Blob, Google Drive, or CDN) in the URL field.'
    );
  }
}

/**
 * Real-time listener for Firestore assignments.
 * Automatically synchronizes across all devices & visitors globally.
 */
export function subscribeToAssignments(
  onUpdate: (assignments: Assignment[]) => void,
  onError?: (error: Error) => void
) {
  const assignmentsRef = collection(db, ASSIGNMENTS_COLLECTION);
  const q = query(assignmentsRef);

  return onSnapshot(
    q,
    (snapshot) => {
      const items: Assignment[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.isPublished !== false) {
          items.push({
            id: docSnap.id,
            activityNumber: data.activityNumber,
            activityCode: data.activityCode,
            tagPill: data.tagPill,
            title: data.title || 'Untitled Activity',
            subject: data.subject || 'E-Waste & Environmental Management',
            weekNumber: Number(data.weekNumber) || 1,
            submissionDate: data.submissionDate || new Date().toISOString().split('T')[0],
            description: data.description || '',
            pdfUrl: data.pdfUrl || 'https://cdn.jsdelivr.net/gh/mozilla/pdf.js@master/web/compressed.tracemonkey-pldi-09.pdf',
            fileSize: data.fileSize || '1.8 MB',
            type: data.type || 'Activity',
            category: data.category || 'Activities',
            status: data.status || 'Evaluated',
            marksObtained: data.marksObtained,
            topics: Array.isArray(data.topics) ? data.topics : [],
            objective: data.objective,
            evidenceUrl: data.evidenceUrl,
            evidenceType: data.evidenceType,
            evidencePosterData: data.evidencePosterData,
            whatILearned: data.whatILearned,
            sustainabilityConnection: data.sustainabilityConnection,
            reflection: data.reflection,
            references: data.references,
            isPublished: data.isPublished !== false,
            uploadedBy: data.uploadedBy || 'Administrator',
            createdAt: data.createdAt || new Date().toISOString()
          });
        }
      });

      // If Firestore is empty, provide default 11 Activities curriculum
      if (items.length === 0) {
        onUpdate(ELEVEN_ACTIVITIES_DATA);
      } else {
        // Sort by activity number / week number ascending
        items.sort((a, b) => {
          const numA = a.activityNumber || a.weekNumber || 0;
          const numB = b.activityNumber || b.weekNumber || 0;
          return numA - numB;
        });
        onUpdate(items);
      }
    },
    (err) => {
      console.warn('Firestore real-time subscription note:', err);
      // Fallback to local 11 activities if offline or permission pending
      onUpdate(ELEVEN_ACTIVITIES_DATA);
      if (onError) onError(err);
    }
  );
}

/**
 * Save / Create new assignment in Firestore (Persistent for everyone)
 */
export async function saveAssignmentToFirestore(
  assignment: Assignment,
  currentUserEmail?: string | null
): Promise<void> {
  const docRef = doc(db, ASSIGNMENTS_COLLECTION, assignment.id);

  // Validate admin permissions before persisting
  const emailToCheck = currentUserEmail || auth.currentUser?.email;
  if (!isUserAdmin(emailToCheck)) {
    throw new Error(`Unauthorized: Only ${ADMIN_EMAIL} is allowed to publish or create assignments.`);
  }

  let safePdfUrl = assignment.pdfUrl || 'https://cdn.jsdelivr.net/gh/mozilla/pdf.js@master/web/compressed.tracemonkey-pldi-09.pdf';
  if (safePdfUrl.startsWith('data:') && safePdfUrl.length > 750000) {
    safePdfUrl = 'https://cdn.jsdelivr.net/gh/mozilla/pdf.js@master/web/compressed.tracemonkey-pldi-09.pdf';
  }

  const dataToSave = {
    ...assignment,
    pdfUrl: safePdfUrl,
    isPublished: true,
    uploadedBy: emailToCheck || ADMIN_EMAIL,
    createdAt: assignment.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await setDoc(docRef, dataToSave, { merge: true });
}

/**
 * Update existing assignment in Firestore
 */
export async function updateAssignmentInFirestore(
  assignment: Assignment,
  currentUserEmail?: string | null
): Promise<void> {
  const docRef = doc(db, ASSIGNMENTS_COLLECTION, assignment.id);

  const emailToCheck = currentUserEmail || auth.currentUser?.email;
  if (!isUserAdmin(emailToCheck)) {
    throw new Error(`Unauthorized: Only ${ADMIN_EMAIL} is allowed to edit assignments.`);
  }

  const dataToUpdate = {
    ...assignment,
    updatedAt: new Date().toISOString()
  };

  await setDoc(docRef, dataToUpdate, { merge: true });
}

/**
 * Delete assignment from Firestore
 */
export async function deleteAssignmentFromFirestore(
  id: string,
  pdfUrl?: string,
  currentUserEmail?: string | null
): Promise<void> {
  const emailToCheck = currentUserEmail || auth.currentUser?.email;
  if (!isUserAdmin(emailToCheck)) {
    throw new Error(`Unauthorized: Only ${ADMIN_EMAIL} is allowed to delete assignments.`);
  }

  const docRef = doc(db, ASSIGNMENTS_COLLECTION, id);
  await deleteDoc(docRef);

  // If file was stored in Firebase Storage, attempt cleanup
  if (pdfUrl && pdfUrl.includes('firebasestorage.googleapis.com')) {
    try {
      const fileRef = ref(storage, pdfUrl);
      await deleteObject(fileRef);
    } catch (e) {
      console.warn('Storage cleanup non-critical error:', e);
    }
  }
}
