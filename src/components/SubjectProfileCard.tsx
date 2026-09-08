import React from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, 
  Layers, 
  GraduationCap, 
  Calendar, 
  Hash, 
  CheckCircle2, 
  Clock, 
  ChevronDown,
  Award,
  BookCheck,
  Building2,
  Recycle,
  Leaf,
  ShieldCheck,
  Globe2
} from 'lucide-react';
import { PROFILE_DATA } from '../lib/data/profile';
import { NavSection } from '../types';
import { StatsCounter } from './StatsCounter';

interface SubjectProfileCardProps {
  onNavigate: (section: NavSection) => void;
  totalAssignmentsCount: number;
  totalSubjectsCount: number;
  totalCredits: number;
}

export const SubjectProfileCard: React.FC<SubjectProfileCardProps> = ({
  onNavigate,
  totalAssignmentsCount,
  totalCredits
}) => {
  const profileItems = [
    { label: 'Roll Number', value: PROFILE_DATA.rollNumber, icon: <Hash className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> },
    { label: 'Degree Program', value: PROFILE_DATA.degree, icon: <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> },
    { label: 'Department', value: 'IT & Environmental Engineering', icon: <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> },
    { label: 'Course Code & Term', value: `EVM501 • Sem ${PROFILE_DATA.semester}`, icon: <BookCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> },
    { label: 'Academic Year', value: PROFILE_DATA.academicYear, icon: <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> },
  ];

  return (
    <section className="relative pt-4 pb-16 md:pt-6 md:pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Primary Glassmorphism Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="rounded-[24px] glass-card p-6 sm:p-8 md:p-10 border border-slate-200/80 dark:border-slate-800/80 relative overflow-hidden shadow-2xl"
        >
          {/* Subtle Background Glow Inside Card */}
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Avatar & Main Profile Details */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                {/* Avatar with Emerald Pulse */}
                <div className="relative group">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-700 text-white flex items-center justify-center font-black text-2xl sm:text-3xl shadow-xl shadow-emerald-500/25 border-2 border-white dark:border-slate-800 transform group-hover:scale-105 transition-transform duration-300">
                    <Leaf className="w-10 h-10 text-white" />
                  </div>
                  {/* Status Indicator */}
                  <span className="absolute -bottom-1 -right-1 flex h-5 w-5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-5 w-5 bg-emerald-500 border-2 border-white dark:border-slate-800 items-center justify-center">
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </span>
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      {PROFILE_DATA.name}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      Verified Author
                    </span>
                  </div>
                  <p className="text-sm sm:text-base font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                    {PROFILE_DATA.degree} • {PROFILE_DATA.branch}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Roll No: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{PROFILE_DATA.rollNumber}</span>
                  </p>
                </div>
              </div>

              {/* Tagline Callout */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60">
                <p className="text-sm italic font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                  "{PROFILE_DATA.tagline}"
                </p>
              </div>

              {/* Welcome Description */}
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {PROFILE_DATA.description}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onNavigate('assignments')}
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 flex items-center gap-2 transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Browse E-Waste Assignments</span>
                  <span className="ml-1 px-2 py-0.5 rounded-full bg-white/20 text-xs font-bold">
                    {totalAssignmentsCount}
                  </span>
                </button>

                <button
                  onClick={() => onNavigate('overview')}
                  className="px-6 py-3.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-sm border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-2 transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Subject Overview</span>
                </button>
              </div>
            </div>

            {/* Right Column: Key Student Metadata Cards Grid (Subject Information) */}
            <div className="lg:col-span-5 bg-slate-50/80 dark:bg-slate-900/80 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 px-1 flex items-center justify-between">
                <span>Subject Information</span>
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
              </h3>

              <div className="space-y-2.5">
                {profileItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/60 dark:border-slate-700/60 hover:border-emerald-500/30 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/80">
                        {item.icon}
                      </div>
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {item.label}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1 border-t border-slate-200/60 dark:border-slate-800/60">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-500" />
                  Academic Session: 2026–27
                </span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Globe2 className="w-3.5 h-3.5" />
                  Eco Compliance Certified
                </span>
              </div>
            </div>

          </div>
        </motion.div>

        {/* Animated Quick Stats Counter Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <StatsCounter
            value={totalAssignmentsCount}
            label="Total Submissions"
            sublabel="Reports, Research & Practicals"
            icon={<BookOpen className="w-5 h-5" />}
            highlight={true}
          />

          <StatsCounter
            value={5}
            label="Module Categories"
            sublabel="Reports, Research, Practicals & More"
            icon={<Layers className="w-5 h-5" />}
          />

          <StatsCounter
            value={totalCredits}
            label="Academic Credits"
            sublabel="Course Credit Weight"
            icon={<Award className="w-5 h-5" />}
          />

          <StatsCounter
            value={100}
            suffix="%"
            label="E-Waste Focus"
            sublabel="Sustainable Technology Standard"
            icon={<Recycle className="w-5 h-5" />}
          />
        </motion.div>

        {/* Animated Scroll Down Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="flex justify-center mt-12"
        >
          <button
            onClick={() => onNavigate('overview')}
            aria-label="Scroll to subject overview"
            className="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors focus:outline-none"
          >
            <span className="text-xs font-bold tracking-widest uppercase">Explore Subject Overview</span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="p-2 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700"
            >
              <ChevronDown className="w-4 h-4 text-emerald-500" />
            </motion.div>
          </button>
        </motion.div>

      </div>
    </section>
  );
};
