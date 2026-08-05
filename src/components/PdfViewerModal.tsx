import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Download, 
  ExternalLink, 
  FileText, 
  Calendar, 
  Award, 
  Copy, 
  Check, 
  BookOpen, 
  Sparkles,
  Maximize2,
  FileCode2,
  Share2
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
    const fullUrl = `${window.location.origin}${assignment.pdfUrl}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
          className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-[24px] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col my-auto max-h-[92vh] z-10"
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
                    Week {assignment.weekNumber}
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
                href={assignment.pdfUrl}
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
          <div className="px-6 py-2.5 bg-slate-100/60 dark:bg-slate-900/60 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 overflow-x-auto gap-4">
            <div className="flex items-center gap-4 shrink-0">
              <span className="flex items-center gap-1 font-medium">
                <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                Submitted: {assignment.submissionDate}
              </span>
              {assignment.marksObtained && (
                <span className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                  <Award className="w-3.5 h-3.5 text-emerald-500" />
                  Grade: {assignment.marksObtained}
                </span>
              )}
              <span className="font-mono">File Size: {assignment.fileSize}</span>
            </div>

            <a
              href={assignment.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 shrink-0"
            >
              <span>Open Fullscreen</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Main Content Area: PDF Iframe + Academic Document Fallback Card */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 dark:bg-slate-950/60 min-h-[450px]">
            <div className="w-full h-[550px] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden relative shadow-inner">
              <iframe
                src={`${assignment.pdfUrl}#toolbar=0&navpanes=0`}
                className="w-full h-full border-0"
                title={assignment.title}
                onLoad={() => setIframeLoaded(true)}
              />

              {/* Enhanced Document Overview Card Below / Fallback */}
              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-slate-900/90 via-slate-900/60 to-transparent text-white backdrop-blur-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1 max-w-2xl">
                  <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Topic Summary
                  </p>
                  <p className="text-xs text-slate-200 line-clamp-2">
                    {assignment.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={assignment.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    Expand PDF
                  </a>
                </div>
              </div>
            </div>

            {/* Topic Badges Section */}
            <div className="mt-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Curriculum Concepts Covered
              </h4>
              <div className="flex flex-wrap gap-2">
                {assignment.topics.map((topic, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60"
                  >
                    #{topic}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
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
