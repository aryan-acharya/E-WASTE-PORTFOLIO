import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface StatsCounterProps {
  value: number;
  label: string;
  sublabel?: string;
  icon: React.ReactNode;
  suffix?: string;
  highlight?: boolean;
}

export const StatsCounter: React.FC<StatsCounterProps> = ({
  value,
  label,
  sublabel,
  icon,
  suffix = '',
  highlight = false,
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1200; // ms
    const increment = value / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`p-5 rounded-2xl glass-card transition-all duration-300 relative overflow-hidden group ${
        highlight
          ? 'border-emerald-500/30 dark:border-emerald-500/40 bg-gradient-to-br from-emerald-500/5 via-slate-50 to-teal-500/5 dark:from-emerald-950/20 dark:via-slate-900/60 dark:to-teal-950/20'
          : 'hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-3 rounded-xl transition-all duration-300 ${
          highlight 
            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25 group-hover:scale-110' 
            : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white'
        }`}>
          {icon}
        </div>
        <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60">
          Sem V
        </span>
      </div>

      <div className="flex items-baseline gap-1">
        <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {count}
        </span>
        {suffix && (
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {suffix}
          </span>
        )}
      </div>

      <div className="mt-1">
        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
          {label}
        </h4>
        {sublabel && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {sublabel}
          </p>
        )}
      </div>

      {/* Background Accent Lines */}
      <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/15 transition-all duration-300 pointer-events-none" />
    </motion.div>
  );
};
