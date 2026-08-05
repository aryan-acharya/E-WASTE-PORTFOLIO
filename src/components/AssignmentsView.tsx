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
  Trash2,
  RefreshCw
} from 'lucide-react';
import { Assignment, SortOption, AssignmentCategory } from '../types';
import { AddAssignmentModal } from './AddAssignmentModal';
import { SAMPLE_ASSIGNMENTS_DATA } from '../lib/data/assignments';

interface AssignmentsViewProps {
  assignments: Assignment[];
  onAddAssignment: (assignment: Assignment) => void;
  onDeleteAssignment: (id: string) => void;
  onLoadSampleData?: () => void;
  onViewPdf: (assignment: Assignment) => void;
  searchQueryProp?: string;
}

const ITEMS_PER_PAGE = 6;

export const AssignmentsView: React.FC<AssignmentsViewProps> = ({
  assignments,
  onAddAssignment,
  onDeleteAssignment,
  onLoadSampleData,
  onViewPdf,
  searchQueryProp = ''
}) => {
  const [searchQuery, setSearchQuery] = useState(searchQueryProp);
  const [selectedCategory, setSelectedCategory] = useState<AssignmentCategory | 'All'>('All');
  const [sortOption, setSortOption] = useState<SortOption>('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Sync external search query if prop changes
  useEffect(() => {
    if (searchQueryProp !== undefined) {
      setSearchQuery(searchQueryProp);
    }
  }, [searchQueryProp]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, sortOption]);

  const categoryOptions: { id: AssignmentCategory | 'All'; label: string; icon: React.ReactNode }[] = [
    { id: 'All', label: 'All Submissions', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'Reports', label: 'Reports', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'Research', label: 'Research', icon: <Microscope className="w-3.5 h-3.5" /> },
    { id: 'Activities', label: 'Activities', icon: <Activity className="w-3.5 h-3.5" /> },
    { id: 'Presentations', label: 'Presentations', icon: <Presentation className="w-3.5 h-3.5" /> },
    { id: 'Practicals', label: 'Practicals', icon: <Wrench className="w-3.5 h-3.5" /> },
  ];

  const getAssignmentCategory = (assignment: Assignment): AssignmentCategory => {
    if (assignment.category) return assignment.category;
    switch (assignment.type) {
      case 'Report': return 'Reports';
      case 'Research': return 'Research';
      case 'Activity': return 'Activities';
      case 'Presentation': return 'Presentations';
      case 'Practical': return 'Practicals';
      default: return 'Reports';
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
        const matchesWeek = `week ${item.weekNumber}`.includes(query) || `w${item.weekNumber}` === query;
        const matchesTopics = item.topics.some((t) => t.toLowerCase().includes(query));
        const matchesCategory = itemCategory.toLowerCase().includes(query);
        const matchesType = item.type.toLowerCase().includes(query);

        if (!matchesTitle && !matchesSubject && !matchesDesc && !matchesWeek && !matchesTopics && !matchesCategory && !matchesType) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
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
      if (sortOption === 'week-asc') {
        return a.weekNumber - b.weekNumber;
      }
      if (sortOption === 'week-desc') {
        return b.weekNumber - a.weekNumber;
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
    setSortOption('latest');
  };

  return (
    <section id="assignments-section" className="py-16 md:py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100/80 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3">
              <Recycle className="w-3.5 h-3.5 text-emerald-500" />
              <span>E-Waste Coursework & Submissions</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Assignments <span className="emerald-gradient-text">& Submissions</span>
            </h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-2xl font-medium">
              Explore or manually add coursework for E-Waste & Environmental Management across Reports, Research Papers, Field Activities, Presentations, and Practicals.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{assignments.length}</span> Total Items
            </span>

            {/* Add Assignment Button */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/25 flex items-center gap-2 transition-transform transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Assignment</span>
            </button>
          </div>
        </div>

        {/* Category Pills Header Toolbar */}
        <div className="p-4 rounded-[20px] glass-panel border border-slate-200/80 dark:border-slate-800/80 mb-6 shadow-sm space-y-4">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 pr-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-emerald-500" /> Category:
            </span>
            {categoryOptions.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 shrink-0 ${
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
                placeholder="Search E-Waste assignments by title, topic, keyword, or week..."
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-medium border border-slate-200 dark:border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
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
                className="w-full pl-9 pr-8 py-3 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-sm font-semibold border border-slate-200 dark:border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer appearance-none"
              >
                <option value="latest">Sort by Latest Submission</option>
                <option value="oldest">Sort by Oldest Submission</option>
                <option value="title-asc">Title (A to Z)</option>
                <option value="week-asc">Week (Ascending)</option>
                <option value="week-desc">Week (Descending)</option>
              </select>
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 pointer-events-none" />
            </div>

          </div>
        </div>

        {/* Active Filters Indicator if any filter active */}
        {(selectedCategory !== 'All' || searchQuery !== '') && (
          <div className="mb-6 flex items-center justify-between bg-emerald-50/80 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200/60 dark:border-emerald-800/60 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-700 dark:text-slate-300">Active Filters:</span>
              {selectedCategory !== 'All' && (
                <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-semibold flex items-center gap-1">
                  Category: {selectedCategory}
                  <button onClick={() => setSelectedCategory('All')} className="hover:text-emerald-950 dark:hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="px-2.5 py-0.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold flex items-center gap-1">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="hover:text-slate-900 dark:hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>

            <button
              onClick={handleResetFilters}
              className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline shrink-0"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* Empty State when assignments list is 0 */}
        {assignments.length === 0 ? (
          <div className="p-12 text-center rounded-[28px] glass-card border border-slate-200/80 dark:border-slate-800/80 max-w-2xl mx-auto space-y-6 shadow-xl my-8">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800 shadow-lg shadow-emerald-500/10">
              <PlusCircle className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                No Assignments Added Yet
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                The assignment archive has been cleared. Click <span className="font-bold text-emerald-600 dark:text-emerald-400">"Add Assignment"</span> below to manually record your coursework submissions, field activities, research papers, and practical labs.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 flex-wrap pt-2">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/25 flex items-center gap-2 transform hover:-translate-y-0.5 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Your First Assignment</span>
              </button>

              {onLoadSampleData && (
                <button
                  onClick={onLoadSampleData}
                  className="px-5 py-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-2 border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Restore Sample Data</span>
                </button>
              )}
            </div>
          </div>
        ) : paginatedAssignments.length > 0 ? (
          <>
            {/* Assignments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedAssignments.map((assignment, index) => (
                <motion.div
                  key={assignment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ y: -6 }}
                  className="rounded-[24px] glass-card p-6 flex flex-col justify-between border border-slate-200/80 dark:border-slate-800/80 hover:border-emerald-500/50 transition-all duration-300 group shadow-md hover:shadow-xl relative overflow-hidden"
                >
                  <div className="space-y-3">
                    {/* Top Badges Row */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[11px] font-mono font-bold border border-emerald-200 dark:border-emerald-800">
                          Week {assignment.weekNumber}
                        </span>

                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 text-[11px] font-semibold border border-slate-200 dark:border-slate-700">
                          {getAssignmentCategory(assignment)}
                        </span>
                      </div>

                      {/* Status / Trash Controls */}
                      <div className="flex items-center gap-1.5">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {assignment.status}
                        </span>

                        <button
                          onClick={() => onDeleteAssignment(assignment.id)}
                          title="Delete Assignment"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Subject Tag */}
                    <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mb-1 tracking-wide uppercase flex items-center gap-1">
                      <Recycle className="w-3 h-3 text-emerald-500" />
                      {assignment.subject}
                    </p>

                    {/* Assignment Title */}
                    <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors tracking-tight line-clamp-2 leading-snug">
                      {assignment.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                      {assignment.description}
                    </p>

                    {/* Topic Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {assignment.topics.slice(0, 3).map((topic, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-400"
                        >
                          #{topic}
                        </span>
                      ))}
                      {assignment.topics.length > 3 && (
                        <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-400">
                          +{assignment.topics.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom Strip */}
                  <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-slate-800/60 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                        {assignment.submissionDate}
                      </span>
                      {assignment.marksObtained && (
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          Grade: {assignment.marksObtained}
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => onViewPdf(assignment)}
                        className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View PDF</span>
                      </button>

                      <a
                        href={assignment.pdfUrl}
                        download
                        className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Download</span>
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-6">
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Page <span className="font-bold text-slate-900 dark:text-white">{currentPage}</span> of{' '}
                  <span className="font-bold text-slate-900 dark:text-white">{totalPages}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
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
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Empty Search / Filter Results State */
          <div className="p-12 text-center rounded-[24px] glass-card border border-slate-200/80 dark:border-slate-800/80 max-w-md mx-auto space-y-4 my-8">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-100/80 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FileQuestion className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
              No Matching Assignments
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              We couldn't find any assignments matching your current category filter or search phrase "{searchQuery}".
            </p>
            <button
              onClick={handleResetFilters}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Add Assignment Modal */}
        <AddAssignmentModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAddAssignment={onAddAssignment}
        />

      </div>
    </section>
  );
};
