import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Filter, 
  BookOpen, 
  Calendar, 
  Download, 
  Eye, 
  X, 
  ArrowUpDown, 
  FileQuestion,
  ChevronRight,
  ChevronLeft,
  FileText,
  Microscope,
  Activity,
  Presentation,
  Wrench,
  Recycle,
  PlusCircle,
  Edit2,
  Trash2,
  Lock,
  Lightbulb,
  Leaf,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Assignment, SortOption, AssignmentCategory } from '../types';
import { AddAssignmentModal } from './AddAssignmentModal';
import { EditAssignmentModal } from './EditAssignmentModal';

interface AssignmentsViewProps {
  assignments: Assignment[];
  isAdmin: boolean;
  onAddAssignment: (assignment: Assignment) => Promise<void>;
  onUpdateAssignment: (assignment: Assignment) => Promise<void>;
  onDeleteAssignment: (id: string, pdfUrl?: string) => Promise<void>;
  onViewPdf: (assignment: Assignment) => void;
  onOpenAdminAuth: () => void;
  searchQueryProp?: string;
}

const ITEMS_PER_PAGE = 9;

export const AssignmentsView: React.FC<AssignmentsViewProps> = ({
  assignments,
  isAdmin,
  onAddAssignment,
  onUpdateAssignment,
  onDeleteAssignment,
  onViewPdf,
  onOpenAdminAuth,
  searchQueryProp = ''
}) => {
  const [searchQuery, setSearchQuery] = useState(searchQueryProp);
  const [selectedCategory, setSelectedCategory] = useState<AssignmentCategory | 'All'>('All');
  const [sortOption, setSortOption] = useState<SortOption>('week-asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  // Sync external search query
  useEffect(() => {
    if (searchQueryProp !== undefined) {
      setSearchQuery(searchQueryProp);
    }
  }, [searchQueryProp]);

  // Reset page on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, sortOption]);

  const categoryOptions: { id: AssignmentCategory | 'All'; label: string; icon: React.ReactNode }[] = [
    { id: 'All', label: 'All Items', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'Activities', label: 'Activities', icon: <Activity className="w-3.5 h-3.5" /> },
    { id: 'Practicals', label: 'Practicals', icon: <Wrench className="w-3.5 h-3.5" /> },
    { id: 'Research', label: 'Research', icon: <Microscope className="w-3.5 h-3.5" /> },
    { id: 'Reports', label: 'Reports', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'Presentations', label: 'Presentations', icon: <Presentation className="w-3.5 h-3.5" /> },
  ];

  const getAssignmentCategory = (assignment: Assignment): AssignmentCategory => {
    if (assignment.category) return assignment.category;
    switch (assignment.type) {
      case 'Report': return 'Reports';
      case 'Research': return 'Research';
      case 'Activity': return 'Activities';
      case 'Presentation': return 'Presentations';
      case 'Practical': return 'Practicals';
      default: return 'Activities';
    }
  };

  // Filter & sort
  const filteredAssignments = useMemo(() => {
    return assignments.filter((item) => {
      const itemCategory = getAssignmentCategory(item);
      if (selectedCategory !== 'All' && itemCategory !== selectedCategory) {
        return false;
      }

      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesSubject = item.subject.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesWeek = `week ${item.weekNumber}`.includes(query) || `activity ${item.activityNumber}`.includes(query);
        const matchesLearned = item.whatILearned?.toLowerCase().includes(query) || false;
        const matchesSustainability = item.sustainabilityConnection?.toLowerCase().includes(query) || false;
        const matchesReflection = item.reflection?.toLowerCase().includes(query) || false;

        if (!matchesTitle && !matchesSubject && !matchesDesc && !matchesWeek && !matchesLearned && !matchesSustainability && !matchesReflection) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortOption === 'week-asc') {
        const numA = a.activityNumber || a.weekNumber || 0;
        const numB = b.activityNumber || b.weekNumber || 0;
        return numA - numB;
      }
      if (sortOption === 'week-desc') {
        const numA = a.activityNumber || a.weekNumber || 0;
        const numB = b.activityNumber || b.weekNumber || 0;
        return numB - numA;
      }
      if (sortOption === 'latest') {
        return new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime();
      }
      if (sortOption === 'oldest') {
        return new Date(a.submissionDate).getTime() - new Date(b.submissionDate).getTime();
      }
      if (sortOption === 'title-asc') {
        return a.title.localeCompare(b.title);
      }
      if (sortOption === 'title-desc') {
        return b.title.localeCompare(a.title);
      }
      return 0;
    });
  }, [assignments, selectedCategory, searchQuery, sortOption]);

  const totalPages = Math.ceil(filteredAssignments.length / ITEMS_PER_PAGE);
  const paginatedAssignments = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAssignments.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAssignments, currentPage]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSortOption('week-asc');
  };

  const handleDeleteConfirm = async (id: string, pdfUrl?: string) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;
    setDeletingId(id);
    try {
      await onDeleteAssignment(id, pdfUrl);
    } catch (err: any) {
      alert(err?.message || 'Failed to delete assignment.');
    } finally {
      setDeletingId(null);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedCardId(expandedCardId === id ? null : id);
  };

  return (
    <section id="assignments-section" className="py-16 md:py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100/80 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3 font-mono">
              <Recycle className="w-3.5 h-3.5 text-emerald-500" />
              <span>Coursework & Activities Portfolio</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight font-sans">
              Assignments & <span className="emerald-gradient-text">Submissions</span>
            </h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-2xl font-medium">
              Explore submitted coursework activities, reflections, sustainability connections, and embedded PDF documents.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{assignments.length}</span> Total Submissions
            </span>

            {/* Add Assignment Button (ADMIN ONLY) */}
            {isAdmin ? (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/25 flex items-center gap-2 transition-transform transform active:scale-95 cursor-pointer font-mono"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Assignment</span>
              </button>
            ) : (
              <button
                onClick={onOpenAdminAuth}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-2 border border-slate-200 dark:border-slate-700 transition-colors"
                title="Admin Authentication"
              >
                <Lock className="w-3.5 h-3.5 text-emerald-500" />
                <span>Admin Login</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="p-4 rounded-2xl glass-panel border border-slate-200/80 dark:border-slate-800/80 mb-6 shadow-sm space-y-4">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider shrink-0 pr-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-emerald-500" /> Filter:
            </span>
            {categoryOptions.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all duration-200 shrink-0 ${
                    isSelected
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/25'
                      : 'bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700/60'
                  }`}
                >
                  {cat.icon}
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Bar & Sort Dropdown */}
          <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col md:flex-row items-center gap-3">
            
            {/* Search Input Bar */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search assignments by title, week, learnings, reflection..."
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-medium border border-slate-200 dark:border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort By Select */}
            <div className="relative w-full md:w-56">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer appearance-none font-mono"
              >
                <option value="week-asc">Activity/Week (Low → High)</option>
                <option value="week-desc">Activity/Week (High → Low)</option>
                <option value="latest">Latest Submission</option>
                <option value="oldest">Oldest Submission</option>
                <option value="title-asc">Title (A → Z)</option>
              </select>
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 pointer-events-none" />
            </div>

          </div>
        </div>

        {/* Empty State when assignments list is 0 */}
        {assignments.length === 0 ? (
          <div className="p-12 text-center rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800/80 max-w-2xl mx-auto space-y-6 shadow-xl my-8">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800 shadow-lg shadow-emerald-500/10">
              <BookOpen className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                No Assignments Added Yet
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                Assignments added by the portfolio author will appear here automatically for all visitors.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 flex-wrap pt-2">
              {isAdmin ? (
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/25 flex items-center gap-2 transform hover:-translate-y-0.5 transition-all font-mono"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add First Assignment</span>
                </button>
              ) : (
                <button
                  onClick={onOpenAdminAuth}
                  className="px-6 py-3 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 transition-all font-mono"
                >
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>Admin Sign In</span>
                </button>
              )}
            </div>
          </div>
        ) : paginatedAssignments.length > 0 ? (
          <>
            {/* Assignments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedAssignments.map((assignment, index) => {
                const activityCodeDisplay = assignment.activityCode || (assignment.activityNumber ? `ACTIVITY ${String(assignment.activityNumber).padStart(2, '0')}` : `WEEK ${String(assignment.weekNumber).padStart(2, '0')}`);
                const isExpanded = expandedCardId === assignment.id;
                const hasLearnings = Boolean(assignment.whatILearned || assignment.sustainabilityConnection || assignment.reflection);

                return (
                  <motion.div
                    key={assignment.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: index * 0.03 }}
                    className="rounded-3xl glass-card p-6 flex flex-col justify-between border border-slate-200/80 dark:border-slate-800/80 hover:border-emerald-500/50 transition-all group shadow-sm hover:shadow-xl relative"
                  >
                    <div className="space-y-3.5">
                      {/* Card Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                          [{activityCodeDisplay}]
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-[10px] font-mono font-bold uppercase border border-slate-200 dark:border-slate-800">
                          {assignment.type}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors uppercase tracking-tight line-clamp-2">
                        {assignment.title}
                      </h3>

                      {/* Description */}
                      {assignment.description && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                          {assignment.description}
                        </p>
                      )}

                      {/* Academic Questions Box (What I Learned / Sustainability / Reflection) */}
                      {hasLearnings && (
                        <div className="space-y-2.5 pt-2">
                          {assignment.whatILearned && (
                            <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-xs">
                              <div className="flex items-center gap-1.5 font-mono font-bold text-[11px] text-amber-800 dark:text-amber-300 mb-1 uppercase">
                                <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                <span>What I Learned</span>
                              </div>
                              <p className={`text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed ${!isExpanded ? 'line-clamp-2' : ''}`}>
                                {assignment.whatILearned}
                              </p>
                            </div>
                          )}

                          {assignment.sustainabilityConnection && (
                            <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 text-xs">
                              <div className="flex items-center gap-1.5 font-mono font-bold text-[11px] text-emerald-800 dark:text-emerald-300 mb-1 uppercase">
                                <Leaf className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                <span>Sustainability Connection</span>
                              </div>
                              <p className={`text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed ${!isExpanded ? 'line-clamp-2' : ''}`}>
                                {assignment.sustainabilityConnection}
                              </p>
                            </div>
                          )}

                          {assignment.reflection && (
                            <div className="p-3 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-900/40 text-xs">
                              <div className="flex items-center gap-1.5 font-mono font-bold text-[11px] text-purple-800 dark:text-purple-300 mb-1 uppercase">
                                <Sparkles className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                                <span>Reflection</span>
                              </div>
                              <p className={`text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed ${!isExpanded ? 'line-clamp-2' : ''}`}>
                                {assignment.reflection}
                              </p>
                            </div>
                          )}

                          {/* Toggle Expand Details */}
                          <button
                            onClick={() => toggleExpand(assignment.id)}
                            className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 flex items-center gap-1 pt-0.5 transition-colors"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp className="w-3 h-3" />
                                <span>Show Less</span>
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-3 h-3" />
                                <span>Read Full Learnings & Reflection</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Card Footer Actions */}
                    <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-slate-800/60 space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-emerald-500" />
                          {assignment.submissionDate}
                        </span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase text-[10px]">
                          {assignment.status || 'Evaluated'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onViewPdf(assignment)}
                          className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-600/20"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View PDF</span>
                        </button>

                        <a
                          href={assignment.pdfUrl}
                          download
                          title="Download PDF"
                          className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>

                        {/* Admin-only controls */}
                        {isAdmin && (
                          <div className="flex items-center gap-1 pl-1 border-l border-slate-200 dark:border-slate-800">
                            <button
                              onClick={() => setEditingAssignment(assignment)}
                              className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
                              title="Edit Assignment"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteConfirm(assignment.id, assignment.pdfUrl)}
                              disabled={deletingId === assignment.id}
                              className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 transition-colors disabled:opacity-50"
                              title="Delete Assignment"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-6">
                <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  Page <span className="font-bold text-slate-900 dark:text-white">{currentPage}</span> of{' '}
                  <span className="font-bold text-slate-900 dark:text-white">{totalPages}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-8 h-8 rounded-xl text-xs font-mono font-bold transition-all ${
                        currentPage === i + 1
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Empty Search Filter Result */
          <div className="p-12 text-center rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800/80 max-w-md mx-auto space-y-4 my-8">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-100/80 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FileQuestion className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
              No Matching Assignments
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              We couldn't find any assignments matching "{searchQuery}".
            </p>
            <button
              onClick={handleResetFilters}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all font-mono"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Add Assignment Modal (Admin only) */}
        {isAdmin && (
          <AddAssignmentModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onAddAssignment={onAddAssignment}
          />
        )}

        {/* Edit Assignment Modal (Admin only) */}
        {isAdmin && (
          <EditAssignmentModal
            assignment={editingAssignment}
            isOpen={editingAssignment !== null}
            onClose={() => setEditingAssignment(null)}
            onUpdateAssignment={onUpdateAssignment}
          />
        )}

      </div>
    </section>
  );
};
