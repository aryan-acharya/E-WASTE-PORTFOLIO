import React from 'react';
import { motion } from 'motion/react';
import { Recycle } from 'lucide-react';

export const HeroTitle: React.FC = () => {
  return (
    <section className="relative pt-28 pb-4 md:pt-36 md:pb-6 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Header Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/90 border border-emerald-200 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300 text-xs font-bold tracking-wide uppercase shadow-sm mb-4">
            <Recycle className="w-4 h-4 text-emerald-500 animate-spin-slow" />
            <span>Academic Portfolio • Specialization Stream</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight max-w-5xl leading-[1.1]">
            E-Waste & <span className="emerald-gradient-text">Environmental</span> Management
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-3xl font-medium leading-relaxed">
            A specialized digital archive documenting research, field activities, practical labs, and circular economy solutions for electronic waste mitigation.
          </p>
        </motion.div>

      </div>
    </section>
  );
};
