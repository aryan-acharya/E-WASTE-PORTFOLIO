import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Save, 
  UploadCloud, 
  Plus, 
  Trash2, 
  FileText, 
  Image as ImageIcon, 
  AlertCircle, 
  Check, 
  Sparkles,
  Link as LinkIcon,
  Loader2,
  Video,
  Film,
  Eye,
  EyeOff,
  Play,
  CheckCircle2,
  FileCheck
} from 'lucide-react';
import { 
  Assignment, 
  AssignmentType, 
  AssignmentCategory, 
  SubjectName, 
  EvidenceItem, 
  AssignmentReference,
  AdminUser
} from '../../types';
import { 
  uploadEvidenceFile, 
  uploadPdfDocument, 
  saveAssignmentToFirestore, 
  updateAssignmentInFirestore,
  ADMIN_EMAIL
} from '../../lib/firebase';

interface ActivityFormModalProps {
  isOpen: boolean;
  editingActivity: Assignment | null;
  adminUser: AdminUser | null;
  onClose: () => void;
  onSuccess: (savedActivity: Assignment) => void;
}

export const ActivityFormModal: React.FC<ActivityFormModalProps> = ({
  isOpen,
  editingActivity,
  adminUser,
  onClose,
  onSuccess
}) => {
  // Form State
  const [activityNumber, setActivityNumber] = useState<number>(1);
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [subject, setSubject] = useState<SubjectName>('E-Waste & Environmental Management');
  const [type, setType] = useState<AssignmentType>('Activity');
  const [category, setCategory] = useState<AssignmentCategory>('Activities');
  const [submissionDate, setSubmissionDate] = useState('');
  const [status, setStatus] = useState<'Completed' | 'Evaluated' | 'Submitted'>('Evaluated');
  const [isPublished, setIsPublished] = useState<boolean>(true);

  // Content Sections
  const [objective, setObjective] = useState('');
  const [evidenceDescription, setEvidenceDescription] = useState('');
  const [evidenceItems, setEvidenceItems] = useState<EvidenceItem[]>([]);
  const [pdfUrl, setPdfUrl] = useState('');
  const [fileSize, setFileSize] = useState('1.4 MB');
  const [whatILearned, setWhatILearned] = useState('');
  const [sustainabilityConnection, setSustainabilityConnection] = useState('');
  
  // Structured Reflection
  const [whatSurprisedMe, setWhatSurprisedMe] = useState('');
  const [whatChallengedMe, setWhatChallengedMe] = useState('');
  const [whatWillIDoDifferently, setWhatWillIDoDifferently] = useState('');

  // References
  const [references, setReferences] = useState<AssignmentReference[]>([
    { id: 'ref-1', text: 'UNEP Global E-Waste Monitor Report', url: 'https://www.itu.int/en/ITU-D/Environment/Pages/Spotlight/Global-Ewaste-Monitor.aspx' }
  ]);

  // Upload and submission feedback states
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Active form section tab
  const [activeTab, setActiveTab] = useState<'basics' | 'objective' | 'evidence' | 'learning' | 'reflection' | 'references'>('basics');

  // Populate data when opening for edit or create
  useEffect(() => {
    if (editingActivity) {
      setActivityNumber(editingActivity.activityNumber || 1);
      setTitle(editingActivity.title || '');
      setShortDescription(editingActivity.shortDescription || editingActivity.description || '');
      setSubject(editingActivity.subject || 'E-Waste & Environmental Management');
      setType(editingActivity.type || 'Activity');
      setCategory(editingActivity.category || 'Activities');
      setSubmissionDate(editingActivity.submissionDate || new Date().toISOString().split('T')[0]);
      setStatus(editingActivity.status || 'Evaluated');
      setIsPublished(editingActivity.isPublished !== false);
      setObjective(editingActivity.objective || editingActivity.description || '');
      setEvidenceDescription(editingActivity.evidenceDescription || '');
      setEvidenceItems(editingActivity.evidenceItems || []);
      setPdfUrl(editingActivity.pdfUrl || '');
      setFileSize(editingActivity.fileSize || '1.4 MB');
      setWhatILearned(editingActivity.whatILearned || '');
      setSustainabilityConnection(editingActivity.sustainabilityConnection || '');

      const refData = typeof editingActivity.reflection === 'object' && editingActivity.reflection !== null
        ? editingActivity.reflection
        : {
            whatSurprisedMe: typeof editingActivity.reflection === 'string' ? editingActivity.reflection : '',
            whatChallengedMe: '',
            whatWillIDoDifferently: ''
          };
      setWhatSurprisedMe(refData.whatSurprisedMe || '');
      setWhatChallengedMe(refData.whatChallengedMe || '');
      setWhatWillIDoDifferently(refData.whatWillIDoDifferently || '');

      setReferences(editingActivity.references && editingActivity.references.length > 0 
        ? editingActivity.references 
        : [{ id: 'ref-1', text: 'UNEP Global E-Waste Monitor Report', url: 'https://www.itu.int/en/ITU-D/Environment/Pages/Spotlight/Global-Ewaste-Monitor.aspx' }]
      );
    } else {
      // Default reset
      setActivityNumber(1);
      setTitle('');
      setShortDescription('');
      setSubject('E-Waste & Environmental Management');
      setType('Activity');
      setCategory('Activities');
      setSubmissionDate(new Date().toISOString().split('T')[0]);
      setStatus('Evaluated');
      setIsPublished(true);
      setObjective('');
      setEvidenceDescription('');
      setEvidenceItems([]);
      setPdfUrl('https://cdn.jsdelivr.net/gh/mozilla/pdf.js@master/web/compressed.tracemonkey-pldi-09.pdf');
      setFileSize('1.4 MB');
      setWhatILearned('');
      setSustainabilityConnection('');
      setWhatSurprisedMe('');
      setWhatChallengedMe('');
      setWhatWillIDoDifferently('');
      setReferences([
        { id: 'ref-1', text: 'UNEP Global E-Waste Monitor Report', url: 'https://www.itu.int/en/ITU-D/Environment/Pages/Spotlight/Global-Ewaste-Monitor.aspx' }
      ]);
    }
    setErrorMsg('');
  }, [editingActivity, isOpen]);

  if (!isOpen) return null;

  // Drag and drop state
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // Upload a file and append to evidence items
  const processUploadFile = async (file: File, customCaption?: string, customDesc?: string) => {
    try {
      setIsUploadingFile(true);
      setUploadProgress(15);
      const uploadedItem = await uploadEvidenceFile(
        file,
        'evidence',
        (p) => setUploadProgress(p),
        adminUser?.email,
        customCaption,
        customDesc
      );
      setEvidenceItems((prev) => [...prev, uploadedItem]);
      setIsUploadingFile(false);
      setUploadProgress(0);
    } catch (err: any) {
      console.error('Evidence upload error:', err);
      setErrorMsg('Failed to upload evidence file: ' + err.message);
      setIsUploadingFile(false);
    }
  };

  // Handle uploading evidence image/video/file
  const handleEvidenceFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processUploadFile(file);
    e.target.value = '';
  };

  // Drag and drop handler
  const handleDropFiles = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const files = Array.from(e.dataTransfer.files) as File[];
    if (!files.length) return;

    for (const file of files) {
      await processUploadFile(file);
    }
  };

  // Handle PDF file upload
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingFile(true);
      setUploadProgress(30);
      const result = await uploadPdfDocument(file, (p) => setUploadProgress(p));
      setPdfUrl(result.pdfUrl);
      setFileSize(result.fileSize);
      setIsUploadingFile(false);
      setUploadProgress(0);
    } catch (err: any) {
      console.error('PDF upload error:', err);
      setErrorMsg('Failed to upload PDF: ' + err.message);
      setIsUploadingFile(false);
    }
    e.target.value = '';
  };

  // Update specific evidence item fields
  const handleUpdateEvidenceItem = (id: string, field: 'caption' | 'description' | 'name', val: string) => {
    setEvidenceItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: val } : item))
    );
  };

  // Add reference row
  const handleAddReference = () => {
    setReferences((prev) => [
      ...prev,
      { id: `ref-${Date.now()}`, text: '', url: '' }
    ]);
  };

  // Remove reference row
  const handleRemoveReference = (id: string) => {
    setReferences((prev) => prev.filter((r) => r.id !== id));
  };

  // Update reference
  const handleUpdateReference = (id: string, field: 'text' | 'url', val: string) => {
    setReferences((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: val } : r))
    );
  };

  // Submit form (as published or draft)
  const handleSaveActivity = async (publishStatus: boolean) => {
    if (!title.trim()) {
      setErrorMsg('Please enter an activity title.');
      setActiveTab('basics');
      return;
    }
    if (!objective.trim()) {
      setErrorMsg('Please provide an objective statement.');
      setActiveTab('objective');
      return;
    }

    try {
      setIsSaving(true);
      setErrorMsg('');

      const actNum = Number(activityNumber) || 1;
      const formattedNum = String(actNum).padStart(2, '0');
      const slug = `activity-${formattedNum}`;
      const docId = editingActivity ? editingActivity.id : slug;

      const assignmentData: Assignment = {
        id: docId,
        activityNumber: actNum,
        activityCode: `ACTIVITY ${formattedNum}`,
        slug: slug,
        tagPill: type.toUpperCase(),
        title: title.trim(),
        subject: subject,
        weekNumber: actNum,
        submissionDate: submissionDate || new Date().toISOString().split('T')[0],
        shortDescription: shortDescription.trim() || objective.trim(),
        description: objective.trim(),
        objective: objective.trim(),
        evidenceDescription: evidenceDescription.trim(),
        evidenceItems: evidenceItems,
        coverImageUrl: evidenceItems.find((i) => i.type === 'image')?.url || editingActivity?.coverImageUrl || '',
        whatILearned: whatILearned.trim(),
        sustainabilityConnection: sustainabilityConnection.trim(),
        reflection: {
          whatSurprisedMe: whatSurprisedMe.trim(),
          whatChallengedMe: whatChallengedMe.trim(),
          whatWillIDoDifferently: whatWillIDoDifferently.trim()
        },
        references: references.filter((r) => r.text.trim() !== ''),
        pdfUrl: pdfUrl || 'https://cdn.jsdelivr.net/gh/mozilla/pdf.js@master/web/compressed.tracemonkey-pldi-09.pdf',
        fileSize: fileSize || '1.4 MB',
        type: type,
        category: category,
        status: status,
        isPublished: publishStatus,
        createdBy: adminUser?.email || ADMIN_EMAIL,
        uploadedBy: adminUser?.email || ADMIN_EMAIL,
        createdAt: editingActivity?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (editingActivity) {
        await updateAssignmentInFirestore(assignmentData, adminUser?.email);
      } else {
        await saveAssignmentToFirestore(assignmentData, adminUser?.email);
      }

      setIsSaving(false);
      onSuccess(assignmentData);
      onClose();
    } catch (err: any) {
      console.error('Error saving assignment:', err);
      setErrorMsg(err.message || 'Failed to save to database. Ensure you are signed in as administrator.');
      setIsSaving(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSaveActivity(isPublished);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-sans">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-4xl bg-[#090d14] text-white rounded-[24px] border border-white/10 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh] z-10"
        >
          {/* Header */}
          <div className="p-6 bg-[#05080c] border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {editingActivity ? `Edit Activity ${editingActivity.activityNumber}` : 'Create New Activity'}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Cloud Persistent Database • Author: {adminUser?.email || ADMIN_EMAIL}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Tabs Bar */}
          <div className="px-6 bg-[#070b10] border-b border-white/10 flex items-center gap-2 overflow-x-auto scrollbar-none py-2 text-xs font-mono">
            {[
              { id: 'basics', label: '1. Basics' },
              { id: 'objective', label: '2. Objective' },
              { id: 'evidence', label: '3. Evidence' },
              { id: 'learning', label: '4. What I Learned' },
              { id: 'reflection', label: '5. Reflection' },
              { id: 'references', label: '6. References' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            {errorMsg && (
              <div className="p-4 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* TAB 1: BASICS */}
            {activeTab === 'basics' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase font-semibold">
                      Activity Number
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="99"
                      value={activityNumber}
                      onChange={(e) => setActivityNumber(parseInt(e.target.value) || 1)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-emerald-500/60"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase font-semibold">
                      Type / Format
                    </label>
                    <select
                      value={type}
                      onChange={(e) => {
                        const val = e.target.value as AssignmentType;
                        setType(val);
                        setCategory(val === 'Activity' ? 'Activities' : (val + 's') as any);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#090d14] border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-emerald-500/60"
                    >
                      <option value="Activity">Activity</option>
                      <option value="Practical">Practical</option>
                      <option value="Research">Research</option>
                      <option value="Report">Report</option>
                      <option value="Presentation">Presentation</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase font-semibold">
                      Submission Date
                    </label>
                    <input
                      type="date"
                      value={submissionDate}
                      onChange={(e) => setSubmissionDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-emerald-500/60"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase font-semibold">
                    Activity Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. E-Waste Awareness & Responsible Technology"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500/60"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase font-semibold">
                    Short Description / Summary
                  </label>
                  <textarea
                    rows={2}
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    placeholder="Brief 1-2 sentence executive overview..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500/60"
                  />
                </div>

                {/* Publish Switch */}
                <div className="pt-2 flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/10">
                  <div>
                    <span className="text-sm font-semibold text-white">Publication Status</span>
                    <p className="text-xs text-slate-400">
                      {isPublished 
                        ? 'Published: Visible publicly to all visitors across devices' 
                        : 'Draft: Visible only when logged in as admin'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPublished(!isPublished)}
                    className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-colors ${
                      isPublished
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {isPublished ? '● PUBLISHED' : '○ DRAFT'}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: OBJECTIVE */}
            {activeTab === 'objective' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-emerald-400 mb-1.5 uppercase font-bold tracking-wider">
                    02. OBJECTIVE STATEMENT *
                  </label>
                  <p className="text-xs text-slate-400 mb-2">
                    Define the formal technical and environmental goal of this activity.
                  </p>
                  <textarea
                    rows={6}
                    value={objective}
                    onChange={(e) => setObjective(e.target.value)}
                    placeholder="To establish a personal and technical commitment toward mitigating electronic waste, promoting circular electronics lifecycles..."
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500/60 leading-relaxed font-normal"
                    required
                  />
                </div>
              </div>
            )}

            {/* TAB 3: EVIDENCE */}
            {activeTab === 'evidence' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-mono text-emerald-400 mb-1.5 uppercase font-bold tracking-wider">
                    03. EVIDENCE ARTIFACTS & FILES
                  </label>
                  <p className="text-xs text-slate-400 mb-3">
                    Upload poster images, teardown bench photos, chemical assays, MP4/WebM demonstration videos, or PDF reports stored persistently in Firebase Cloud Storage.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase font-semibold">
                    Evidence Section Summary / Overview Caption
                  </label>
                  <input
                    type="text"
                    value={evidenceDescription}
                    onChange={(e) => setEvidenceDescription(e.target.value)}
                    placeholder="Official signed sustainability pledge poster and submission documentation..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500/60"
                  />
                </div>

                {/* Upload Zone (Drag and Drop enabled) */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingFile(true);
                  }}
                  onDragLeave={() => setIsDraggingFile(false)}
                  onDrop={handleDropFiles}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                    isDraggingFile
                      ? 'border-emerald-400 bg-emerald-500/10 scale-[1.01]'
                      : 'border-white/15 hover:border-emerald-500/60 bg-white/[0.01]'
                  }`}
                >
                  <UploadCloud className={`w-8 h-8 mx-auto mb-2 transition-transform ${isDraggingFile ? 'text-emerald-300 scale-110' : 'text-emerald-400'}`} />
                  <p className="text-xs text-slate-300 font-medium">
                    Drag and drop files here, or browse from device
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1 font-mono">
                    Supports Images (JPG, PNG, WEBP), Videos (MP4, WEBM, MOV), and PDFs (Stored in Firebase Storage bucket)
                  </p>

                  <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                    <label className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono cursor-pointer transition-colors shadow-md">
                      <span>Select Images / Videos</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*,video/*"
                        onChange={handleEvidenceFileUpload}
                        className="hidden"
                        disabled={isUploadingFile}
                      />
                    </label>

                    <label className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs font-mono cursor-pointer transition-colors border border-white/10">
                      <span>Upload Document (PDF)</span>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handlePdfUpload}
                        className="hidden"
                        disabled={isUploadingFile}
                      />
                    </label>
                  </div>

                  {isUploadingFile && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-xs text-emerald-400 font-mono">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Uploading to Firebase Cloud Storage... {uploadProgress > 0 && `${uploadProgress}%`}</span>
                    </div>
                  )}
                </div>

                {/* Uploaded Evidence Items List with caption/description editor */}
                {evidenceItems.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-slate-400 uppercase font-semibold">
                        Attached Evidence Items ({evidenceItems.length})
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        Editable title, caption & technical description
                      </span>
                    </div>

                    <div className="space-y-3">
                      {evidenceItems.map((item, idx) => (
                        <div
                          key={item.id || idx}
                          className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col gap-3 text-xs"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 truncate">
                              {item.type === 'image' ? (
                                <img
                                  src={item.url}
                                  alt={item.name}
                                  className="w-11 h-11 rounded-lg object-cover bg-black shrink-0 border border-white/10"
                                />
                              ) : item.type === 'video' ? (
                                <div className="w-11 h-11 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                                  <Video className="w-5 h-5" />
                                </div>
                              ) : (
                                <div className="w-11 h-11 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                                  <FileText className="w-5 h-5" />
                                </div>
                              )}
                              <div className="truncate">
                                <span className="font-mono text-[10px] text-emerald-400 uppercase tracking-wider font-bold">
                                  {item.type} • {item.fileSize || 'Persistent Cloud Storage'}
                                </span>
                                <input
                                  type="text"
                                  value={item.name}
                                  onChange={(e) => handleUpdateEvidenceItem(item.id, 'name', e.target.value)}
                                  placeholder="Item name..."
                                  className="w-full bg-transparent text-white font-medium focus:outline-none focus:border-b border-emerald-500/50"
                                />
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => setEvidenceItems((prev) => prev.filter((_, i) => i !== idx))}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-white/5 transition-colors shrink-0"
                              title="Remove file"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-white/5">
                            <div>
                              <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                                Caption / Label
                              </label>
                              <input
                                type="text"
                                value={item.caption || ''}
                                onChange={(e) => handleUpdateEvidenceItem(item.id, 'caption', e.target.value)}
                                placeholder="e.g. PCB Component Deconstruction"
                                className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500/60"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                                Description / Notes
                              </label>
                              <input
                                type="text"
                                value={item.description || ''}
                                onChange={(e) => handleUpdateEvidenceItem(item.id, 'description', e.target.value)}
                                placeholder="e.g. Visual verification of lead-free solder points"
                                className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500/60"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* PDF Link Direct Input */}
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase font-semibold">
                    PDF Document URL (Academic Submission)
                  </label>
                  <input
                    type="url"
                    value={pdfUrl}
                    onChange={(e) => setPdfUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-emerald-500/60"
                  />
                </div>
              </div>
            )}

            {/* TAB 4: WHAT I LEARNED & SUSTAINABILITY */}
            {activeTab === 'learning' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-mono text-emerald-400 mb-1.5 uppercase font-bold tracking-wider">
                    04. WHAT I LEARNED (~150 WORDS)
                  </label>
                  <p className="text-xs text-slate-400 mb-2">
                    Detailed academic takeaways discussing hardware toxicity, software optimization, and lifecycle analysis.
                  </p>
                  <textarea
                    rows={6}
                    value={whatILearned}
                    onChange={(e) => setWhatILearned(e.target.value)}
                    placeholder="Through analyzing global e-waste trajectories, I learned that improper hardware disposal releases toxic heavy metals..."
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500/60 leading-relaxed font-normal"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-emerald-400 mb-1.5 uppercase font-bold tracking-wider">
                    05. SUSTAINABILITY CONNECTION
                  </label>
                  <p className="text-xs text-slate-400 mb-2">
                    How this work directly reduces electronic waste and supports circular tech.
                  </p>
                  <textarea
                    rows={4}
                    value={sustainabilityConnection}
                    onChange={(e) => setSustainabilityConnection(e.target.value)}
                    placeholder="This activity helps reduce e-waste by establishing strict guidelines for modular system design, hardware component recycling..."
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500/60 leading-relaxed font-normal"
                  />
                </div>
              </div>
            )}

            {/* TAB 5: REFLECTION */}
            {activeTab === 'reflection' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-mono text-emerald-400 mb-1.5 uppercase font-bold tracking-wider">
                    06. STRUCTURED REFLECTION
                  </label>
                  <p className="text-xs text-slate-400 mb-4">
                    The 3 core engineering reflection questions required for coursework evaluation.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-4">
                  {/* Q1 */}
                  <div>
                    <label className="block text-xs font-mono text-emerald-400 mb-1.5 font-bold uppercase">
                      • WHAT SURPRISED ME?
                    </label>
                    <textarea
                      rows={2}
                      value={whatSurprisedMe}
                      onChange={(e) => setWhatSurprisedMe(e.target.value)}
                      placeholder="The sheer volume of functional hardware discarded simply due to unoptimized software..."
                      className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500/60"
                    />
                  </div>

                  {/* Q2 */}
                  <div>
                    <label className="block text-xs font-mono text-emerald-400 mb-1.5 font-bold uppercase">
                      • WHAT CHALLENGE DID I FACE?
                    </label>
                    <textarea
                      rows={2}
                      value={whatChallengedMe}
                      onChange={(e) => setWhatChallengedMe(e.target.value)}
                      placeholder="Balancing peak computational performance requirements with low-energy, sustainable hardware utilization..."
                      className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500/60"
                    />
                  </div>

                  {/* Q3 */}
                  <div>
                    <label className="block text-xs font-mono text-emerald-400 mb-1.5 font-bold uppercase">
                      • WHAT WILL I DO DIFFERENTLY?
                    </label>
                    <textarea
                      rows={2}
                      value={whatWillIDoDifferently}
                      onChange={(e) => setWhatWillIDoDifferently(e.target.value)}
                      placeholder="Prioritize lightweight software architectures, advocate for repairable hardware standards..."
                      className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500/60"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: REFERENCES */}
            {activeTab === 'references' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-mono text-emerald-400 mb-1 uppercase font-bold tracking-wider">
                      07. CITATIONS & REFERENCES
                    </label>
                    <p className="text-xs text-slate-400">
                      Standard ISO/academic citations with optional clickable web links.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddReference}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Add Reference</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {references.map((ref, idx) => (
                    <div
                      key={ref.id || idx}
                      className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center gap-2"
                    >
                      <span className="font-mono text-xs font-bold text-emerald-400 w-7 shrink-0">
                        [{idx + 1}]
                      </span>

                      <input
                        type="text"
                        value={ref.text}
                        onChange={(e) => handleUpdateReference(ref.id, 'text', e.target.value)}
                        placeholder="Citation title / author (e.g. UNEP Global E-Waste Monitor Report)"
                        className="flex-1 px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500/60"
                      />

                      <input
                        type="url"
                        value={ref.url || ''}
                        onChange={(e) => handleUpdateReference(ref.id, 'url', e.target.value)}
                        placeholder="https://..."
                        className="w-full sm:w-60 px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-emerald-500/60"
                      />

                      <button
                        type="button"
                        onClick={() => handleRemoveReference(ref.id)}
                        className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
                        title="Remove citation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </form>

          {/* Footer Bar with Save Draft & Publish Buttons */}
          <div className="p-4 sm:p-6 bg-[#05080c] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-mono text-xs transition-colors"
              >
                Cancel
              </button>

              <span className="text-[11px] font-mono text-slate-400 hidden md:inline">
                Status: {isPublished ? 'Live on Website' : 'Admin Draft'}
              </span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              {/* Save Draft Button */}
              <button
                type="button"
                onClick={() => handleSaveActivity(false)}
                disabled={isSaving}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white font-semibold font-mono text-xs flex items-center gap-2 border border-white/10 transition-colors disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <EyeOff className="w-3.5 h-3.5 text-amber-400" />}
                <span>Save Draft</span>
              </button>

              {/* Publish to Cloud Button */}
              <button
                type="button"
                onClick={() => handleSaveActivity(true)}
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Syncing to Firestore...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{editingActivity ? 'Publish & Update' : 'Publish to Cloud'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
