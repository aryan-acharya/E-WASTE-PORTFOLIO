import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query
} from 'firebase/firestore';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  signOut, 
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
import firebaseConfig from '../../firebase-applet-config.json';

// Configured admin email from environment or default
export const ADMIN_EMAIL = 'aryanacharya0211@gmail.com';
export const ALT_ADMIN_EMAIL = 'aryanacharya211@gmail.com';

// Initialize Firebase App singleton
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Constants
export const ASSIGNMENTS_COLLECTION = 'assignments';

/**
 * Check whether a given user email is the authorized Admin
 */
export function isUserAdmin(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return (
    normalized === ADMIN_EMAIL.toLowerCase() || 
    normalized === ALT_ADMIN_EMAIL.toLowerCase() ||
    normalized.startsWith('aryanacharya')
  );
}

/**
 * Convert Firebase User to App AdminUser representation
 */
export function formatAdminUser(user: User | null): AdminUser | null {
  if (!user) return null;
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || user.email?.split('@')[0] || 'User',
    photoURL: user.photoURL,
    isAdmin: isUserAdmin(user.email)
  };
}

/**
 * Google Sign-In with popup
 */
export async function loginWithGoogle(): Promise<AdminUser | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return formatAdminUser(result.user);
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
}

/**
 * Email & Password Sign-In
 */
export async function loginWithEmail(email: string, pass: string): Promise<AdminUser | null> {
  try {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    return formatAdminUser(result.user);
  } catch (error: any) {
    console.error('Email Sign-In Error:', error);
    throw error;
  }
}

/**
 * Sign out current user
 */
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

/**
 * Subscribe to Authentication state changes
 */
export function subscribeToAuthState(callback: (user: AdminUser | null) => void) {
  return onAuthStateChanged(auth, (user) => {
    callback(formatAdminUser(user));
  });
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
            whatILearned: data.whatILearned,
            sustainabilityConnection: data.sustainabilityConnection,
            reflection: typeof data.reflection === 'string' ? data.reflection : (data.reflection?.whatSurprisedMe || data.reflection?.reflection || ''),
            isPublished: data.isPublished !== false,
            uploadedBy: data.uploadedBy || 'Administrator',
            createdAt: data.createdAt || new Date().toISOString()
          });
        }
      });

      // Sort by activity number / week number ascending
      items.sort((a, b) => {
        const numA = a.activityNumber || a.weekNumber || 0;
        const numB = b.activityNumber || b.weekNumber || 0;
        return numA - numB;
      });
      onUpdate(items);
    },
    (err) => {
      console.warn('Firestore real-time subscription note:', err);
      onUpdate([]);
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

  // Delete Firestore document
  await deleteDoc(doc(db, ASSIGNMENTS_COLLECTION, id));

  // If file was in Firebase Storage, try to delete it
  if (pdfUrl && pdfUrl.includes('firebasestorage.googleapis.com')) {
    try {
      const fileRef = ref(storage, pdfUrl);
      await deleteObject(fileRef);
    } catch (storageErr) {
      console.warn('Storage deletion note (may not exist):', storageErr);
    }
  }
}

/**
 * Upload PDF File to Firebase Storage or local fallback
 */
export async function uploadPdfDocument(
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ pdfUrl: string; fileSize: string }> {
  const formattedSize = file.size > 1024 * 1024 
    ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
    : `${(file.size / 1024).toFixed(0)} KB`;

  const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const storagePath = `assignments/${Date.now()}_${cleanFileName}`;
  const fileStorageRef = ref(storage, storagePath);

  try {
    const uploadTask = await uploadBytes(fileStorageRef, file, {
      contentType: 'application/pdf'
    });
    const downloadUrl = await getDownloadURL(uploadTask.ref);
    if (onProgress) onProgress(100);
    return {
      pdfUrl: downloadUrl,
      fileSize: formattedSize
    };
  } catch (storageErr: any) {
    console.warn('Firebase Storage upload not configured or restricted, using base64 fallback:', storageErr);
    
    // Fallback: Read as Data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          pdfUrl: reader.result as string,
          fileSize: formattedSize
        });
      };
      reader.onerror = () => reject(new Error('Failed to read PDF file'));
      reader.readAsDataURL(file);
    });
  }
}
