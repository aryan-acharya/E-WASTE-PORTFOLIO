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

export default function App() {
  const [activeSection, setActiveSection] = useState<NavSection>('home');
  const [activePdfAssignment, setActivePdfAssignment] = useState<Assignment | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // LocalStorage state management for user assignments
  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const saved = localStorage.getItem('ewaste_assignments');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return ASSIGNMENTS_DATA; // []
      }
    }
    return ASSIGNMENTS_DATA; // []
  });

  useEffect(() => {
    localStorage.setItem('ewaste_assignments', JSON.stringify(assignments));
  }, [assignments]);

  const handleAddAssignment = (newAssignment: Assignment) => {
    setAssignments((prev) => [newAssignment, ...prev]);
  };

  const handleDeleteAssignment = (id: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleLoadSampleData = () => {
    setAssignments(SAMPLE_ASSIGNMENTS_DATA);
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
