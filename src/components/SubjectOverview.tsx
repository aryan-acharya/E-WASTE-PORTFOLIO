import React from 'react';
import { motion } from 'motion/react';
import { 
  Recycle, 
  AlertTriangle, 
  Target, 
  BookOpen, 
  CheckCircle2, 
  Leaf, 
  Globe, 
  Cpu, 
  ShieldAlert, 
  Factory, 
  Scale, 
  RefreshCw, 
  Server, 
  GraduationCap, 
  Layers, 
  Zap, 
  ArrowRight,
  TrendingUp,
  Flame,
  Award
} from 'lucide-react';
import { SubjectName } from '../types';

interface SubjectOverviewProps {
  onSelectSubject?: (subjectName: SubjectName) => void;
  getAssignmentCountForSubject?: (subjectName: SubjectName) => number;
}

export const SubjectOverview: React.FC<SubjectOverviewProps> = () => {
  const objectives = [
    { text: 'Responsible disposal', icon: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> },
    { text: 'Recycling valuable materials', icon: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> },
    { text: 'Reducing landfill waste', icon: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> },
    { text: 'Protecting human health', icon: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> },
    { text: 'Promoting sustainable technology', icon: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> },
  ];

  const keyTopics = [
    { title: 'Introduction to E-Waste', desc: 'Understanding electronic waste definitions, categories, and historical growth trends.', icon: <BookOpen className="w-5 h-5 text-emerald-500" /> },
    { title: 'Sources of Electronic Waste', desc: 'Identifying household appliances, IT hardware, telecom gear, and consumer devices.', icon: <Cpu className="w-5 h-5 text-emerald-500" /> },
    { title: 'Environmental Impact', desc: 'Analyzing soil degradation, water contamination, and bioaccumulation from toxic leachates.', icon: <Globe className="w-5 h-5 text-emerald-500" /> },
    { title: 'Health Hazards', desc: 'Studying biological toxicity from lead, mercury, cadmium, and flame retardants.', icon: <ShieldAlert className="w-5 h-5 text-emerald-500" /> },
    { title: 'E-Waste Management Techniques', desc: 'Implementing formal collection networks, safe storage, and segregation protocols.', icon: <Recycle className="w-5 h-5 text-emerald-500" /> },
    { title: 'Recycling Process', desc: 'Mastering mechanical shredding, hydrometallurgical leaching, and urban mining.', icon: <Factory className="w-5 h-5 text-emerald-500" /> },
    { title: 'Government Rules & Regulations', desc: 'Navigating E-Waste Management Rules 2022, PRO guidelines, and EPR compliance.', icon: <Scale className="w-5 h-5 text-emerald-500" /> },
    { title: 'Circular Economy', desc: 'Designing closed-loop product lifecycles, modular hardware, and Design for Disassembly.', icon: <RefreshCw className="w-5 h-5 text-emerald-500" /> },
    { title: 'Green Computing', desc: 'Optimizing data center PUE metrics, energy-efficient chips, and carbon footprints.', icon: <Server className="w-5 h-5 text-emerald-500" /> },
    { title: 'Sustainable Development', desc: 'Aligning e-waste reduction with UN Sustainable Development Goals (SDGs 11, 12 & 13).', icon: <Leaf className="w-5 h-5 text-emerald-500" /> },
  ];

  const learningOutcomes = [
    {
      title: 'Hazardous Waste & Risk Assessment',
      desc: 'Skillfully audit toxicity pathways, heavy metal leachates, and occupational hazards in informal and formal e-waste processing.',
      icon: <AlertTriangle className="w-6 h-6 text-emerald-500" />,
      badge: 'Analytical Skill'
    },
    {
      title: 'Circular Tech & Design for Disassembly',
      desc: 'Apply modular engineering and cradle-to-cradle principles to extend electronic hardware lifespans.',
      icon: <RefreshCw className="w-6 h-6 text-teal-500" />,
      badge: 'Engineering Principle'
    },
    {
      title: 'Hydrometallurgy & Urban Mining',
      desc: 'Understand chemical and mechanical recovery processes to extract high-purity gold, silver, copper, and rare earth metals.',
      icon: <Zap className="w-6 h-6 text-emerald-400" />,
      badge: 'Material Science'
    },
    {
      title: 'Regulatory & EPR Compliance Auditing',
      desc: 'Formulate policy frameworks adhering to Government E-Waste Rules 2022 and Extended Producer Responsibility (EPR).',
      icon: <Scale className="w-6 h-6 text-emerald-500" />,
      badge: 'Policy & Legal'
    },
    {
      title: 'Green Computing & Carbon Optimization',
      desc: 'Design energy-efficient cloud software architectures, server cooling, and sustainable IT infrastructures.',
      icon: <Server className="w-6 h-6 text-teal-400" />,
      badge: 'Sustainability Science'
    }
  ];

  return (
    <section id="subjects-section" className="py-16 md:py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        
        {/* Section 1 & 2 Grid: What is E-Waste? + Why is it Important? */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Card 1: What is E-Waste? */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-[24px] glass-card p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800/80 relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <Recycle className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Core Definition</span>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">What is E-Waste?</h3>
                </div>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                Electronic waste (E-Waste) refers to discarded, obsolete, or non-functional electrical and electronic devices, including computers, smartphones, circuit boards, televisions, batteries, and home appliances. As consumer electronics lifecycles shorten, e-waste has become the fastest-growing solid waste stream globally. While e-waste contains valuable metals like gold, copper, and silver, it simultaneously harbors hazardous toxins like lead, cadmium, and mercury that require specialized handling.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" /> Global Growth: +5% Annually
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200">
                Course Module 1
              </span>
            </div>
          </motion.div>

          {/* Card 2: Why is E-Waste Management Important? */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-[24px] glass-card p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800/80 relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3.5 rounded-2xl bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">Global Significance</span>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Why is Management Important?</h3>
                </div>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                Irresponsible e-waste disposal leads to severe environmental degradation, soil contamination, toxic heavy metal leaching into groundwater, and atmospheric pollution caused by open-air burning. Prolonged human exposure to toxic compounds causes severe respiratory, neurological, and kidney disorders. Proper management protects public health, prevents toxic pollution, recovers finite precious materials, conserves virgin natural resources, and mitigates climate change through sustainable circular technology frameworks.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs font-mono font-semibold text-teal-600 dark:text-teal-400">
              <span className="flex items-center gap-1.5">
                <Flame className="w-4 h-4" /> Toxic Risk Mitigation
              </span>
              <span className="px-2.5 py-1 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-200">
                Course Module 2
              </span>
            </div>
          </motion.div>

        </div>

        {/* Section 3: Objectives Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-[24px] glass-card p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800/80 shadow-lg relative overflow-hidden"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3.5 rounded-2xl bg-emerald-500 text-white shadow-md shadow-emerald-500/20">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Strategic Goals</span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Subject Objectives</h3>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md font-medium">
              Core academic goals designed to establish sustainable technical capabilities and environmental ethics.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {objectives.map((obj, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.03 }}
                className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/60 flex items-start gap-3 shadow-sm hover:border-emerald-500/40 transition-all"
              >
                {obj.icon}
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug">
                  {obj.text}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Section 4: Key Topics Covered (10 Cards Grid) */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Syllabus Breakdown</span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Key Topics Covered</h3>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800">
              10 Core Modules
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {keyTopics.map((topic, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}
                whileHover={{ y: -5 }}
                className="p-4 rounded-[20px] glass-card border border-slate-200/80 dark:border-slate-800/80 hover:border-emerald-500/50 transition-all duration-200 flex flex-col justify-between group shadow-sm hover:shadow-md"
              >
                <div className="space-y-2.5">
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 w-fit group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    {topic.icon}
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-tight">
                    {topic.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    {topic.desc}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/40 dark:border-slate-800/40 flex items-center justify-between text-[10px] font-mono font-bold text-slate-400">
                  <span>Topic #{idx + 1}</span>
                  <ArrowRight className="w-3 h-3 text-emerald-500 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Section 5: Learning Outcomes */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Academic Proficiency</span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Learning Outcomes</h3>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <Award className="w-4 h-4" />
              <span>Competency Framework</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {learningOutcomes.map((outcome, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                whileHover={{ y: -6 }}
                className="rounded-[24px] glass-card p-6 border border-slate-200/80 dark:border-slate-800/80 hover:border-emerald-500/50 transition-all duration-300 flex flex-col justify-between group shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 group-hover:scale-110 transition-transform">
                      {outcome.icon}
                    </div>
                    <span className="text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {outcome.badge}
                    </span>
                  </div>

                  <h4 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors tracking-tight">
                    {outcome.title}
                  </h4>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {outcome.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified Outcome
                  </span>
                  <span>Outcome #{idx + 1}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

