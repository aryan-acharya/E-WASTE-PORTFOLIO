import { initializeApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  doc, 
  query
} from 'firebase/firestore';
import { Assignment } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App singleton
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Export Firestore database instance with configured database ID
export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

const ASSIGNMENTS_COLLECTION = 'assignments';

/**
 * Real-time listener for Firestore assignments.
 * Automatically synchronizes whenever any user adds or removes an assignment.
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
        items.push({
          id: docSnap.id,
          title: data.title || 'Untitled',
          subject: data.subject || 'E-Waste & Environmental Management',
          weekNumber: Number(data.weekNumber) || 1,
          submissionDate: data.submissionDate || new Date().toISOString().split('T')[0],
          description: data.description || '',
          pdfUrl: data.pdfUrl || '/assignments/ewaste-global-generation-report.pdf',
          fileSize: data.fileSize || '1.2 MB',
          type: data.type || 'Report',
          category: data.category || 'Reports',
          status: data.status || 'Submitted',
          marksObtained: data.marksObtained,
          topics: Array.isArray(data.topics) ? data.topics : []
        });
      });

      // Sort latest submission first
      items.sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime());

      onUpdate(items);
    },
    (err) => {
      console.error('Firestore real-time subscription error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Save assignment to Firestore (persistent and visible to all users globally)
 */
export async function saveAssignmentToFirestore(assignment: Assignment): Promise<void> {
  const docRef = doc(db, ASSIGNMENTS_COLLECTION, assignment.id);

  // Ensure pdfUrl is safe for Firestore 1MB limit
  let safePdfUrl = assignment.pdfUrl || '/assignments/ewaste-global-generation-report.pdf';
  if (safePdfUrl.startsWith('data:') && safePdfUrl.length > 750000) {
    safePdfUrl = '/assignments/ewaste-global-generation-report.pdf';
  }

  const dataToSave = {
    ...assignment,
    pdfUrl: safePdfUrl,
    createdAt: new Date().toISOString()
  };

  try {
    await setDoc(docRef, dataToSave, { merge: true });
  } catch (err: any) {
    console.warn('Firestore setDoc warning, attempting fallback:', err);
    if (dataToSave.pdfUrl.length > 300000) {
      dataToSave.pdfUrl = '/assignments/ewaste-global-generation-report.pdf';
      await setDoc(docRef, dataToSave, { merge: true });
    } else {
      throw err;
    }
  }
}

/**
 * Delete assignment from Firestore for all users
 */
export async function deleteAssignmentFromFirestore(id: string): Promise<void> {
  const docRef = doc(db, ASSIGNMENTS_COLLECTION, id);
  await deleteDoc(docRef);
}
