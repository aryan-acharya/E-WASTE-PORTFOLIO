import React, { useState, useEffect } from 'react';
import { 
  subscribeToAssignments, 
  subscribeToAuthState, 
  togglePublishAssignmentInFirestore,
  deleteAssignmentFromFirestore,
  ADMIN_EMAIL
} from '../lib/firebase';
import { Assignment, AdminUser } from '../types';
import { ActivityListView } from './activity/ActivityListView';
import { ActivityDetailView } from './activity/ActivityDetailView';
import { ActivityFormModal } from './admin/ActivityFormModal';
import { AdminDashboardModal } from './admin/AdminDashboardModal';
import { AdminAuthModal } from './AdminAuthModal';
import { PdfViewerModal } from './PdfViewerModal';

export const AssignmentsView: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Assignment | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Assignment | null>(null);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [viewingPdfActivity, setViewingPdfActivity] = useState<Assignment | null>(null);

  // Subscribe to Auth State
  useEffect(() => {
    const unsubscribeAuth = subscribeToAuthState((user) => {
      setAdminUser(user);
    });
    return () => unsubscribeAuth();
  }, []);

  // Subscribe to Realtime Firestore Assignments
  useEffect(() => {
    const unsubscribeFirestore = subscribeToAssignments(
      (firestoreAssignments) => {
        setAssignments(firestoreAssignments);

        // Check if URL hash matches an activity (e.g. #activity-01 or #activity-02)
        const hash = window.location.hash.replace('#', '').trim().toLowerCase();
        if (hash.startsWith('activity-')) {
          const match = firestoreAssignments.find(
            (a) => a.slug?.toLowerCase() === hash || a.id.toLowerCase() === hash
          );
          if (match) {
            setSelectedActivity(match);
          }
        }
      },
      (error) => {
        console.warn('Assignments subscription error:', error);
      }
    );

    return () => unsubscribeFirestore();
  }, []);

  // Hash change listener for browser navigation (Back / Forward)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').trim().toLowerCase();
      if (!hash || hash === 'assignments') {
        setSelectedActivity(null);
      } else if (hash.startsWith('activity-')) {
        const match = assignments.find(
          (a) => a.slug?.toLowerCase() === hash || a.id.toLowerCase() === hash
        );
        if (match) {
          setSelectedActivity(match);
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [assignments]);

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

  // Open Edit Modal
  const handleOpenEdit = (activity: Assignment) => {
    setEditingActivity(activity);
    setIsAddModalOpen(true);
  };

  // Toggle publish status
  const handleTogglePublish = async (activity: Assignment) => {
    if (!adminUser?.isAdmin) return;
    try {
      await togglePublishAssignmentInFirestore(activity.id, !activity.isPublished, adminUser.email);
    } catch (err) {
      console.error('Failed to toggle publish:', err);
    }
  };

  // Delete activity
  const handleDeleteActivity = async (activity: Assignment) => {
    if (!adminUser?.isAdmin) return;
    if (!window.confirm(`Are you sure you want to permanently delete Activity ${activity.activityNumber}: "${activity.title}" from the cloud database?`)) {
      return;
    }

    try {
      await deleteAssignmentFromFirestore(activity.id, activity.evidenceItems, activity.pdfUrl, adminUser.email);
      if (selectedActivity?.id === activity.id) {
        handleBackToList();
      }
    } catch (err) {
      console.error('Failed to delete activity:', err);
    }
  };

  return (
    <section id="assignments-section" className="relative min-h-[600px] w-full bg-[#05080c] transition-colors">
      {/* Either Activity Detail View or Activity List View */}
      {selectedActivity ? (
        <ActivityDetailView
          activity={selectedActivity}
          allActivities={assignments.filter((a) => adminUser?.isAdmin || a.isPublished !== false)}
          adminUser={adminUser}
          onBack={handleBackToList}
          onSelectActivity={handleSelectActivity}
          onOpenPdfViewer={(act) => setViewingPdfActivity(act)}
          onEditActivity={handleOpenEdit}
          onDeleteActivity={handleDeleteActivity}
          onTogglePublish={handleTogglePublish}
        />
      ) : (
        <ActivityListView
          assignments={assignments}
          adminUser={adminUser}
          onSelectActivity={handleSelectActivity}
          onOpenAddModal={() => {
            setEditingActivity(null);
            setIsAddModalOpen(true);
          }}
          onOpenAdminAuth={() => setIsAuthModalOpen(true)}
          onOpenDashboard={() => setIsDashboardOpen(true)}
        />
      )}

      {/* PDF Viewer Modal */}
      <PdfViewerModal
        assignment={viewingPdfActivity}
        onClose={() => setViewingPdfActivity(null)}
      />

      {/* Admin Auth Modal (Google & Credentials sign-in) */}
      <AdminAuthModal
        isOpen={isAuthModalOpen}
        currentUser={adminUser}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Activity Add / Edit Modal */}
      <ActivityFormModal
        isOpen={isAddModalOpen}
        editingActivity={editingActivity}
        adminUser={adminUser}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingActivity(null);
        }}
        onSuccess={(saved) => {
          if (selectedActivity?.id === saved.id) {
            setSelectedActivity(saved);
          }
        }}
      />

      {/* Admin Dashboard Modal */}
      <AdminDashboardModal
        isOpen={isDashboardOpen}
        adminUser={adminUser}
        assignments={assignments}
        onClose={() => setIsDashboardOpen(false)}
        onOpenAddModal={() => {
          setEditingActivity(null);
          setIsAddModalOpen(true);
        }}
        onOpenEditModal={handleOpenEdit}
        onViewActivity={handleSelectActivity}
      />
    </section>
  );
};
