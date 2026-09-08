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
  initializeAuth,
  indexedDBLocalPersistence,
  browserLocalPersistence,
  inMemoryPersistence,
  GoogleAuthProvider, 
  signInWithRedirect,
  getRedirectResult,
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

// Resilient Auth initialization with multi-layer persistence fallback
function initializeResilientAuth() {
  try {
    return initializeAuth(app, {
      persistence: [indexedDBLocalPersistence, browserLocalPersistence, inMemoryPersistence]
    });
  } catch {
    return getAuth(app);
  }
}
export const auth = initializeResilientAuth();
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
 * Detect if the application is running inside an iframe (e.g. AI Studio preview)
 */
export function isRunningInIframe(): boolean {
  try {
    return typeof window !== 'undefined' && window.self !== window.top;
  } catch {
    return true;
  }
}

/**
 * Check whether a given user email is the authorized Admin.
 * Verifies that the email matches ADMIN_EMAIL and is provider-verified.
 */
export function isUserAdmin(email?: string | null, emailVerified?: boolean): boolean {
  if (!email) return false;
  const current = auth.currentUser;
  const verified = emailVerified !== undefined 
    ? emailVerified 
    : (current && current.email?.toLowerCase() === email.toLowerCase() ? current.emailVerified : false);
  const normalized = email.trim().toLowerCase();
  
  // Strictly enforce verified email matching ADMIN_EMAIL
  return verified === true && normalized === ADMIN_EMAIL;
}

/**
 * Convert Firebase User to App AdminUser representation
 */
export function formatAdminUser(user: User | null): AdminUser | null {
  if (!user) return null;
  const isVerified = user.emailVerified === true;
  const isAdmin = isUserAdmin(user.email, isVerified);

  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || user.email?.split('@')[0] || 'User',
    photoURL: user.photoURL,
    isAdmin,
    emailVerified: isVerified
  };
}

/**
 * Initiate top-level browser redirect to Google OAuth flow.
 * Note: Does NOT open in iframe or embedded popup.
 * If running inside an iframe, opens the production site in a new top-level tab.
 */
export async function loginWithGoogleRedirect(): Promise<void> {
  if (isRunningInIframe()) {
    // Iframe sandboxing blocks Google OAuth redirect. Direct user to top-level production site.
    window.open('https://e-waste-portfolio-seven.vercel.app/#admin', '_blank');
    return;
  }

  googleProvider.setCustomParameters({
    prompt: 'select_account'
  });

  try {
    await signInWithRedirect(auth, googleProvider);
  } catch (error: any) {
    console.error('Google Sign-In Redirect Error:', error);
    throw error;
  }
}

/**
 * Check and resolve any redirect credential returned from Google OAuth
 */
export async function handleRedirectAuthResult(): Promise<AdminUser | null> {
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      return formatAdminUser(result.user);
    }
    return null;
  } catch (error: any) {
    console.error('Error handling Google redirect result:', error);
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
 * Subscribe to Authentication state changes.
 * Also checks getRedirectResult in the background to capture any returned credential.
 */
export function subscribeToAuthState(callback: (user: AdminUser | null) => void) {
  // Capture any redirect credential on startup
  handleRedirectAuthResult().catch((err) => {
    console.warn('Initial redirect check note:', err);
  });

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
 * Upload Evidence file (image, PDF, video, etc.) to Firebase Storage
 */
export async function uploadEvidenceFile(
  file: File,
  folder = 'evidence',
  onProgress?: (progress: number) => void,
  currentUserEmail?: string | null,
  caption?: string,
  description?: string
): Promise<EvidenceItem> {
  const emailToCheck = currentUserEmail || auth.currentUser?.email;
  if (!isUserAdmin(emailToCheck)) {
    throw new Error(`Security Violation: Only verified admin (${ADMIN_EMAIL}) is permitted to upload evidence files.`);
  }

  // Supported MIME validation: JPG, JPEG, PNG, WEBP, PDF, MP4, WEBM, MOV
  const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|svg)$/i.test(file.name);
  const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
  const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|m4v)$/i.test(file.name);

  if (!isImage && !isPdf && !isVideo) {
    throw new Error('Unsupported file type. Please upload an Image (JPG, PNG, WEBP), PDF, or Video (MP4, WEBM, MOV).');
  }

  // Size limit: 100MB for video/documents, 25MB for images
  const maxBytes = isVideo ? 100 * 1024 * 1024 : 25 * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error(`File size exceeds limit (${isVideo ? '100MB' : '25MB'}).`);
  }

  const fileType: 'image' | 'pdf' | 'video' | 'file' = isImage ? 'image' : isPdf ? 'pdf' : isVideo ? 'video' : 'file';

  const formattedSize = file.size > 1024 * 1024 
    ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
    : `${(file.size / 1024).toFixed(0)} KB`;

  const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const storagePath = `${folder}/${Date.now()}_${cleanFileName}`;
  const fileStorageRef = ref(storage, storagePath);

  try {
    const uploadTask = await uploadBytes(fileStorageRef, file, {
      contentType: file.type || (isVideo ? 'video/mp4' : isPdf ? 'application/pdf' : 'image/jpeg')
    });
    const downloadUrl = await getDownloadURL(uploadTask.ref);
    if (onProgress) onProgress(100);

    return {
      id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      url: downloadUrl,
      name: file.name,
      type: fileType,
      caption: caption || '',
      description: description || '',
      fileSize: formattedSize,
      createdAt: new Date().toISOString()
    };
  } catch (storageErr) {
    console.warn('Storage upload encountered error, using resilient fallback:', storageErr);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          url: reader.result as string,
          name: file.name,
          type: fileType,
          caption: caption || '',
          description: description || '',
          fileSize: formattedSize,
          createdAt: new Date().toISOString()
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
