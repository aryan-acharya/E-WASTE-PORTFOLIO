import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  PlusCircle, 
  FileText, 
  AlertCircle, 
  Calendar, 
  FileUp,
  Lightbulb,
  Leaf,
  Sparkles
} from 'lucide-react';
import { Assignment, AssignmentType, SubjectName } from '../types';
import { uploadPdfDocument } from '../lib/firebase';

interface AddAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAssignment: (assignment: Assignment) => Promise<void>;
}

export const AddAssignmentModal: React.FC<AddAssignmentModalProps> = ({
  isOpen,
  onClose,
  onAddAssignment
}) => {
  const [activityNumber, setActivityNumber] = useState<number | ''>(1);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState<SubjectName>('E-Waste & Environmental Management');
  const [type, setType] = useState<AssignmentType>('Activity');
  const [weekNumber, setWeekNumber] = useState<number | ''>(1);
  const [submissionDate, setSubmissionDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [status, setStatus] = useState<'Submitted' | 'Completed' | 'Evaluated'>('Evaluated');
  const [description, setDescription] = useState('');
  
  // Custom Academic Learning Questions
  const [whatILearned, setWhatILearned] = useState('');
  const [sustainabilityConnection, setSustainabilityConnection] = useState('');
  const [reflection, setReflection] = useState('');
  
  // Files
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrlInput, setPdfUrlInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPdfFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setPdfFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setErrorMsg('Please enter an assignment title.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      let pdfUrl = 'https://cdn.jsdelivr.net/gh/mozilla/pdf.js@master/web/compressed.tracemonkey-pldi-09.pdf';
      let fileSize = '1.2 MB';

      if (pdfFile) {
        try {
          const uploadResult = await uploadPdfDocument(pdfFile);
          pdfUrl = uploadResult.pdfUrl;
          fileSize = uploadResult.fileSize;
        } catch (uploadErr: any) {
          console.warn('PDF upload error:', uploadErr);
          if (pdfUrlInput.trim()) {
            pdfUrl = pdfUrlInput.trim();
            fileSize = 'Custom PDF';
          } else {
            throw uploadErr;
          }
        }
      } else if (pdfUrlInput.trim()) {
        pdfUrl = pdfUrlInput.trim();
        fileSize = 'Document Link';
      }

      const actNum = typeof activityNumber === 'number' ? activityNumber : 1;
      const activityCode = `ACTIVITY ${String(actNum).padStart(2, '0')}`;

      const newAssignment: Assignment = {
        id: `activity-${String(actNum).padStart(2, '0')}-${Date.now()}`,
        activityNumber: actNum,
        activityCode,
        tagPill: type.toUpperCase(),
        title: title.trim(),
        subject,
        weekNumber: typeof weekNumber === 'number' ? weekNumber : actNum,
        submissionDate,
        description: description.trim(),
        whatILearned: whatILearned.trim() || undefined,
        sustainabilityConnection: sustainabilityConnection.trim() || undefined,
        reflection: reflection.trim() || undefined,
        pdfUrl,
        fileSize,
        type,
        category: type === 'Report' ? 'Reports' : type === 'Research' ? 'Research' : type === 'Activity' ? 'Activities' : type === 'Presentation' ? 'Presentations' : 'Practicals',
        status,
        isPublished: true
      };

      await onAddAssignment(newAssignment);
      onClose();
      
      // Reset form
      setTitle('');
      setDescription('');
      setWhatILearned('');
      setSustainabilityConnection('');
      setReflection('');
      setPdfFile(null);
      setPdfUrlInput('');
    } catch (err: any) {
      console.error('Failed to add assignment:', err);
      setErrorMsg(err?.message || 'Failed to save assignment. Please check all fields.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6">
        <div 
          className="fixed inset-0" 
          onClick={onClose}
          aria-label="Close modal background"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 my-auto max-h-[92vh] flex flex-col font-sans"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Add Coursework Assignment
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Enter your assignment details, learnings, reflection, and upload your PDF submission
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/80 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Activity Number */}
              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Activity Number *
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={activityNumber}
                  onChange={(e) => setActivityNumber(e.target.value === '' ? '' : parseInt(e.target.value))}
                  placeholder="1"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Category Type */}
              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Category Type *
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as AssignmentType)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Activity">Activity</option>
                  <option value="Practical">Practical</option>
                  <option value="Research">Research Paper</option>
                  <option value="Report">Audit Report</option>
                  <option value="Presentation">Presentation</option>
                </select>
              </div>

              {/* Week Number */}
              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Week Number
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={weekNumber}
                  onChange={(e) => setWeekNumber(e.target.value === '' ? '' : parseInt(e.target.value))}
                  placeholder="1"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Assignment Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Activity 01: E-Waste Management Pledge"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Subject */}
              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Course Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value as SubjectName)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Submission Date */}
              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Submission Date
                </label>
                <input
                  type="date"
                  value={submissionDate}
                  onChange={(e) => setSubmissionDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Description / Summary */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Description / Objective
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter a brief summary or objective of this assignment..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>

            {/* Learning Reflection Section */}
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Coursework Learnings & Reflection
                </span>
              </div>

              {/* WHAT I LEARNED */}
              <div>
                <label className="block text-xs font-mono font-bold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  <span>WHAT I LEARNED</span>
                </label>
                <textarea
                  rows={3}
                  value={whatILearned}
                  onChange={(e) => setWhatILearned(e.target.value)}
                  placeholder="Key concepts, insights, methodologies, or technical knowledge gained from completing this activity..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              {/* SUSTAINABILITY CONNECTION */}
              <div>
                <label className="block text-xs font-mono font-bold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
                  <Leaf className="w-3.5 h-3.5 text-emerald-500" />
                  <span>SUSTAINABILITY CONNECTION</span>
                </label>
                <textarea
                  rows={3}
                  value={sustainabilityConnection}
                  onChange={(e) => setSustainabilityConnection(e.target.value)}
                  placeholder="How this activity connects to environmental sustainability, circular economy, lifecycle assessment, or e-waste mitigation..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              {/* REFLECTION */}
              <div>
                <label className="block text-xs font-mono font-bold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                  <span>REFLECTION</span>
                </label>
                <textarea
                  rows={3}
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="Personal takeaways, practical challenges faced, surprises encountered, or actions to take forward..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>
            </div>

            {/* PDF Upload / URL */}
            <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                Assignment PDF Document
              </label>

              {/* Drag & Drop Box */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 rounded-2xl p-5 text-center transition-colors bg-slate-50/50 dark:bg-slate-950/50 cursor-pointer"
                onClick={() => document.getElementById('pdf-upload-input')?.click()}
              >
                <input
                  id="pdf-upload-input"
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-2">
                  <FileUp className="w-5 h-5" />
                </div>
                {pdfFile ? (
                  <p className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    Selected: {pdfFile.name} ({(pdfFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                ) : (
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Click to browse or drag & drop your PDF here
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Supports PDF files up to 20MB
                    </p>
                  </div>
                )}
              </div>

              {/* Or external URL */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 font-mono">Or paste link:</span>
                <input
                  type="url"
                  value={pdfUrlInput}
                  onChange={(e) => setPdfUrlInput(e.target.value)}
                  placeholder="https://example.com/my-assignment.pdf"
                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Footer buttons */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all disabled:opacity-50 font-mono"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>Add Assignment</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
