import React from 'react';
import { motion } from 'motion/react';
import { 
  Layers, 
  Cpu, 
  FileText, 
  Code, 
  Sparkles 
} from 'lucide-react';

interface FocusArea {
  id: string;
  title: string;
  badge: string;
  description: string;
  focusPoints: string[];
  tags: string[];
  icon: React.ReactNode;
}

export const TechStackSection: React.FC = () => {
  const focusAreas: FocusArea[] = [
    {
      id: 'system-architecture',
      title: 'SYSTEM ARCHITECTURE',
      badge: 'Architecture',
      icon: <Layers className="w-5 h-5" />,
      description:
        'Designing structured, scalable systems that connect frontend, backend, data, APIs, and deployment into a clear and maintainable architecture.',
      focusPoints: [
        'System design',
        'Architecture planning',
        'Component structure',
        'API/data flow',
        'Scalable implementation',
      ],
      tags: ['Architecture', 'APIs', 'Data Flow', 'Component Design', 'Express'],
    },
    {
      id: 'ai-optimization',
      title: 'AI OPTIMIZATION',
      badge: 'Intelligence',
      icon: <Cpu className="w-5 h-5" />,
      description:
        'Applying AI where it provides practical value, while optimizing models, workflows, prompts, and data pipelines for efficient and purposeful solutions.',
      focusPoints: [
        'AI-assisted development',
        'Model/workflow optimization',
        'Prompt engineering',
        'Data-driven solutions',
        'Practical AI integration',
      ],
      tags: ['AI', 'Prompt Engineering', 'Optimization', 'Google GenAI', 'Data Pipelines'],
    },
    {
      id: 'technical-documentation',
      title: 'TECHNICAL DOCUMENTATION',
      badge: 'Documentation',
      icon: <FileText className="w-5 h-5" />,
      description:
        'Turning complex technical work into clear documentation that explains architecture, implementation, workflows, decisions, and system behavior.',
      focusPoints: [
        'Technical documentation',
        'System diagrams',
        'Implementation documentation',
        'API/workflow documentation',
        'Clear technical communication',
      ],
      tags: ['Documentation', 'System Design', 'Technical Writing', 'Workflow Specs'],
    },
    {
      id: 'web-development',
      title: 'WEB DEVELOPMENT',
      badge: 'Engineering',
      icon: <Code className="w-5 h-5" />,
      description:
        'Building responsive, accessible, and production-ready web interfaces with a focus on clean architecture, usability, performance, and maintainability.',
      focusPoints: [
        'Frontend development',
        'Responsive UI',
        'Component-based development',
        'Performance optimization',
        'Production-ready implementation',
      ],
      tags: ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'Three.js', 'Motion'],
    },
  ];

  return (
    <div className="mt-14 sm:mt-16 md:mt-20 space-y-8 sm:space-y-10">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-3"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 font-mono text-xs font-bold tracking-widest uppercase">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          <span>BUILDING • OPTIMIZING • DOCUMENTING</span>
        </div>

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight uppercase font-sans">
          TECH STACK & ENGINEERING FOCUS
        </h2>
      </motion.div>

      {/* Engineering Introduction Card */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="rounded-[24px] glass-card p-6 sm:p-8 md:p-10 border border-slate-200/80 dark:border-slate-800/80 relative overflow-hidden shadow-xl"
      >
        {/* Subtle Background Glow */}
        <div className="absolute -top-16 -right-16 w-72 h-72 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-4 text-slate-700 dark:text-slate-300 font-normal leading-relaxed text-sm sm:text-base md:text-lg">
          <p>
            I'm not a founder, a visionary, or a strategist hiding behind a title. I'm an engineer.
          </p>
          <p>
            Someone who architects, builds, and documents in equal measure, and uses that to walk projects through every stage of their lifecycle—from the first system diagram to the moment production-ready code goes live.
          </p>
          <p>
            I'm not here to chase trends or pile on unnecessary complexity. I'm here to take intricate technical challenges and translate them into optimized, sustainable digital solutions. Work that serves a clear, logical purpose, rather than just taking up space.
          </p>
        </div>
      </motion.div>

      {/* Four Engineering Focus Areas (2x2 Grid on Desktop / Tablet, 1 col on Mobile) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {focusAreas.map((area, idx) => (
          <motion.div
            key={area.id}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 + idx * 0.08 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="rounded-[24px] glass-card p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800/80 relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
          >
            {/* Top Row: Icon + Badge */}
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 shrink-0">
                  {area.icon}
                </div>
                <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60 font-mono">
                  {area.badge}
                </span>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight uppercase group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {area.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal mt-2">
                  {area.description}
                </p>
              </div>

              {/* Focus Points List */}
              <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/60">
                <span className="text-[11px] font-mono font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase block mb-2">
                  Key Focus Points:
                </span>
                <ul className="space-y-1.5">
                  {area.focusPoints.map((point) => (
                    <li
                      key={point}
                      className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 font-mono"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bottom Row: Technology Tags */}
            <div className="pt-4 mt-6 border-t border-slate-200/60 dark:border-slate-800/60">
              <span className="text-[10px] font-mono font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase block mb-2">
                Technologies & Tools:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {area.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 group-hover:border-emerald-500/40 transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Subtle corner blur accent */}
            <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/15 transition-all duration-300 pointer-events-none" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};
