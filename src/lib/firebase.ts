import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query,
  getDocs,
  getDocFromServer
} from 'firebase/firestore';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
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
import { Assignment, AdminUser, EvidenceItem } from '../types';
import { INITIAL_ASSIGNMENTS } from './data/initialAssignments';
import firebaseConfig from '../../firebase-applet-config.json';

// Configured admin email - Read from environment or fallback to authorized account
export const ADMIN_EMAIL = (
  ((import.meta as any)?.env?.VITE_ADMIN_EMAIL as string) || 
  'aryanacharya0211@gmail.com'
).trim().toLowerCase();

// Initialize Firebase App singleton
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId) 
  : getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Constants
export const ASSIGNMENTS_COLLECTION = 'assignments';

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
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on startup
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline note: Using cached or fallback data.');
    }
  }
}
testConnection();

/**
 * Check whether a given user email is the authorized Admin
 */
export function isUserAdmin(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return (
    normalized === ADMIN_EMAIL ||
    normalized === 'aryanacharya0211@gmail.com' ||
    normalized === 'aryanacharya211@gmail.com' ||
    normalized === 'aryan.acharya0211@gmail.com' ||
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
 * Email & Password Sign-In (with automatic registration for authorized admin)
 */
export async function loginWithEmail(email: string, pass: string): Promise<AdminUser | null> {
  const cleanEmail = email.trim().toLowerCase();
  try {
    const result = await signInWithEmailAndPassword(auth, cleanEmail, pass);
    return formatAdminUser(result.user);
  } catch (error: any) {
    // If account doesn't exist yet, attempt to create it for the admin
    if (
      (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') &&
      isUserAdmin(cleanEmail)
    ) {
      try {
        const createResult = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
        return formatAdminUser(createResult.user);
      } catch (createErr: any) {
        console.error('Email Registration Error:', createErr);
        throw createErr;
      }
    }
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
 * Auto-seed initial assignments to Firestore if the collection is empty
 */
let isSeedingInitiated = false;
async function autoSeedAssignmentsIfEmpty() {
  if (isSeedingInitiated) return;
  isSeedingInitiated = true;

  try {
    const assignmentsRef = collection(db, ASSIGNMENTS_COLLECTION);
    const existingSnap = await getDocs(assignmentsRef);
    if (existingSnap.empty) {
      console.log('Seeding initial assignments into Firestore for cross-device visibility...');
      for (const item of INITIAL_ASSIGNMENTS) {
        const itemRef = doc(db, ASSIGNMENTS_COLLECTION, item.id);
        await setDoc(itemRef, {
          ...item,
          isPublished: true,
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          uploadedBy: ADMIN_EMAIL
        }, { merge: true });
      }
    }
  } catch (seedErr) {
    console.warn('Auto-seed note (normal if not admin or offline):', seedErr);
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

  // Trigger non-blocking auto-seed check
  autoSeedAssignmentsIfEmpty();

  return onSnapshot(
    q,
    (snapshot) => {
      const items: Assignment[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const actNum = Number(data.activityNumber) || 1;
        
        // Structured reflection mapping
        let parsedReflection = {
          whatSurprisedMe: '',
          whatChallengedMe: '',
          whatWillIDoDifferently: ''
        };
        if (typeof data.reflection === 'object' && data.reflection !== null) {
          parsedReflection = {
            whatSurprisedMe: data.reflection.whatSurprisedMe || '',
            whatChallengedMe: data.reflection.whatChallengedMe || data.reflection.whatChallengeDidIFace || '',
            whatWillIDoDifferently: data.reflection.whatWillIDoDifferently || ''
          };
        } else if (typeof data.reflection === 'string') {
          parsedReflection = {
            whatSurprisedMe: data.reflection,
            whatChallengedMe: '',
            whatWillIDoDifferently: ''
          };
        }

        items.push({
          id: docSnap.id,
          activityNumber: actNum,
          activityCode: data.activityCode || `ACTIVITY ${String(actNum).padStart(2, '0')}`,
          slug: data.slug || `activity-${String(actNum).padStart(2, '0')}`,
          tagPill: data.tagPill || data.type || 'ACTIVITY',
          title: data.title || `Activity ${actNum}`,
          subject: data.subject || 'E-Waste & Environmental Management',
          weekNumber: Number(data.weekNumber) || actNum,
          submissionDate: data.submissionDate || new Date().toISOString().split('T')[0],
          shortDescription: data.shortDescription || data.description || '',
          description: data.description || data.shortDescription || '',
          objective: data.objective || data.description || '',
          evidenceDescription: data.evidenceDescription || '',
          evidenceItems: Array.isArray(data.evidenceItems) ? data.evidenceItems : [],
          coverImageUrl: data.coverImageUrl || '',
          whatILearned: data.whatILearned || '',
          sustainabilityConnection: data.sustainabilityConnection || '',
          reflection: parsedReflection,
          references: Array.isArray(data.references) ? data.references : [],
          pdfUrl: data.pdfUrl || 'https://cdn.jsdelivr.net/gh/mozilla/pdf.js@master/web/compressed.tracemonkey-pldi-09.pdf',
          fileSize: data.fileSize || '1.4 MB',
          type: data.type || 'Activity',
          category: data.category || 'Activities',
          status: data.status || 'Evaluated',
          isPublished: data.isPublished !== false,
          createdBy: data.createdBy || data.uploadedBy || 'Administrator',
          uploadedBy: data.uploadedBy || data.createdBy || 'Administrator',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString()
        });
      });

      // If Firestore returned items, sort them by activityNumber ascending
      if (items.length > 0) {
        items.sort((a, b) => (a.activityNumber || 0) - (b.activityNumber || 0));
        onUpdate(items);
      } else {
        // Fallback to initial assignments if collection hasn't yet completed sync
        onUpdate(INITIAL_ASSIGNMENTS);
      }
    },
    (err) => {
      console.warn('Firestore real-time subscription status:', err);
      // Serve initial assignments so user never sees a blank screen
      onUpdate(INITIAL_ASSIGNMENTS);
      if (onError) onError(err);
    }
  );
}

/**
 * Save / Create new assignment in Firestore
 */
export async function saveAssignmentToFirestore(
  assignment: Assignment,
  currentUserEmail?: string | null
): Promise<void> {
  const emailToCheck = currentUserEmail || auth.currentUser?.email;
  if (!isUserAdmin(emailToCheck)) {
    throw new Error(`Security Violation: Only verified admin (${ADMIN_EMAIL}) is permitted to add assignments.`);
  }

  const actNum = assignment.activityNumber || 1;
  const docId = assignment.id || `activity-${String(actNum).padStart(2, '0')}`;
  const docRef = doc(db, ASSIGNMENTS_COLLECTION, docId);

  const dataToSave = {
    ...assignment,
    id: docId,
    activityNumber: actNum,
    activityCode: `ACTIVITY ${String(actNum).padStart(2, '0')}`,
    slug: assignment.slug || `activity-${String(actNum).padStart(2, '0')}`,
    isPublished: assignment.isPublished !== false,
    createdBy: emailToCheck || ADMIN_EMAIL,
    uploadedBy: emailToCheck || ADMIN_EMAIL,
    createdAt: assignment.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    await setDoc(docRef, dataToSave, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${ASSIGNMENTS_COLLECTION}/${docId}`);
  }
}

/**
 * Update existing assignment in Firestore
 */
export async function updateAssignmentInFirestore(
  assignment: Assignment,
  currentUserEmail?: string | null
): Promise<void> {
  const emailToCheck = currentUserEmail || auth.currentUser?.email;
  if (!isUserAdmin(emailToCheck)) {
    throw new Error(`Security Violation: Only verified admin (${ADMIN_EMAIL}) is permitted to edit assignments.`);
  }

  const docRef = doc(db, ASSIGNMENTS_COLLECTION, assignment.id);
  const dataToUpdate = {
    ...assignment,
    updatedAt: new Date().toISOString()
  };

  try {
    await setDoc(docRef, dataToUpdate, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${ASSIGNMENTS_COLLECTION}/${assignment.id}`);
  }
}

/**
 * Toggle Publish / Draft status of an assignment
 */
export async function togglePublishAssignmentInFirestore(
  id: string,
  newPublishState: boolean,
  currentUserEmail?: string | null
): Promise<void> {
  const emailToCheck = currentUserEmail || auth.currentUser?.email;
  if (!isUserAdmin(emailToCheck)) {
    throw new Error(`Security Violation: Only verified admin (${ADMIN_EMAIL}) is permitted to publish or unpublish.`);
  }

  const docRef = doc(db, ASSIGNMENTS_COLLECTION, id);
  try {
    await setDoc(docRef, {
      isPublished: newPublishState,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${ASSIGNMENTS_COLLECTION}/${id}`);
  }
}

/**
 * Delete assignment from Firestore and associated storage files
 */
export async function deleteAssignmentFromFirestore(
  id: string,
  evidenceItems?: EvidenceItem[],
  pdfUrl?: string,
  currentUserEmail?: string | null
): Promise<void> {
  const emailToCheck = currentUserEmail || auth.currentUser?.email;
  if (!isUserAdmin(emailToCheck)) {
    throw new Error(`Security Violation: Only verified admin (${ADMIN_EMAIL}) is permitted to delete assignments.`);
  }

  try {
    await deleteDoc(doc(db, ASSIGNMENTS_COLLECTION, id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${ASSIGNMENTS_COLLECTION}/${id}`);
  }

  // Delete attached files if stored in Firebase Storage
  if (pdfUrl && pdfUrl.includes('firebasestorage.googleapis.com')) {
    try {
      const fileRef = ref(storage, pdfUrl);
      await deleteObject(fileRef);
    } catch (storageErr) {
      console.warn('Storage delete note:', storageErr);
    }
  }

  if (evidenceItems && evidenceItems.length > 0) {
    for (const item of evidenceItems) {
      if (item.url && item.url.includes('firebasestorage.googleapis.com')) {
        try {
          const fileRef = ref(storage, item.url);
          await deleteObject(fileRef);
        } catch (storageErr) {
          console.warn('Evidence file delete note:', storageErr);
        }
      }
    }
  }
}

/**
 * Upload Evidence file (image, PDF, etc.) to Firebase Storage
 */
export async function uploadEvidenceFile(
  file: File,
  folder = 'evidence',
  onProgress?: (progress: number) => void
): Promise<EvidenceItem> {
  const isImage = file.type.startsWith('image/');
  const isPdf = file.type === 'application/pdf';
  const fileType: 'image' | 'pdf' | 'file' = isImage ? 'image' : isPdf ? 'pdf' : 'file';

  const formattedSize = file.size > 1024 * 1024 
    ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
    : `${(file.size / 1024).toFixed(0)} KB`;

  const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const storagePath = `${folder}/${Date.now()}_${cleanFileName}`;
  const fileStorageRef = ref(storage, storagePath);

  try {
    const uploadTask = await uploadBytes(fileStorageRef, file, {
      contentType: file.type || 'application/octet-stream'
    });
    const downloadUrl = await getDownloadURL(uploadTask.ref);
    if (onProgress) onProgress(100);

    return {
      id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      url: downloadUrl,
      name: file.name,
      type: fileType,
      fileSize: formattedSize
    };
  } catch (storageErr) {
    console.warn('Storage upload encountered error, using base64 fallback:', storageErr);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          url: reader.result as string,
          name: file.name,
          type: fileType,
          fileSize: formattedSize
        });
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }
}

/**
 * Upload PDF File to Firebase Storage with resilient fallback
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
    console.warn('Firebase Storage PDF upload fallback:', storageErr);
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
