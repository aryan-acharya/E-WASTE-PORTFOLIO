import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  LogIn, 
  LogOut, 
  ArrowLeft, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  ExternalLink, 
  Search, 
  CheckCircle2, 
  AlertTriangle,
  RotateCw,
  Sparkles
} from 'lucide-react';
import { Assignment, AdminUser } from '../../types';
import { ActivityFormModal } from './ActivityFormModal';
import { 
  loginWithGoogleRedirect, 
  logoutUser, 
  isRunningInIframe, 
  ADMIN_EMAIL,
  deleteAssignmentFromFirestore,
  togglePublishAssignmentInFirestore
} from '../../lib/firebase';

export const VERCEL_PRODUCTION_URL = 'https://e-waste-portfolio-seven.vercel.app/';

interface AdminRouteViewProps {
  adminUser: AdminUser | null;
  authLoading: boolean;
  assignments: Assignment[];
  onReturnToPortfolio: () => void;
  onOpenAddModal: () => void;
  onOpenEditModal: (assignment: Assignment) => void;
  onViewAssignment: (assignment: Assignment) => void;
}

export const AdminRouteView: React.FC<AdminRouteViewProps> = ({
  adminUser,
  authLoading,
  assignments,
  onReturnToPortfolio,
  onOpenAddModal,
  onOpenEditModal,
  onViewAssignment
}) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentEditing, setCurrentEditing] = useState<Assignment | null>(null);

  const inIframe = isRunningInIframe();

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await loginWithGoogleRedirect();
    } catch (err) {
      console.error('Sign in redirect failed:', err);
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  };

  const handleSwitchAccount = async () => {
    try {
      await logoutUser();
      await loginWithGoogleRedirect();
    } catch (err) {
      console.error('Switch account failed:', err);
    }
  };

  const handleTogglePublish = async (activity: Assignment) => {
    if (!adminUser?.isAdmin) return;
    try {
      await togglePublishAssignmentInFirestore(activity.id, !activity.isPublished, adminUser.email);
    } catch (err) {
      console.error('Error toggling publish status:', err);
    }
  };

  const handleDelete = async (activity: Assignment) => {
    if (!adminUser?.isAdmin) return;
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete Activity ${activity.activityNumber}: "${activity.title}" from the database?`
    );
    if (!confirmed) return;

    try {
      setDeletingId(activity.id);
      await deleteAssignmentFromFirestore(activity.id, activity.evidenceItems, activity.pdfUrl, adminUser.email);
      setDeletingId(null);
    } catch (err) {
      console.error('Error deleting activity:', err);
      setDeletingId(null);
    }
  };

  // 1. Loading State
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#05080c] text-white flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 animate-pulse">
            <RotateCw className="w-6 h-6 animate-spin" />
          </div>
          <h2 className="text-base font-bold font-mono tracking-tight text-white">
            Verifying Authentication Status
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Communicating with secure Google Identity provider...
          </p>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated State (Prompt to Sign In)
  if (!adminUser) {
    return (
      <div className="min-h-screen bg-[#05080c] text-white flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
        <div className="w-full max-w-md bg-[#090d14] rounded-3xl border border-white/10 shadow-2xl p-8 space-y-6">
          {/* Header icon */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                Portfolio Administration
              </div>
              <h1 className="text-xl font-extrabold text-white">
                Admin Sign-In
              </h1>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Authentication is required to access the management portal. Only the verified portfolio coordinator is authorized to add, edit, or delete coursework assignments.
          </p>

          {/* Iframe Notice & Direct Launch if previewing */}
          {inIframe && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-300">
                    Iframe Preview Notice
                  </h4>
                  <p className="text-[11px] text-amber-200/80 mt-1 leading-relaxed">
                    Google OAuth redirect flows require a top-level browser tab. Open the production website directly to sign in securely:
                  </p>
                </div>
              </div>

              <a
                href={`${VERCEL_PRODUCTION_URL}#admin`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-xs flex items-center justify-center gap-2 transition-colors shadow-md shadow-emerald-500/20"
              >
                <span>Open Production Website to Sign In</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Google Sign In Action */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
              className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-md shadow-white/10 disabled:opacity-50"
            >
              {isSigningIn ? (
                <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>{isSigningIn ? 'Redirecting to Google...' : 'Sign in with Google'}</span>
            </button>

            <button
              onClick={onReturnToPortfolio}
              className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors border border-white/5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Portfolio</span>
            </button>
          </div>

          <div className="pt-2 text-center">
            <span className="text-[10px] font-mono text-slate-500">
              Protected by Provider-Level OAuth & Firestore Rules
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authenticated BUT Unauthorized State (403 Forbidden / Access Denied)
  if (!adminUser.isAdmin) {
    return (
      <div className="min-h-screen bg-[#05080c] text-white flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
        <div className="w-full max-w-lg bg-[#090d14] rounded-3xl border border-rose-500/30 shadow-2xl p-8 space-y-6 text-center">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center shadow-xl shadow-rose-500/10">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 font-mono font-bold text-xs border border-rose-500/30 mb-2">
              HTTP 403 FORBIDDEN
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Access Denied
            </h1>
            <p className="text-sm font-semibold text-rose-300/90 mt-1">
              You are not authorized to manage this portfolio.
            </p>
          </div>

          {/* User identity details */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 text-left space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between text-slate-400">
              <span>Authenticated Account:</span>
              <span className="text-white font-bold truncate max-w-[220px]">
                {adminUser.email || 'No email associated'}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Identity Provider:</span>
              <span className="text-slate-300">Google OAuth 2.0</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Verification Status:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-white/5">
              <span>Authorized Administrator:</span>
              <span className="text-amber-400 font-bold truncate max-w-[220px]">
                {ADMIN_EMAIL}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Assignments and evidence can only be created, modified, or deleted by the authorized course administrator. You may return to browse the public portfolio as a visitor.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={onReturnToPortfolio}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-500/20"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Portfolio</span>
            </button>

            <button
              onClick={handleSwitchAccount}
              className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs flex items-center justify-center gap-2 transition-colors border border-white/10"
            >
              <span>Switch Account</span>
            </button>

            <button
              onClick={handleSignOut}
              className="py-3 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-mono text-xs flex items-center justify-center gap-2 transition-colors border border-rose-500/20"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Authenticated & Verified Admin State (Full Management Console)
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

  return (
    <div className="min-h-screen bg-[#05080c] text-white flex flex-col font-sans">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-[#070b10]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/15">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                  Admin Management Portal
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/30">
                  VERIFIED ADMIN
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                {adminUser.email} • Realtime Cloud Firestore
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={() => {
                setCurrentEditing(null);
                setIsFormOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>+ ADD ASSIGNMENT</span>
            </button>

            <button
              onClick={onReturnToPortfolio}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-mono text-xs flex items-center gap-1.5 transition-colors border border-white/10"
              title="Return to public portfolio view"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Portfolio</span>
            </button>

            <button
              onClick={handleSignOut}
              className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-mono text-xs flex items-center gap-1.5 transition-colors border border-rose-500/20"
              title="Sign out of Admin Portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-8 space-y-6">
        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-[#090d14] border border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Total Assignments</span>
            <p className="text-2xl font-bold font-mono text-white mt-1">{assignments.length}</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#090d14] border border-white/10">
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">Publicly Published</span>
            <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">{publishedCount}</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#090d14] border border-white/10">
            <span className="text-xs font-mono text-amber-400 uppercase tracking-wider">Private Drafts</span>
            <p className="text-2xl font-bold font-mono text-amber-400 mt-1">{draftCount}</p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-4 rounded-2xl bg-[#090d14] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-colors ${
                statusFilter === 'all' ? 'bg-white text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({assignments.length})
            </button>
            <button
              onClick={() => setStatusFilter('published')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-colors ${
                statusFilter === 'published' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Published ({publishedCount})
            </button>
            <button
              onClick={() => setStatusFilter('draft')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-colors ${
                statusFilter === 'draft' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Drafts ({draftCount})
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search title, activity number..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 font-sans"
            />
          </div>
        </div>

        {/* Assignments List */}
        <div className="bg-[#090d14] rounded-2xl border border-white/10 divide-y divide-white/10 overflow-hidden shadow-xl">
          {displayedAssignments.length === 0 ? (
            <div className="p-16 text-center text-slate-500 font-mono text-xs">
              No assignments found matching the current search criteria.
            </div>
          ) : (
            displayedAssignments.map((assignment) => {
              const isDraft = assignment.isPublished === false;
              return (
                <div
                  key={assignment.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <span className="px-2.5 py-1 rounded-xl bg-white/5 text-white font-mono text-xs font-bold shrink-0 border border-white/10">
                      {assignment.activityCode || `ACT ${assignment.activityNumber}`}
                    </span>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-sm text-white tracking-tight">
                          {assignment.title}
                        </h4>
                        {isDraft ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            DRAFT
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            PUBLISHED
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mt-1">
                        <span>{assignment.type}</span>
                        <span>•</span>
                        <span>Week {assignment.weekNumber}</span>
                        <span>•</span>
                        <span>{assignment.submissionDate}</span>
                        <span>•</span>
                        <span>{assignment.evidenceItems?.length || 1} Evidence File(s)</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onViewAssignment(assignment)}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors border border-white/5"
                      title="View on site"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                      <span>View</span>
                    </button>

                    <button
                      onClick={() => handleTogglePublish(assignment)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-colors ${
                        isDraft
                          ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30'
                      }`}
                      title={isDraft ? 'Publish Activity' : 'Unpublish Activity'}
                    >
                      {isDraft ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span>{isDraft ? 'Publish' : 'Unpublish'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setCurrentEditing(assignment);
                        setIsFormOpen(true);
                      }}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors border border-white/5"
                      title="Edit activity details"
                    >
                      <Edit3 className="w-4 h-4 text-emerald-400" />
                    </button>

                    <button
                      onClick={() => handleDelete(assignment)}
                      disabled={deletingId === assignment.id}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors border border-rose-500/20 disabled:opacity-50"
                      title="Permanently delete activity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Assignment Create / Edit Modal */}
      <ActivityFormModal
        isOpen={isFormOpen}
        editingActivity={currentEditing}
        adminUser={adminUser}
        onClose={() => {
          setIsFormOpen(false);
          setCurrentEditing(null);
        }}
        onSuccess={() => {
          setIsFormOpen(false);
          setCurrentEditing(null);
        }}
      />
    </div>
  );
};
