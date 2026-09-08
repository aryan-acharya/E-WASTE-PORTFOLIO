import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowUpRight, 
  Plus, 
  Search, 
  ShieldCheck, 
  Lock, 
  Sparkles, 
  FileText, 
  Layers, 
  Eye, 
  SlidersHorizontal,
  CheckCircle2,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { Assignment, AdminUser, AssignmentCategory } from '../../types';

interface ActivityListViewProps {
  assignments: Assignment[];
  adminUser: AdminUser | null;
  onSelectActivity: (activity: Assignment) => void;
  onOpenAddModal: () => void;
  onOpenAdminAuth: () => void;
  onOpenDashboard: () => void;
}

export const ActivityListView: React.FC<ActivityListViewProps> = ({
  assignments,
  adminUser,
  onSelectActivity,
  onOpenAddModal,
  onOpenAdminAuth,
  onOpenDashboard
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AssignmentCategory>('All');

  // Filter assignments based on search & category
  const filteredAssignments = assignments.filter((item) => {
    // Only admin can see unpublished items; public visitors see published items
    if (!adminUser?.isAdmin && item.isPublished === false) {
      return false;
    }

    const matchesCategory = 
      selectedCategory === 'All' || 
      item.category === selectedCategory || 
      item.type === selectedCategory ||
      (selectedCategory === 'Activities' && item.type === 'Activity');

    const matchesQuery = 
      searchQuery.trim() === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.activityCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(item.activityNumber).includes(searchQuery) ||
      item.shortDescription?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.objective?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesQuery;
  });

  const categories: AssignmentCategory[] = ['All', 'Activities', 'Practicals', 'Research', 'Reports'];

  return (
    <div className="w-full bg-[#05080c] text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-12 transition-colors">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Control Bar: Title, Search, Category filters, and Admin Actions */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/60">
                <Sparkles className="w-3.5 h-3.5" />
                ACADEMIC COURSEWORK • SEM V
              </span>
              {adminUser?.isAdmin && (
                <span className="inline-flex items-center gap-1 text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  ADMIN MODE
                </span>
              )}
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white font-sans">
              Coursework & Activity Index
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-2xl font-light">
              Interactive archival portfolio of research, practical engineering laboratory teardowns, and sustainable hardware analyses.
            </p>
          </div>

          {/* Admin and Search controls */}
          <div className="flex flex-wrap items-center gap-3">
            {adminUser?.isAdmin ? (
              <>
                <button
                  onClick={onOpenAddModal}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  Add Assignment
                </button>
                <button
                  onClick={onOpenDashboard}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/10 flex items-center gap-2 transition-colors"
                >
                  <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
                  Dashboard
                </button>
              </>
            ) : (
              <button
                onClick={onOpenAdminAuth}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 text-xs font-mono border border-white/10 flex items-center gap-2 transition-colors"
                title="Admin Authentication"
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                Admin Login
              </button>
            )}
          </div>
        </div>

        {/* Filter Bar & Search Input */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-b border-white/10">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Quick Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search activities..."
              className="w-full bg-white/5 border border-white/10 focus:border-emerald-500/60 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 transition-all font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* MAIN EDITORIAL ACTIVITIES LIST (Replicating Screenshot 1) */}
        <div className="w-full divide-y divide-white/10">
          {filteredAssignments.length === 0 ? (
            <div className="py-20 text-center text-slate-500 font-mono text-sm">
              No coursework matching your filters.
            </div>
          ) : (
            filteredAssignments.map((assignment, index) => {
              const actNum = assignment.activityNumber || index + 1;
              const formattedNum = String(actNum).padStart(2, '0');
              const isDraft = assignment.isPublished === false;

              return (
                <motion.div
                  key={assignment.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  onClick={() => onSelectActivity(assignment)}
                  className="group relative w-full py-8 sm:py-12 md:py-16 flex flex-col md:flex-row md:items-center justify-between cursor-pointer transition-colors duration-300 hover:bg-white/[0.02] px-2 sm:px-4 rounded-xl"
                >
                  {/* Left Column: Activity Number Label & Title */}
                  <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-8">
                    {/* Small Mono Label as shown in reference: "Activity 01" */}
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs sm:text-sm text-slate-400 group-hover:text-emerald-400 transition-colors tracking-wider font-semibold">
                        Activity {formattedNum}
                      </span>
                      {isDraft && (
                        <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          DRAFT
                        </span>
                      )}
                    </div>

                    {/* Subtitle / Description teaser */}
                    <p className="text-xs sm:text-sm text-slate-400 group-hover:text-slate-200 transition-colors max-w-xl font-normal line-clamp-1">
                      {assignment.title}
                    </p>
                  </div>

                  {/* Right Column: HUGE Editorial Typography (Screenshot 1: "ACTIVITY 1", "ACTIVITY 2"...) */}
                  <div className="flex items-center justify-between md:justify-end gap-6 mt-4 md:mt-0">
                    <h3 className="font-black text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl tracking-tighter text-white/90 group-hover:text-emerald-400 transition-all duration-300 select-none uppercase font-sans">
                      ACTIVITY {actNum}
                    </h3>

                    {/* Hover Arrow indicator */}
                    <div className="w-12 h-12 rounded-full border border-white/20 group-hover:border-emerald-400/80 group-hover:bg-emerald-400 text-white group-hover:text-slate-950 flex items-center justify-center transition-all duration-300 shrink-0">
                      <ArrowUpRight className="w-6 h-6 stroke-[2.5] transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Bottom Left Chapter Badges matching Screenshot 1 */}
        <div className="pt-16 sm:pt-24 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-t border-white/10 text-xs font-mono text-slate-500">
          <div className="flex items-center gap-6">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-1.5 text-slate-400 hover:text-emerald-400 transition-colors uppercase tracking-widest font-semibold"
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
              CHP. — ME
            </button>
            <span className="text-slate-700">•</span>
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase tracking-widest">
              <ArrowUpRight className="w-3.5 h-3.5" />
              CHP. — ACTIVITIES
            </div>
          </div>

          <div className="text-slate-500 text-[11px] font-mono">
            ARYAN ACHARYA • ROLL NO: 24101C0022 • SEMESTER V
          </div>
        </div>

      </div>
    </div>
  );
};
