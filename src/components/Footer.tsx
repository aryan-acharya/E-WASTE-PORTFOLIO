import React from 'react';
import { ChevronUp, GraduationCap, Heart, Sparkles } from 'lucide-react';
import { PROFILE_DATA } from '../lib/data/profile';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="mt-20 border-t border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-950/60 backdrop-blur-md relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Left Info */}
          <div className="flex items-center gap-3 text-center md:text-left">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-emerald-500/20 shrink-0">
              {PROFILE_DATA.initials}
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
                {PROFILE_DATA.name} • Roll No: {PROFILE_DATA.rollNumber}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {PROFILE_DATA.degree} ({PROFILE_DATA.branch}) • Semester {PROFILE_DATA.semester}
              </p>
            </div>
          </div>

          {/* Middle Copyright */}
          <div className="text-center text-xs text-slate-500 dark:text-slate-400">
            <p className="flex items-center justify-center gap-1 font-medium">
              Academic Year {PROFILE_DATA.academicYear} • E-Waste & Environmental Management
            </p>
            <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
              Specialized Digital Repository for Reports, Research Papers, Practicals & Presentations
            </p>
          </div>

          {/* Right Scroll To Top */}
          <div className="flex items-center gap-2">
            <button
              onClick={scrollToTop}
              aria-label="Scroll to top of page"
              className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-500 text-slate-700 dark:text-slate-300 transition-all duration-300 border border-slate-200/80 dark:border-slate-700/60 flex items-center gap-2 text-xs font-bold shadow-sm group"
            >
              <span>Back to top</span>
              <ChevronUp className="w-4 h-4 transform group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>

        </div>
      </div>
    </footer>
  );
};
