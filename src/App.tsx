import React, { useState, useEffect } from 'react';
import { NavSection, SubjectName, Assignment } from './types';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { SubjectOverview } from './components/SubjectOverview';
import { AssignmentsView } from './components/AssignmentsView';
import { PdfViewerModal } from './components/PdfViewerModal';
import { FloatingBlobs } from './components/FloatingBlobs';
import { Footer } from './components/Footer';
import { ASSIGNMENTS_DATA, SAMPLE_ASSIGNMENTS_DATA } from './lib/data/assignments';
import { SUBJECTS_DATA } from './lib/data/subjects';
import { 
  subscribeToAssignments, 
  saveAssignmentToFirestore, 
  deleteAssignmentFromFirestore 
} from './lib/firebase';

export default function App() {
  const [activeSection, setActiveSection] = useState<NavSection>('home');
  const [activePdfAssignment, setActivePdfAssignment] = useState<Assignment | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Assignments state with initial fallback to localStorage
  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const saved = localStorage.getItem('ewaste_assignments');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // ignore parse error
      }
    }
    return ASSIGNMENTS_DATA;
  });

  // Real-time Firestore synchronization across all users & devices
  useEffect(() => {
    let hasSeeded = false;
    const unsubscribe = subscribeToAssignments(
      (firestoreAssignments) => {
        if (firestoreAssignments.length === 0 && !hasSeeded) {
          hasSeeded = true;
          handleLoadSampleData();
        } else {
          setAssignments(firestoreAssignments);
          try {
            localStorage.setItem('ewaste_assignments', JSON.stringify(firestoreAssignments));
          } catch (e) {
            console.warn('LocalStorage save error:', e);
          }
        }
      },
      (error) => {
        console.warn('Firestore subscription fallback:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleAddAssignment = async (newAssignment: Assignment) => {
    // Optimistic UI update
    setAssignments((prev) => [newAssignment, ...prev.filter(a => a.id !== newAssignment.id)]);
    // Save to Firestore globally for everyone
    try {
      await saveAssignmentToFirestore(newAssignment);
    } catch (err) {
      console.error('Failed to sync assignment to Firestore:', err);
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    // Optimistic UI update
    setAssignments((prev) => prev.filter((a) => a.id !== id));
    // Remove from Firestore globally
    try {
      await deleteAssignmentFromFirestore(id);
    } catch (err) {
      console.error('Failed to delete assignment from Firestore:', err);
    }
  };

  const handleLoadSampleData = async () => {
    for (const item of SAMPLE_ASSIGNMENTS_DATA) {
      try {
        await saveAssignmentToFirestore(item);
      } catch (err) {
        console.error('Failed to load sample data item to Firestore:', err);
      }
    }
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
    
    // Smooth scroll to relevant section if on single page layout
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
          onAddAssignment={handleAddAssignment}
          onDeleteAssignment={handleDeleteAssignment}
          onLoadSampleData={handleLoadSampleData}
          onViewPdf={(assignment) => setActivePdfAssignment(assignment)}
          searchQueryProp={searchQuery}
        />
      </main>

      {/* Footer */}
      <Footer />

      {/* Interactive PDF Document Reader Modal */}
      <PdfViewerModal
        assignment={activePdfAssignment}
        onClose={() => setActivePdfAssignment(null)}
      />
    </div>
  );
}
