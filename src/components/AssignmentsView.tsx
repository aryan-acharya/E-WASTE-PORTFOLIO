import React, { useState, useEffect } from 'react';
import { ASSIGNMENTS } from '../lib/data/assignments';
import { Assignment } from '../types';
import { ActivityListView } from './activity/ActivityListView';
import { ActivityDetailView } from './activity/ActivityDetailView';
import { PdfViewerModal } from './PdfViewerModal';

export const AssignmentsView: React.FC = () => {
  const [selectedActivity, setSelectedActivity] = useState<Assignment | null>(null);
  const [viewingPdfActivity, setViewingPdfActivity] = useState<Assignment | null>(null);

  // Check URL hash on initial load
  useEffect(() => {
    const hash = window.location.hash.replace('#', '').trim().toLowerCase();
    if (hash.startsWith('activity-')) {
      const match = ASSIGNMENTS.find(
        (a) => a.slug?.toLowerCase() === hash || a.id.toLowerCase() === hash
      );
      if (match) {
        setSelectedActivity(match);
      }
    }
  }, []);

  // Hash change listener for browser navigation (Back / Forward)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').trim().toLowerCase();
      if (!hash || hash === 'assignments') {
        setSelectedActivity(null);
      } else if (hash.startsWith('activity-')) {
        const match = ASSIGNMENTS.find(
          (a) => a.slug?.toLowerCase() === hash || a.id.toLowerCase() === hash
        );
        if (match) {
          setSelectedActivity(match);
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Handle selecting an activity
  const handleSelectActivity = (activity: Assignment) => {
    setSelectedActivity(activity);
    const actNum = activity.activityNumber || 1;
    const slug = activity.slug || `activity-${String(actNum).padStart(2, '0')}`;
    window.location.hash = slug;
    
    // Scroll smoothly to top of assignment view
    const el = document.getElementById('assignments-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle going back to list
  const handleBackToList = () => {
    setSelectedActivity(null);
    window.location.hash = 'assignments';
    const el = document.getElementById('assignments-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="assignments-section" className="relative min-h-[600px] w-full bg-[#05080c] transition-colors">
      {/* Either Activity Detail View or Activity List View */}
      {selectedActivity ? (
        <ActivityDetailView
          activity={selectedActivity}
          allActivities={ASSIGNMENTS}
          onBack={handleBackToList}
          onSelectActivity={handleSelectActivity}
          onOpenPdfViewer={(act) => setViewingPdfActivity(act)}
        />
      ) : (
        <ActivityListView
          assignments={ASSIGNMENTS}
          onSelectActivity={handleSelectActivity}
        />
      )}

      {/* PDF Viewer Modal */}
      <PdfViewerModal
        assignment={viewingPdfActivity}
        onClose={() => setViewingPdfActivity(null)}
      />
    </section>
  );
};
