import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Download, 
  ExternalLink, 
  FileText, 
  Calendar, 
  Copy, 
  Check, 
  Sparkles,
  Maximize2,
  Share2,
  Lightbulb,
  Leaf
} from 'lucide-react';
import { Assignment } from '../types';

interface PdfViewerModalProps {
  assignment: Assignment | null;
  onClose: () => void;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  assignment,
  onClose
}) => {
  const [copied, setCopied] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!assignment) return null;

  const handleCopyLink = () => {
    const fullUrl = assignment.pdfUrl.startsWith('http') || assignment.pdfUrl.startsWith('data:') 
      ? assignment.pdfUrl 
      : `${window.location.origin}${assignment.pdfUrl}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const pdfUrl = assignment.pdfUrl;
  const isDataOrBlob = pdfUrl.startsWith('data:') || pdfUrl.startsWith('blob:');
  const fullPdfUrl = isDataOrBlob 
    ? pdfUrl 
    : (pdfUrl.startsWith('http') ? pdfUrl : `${window.location.origin}${pdfUrl}`);

  // Clean PDF URL without fragment lock for native browser PDF rendering
  const cleanPdfUrl = isDataOrBlob ? pdfUrl : pdfUrl.split('#')[0];

  // Helper to format reflection text
  const reflectionText = typeof assignment.reflection === 'object' && assignment.reflection !== null
    ? [assignment.reflection.whatSurprisedMe, assignment.reflection.whatChallengedMe, assignment.reflection.whatWillIDoDifferently].filter(Boolean).join(' ')
    : String(assignment.reflection || '');

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-[24px] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col my-auto max-h-[92vh] z-10 font-sans"
        >
          {/* Header Bar */}
          <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-2xl bg-emerald-500 text-white shadow-md shadow-emerald-500/20 shrink-0">
                <FileText className="w-6 h-6" />
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono">
                    Activity {assignment.activityNumber || assignment.weekNumber}
                  </span>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {assignment.subject}
                  </span>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                    {assignment.type}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
                  {assignment.title}
                </h3>
              </div>
            </div>

            {/* Top Right Controls */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCopyLink}
                title="Copy Document Link"
                className="p-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 text-xs font-semibold"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
                <span className="hidden sm:inline">{copied ? 'Copied' : 'Share'}</span>
              </button>

              <a
                href={cleanPdfUrl}
                download
                title="Download PDF file"
                className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download ({assignment.fileSize})</span>
              </a>

              <button
                onClick={onClose}
                aria-label="Close modal"
                className="p-2.5 rounded-xl bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Subheader info strip */}
          <div className="px-6 py-2.5 bg-slate-100/60 dark:bg-slate-900/60 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 overflow-x-auto gap-4 font-mono">
            <div className="flex items-center gap-4 shrink-0">
              <span className="flex items-center gap-1 font-medium">
                <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                Submitted: {assignment.submissionDate}
              </span>
              <span>Status: <strong className="text-emerald-600 dark:text-emerald-400">{assignment.status || 'Evaluated'}</strong></span>
            </div>

            <a
              href={cleanPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 shrink-0"
            >
              <span>Open in New Tab</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Main Content Area: PDF Viewer + Learnings / Reflection cards */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 dark:bg-slate-950/60 space-y-4">
            
            {/* PDF View Container */}
            <div className="w-full h-[560px] sm:h-[640px] rounded-2xl bg-[#090d14] border border-slate-200 dark:border-slate-800 overflow-hidden relative shadow-inner flex flex-col">
              <object
                data={cleanPdfUrl}
                type="application/pdf"
                className="w-full h-full rounded-2xl"
              >
                <embed
                  src={cleanPdfUrl}
                  type="application/pdf"
                  className="w-full h-full rounded-2xl"
                />
                <iframe
                  src={cleanPdfUrl}
                  className="w-full h-full border-0"
                  title={assignment.title}
                >
                  <p className="p-4 text-center text-slate-400">
                    Your browser does not support inline PDF previews.{' '}
                    <a href={cleanPdfUrl} target="_blank" rel="noreferrer" className="text-emerald-400 underline">
                      Click here to open the PDF.
                    </a>
                  </p>
                </iframe>
              </object>

              {assignment.description && (
                <div className="p-3.5 bg-slate-950/90 border-t border-slate-800 text-white backdrop-blur-sm flex items-center justify-between gap-3 shrink-0">
                  <p className="text-xs text-slate-200 line-clamp-2">
                    {assignment.description}
                  </p>
                  <a
                    href={cleanPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-1 shadow shrink-0"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    Fullscreen
                  </a>
                </div>
              )}
            </div>

            {/* Academic Learning Breakdown Cards */}
            {(assignment.whatILearned || assignment.sustainabilityConnection || reflectionText) && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {/* WHAT I LEARNED */}
                {assignment.whatILearned && (
                  <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 shadow-sm">
                    <div className="flex items-center gap-2 font-mono font-bold text-xs text-amber-800 dark:text-amber-300 mb-1.5 uppercase">
                      <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>What I Learned</span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {assignment.whatILearned}
                    </p>
                  </div>
                )}

                {/* SUSTAINABILITY CONNECTION */}
                {assignment.sustainabilityConnection && (
                  <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50 shadow-sm">
                    <div className="flex items-center gap-2 font-mono font-bold text-xs text-emerald-800 dark:text-emerald-300 mb-1.5 uppercase">
                      <Leaf className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Sustainability Connection</span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {assignment.sustainabilityConnection}
                    </p>
                  </div>
                )}

                {/* REFLECTION */}
                {reflectionText && (
                  <div className="p-4 rounded-2xl bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-900/50 shadow-sm">
                    <div className="flex items-center gap-2 font-mono font-bold text-xs text-purple-800 dark:text-purple-300 mb-1.5 uppercase">
                      <Sparkles className="w-4 h-4 text-purple-500 shrink-0" />
                      <span>Reflection</span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {reflectionText}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
            <span>Aryan Acharya • Roll No: 24101C0022</span>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              Close
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
