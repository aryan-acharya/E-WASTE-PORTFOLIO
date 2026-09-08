import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  ExternalLink, 
  ShieldCheck, 
  Calendar, 
  FileText, 
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  Lock
} from 'lucide-react';
import { Assignment, AdminUser } from '../../types';
import { 
  deleteAssignmentFromFirestore, 
  togglePublishAssignmentInFirestore,
  ADMIN_EMAIL 
} from '../../lib/firebase';

interface AdminDashboardModalProps {
  isOpen: boolean;
  adminUser: AdminUser | null;
  assignments: Assignment[];
  onClose: () => void;
  onOpenAddModal: () => void;
  onOpenEditModal: (activity: Assignment) => void;
  onViewActivity: (activity: Assignment) => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  adminUser,
  assignments,
  onClose,
  onOpenAddModal,
  onOpenEditModal,
  onViewActivity
}) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!isOpen) return null;

  if (!adminUser?.isAdmin) {
    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#090d14] border border-white/10 p-8 rounded-2xl max-w-md w-full text-center text-white space-y-4">
            <Lock className="w-12 h-12 text-red-400 mx-auto" />
            <h3 className="text-lg font-bold">Unauthorized Access</h3>
            <p className="text-xs text-slate-400">
              Only the verified administrator ({ADMIN_EMAIL}) is authorized to access the management portal.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-mono"
            >
              Close
            </button>
          </div>
        </div>
      </AnimatePresence>
    );
  }

  // Filter assignments
  const displayedAssignments = assignments.filter((item) => {
    const matchesSearch = 
      item.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
      String(item.activityNumber).includes(filterQuery);

    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'published' && item.isPublished !== false) ||
      (statusFilter === 'draft' && item.isPublished === false);

    return matchesSearch && matchesStatus;
  });

  const publishedCount = assignments.filter((a) => a.isPublished !== false).length;
  const draftCount = assignments.filter((a) => a.isPublished === false).length;

  const handleTogglePublish = async (activity: Assignment) => {
    try {
      await togglePublishAssignmentInFirestore(activity.id, !activity.isPublished, adminUser.email);
    } catch (err) {
      console.error('Error toggling publish status:', err);
    }
  };

  const handleDelete = async (activity: Assignment) => {
    if (!window.confirm(`Are you sure you want to permanently delete Activity ${activity.activityNumber}: "${activity.title}" from the cloud database?`)) {
      return;
    }

    try {
      setDeletingId(activity.id);
      await deleteAssignmentFromFirestore(activity.id, activity.evidenceItems, activity.pdfUrl, adminUser.email);
      setDeletingId(null);
    } catch (err) {
      console.error('Error deleting activity:', err);
      setDeletingId(null);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-sans">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="relative w-full max-w-5xl bg-[#090d14] text-white rounded-[24px] border border-white/10 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh] z-10"
        >
          {/* Top Bar */}
          <div className="p-6 bg-[#05080c] border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold tracking-tight text-white">
                  Assignment Management Console
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Administrator: {adminUser.email} • Firestore Cloud DB Synchronized
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  onClose();
                  onOpenAddModal();
                }}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4" />
                <span>+ ADD ASSIGNMENT</span>
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="px-6 py-4 bg-[#070b10] border-b border-white/10 grid grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-slate-500 uppercase">Total Activities</span>
              <p className="text-xl font-bold text-white mt-0.5">{assignments.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-emerald-400 uppercase">Published to Public</span>
              <p className="text-xl font-bold text-emerald-400 mt-0.5">{publishedCount}</p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-amber-400 uppercase">Drafts (Private)</span>
              <p className="text-xl font-bold text-amber-400 mt-0.5">{draftCount}</p>
            </div>
          </div>

          {/* Filter and Search Bar */}
          <div className="p-4 sm:px-6 bg-[#090d14] border-b border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors ${
                  statusFilter === 'all' ? 'bg-white text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({assignments.length})
              </button>
              <button
                onClick={() => setStatusFilter('published')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors ${
                  statusFilter === 'published' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Published ({publishedCount})
              </button>
              <button
                onClick={() => setStatusFilter('draft')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors ${
                  statusFilter === 'draft' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Drafts ({draftCount})
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Filter activities..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 font-sans"
              />
            </div>
          </div>

          {/* Assignments Management Table */}
          <div className="flex-1 overflow-y-auto divide-y divide-white/10">
            {displayedAssignments.length === 0 ? (
              <div className="p-12 text-center text-slate-500 font-mono text-xs">
                No assignments found matching current filter.
              </div>
            ) : (
              displayedAssignments.map((assignment) => {
                const isDraft = assignment.isPublished === false;
                return (
                  <div
                    key={assignment.id}
                    className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <span className="px-2.5 py-1 rounded-lg bg-white/5 text-white font-mono text-xs font-bold shrink-0 border border-white/10">
                        {assignment.activityCode || `ACT ${assignment.activityNumber}`}
                      </span>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-sm text-white tracking-tight">
                            {assignment.title}
                          </h4>
                          {isDraft ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              DRAFT
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              PUBLISHED
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500 font-mono mt-0.5">
                          <span>{assignment.type}</span>
                          <span>•</span>
                          <span>{assignment.submissionDate}</span>
                          <span>•</span>
                          <span>{assignment.evidenceItems?.length || 1} Evidence file(s)</span>
                        </div>
                      </div>
                    </div>

                    {/* Management Action Buttons: Edit, Delete, Toggle Publish, View */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          onClose();
                          onViewActivity(assignment);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors"
                        title="View detail page"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                        <span>View</span>
                      </button>

                      <button
                        onClick={() => handleTogglePublish(assignment)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors ${
                          isDraft
                            ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                        }`}
                        title={isDraft ? 'Publish Activity' : 'Unpublish Activity'}
                      >
                        {isDraft ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span>{isDraft ? 'Publish' : 'Unpublish'}</span>
                      </button>

                      <button
                        onClick={() => {
                          onClose();
                          onOpenEditModal(assignment);
                        }}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                        title="Edit activity"
                      >
                        <Edit3 className="w-4 h-4 text-emerald-400" />
                      </button>

                      <button
                        onClick={() => handleDelete(assignment)}
                        disabled={deletingId === assignment.id}
                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                        title="Delete activity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-[#05080c] border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-500">
            <span>Database: ai-studio-ewasteenvironmen • Realtime Sync Active</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
