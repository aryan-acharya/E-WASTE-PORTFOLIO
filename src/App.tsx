import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Globe2 } from 'lucide-react';
import { NavSection, SubjectName, Assignment } from './types';
import { Navbar } from './components/Navbar';
import { HeroTitle } from './components/HeroTitle';
import { SubjectProfileCard } from './components/SubjectProfileCard';
import { SubjectOverview } from './components/SubjectOverview';
import { AssignmentsView } from './components/AssignmentsView';
import { FloatingBlobs } from './components/FloatingBlobs';
import { Footer } from './components/Footer';
import { SUBJECTS_DATA } from './lib/data/subjects';
import { subscribeToAssignments } from './lib/firebase';

// Lazy-load the 3D globe section so it does not block initial page rendering
const GlobalGlobeSection = lazy(() =>
  import('./components/globe/GlobalGlobeSection').then((m) => ({ default: m.GlobalGlobeSection }))
);

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
        <Suspense
          fallback={
            <section className="relative py-8 md:py-12 overflow-hidden">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="w-full h-[520px] sm:h-[600px] md:h-[680px] lg:h-[720px] rounded-[28px] sm:rounded-[36px] bg-gradient-to-b from-slate-950 via-[#030d17] to-slate-950 border border-slate-800/90 shadow-2xl flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
                  <div className="relative flex items-center justify-center w-20 h-20 mb-4">
                    <span className="animate-ping absolute inline-flex h-16 w-16 rounded-full bg-emerald-400 opacity-25"></span>
                    <div className="relative w-16 h-16 rounded-full border-2 border-emerald-400/40 border-t-emerald-400 animate-spin flex items-center justify-center">
                      <Globe2 className="w-6 h-6 text-emerald-400" />
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400 tracking-wider uppercase">
                    INITIALIZING PLANETARY MONITOR & 3D EARTH VIEW...
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono mt-1">
                    Loading UN GEM spatial telemetry
                  </span>
                </div>
              </div>
            </section>
          }
        >
          <GlobalGlobeSection />
        </Suspense>

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
