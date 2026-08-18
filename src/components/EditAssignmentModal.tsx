import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Edit3, 
  Save, 
  AlertCircle, 
  FileUp, 
  CheckCircle2, 
  Tag, 
  Calendar,
  Layers,
  BookOpen,
  Lightbulb
} from 'lucide-react';
import { Assignment, AssignmentType, SubjectName, ActivityReflection } from '../types';
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
  const [activeTab, setActiveTab] = useState<'basic' | 'activity' | 'reflection'>('basic');

  // Basic Info
  const [activityNumber, setActivityNumber] = useState<number>(1);
  const [tagPill, setTagPill] = useState<string>('PLEDGE');
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState<SubjectName>('E-Waste & Environmental Management');
  const [type, setType] = useState<AssignmentType>('Activity');
  const [weekNumber, setWeekNumber] = useState<number>(1);
  const [submissionDate, setSubmissionDate] = useState<string>('');
  const [status, setStatus] = useState<'Submitted' | 'Completed' | 'Evaluated'>('Evaluated');
  const [marksObtained, setMarksObtained] = useState('');
  const [description, setDescription] = useState('');
  const [topicsInput, setTopicsInput] = useState('');

  // Rich Activity Spec
  const [objective, setObjective] = useState('');
  const [evidenceType, setEvidenceType] = useState<'custom_poster' | 'image' | 'pdf'>('custom_poster');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [whatILearned, setWhatILearned] = useState('');
  const [sustainabilityConnection, setSustainabilityConnection] = useState('');
  
  // Reflections
  const [whatSurprisedMe, setWhatSurprisedMe] = useState('');
  const [whatChallengeFaced, setWhatChallengeFaced] = useState('');
  const [whatWillIDoDifferently, setWhatWillIDoDifferently] = useState('');

  // References
  const [referencesInput, setReferencesInput] = useState('');

  // File
  const [pdfUrlInput, setPdfUrlInput] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (assignment) {
      setActivityNumber(assignment.activityNumber || 1);
      setTagPill(assignment.tagPill || assignment.type.toUpperCase());
      setTitle(assignment.title);
      setSubject(assignment.subject);
      setType(assignment.type);
      setWeekNumber(assignment.weekNumber);
      setSubmissionDate(assignment.submissionDate);
      setStatus(assignment.status);
      setMarksObtained(assignment.marksObtained || '');
      setDescription(assignment.description);
      setTopicsInput(assignment.topics?.join(', ') || '');
      setObjective(assignment.objective || assignment.description || '');
      setEvidenceType(assignment.evidenceType || (assignment.id === 'activity-01' ? 'custom_poster' : 'pdf'));
      setEvidenceUrl(assignment.evidenceUrl || '');
      setWhatILearned(assignment.whatILearned || '');
      setSustainabilityConnection(assignment.sustainabilityConnection || '');
      setWhatSurprisedMe(assignment.reflection?.whatSurprisedMe || '');
      setWhatChallengeFaced(assignment.reflection?.whatChallengeFaced || '');
      setWhatWillIDoDifferently(assignment.reflection?.whatWillIDoDifferently || '');
      setReferencesInput(assignment.references?.join('\n') || '');
      setPdfUrlInput(assignment.pdfUrl);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setErrorMsg('Please provide a title.');
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
          console.warn('PDF upload warning:', uploadErr);
          if (!pdfUrlInput.trim()) {
            throw uploadErr;
          }
        }
      }

      const topics = topicsInput
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const references = referencesInput
        .split('\n')
        .map((r) => r.trim())
        .filter((r) => r.length > 0);

      const activityCode = `ACTIVITY ${String(activityNumber).padStart(2, '0')}`;

      const updatedAssignment: Assignment = {
        ...assignment,
        activityNumber,
        activityCode,
        tagPill: tagPill.trim().toUpperCase() || 'ACTIVITY',
        title: title.trim(),
        subject,
        weekNumber: Number(weekNumber) || 1,
        submissionDate,
        description: description.trim() || objective.trim(),
        pdfUrl: finalPdfUrl,
        fileSize: finalFileSize,
        type,
        category: type === 'Report' ? 'Reports' : type === 'Research' ? 'Research' : type === 'Activity' ? 'Activities' : type === 'Presentation' ? 'Presentations' : 'Practicals',
        status,
        marksObtained: marksObtained.trim() || undefined,
        topics: topics.length > 0 ? topics : ['E-Waste', 'Environmental Management'],
        objective: objective.trim(),
        evidenceType,
        evidenceUrl: evidenceUrl.trim() || undefined,
        whatILearned: whatILearned.trim(),
        sustainabilityConnection: sustainabilityConnection.trim(),
        reflection: {
          whatSurprisedMe: whatSurprisedMe.trim(),
          whatChallengeFaced: whatChallengeFaced.trim(),
          whatWillIDoDifferently: whatWillIDoDifferently.trim()
        },
        references: references.length > 0 ? references : undefined
      };

      await onUpdateAssignment(updatedAssignment);
      onClose();
    } catch (err: any) {
      console.error('Update assignment error:', err);
      setErrorMsg(err?.message || 'Failed to update assignment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto bg-black/85 backdrop-blur-md">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-4xl bg-[#0b0e14] text-slate-100 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col my-auto max-h-[92vh] z-10 font-sans"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Edit3 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                  Administrator Edit Panel
                </span>
                <h3 className="text-xl font-extrabold text-white tracking-tight">
                  Edit Activity Details
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-slate-800 bg-slate-900/50 px-6 pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('basic')}
              className={`px-4 py-3 text-xs font-mono font-bold tracking-wider uppercase border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'basic'
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>1. General</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('activity')}
              className={`px-4 py-3 text-xs font-mono font-bold tracking-wider uppercase border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'activity'
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>2. Objective & Evidence</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('reflection')}
              className={`px-4 py-3 text-xs font-mono font-bold tracking-wider uppercase border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'reflection'
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Lightbulb className="w-4 h-4" />
              <span>3. Learnings & Reflection</span>
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
            {errorMsg && (
              <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* TAB 1: BASIC & CODE */}
            {activeTab === 'basic' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Activity Number
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={activityNumber}
                      onChange={(e) => setActivityNumber(parseInt(e.target.value) || 1)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 text-white font-mono text-sm border border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Tag / Badge
                    </label>
                    <input
                      type="text"
                      value={tagPill}
                      onChange={(e) => setTagPill(e.target.value)}
                      placeholder="PLEDGE, TEARDOWN, LCA..."
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 text-white font-mono text-sm border border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Category Type
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as AssignmentType)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 text-white font-mono text-sm border border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Activity">Field Activity</option>
                      <option value="Report">Report</option>
                      <option value="Research">Research Paper</option>
                      <option value="Presentation">Presentation</option>
                      <option value="Practical">Practical Lab</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Activity Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm border border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Week Number
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={weekNumber}
                      onChange={(e) => setWeekNumber(parseInt(e.target.value) || 1)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 text-white text-sm font-mono border border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Submission Date
                    </label>
                    <input
                      type="date"
                      value={submissionDate}
                      onChange={(e) => setSubmissionDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 text-white text-sm font-mono border border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Status & Marks
                    </label>
                    <div className="flex items-center gap-2">
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as any)}
                        className="w-1/2 px-2 py-3 rounded-xl bg-slate-900 text-white text-xs font-mono border border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="Evaluated">Evaluated</option>
                        <option value="Completed">Completed</option>
                        <option value="Submitted">Submitted</option>
                      </select>
                      <input
                        type="text"
                        value={marksObtained}
                        onChange={(e) => setMarksObtained(e.target.value)}
                        placeholder="10/10"
                        className="w-1/2 px-3 py-3 rounded-xl bg-slate-900 text-white text-xs font-mono border border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Topics & Keywords
                  </label>
                  <input
                    type="text"
                    value={topicsInput}
                    onChange={(e) => setTopicsInput(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 text-white text-sm border border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: OBJECTIVE & EVIDENCE */}
            {activeTab === 'activity' && (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider mb-2">
                    02. OBJECTIVE
                  </label>
                  <textarea
                    rows={3}
                    value={objective}
                    onChange={(e) => setObjective(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 text-white text-sm border border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                    03. EVIDENCE PRESENTATION FORMAT
                  </label>

                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setEvidenceType('custom_poster')}
                      className={`p-3 rounded-xl border text-xs font-mono font-bold flex flex-col items-center gap-1.5 transition-all ${
                        evidenceType === 'custom_poster'
                          ? 'border-emerald-400 bg-emerald-950/40 text-emerald-300'
                          : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>📜 Pledge Poster</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEvidenceType('image')}
                      className={`p-3 rounded-xl border text-xs font-mono font-bold flex flex-col items-center gap-1.5 transition-all ${
                        evidenceType === 'image'
                          ? 'border-emerald-400 bg-emerald-950/40 text-emerald-300'
                          : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>🖼️ Evidence Image</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEvidenceType('pdf')}
                      className={`p-3 rounded-xl border text-xs font-mono font-bold flex flex-col items-center gap-1.5 transition-all ${
                        evidenceType === 'pdf'
                          ? 'border-emerald-400 bg-emerald-950/40 text-emerald-300'
                          : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>📄 PDF Document</span>
                    </button>
                  </div>

                  {evidenceType === 'image' && (
                    <div>
                      <label className="block text-xs font-mono text-slate-400 mb-1">
                        Evidence Image URL
                      </label>
                      <input
                        type="url"
                        value={evidenceUrl}
                        onChange={(e) => setEvidenceUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs border border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">
                      Update Attached PDF
                    </label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-950 file:text-emerald-300 cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider mb-2">
                    05. SUSTAINABILITY CONNECTION
                  </label>
                  <textarea
                    rows={3}
                    value={sustainabilityConnection}
                    onChange={(e) => setSustainabilityConnection(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 text-white text-sm border border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: LEARNINGS & REFLECTION */}
            {activeTab === 'reflection' && (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider mb-2">
                    04. WHAT I LEARNED (~150 WORDS)
                  </label>
                  <textarea
                    rows={4}
                    value={whatILearned}
                    onChange={(e) => setWhatILearned(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 text-white text-sm border border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
                  />
                </div>

                <div className="space-y-4 pt-2">
                  <label className="block text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                    06. REFLECTION QUESTIONS
                  </label>

                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">
                      • WHAT SURPRISED ME?
                    </label>
                    <textarea
                      rows={2}
                      value={whatSurprisedMe}
                      onChange={(e) => setWhatSurprisedMe(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs border border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">
                      • WHAT CHALLENGE DID I FACE?
                    </label>
                    <textarea
                      rows={2}
                      value={whatChallengeFaced}
                      onChange={(e) => setWhatChallengeFaced(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs border border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">
                      • WHAT WILL I DO DIFFERENTLY?
                    </label>
                    <textarea
                      rows={2}
                      value={whatWillIDoDifferently}
                      onChange={(e) => setWhatWillIDoDifferently(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs border border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider mb-2">
                    07. REFERENCES (ONE PER LINE)
                  </label>
                  <textarea
                    rows={3}
                    value={referencesInput}
                    onChange={(e) => setReferencesInput(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 text-white text-xs font-mono border border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div className="text-xs font-mono text-slate-500">
                Tab {activeTab === 'basic' ? '1 of 3' : activeTab === 'activity' ? '2 of 3' : '3 of 3'}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-mono"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-black text-xs font-mono flex items-center gap-2 transition-transform transform active:scale-95 shadow-lg shadow-emerald-500/20"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
