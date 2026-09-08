import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Save, 
  AlertCircle, 
  FileUp, 
  Calendar,
  Lightbulb,
  Leaf,
  Sparkles
} from 'lucide-react';
import { Assignment, AssignmentType, SubjectName } from '../types';
import { uploadPdfDocument } from '../lib/firebase';

interface EditAssignmentModalProps {
  assignment: Assignment | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateAssignment: (updated: Assignment) => Promise<void>;
}

export const EditAssignmentModal: React.FC<EditAssignmentModalProps> = ({
  assignment,
  isOpen,
  onClose,
  onUpdateAssignment
}) => {
  const [activityNumber, setActivityNumber] = useState<number | ''>(1);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState<SubjectName>('E-Waste & Environmental Management');
  const [type, setType] = useState<AssignmentType>('Activity');
  const [weekNumber, setWeekNumber] = useState<number | ''>(1);
  const [submissionDate, setSubmissionDate] = useState<string>('');
  const [status, setStatus] = useState<'Submitted' | 'Completed' | 'Evaluated'>('Evaluated');
  const [description, setDescription] = useState('');
  
  // Custom Academic Learning Questions
  const [whatILearned, setWhatILearned] = useState('');
  const [sustainabilityConnection, setSustainabilityConnection] = useState('');
  const [reflection, setReflection] = useState('');
  
  // File
  const [pdfUrlInput, setPdfUrlInput] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (assignment) {
      setActivityNumber(assignment.activityNumber || assignment.weekNumber || 1);
      setTitle(assignment.title || '');
      setSubject(assignment.subject || 'E-Waste & Environmental Management');
      setType(assignment.type || 'Activity');
      setWeekNumber(assignment.weekNumber || 1);
      setSubmissionDate(assignment.submissionDate || new Date().toISOString().split('T')[0]);
      setStatus(assignment.status || 'Evaluated');
      setDescription(assignment.description || '');
      setWhatILearned(assignment.whatILearned || '');
      setSustainabilityConnection(assignment.sustainabilityConnection || '');
      setReflection(
        typeof assignment.reflection === 'string' 
          ? assignment.reflection 
          : ''
      );
      setPdfUrlInput(assignment.pdfUrl || '');
      setPdfFile(null);
      setErrorMsg('');
    }
  }, [assignment, isOpen]);

  if (!isOpen || !assignment) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPdfFile(e.target.files[0]);
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
      let finalPdfUrl = pdfUrlInput.trim() || assignment.pdfUrl;
      let finalFileSize = assignment.fileSize;

      if (pdfFile) {
        try {
          const uploadResult = await uploadPdfDocument(pdfFile);
          finalPdfUrl = uploadResult.pdfUrl;
          finalFileSize = uploadResult.fileSize;
        } catch (uploadErr: any) {
          console.warn('Upload error, using fallback:', uploadErr);
          if (!finalPdfUrl) throw uploadErr;
        }
      }

      const actNum = typeof activityNumber === 'number' ? activityNumber : (assignment.activityNumber || 1);

      const updatedAssignment: Assignment = {
        ...assignment,
        activityNumber: actNum,
        activityCode: `ACTIVITY ${String(actNum).padStart(2, '0')}`,
        slug: assignment.slug || `activity-${String(actNum).padStart(2, '0')}`,
        tagPill: type.toUpperCase(),
        title: title.trim(),
        subject,
        type,
        weekNumber: typeof weekNumber === 'number' ? weekNumber : (assignment.weekNumber || 1),
        submissionDate,
        status,
        shortDescription: description.trim(),
        description: description.trim(),
        objective: description.trim(),
        whatILearned: whatILearned.trim(),
        sustainabilityConnection: sustainabilityConnection.trim(),
        reflection: reflection.trim(),
        pdfUrl: finalPdfUrl,
        fileSize: finalFileSize,
        category: type === 'Report' ? 'Reports' : type === 'Research' ? 'Research' : type === 'Activity' ? 'Activities' : type === 'Presentation' ? 'Presentations' : 'Practicals',
      };

      await onUpdateAssignment(updatedAssignment);
      onClose();
    } catch (err: any) {
      console.error('Failed to update assignment:', err);
      setErrorMsg(err?.message || 'Failed to update assignment.');
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
                <Save className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Edit Coursework Assignment
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Update assignment details, learnings, reflection, or replace the PDF document
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
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

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
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            {/* Description */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Description / Objective
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Assignment description, objective, or summary..."
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
                  placeholder="Key concepts, insights, methodologies, or technical knowledge gained from this activity..."
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
                  placeholder="How this activity connects to environmental sustainability, circular economy, or e-waste reduction..."
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
                  placeholder="Personal takeaways, practical challenges, or actions to take forward..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>
            </div>

            {/* PDF File / Link */}
            <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                PDF Document
              </label>

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 rounded-2xl p-4 text-center transition-colors bg-slate-50/50 dark:bg-slate-950/50 cursor-pointer"
                onClick={() => document.getElementById('edit-pdf-upload-input')?.click()}
              >
                <input
                  id="edit-pdf-upload-input"
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-1.5">
                  <FileUp className="w-4 h-4" />
                </div>
                {pdfFile ? (
                  <p className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    New file selected: {pdfFile.name}
                  </p>
                ) : (
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Click to replace PDF or drop a new file here
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 font-mono">Current PDF link:</span>
                <input
                  type="url"
                  value={pdfUrlInput}
                  onChange={(e) => setPdfUrlInput(e.target.value)}
                  placeholder="https://example.com/document.pdf"
                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Footer */}
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
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
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
