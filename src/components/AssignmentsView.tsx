import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Search, 
  Filter, 
  BookOpen, 
  Calendar, 
  Download, 
  Eye, 
  X, 
  Sparkles, 
  CheckCircle2, 
  Tag, 
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
  RefreshCw,
  Edit2,
  Trash2,
  Lock,
  ShieldCheck,
  FileUp,
  LayoutGrid,
  ListOrdered,
  ExternalLink,
  Award,
  ArrowRight
} from 'lucide-react';
import { Assignment, SortOption, AssignmentCategory } from '../types';
import { AddAssignmentModal } from './AddAssignmentModal';
import { EditAssignmentModal } from './EditAssignmentModal';
import { ActivityDetailModal } from './ActivityDetailModal';

interface AssignmentsViewProps {
  assignments: Assignment[];
  isAdmin: boolean;
  onAddAssignment: (assignment: Assignment) => Promise<void>;
  onUpdateAssignment: (assignment: Assignment) => Promise<void>;
  onDeleteAssignment: (id: string, pdfUrl?: string) => Promise<void>;
  onLoadSampleData?: () => void;
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
  onLoadSampleData,
  onViewPdf,
  onOpenAdminAuth,
  searchQueryProp = ''
}) => {
  const [searchQuery, setSearchQuery] = useState(searchQueryProp);
  const [selectedCategory, setSelectedCategory] = useState<AssignmentCategory | 'All'>('All');
  const [sortOption, setSortOption] = useState<SortOption>('week-asc');
  const [viewLayout, setViewLayout] = useState<'curriculum' | 'grid'>('curriculum');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [selectedActivityForDetail, setSelectedActivityForDetail] = useState<Assignment | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Sync external search query if prop changes
  useEffect(() => {
    if (searchQueryProp !== undefined) {
      setSearchQuery(searchQueryProp);
    }
  }, [searchQueryProp]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, sortOption, viewLayout]);

  const categoryOptions: { id: AssignmentCategory | 'All'; label: string; icon: React.ReactNode }[] = [
    { id: 'All', label: 'All 11 Activities', icon: <ListOrdered className="w-3.5 h-3.5" /> },
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

  // Filtering and Sorting Logic
  const filteredAssignments = useMemo(() => {
    return assignments.filter((item) => {
      const itemCategory = getAssignmentCategory(item);
      // Category filter
      if (selectedCategory !== 'All' && itemCategory !== selectedCategory) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesSubject = item.subject.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesCode = item.activityCode ? item.activityCode.toLowerCase().includes(query) : false;
        const matchesTag = item.tagPill ? item.tagPill.toLowerCase().includes(query) : false;
        const matchesWeek = `week ${item.weekNumber}`.includes(query) || `activity ${item.activityNumber}`.includes(query);
        const matchesTopics = item.topics.some((t) => t.toLowerCase().includes(query));
        const matchesCategory = itemCategory.toLowerCase().includes(query);

        if (!matchesTitle && !matchesSubject && !matchesDesc && !matchesCode && !matchesTag && !matchesWeek && !matchesTopics && !matchesCategory) {
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

  // Pagination Math
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
    setDeletingId(id);
    try {
      await onDeleteAssignment(id, pdfUrl);
    } catch (err: any) {
      alert(err?.message || 'Failed to delete assignment.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section id="assignments-section" className="py-16 md:py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100/80 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3 font-mono">
              <Recycle className="w-3.5 h-3.5 text-emerald-500" />
              <span>11 Activities Curriculum Portfolio</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight font-sans">
              Coursework & <span className="emerald-gradient-text">Activities</span>
            </h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-2xl font-medium">
              Complete semester portfolio featuring the 11 practical activities, research papers, teardowns, lifecycle analyses, and institutional e-waste audits.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* View switcher */}
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewLayout('curriculum')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  viewLayout === 'curriculum'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Curriculum List View"
              >
                <ListOrdered className="w-3.5 h-3.5" />
                <span>Activities</span>
              </button>
              <button
                onClick={() => setViewLayout('grid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  viewLayout === 'grid'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Grid Cards View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Cards</span>
              </button>
            </div>

            <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{assignments.length}</span> Total Activities
            </span>

            {/* Admin Add Assignment Button */}
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
                title="Admin Authentication Portal"
              >
                <Lock className="w-3.5 h-3.5 text-emerald-500" />
                <span>Admin Portal</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Pills Header Toolbar */}
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
                placeholder="Search activities by number, title, objective, topics, or keywords..."
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
                <option value="week-asc">Activity 01 → 11</option>
                <option value="week-desc">Activity 11 → 01</option>
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
                No Activities Available
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                Click below to restore the complete 11 curriculum activities or add custom assignments.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 flex-wrap pt-2">
              {onLoadSampleData && (
                <button
                  onClick={onLoadSampleData}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/25 flex items-center gap-2 transform hover:-translate-y-0.5 transition-all font-mono"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Load 11 Coursework Activities</span>
                </button>
              )}
            </div>
          </div>
        ) : paginatedAssignments.length > 0 ? (
          <>
            {/* VIEW 1: CURRICULUM LIST VIEW (Default - High visual fidelity to user spec) */}
            {viewLayout === 'curriculum' ? (
              <div className="space-y-4">
                {paginatedAssignments.map((activity, index) => {
                  const activityCodeDisplay = activity.activityCode || (activity.activityNumber ? `ACTIVITY ${String(activity.activityNumber).padStart(2, '0')}` : `ACTIVITY ${String(index + 1).padStart(2, '0')}`);
                  const tagPillDisplay = activity.tagPill || activity.type.toUpperCase();

                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: index * 0.04 }}
                      className="rounded-2xl bg-white dark:bg-[#0c1017] border border-slate-200 dark:border-slate-800/90 hover:border-emerald-500/60 transition-all p-5 sm:p-6 shadow-sm hover:shadow-xl hover:shadow-emerald-950/20 group cursor-pointer"
                      onClick={() => setSelectedActivityForDetail(activity)}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        
                        {/* Left Info Column */}
                        <div className="space-y-2.5 flex-1">
                          
                          {/* Top Badges */}
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-extrabold text-xs sm:text-sm tracking-wider">
                              [{activityCodeDisplay}]
                            </span>

                            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-mono font-bold tracking-wider text-slate-700 dark:text-slate-300 uppercase">
                              {tagPillDisplay}
                            </span>

                            <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-emerald-500" />
                              {activity.submissionDate}
                            </span>

                            {activity.marksObtained && (
                              <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/60">
                                Score: {activity.marksObtained}
                              </span>
                            )}
                          </div>

                          {/* Activity Title */}
                          <h3 className="text-base sm:text-lg lg:text-xl font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors uppercase tracking-tight font-sans">
                            {activity.title}
                          </h3>

                          {/* Objective Preview */}
                          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed font-normal">
                            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase mr-1.5">
                              Objective:
                            </span>
                            {activity.objective || activity.description}
                          </p>

                          {/* Topics */}
                          {activity.topics && activity.topics.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {activity.topics.slice(0, 4).map((t, i) => (
                                <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-mono text-slate-600 dark:text-slate-400">
                                  #{t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Right Action Column */}
                        <div className="flex items-center gap-2.5 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800/80 shrink-0" onClick={(e) => e.stopPropagation()}>
                          
                          {/* Open Dedicated Activity Interface */}
                          <button
                            onClick={() => setSelectedActivityForDetail(activity)}
                            className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-emerald-500/10 hover:bg-emerald-600 dark:hover:bg-emerald-500/20 text-white dark:text-emerald-300 border border-slate-800 dark:border-emerald-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm group-hover:bg-emerald-600"
                          >
                            <span>Explore Activity</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                          </button>

                          {/* View Raw PDF */}
                          <button
                            onClick={() => onViewPdf(activity)}
                            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-colors"
                            title="View Attached PDF Document"
                          >
                            <FileText className="w-4 h-4 text-emerald-500" />
                          </button>

                          {/* Admin Edit / Delete Actions */}
                          {isAdmin && (
                            <div className="flex items-center gap-1 pl-1 border-l border-slate-200 dark:border-slate-800">
                              <button
                                onClick={() => setEditingAssignment(activity)}
                                className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 hover:bg-emerald-100 transition-colors"
                                title="Edit Activity"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteConfirm(activity.id, activity.pdfUrl)}
                                disabled={deletingId === activity.id}
                                className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/80 hover:bg-rose-100 transition-colors disabled:opacity-50"
                                title="Delete Activity"
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
            ) : (
              /* VIEW 2: GRID CARDS VIEW */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedAssignments.map((assignment, index) => {
                  const activityCodeDisplay = assignment.activityCode || (assignment.activityNumber ? `ACTIVITY ${String(assignment.activityNumber).padStart(2, '0')}` : `ACTIVITY ${String(index + 1).padStart(2, '0')}`);
                  const tagPillDisplay = assignment.tagPill || assignment.type.toUpperCase();

                  return (
                    <motion.div
                      key={assignment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: index * 0.04 }}
                      whileHover={{ y: -4 }}
                      className="rounded-3xl glass-card p-6 flex flex-col justify-between border border-slate-200/80 dark:border-slate-800/80 hover:border-emerald-500/50 transition-all group shadow-md hover:shadow-xl relative overflow-hidden cursor-pointer"
                      onClick={() => setSelectedActivityForDetail(assignment)}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                            [{activityCodeDisplay}]
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-[10px] font-mono font-bold uppercase border border-slate-200 dark:border-slate-800">
                            {tagPillDisplay}
                          </span>
                        </div>

                        <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors uppercase tracking-tight line-clamp-2">
                          {assignment.title}
                        </h3>

                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                          {assignment.objective || assignment.description}
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-slate-800/60 space-y-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
                          <span>{assignment.submissionDate}</span>
                          {assignment.marksObtained && (
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                              {assignment.marksObtained}
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setSelectedActivityForDetail(assignment)}
                            className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-600/20"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspect</span>
                          </button>

                          <button
                            onClick={() => onViewPdf(assignment)}
                            className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-mono font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700"
                          >
                            <FileText className="w-3.5 h-3.5 text-emerald-500" />
                            <span>PDF</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
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
          /* Empty Search / Filter Results State */
          <div className="p-12 text-center rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800/80 max-w-md mx-auto space-y-4 my-8">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-100/80 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FileQuestion className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
              No Matching Activities
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              We couldn't find any activities matching "{searchQuery}".
            </p>
            <button
              onClick={handleResetFilters}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all font-mono"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Detailed Activity Modal Interface (Matching User Screenshots) */}
        <ActivityDetailModal
          activity={selectedActivityForDetail}
          onClose={() => setSelectedActivityForDetail(null)}
          onViewPdf={onViewPdf}
          isAdmin={isAdmin}
          onEdit={(act) => {
            setSelectedActivityForDetail(null);
            setEditingAssignment(act);
          }}
          onDelete={(id, pdfUrl) => handleDeleteConfirm(id, pdfUrl)}
          allActivities={filteredAssignments}
          onSelectActivity={(act) => setSelectedActivityForDetail(act)}
        />

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
