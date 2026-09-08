import React from 'react';
import { BookOpen, Sparkles, Layers } from 'lucide-react';

interface AssignmentsViewProps {
  // Keeping props clean and ready for the new implementation
}

export const AssignmentsView: React.FC<AssignmentsViewProps> = () => {
  return (
    <section id="assignments-section" className="py-16 md:py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100/80 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider font-mono">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>Coursework & Submissions</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Assignments & <span className="emerald-gradient-text">Activities</span>
          </h2>

          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base font-medium max-w-2xl mx-auto leading-relaxed">
            This section has been cleared and is ready for your new coursework structure and presentation layout.
          </p>
        </div>

        {/* Clean Minimal Canvas Ready for New Approach */}
        <div className="max-w-xl mx-auto p-12 text-center rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-5">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800/60 shadow-sm">
            <BookOpen className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Ready for Your New Approach
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
              All previous features, CRUD actions, and authentication controls have been removed. Let me know how you'd like to structure and design the new assignments section!
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center gap-2 text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
            <Layers className="w-4 h-4" />
            <span>Awaiting New Specifications</span>
          </div>
        </div>

      </div>
    </section>
  );
};
