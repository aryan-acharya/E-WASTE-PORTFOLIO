import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Download, 
  ExternalLink, 
  Calendar, 
  CheckCircle2, 
  FileText, 
  Share2, 
  Sparkles, 
  Shield, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight,
  Edit3,
  Trash2,
  Award
} from 'lucide-react';
import { Assignment } from '../types';

interface ActivityDetailModalProps {
  activity: Assignment | null;
  onClose: () => void;
  onViewPdf: (activity: Assignment) => void;
  isAdmin?: boolean;
  onEdit?: (activity: Assignment) => void;
  onDelete?: (id: string, pdfUrl?: string) => void;
  allActivities?: Assignment[];
  onSelectActivity?: (activity: Assignment) => void;
}

export const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({
  activity,
  onClose,
  onViewPdf,
  isAdmin = false,
  onEdit,
  onDelete,
  allActivities = [],
  onSelectActivity
}) => {
  const [copied, setCopied] = useState(false);

  if (!activity) return null;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: activity.title,
        text: `Check out ${activity.title} on Aryan's E-Waste Portfolio`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Find index for next / prev navigation
  const currentIndex = allActivities.findIndex(a => a.id === activity.id);
  const prevActivity = currentIndex > 0 ? allActivities[currentIndex - 1] : null;
  const nextActivity = currentIndex >= 0 && currentIndex < allActivities.length - 1 ? allActivities[currentIndex + 1] : null;

  const activityCodeDisplay = activity.activityCode || (activity.activityNumber ? `ACTIVITY ${String(activity.activityNumber).padStart(2, '0')}` : 'ACTIVITY 01');
  const tagPillDisplay = activity.tagPill || activity.type.toUpperCase();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-10">
        {/* Click outside backdrop */}
        <div 
          className="fixed inset-0" 
          onClick={onClose}
          aria-label="Close modal background"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-5xl bg-[#090b0e] text-slate-100 rounded-3xl border border-slate-800/90 shadow-2xl shadow-emerald-950/30 overflow-hidden z-10 my-auto max-h-[92vh] flex flex-col font-sans"
        >
          {/* Top Sticky Header */}
          <div className="sticky top-0 z-30 bg-[#090b0e]/95 backdrop-blur-md border-b border-slate-800/80 px-6 sm:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-mono text-emerald-400 font-bold tracking-wider text-sm sm:text-base">
                [{activityCodeDisplay}]
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono font-bold tracking-wider text-slate-300 uppercase">
                {tagPillDisplay}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Previous / Next navigation */}
              {prevActivity && onSelectActivity && (
                <button
                  onClick={() => onSelectActivity(prevActivity)}
                  className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
                  title="Previous Activity"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
              {nextActivity && onSelectActivity && (
                <button
                  onClick={() => onSelectActivity(nextActivity)}
                  className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
                  title="Next Activity"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}

              {/* PDF Viewer Action */}
              <button
                onClick={() => onViewPdf(activity)}
                className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold transition-all"
                title="View Full PDF Document"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>PDF Document</span>
              </button>

              {/* Admin Actions */}
              {isAdmin && (
                <div className="flex items-center gap-1.5 ml-1 pl-2 border-l border-slate-800">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(activity)}
                      className="p-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/80 transition-colors"
                      title="Edit Activity"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete ${activity.title}? This cannot be undone.`)) {
                          onDelete(activity.id, activity.pdfUrl);
                          onClose();
                        }
                      }}
                      className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-900/60 transition-colors"
                      title="Delete Activity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}

              {/* Share button */}
              <button
                onClick={handleShare}
                className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
                title="Share link"
              >
                <Share2 className="w-4 h-4" />
              </button>

              {/* Close button */}
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
                aria-label="Close activity dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Main Content */}
          <div className="overflow-y-auto p-6 sm:p-8 md:p-12 space-y-10 selection:bg-emerald-500 selection:text-black">
            
            {/* 1. ACTIVITY TITLE */}
            <div>
              <span className="font-mono text-xs font-bold text-slate-400 tracking-widest uppercase">
                1. ACTIVITY TITLE
              </span>
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-white uppercase tracking-tight leading-tight mt-2 font-sans">
                {activity.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-3 mt-4 text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  Submission Date: {activity.submissionDate}
                </span>
                <span className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Status: {activity.status}
                </span>
                {activity.marksObtained && (
                  <span className="flex items-center gap-1.5 bg-emerald-950/40 text-emerald-300 border border-emerald-800/80 px-3 py-1.5 rounded-lg font-bold">
                    <Award className="w-3.5 h-3.5 text-emerald-400" />
                    Evaluation: {activity.marksObtained}
                  </span>
                )}
              </div>
            </div>

            <div className="border-b border-slate-800/80 my-4" />

            {/* 02. OBJECTIVE */}
            <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-6 sm:p-8 shadow-inner">
              <h2 className="font-mono text-xs sm:text-sm font-bold text-emerald-400 tracking-widest uppercase mb-3">
                02. OBJECTIVE
              </h2>
              <p className="text-slate-200 text-base sm:text-lg leading-relaxed font-normal">
                {activity.objective || activity.description}
              </p>
            </div>

            {/* 03. EVIDENCE */}
            <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-6 sm:p-8 shadow-inner">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-mono text-xs sm:text-sm font-bold text-emerald-400 tracking-widest uppercase">
                  03. EVIDENCE
                </h2>
                <button
                  onClick={() => onViewPdf(activity)}
                  className="text-xs font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 underline underline-offset-4"
                >
                  <span>Open Raw Document</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              {/* Render Evidence Content */}
              {activity.evidenceType === 'custom_poster' || activity.id === 'activity-01' ? (
                /* Specialized Pledge Poster Canvas */
                <div className="w-full flex justify-center py-4">
                  <div className="w-full max-w-lg bg-gradient-to-b from-[#8ed6c5] via-[#a3e2d3] to-[#409b85] rounded-3xl p-6 sm:p-8 text-slate-800 shadow-2xl relative overflow-hidden border border-emerald-300/40">
                    {/* Background leafy motif aesthetic */}
                    <div className="absolute top-2 left-3 opacity-20 text-4xl select-none">🌿</div>
                    <div className="absolute top-2 right-3 opacity-20 text-4xl select-none">🍃</div>
                    <div className="absolute bottom-2 left-3 opacity-20 text-4xl select-none">🌱</div>
                    <div className="absolute bottom-2 right-3 opacity-20 text-4xl select-none">☘️</div>

                    {/* Poster Header */}
                    <div className="text-center pt-2 pb-6">
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-[#115e4a] tracking-tight uppercase leading-snug drop-shadow-sm font-sans">
                        {activity.evidencePosterData?.title || 'MY COMMITMENT TO A SUSTAINABLE FUTURE'}
                      </h3>
                    </div>

                    {/* White Pledge Sheet */}
                    <div className="bg-white/95 rounded-2xl p-6 sm:p-7 shadow-lg text-slate-700 text-center space-y-4 backdrop-blur-sm border border-emerald-100">
                      <p className="font-bold text-sm sm:text-base text-slate-800">
                        I pledge to be a responsible engineer 👩‍💻 and a conscious citizen 🌍.
                      </p>

                      <div className="space-y-2 text-xs sm:text-sm font-medium text-slate-700 text-left px-2 sm:px-4">
                        <p className="flex items-start gap-2">
                          <span>♻️</span>
                          <span>I will use technology wisely.</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <span>🌱</span>
                          <span>I will reduce waste and conserve resources.</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <span>📱</span>
                          <span>I will dispose of e-waste responsibly.</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <span>💡</span>
                          <span>I will embrace sustainable practices in my personal and professional life.</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <span>🤝</span>
                          <span>I will inspire others to protect and care for our environment.</span>
                        </p>
                      </div>

                      <p className="pt-2 font-bold text-xs sm:text-sm text-emerald-800">
                        Together, let's build a cleaner, greener, and more sustainable future! 🌍✨
                      </p>

                      {/* Student Signoff Footer */}
                      <div className="pt-4 mt-4 border-t border-slate-200 text-xs text-slate-600">
                        <div className="font-bold text-slate-800 flex items-center justify-center gap-1">
                          <span>✍️ Student Commitment</span>
                        </div>
                        <p className="mt-1 font-semibold text-slate-800">
                          Name: {activity.evidencePosterData?.studentName || 'Aryan Acharya'}
                        </p>
                        <p className="text-slate-600">
                          Roll No.: {activity.evidencePosterData?.rollNumber || '24101C0041'}
                        </p>
                        <p className="font-serif italic text-emerald-700 font-bold my-1">
                          Signature: <span className="font-cursive text-sm font-black">Aryan</span>
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Date: {activity.evidencePosterData?.date || activity.submissionDate}
                        </p>
                      </div>

                      <div className="pt-2 text-[11px] font-bold text-emerald-700">
                        💚 Think Green • Innovate Responsibly • Act Sustainably 🌿
                      </div>
                    </div>
                  </div>
                </div>
              ) : activity.evidenceUrl ? (
                /* High-Resolution Evidence Image */
                <div className="w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 flex flex-col items-center justify-center p-2">
                  <img 
                    src={activity.evidenceUrl} 
                    alt={activity.title}
                    referrerPolicy="no-referrer"
                    className="w-full max-h-[480px] object-cover rounded-xl shadow-lg"
                  />
                  <div className="w-full px-4 py-3 flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>Evidence Document Capture</span>
                    <a
                      href={activity.evidenceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <span>Full Resolution</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ) : (
                /* Fallback Evidence PDF Preview Banner */
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm sm:text-base">
                        Attached Submission Document
                      </h4>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        File Size: {activity.fileSize} • Verified Submission
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onViewPdf(activity)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                  >
                    <FileText className="w-4 h-4" />
                    <span>View in Reader</span>
                  </button>
                </div>
              )}
            </div>

            {/* 04. WHAT I LEARNED (~150 WORDS) */}
            <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-6 sm:p-8 shadow-inner">
              <h2 className="font-mono text-xs sm:text-sm font-bold text-emerald-400 tracking-widest uppercase mb-3 flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full border border-emerald-400" />
                04. WHAT I LEARNED (~150 WORDS)
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
                {activity.whatILearned || activity.description}
              </p>
            </div>

            {/* 05. SUSTAINABILITY CONNECTION */}
            <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-6 sm:p-8 shadow-inner">
              <h2 className="font-mono text-xs sm:text-sm font-bold text-emerald-400 tracking-widest uppercase mb-3">
                05. SUSTAINABILITY CONNECTION
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
                {activity.sustainabilityConnection || 
                  'This activity helps reduce e-waste by establishing strict guidelines for modular system design, hardware component recycling, and software optimization that prevents functional devices from being rendered obsolete by heavy software bloat.'}
              </p>
            </div>

            {/* 06. REFLECTION */}
            <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-6 sm:p-8 shadow-inner space-y-6">
              <h2 className="font-mono text-xs sm:text-sm font-bold text-emerald-400 tracking-widest uppercase mb-4">
                06. REFLECTION
              </h2>

              <div className="space-y-4">
                {/* WHAT SURPRISED ME? */}
                <div className="border-l-2 border-emerald-400 pl-4 py-1">
                  <span className="font-mono text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    • WHAT SURPRISED ME?
                  </span>
                  <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
                    {activity.reflection?.whatSurprisedMe || 
                      'The sheer volume of perfectly functional electronic hardware discarded globally every year simply due to unoptimized software updates and lack of documentation.'}
                  </p>
                </div>

                {/* WHAT CHALLENGE DID I FACE? */}
                <div className="border-l-2 border-emerald-400 pl-4 py-1">
                  <span className="font-mono text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    • WHAT CHALLENGE DID I FACE?
                  </span>
                  <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
                    {activity.reflection?.whatChallengeFaced || 
                      'Balancing peak computational performance requirements with low-energy, sustainable hardware utilization across modern development environments.'}
                  </p>
                </div>

                {/* WHAT WILL I DO DIFFERENTLY? */}
                <div className="border-l-2 border-emerald-400 pl-4 py-1">
                  <span className="font-mono text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    • WHAT WILL I DO DIFFERENTLY?
                  </span>
                  <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
                    {activity.reflection?.whatWillIDoDifferently || 
                      'Prioritize lightweight software architectures, advocate for repairable hardware standards, and champion technical documentation for long-term device maintenance.'}
                  </p>
                </div>
              </div>
            </div>

            {/* 07. REFERENCES */}
            <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-6 sm:p-8 shadow-inner">
              <h2 className="font-mono text-xs sm:text-sm font-bold text-emerald-400 tracking-widest uppercase mb-4">
                07. REFERENCES
              </h2>

              <ul className="space-y-2.5 font-mono text-xs sm:text-sm">
                {(activity.references && activity.references.length > 0 ? activity.references : [
                  'UNEP Global E-Waste Monitor Report',
                  'Basel Action Network (BAN) E-Waste Standards',
                  'IEEE Sustainable Systems & Hardware Engineering'
                ]).map((refItem, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="text-emerald-400 font-bold shrink-0">
                      [{idx + 1}]
                    </span>
                    <span className="text-slate-300 underline underline-offset-4 hover:text-white cursor-pointer transition-colors">
                      {refItem}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Topics / Keywords Footer */}
            {activity.topics && activity.topics.length > 0 && (
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono text-slate-500">TAGS:</span>
                {activity.topics.map((topic, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400">
                    #{topic}
                  </span>
                ))}
              </div>
            )}

          </div>

          {/* Bottom Action Footer */}
          <div className="p-4 sm:p-6 bg-[#090b0e] border-t border-slate-800/80 flex items-center justify-between gap-4">
            <div className="text-xs font-mono text-slate-500 hidden sm:block">
              Course: E-Waste & Environmental Management (Semester V)
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium text-xs sm:text-sm border border-slate-800 transition-colors"
              >
                Close View
              </button>
              <button
                onClick={() => onViewPdf(activity)}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs sm:text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span>Open Full PDF</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
