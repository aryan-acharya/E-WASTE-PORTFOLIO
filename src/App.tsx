import React, { useState, useEffect } from 'react';
import { NavSection, SubjectName, Assignment, AdminUser } from './types';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { SubjectOverview } from './components/SubjectOverview';
import { AssignmentsView } from './components/AssignmentsView';
import { PdfViewerModal } from './components/PdfViewerModal';
import { FloatingBlobs } from './components/FloatingBlobs';
import { Footer } from './components/Footer';
import { AdminAuthModal } from './components/AdminAuthModal';
import { SUBJECTS_DATA } from './lib/data/subjects';
import { 
  subscribeToAssignments, 
  saveAssignmentToFirestore, 
  updateAssignmentInFirestore,
  deleteAssignmentFromFirestore,
  subscribeToAuthState
} from './lib/firebase';

export default function App() {
  const [activeSection, setActiveSection] = useState<NavSection>('home');
  const [activePdfAssignment, setActivePdfAssignment] = useState<Assignment | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);

  // Authentication state
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const isAdmin = currentUser?.isAdmin === true;

  // Assignments state (Persisted in Firestore and synchronized in real-time)
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  // Listen to Auth State
  useEffect(() => {
    const unsubscribeAuth = subscribeToAuthState((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribeAuth();
  }, []);

  // Real-time Firestore synchronization across all users & devices
  useEffect(() => {
    const unsubscribeFirestore = subscribeToAssignments(
      (firestoreAssignments) => {
        setAssignments(firestoreAssignments);
      },
      (error) => {
        console.warn('Firestore subscription status:', error);
      }
    );

    return () => unsubscribeFirestore();
  }, []);

  // Add Assignment (Admin only)
  const handleAddAssignment = async (newAssignment: Assignment) => {
    await saveAssignmentToFirestore(newAssignment, currentUser?.email);
  };

  // Update Assignment (Admin only)
  const handleUpdateAssignment = async (updatedAssignment: Assignment) => {
    await updateAssignmentInFirestore(updatedAssignment, currentUser?.email);
  };

  // Delete Assignment (Admin only)
  const handleDeleteAssignment = async (id: string, pdfUrl?: string) => {
    await deleteAssignmentFromFirestore(id, pdfUrl, currentUser?.email);
  };

  // Handle keyboard shortcut (⌘K or Ctrl+K) to focus search / switch to assignments
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setActiveSection('assignments');
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Navigation action
  const handleNavigate = (section: NavSection) => {
    setActiveSection(section);
    
    // Smooth scroll to relevant section
    if (section === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (section === 'overview') {
      const el = document.getElementById('subjects-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 400, behavior: 'smooth' });
      }
    } else if (section === 'assignments') {
      const el = document.getElementById('assignments-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 800, behavior: 'smooth' });
      }
    }
  };

  // Subject count helper
  const getAssignmentCountForSubject = (subjectName: SubjectName) => {
    return assignments.filter((a) => a.subject === subjectName).length;
  };

  const totalCredits = SUBJECTS_DATA.reduce((acc, curr) => acc + curr.credits, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 relative transition-colors duration-300 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Background Floating Blobs */}
      <FloatingBlobs />

      {/* Sticky Top Navigation */}
      <Navbar
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onOpenSearch={() => {
          setActiveSection('assignments');
          setTimeout(() => {
            const input = document.querySelector('input[type="text"]') as HTMLInputElement;
            if (input) input.focus();
          }, 150);
        }}
        totalAssignmentsCount={assignments.length}
        currentUser={currentUser}
        onOpenAdminAuth={() => setIsAdminAuthModalOpen(true)}
      />

      {/* Main Page Content */}
      <main className="relative z-10">
        {/* Hero Section */}
        <Hero
          onNavigate={handleNavigate}
          totalAssignmentsCount={assignments.length}
          totalSubjectsCount={SUBJECTS_DATA.length}
          totalCredits={totalCredits}
        />

        {/* Subject Overview Section */}
        <SubjectOverview
          getAssignmentCountForSubject={getAssignmentCountForSubject}
        />

        {/* Assignments Archive Section */}
        <AssignmentsView
          assignments={assignments}
          isAdmin={isAdmin}
          onAddAssignment={handleAddAssignment}
          onUpdateAssignment={handleUpdateAssignment}
          onDeleteAssignment={handleDeleteAssignment}
          onViewPdf={(assignment) => setActivePdfAssignment(assignment)}
          onOpenAdminAuth={() => setIsAdminAuthModalOpen(true)}
          searchQueryProp={searchQuery}
        />
      </main>

      {/* Footer */}
      <Footer onOpenAdminAuth={() => setIsAdminAuthModalOpen(true)} />

      {/* Interactive PDF Document Reader Modal */}
      <PdfViewerModal
        assignment={activePdfAssignment}
        onClose={() => setActivePdfAssignment(null)}
      />

      {/* Admin Authentication & Control Portal Modal */}
      <AdminAuthModal
        isOpen={isAdminAuthModalOpen}
        onClose={() => setIsAdminAuthModalOpen(false)}
        currentUser={currentUser}
      />
    </div>
  );
}
