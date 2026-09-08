import React, { useState, useEffect } from 'react';
import { NavSection, SubjectName, Assignment } from './types';
import { Navbar } from './components/Navbar';
import { HeroTitle } from './components/HeroTitle';
import { GlobalGlobeSection } from './components/globe/GlobalGlobeSection';
import { SubjectProfileCard } from './components/SubjectProfileCard';
import { SubjectOverview } from './components/SubjectOverview';
import { AssignmentsView } from './components/AssignmentsView';
import { FloatingBlobs } from './components/FloatingBlobs';
import { Footer } from './components/Footer';
import { SUBJECTS_DATA } from './lib/data/subjects';
import { subscribeToAssignments } from './lib/firebase';

export default function App() {
  const [activeSection, setActiveSection] = useState<NavSection>('home');
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  // Real-time Firestore synchronization for counts
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

  // Navigation action
  const handleNavigate = (section: NavSection) => {
    setActiveSection(section);
    
    if (section === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (section === 'overview') {
      const el = document.getElementById('subjects-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 800, behavior: 'smooth' });
      }
    } else if (section === 'assignments') {
      const el = document.getElementById('assignments-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 1200, behavior: 'smooth' });
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
        onOpenSearch={() => handleNavigate('assignments')}
        totalAssignmentsCount={assignments.length}
      />

      {/* Main Page Content */}
      <main className="relative z-10">
        {/* Existing Hero/Title section */}
        <HeroTitle />

        {/* NEW 3D GLOBE SECTION (Centerpiece Earth & Planetary E-Waste Monitor) */}
        <GlobalGlobeSection />

        {/* Existing Subject Information / Author card & Stats */}
        <SubjectProfileCard
          onNavigate={handleNavigate}
          totalAssignmentsCount={assignments.length}
          totalSubjectsCount={SUBJECTS_DATA.length}
          totalCredits={totalCredits}
        />

        {/* Subject Overview Section */}
        <SubjectOverview
          getAssignmentCountForSubject={getAssignmentCountForSubject}
        />

        {/* Assignments Section */}
        <AssignmentsView />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
