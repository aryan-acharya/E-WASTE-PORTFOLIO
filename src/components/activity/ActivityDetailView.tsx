import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Download, 
  ExternalLink, 
  FileText, 
  Maximize2, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  Calendar, 
  CheckCircle2, 
  Sparkles, 
  Share2, 
  Check,
  Leaf,
  ShieldCheck
} from 'lucide-react';
import { Assignment, AdminUser, EvidenceItem } from '../../types';
import { LightboxModal } from '../LightboxModal';

interface ActivityDetailViewProps {
  activity: Assignment;
  allActivities: Assignment[];
  adminUser: AdminUser | null;
  onBack: () => void;
  onSelectActivity: (activity: Assignment) => void;
  onOpenPdfViewer: (activity: Assignment) => void;
  onEditActivity: (activity: Assignment) => void;
  onDeleteActivity: (activity: Assignment) => void;
  onTogglePublish: (activity: Assignment) => void;
}

export const ActivityDetailView: React.FC<ActivityDetailViewProps> = ({
  activity,
  allActivities,
  adminUser,
  onBack,
  onSelectActivity,
  onOpenPdfViewer,
  onEditActivity,
  onDeleteActivity,
  onTogglePublish
}) => {
  const [selectedImage, setSelectedImage] = useState<EvidenceItem | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Parse activity number & display codes
  const actNum = activity.activityNumber || 1;
  const formattedNum = String(actNum).padStart(2, '0');

  // Find index for previous / next navigation
  const currentIndex = allActivities.findIndex((a) => a.id === activity.id);
  const prevActivity = currentIndex > 0 ? allActivities[currentIndex - 1] : null;
  const nextActivity = currentIndex < allActivities.length - 1 ? allActivities[currentIndex + 1] : null;

  // Handle link sharing
  const handleShare = () => {
    const url = `${window.location.origin}${window.location.pathname}#${activity.slug || `activity-${formattedNum}`}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Structured reflection helper
  const reflection = typeof activity.reflection === 'object' && activity.reflection !== null
    ? activity.reflection
    : {
        whatSurprisedMe: typeof activity.reflection === 'string' ? activity.reflection : '',
        whatChallengedMe: '',
        whatWillIDoDifferently: ''
      };

  return (
    <div className="w-full bg-[#05080c] text-white min-h-screen py-10 sm:py-16 px-4 sm:px-6 lg:px-12 font-sans selection:bg-emerald-500 selection:text-slate-950">
      <div className="max-w-6xl mx-auto space-y-12 sm:space-y-16">
        
        {/* Top Navigation Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-mono font-semibold text-slate-400 hover:text-emerald-400 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform text-emerald-400" />
            <span>← ALL ACTIVITIES</span>
          </button>

          {/* Admin Management Toolbar */}
          {adminUser?.isAdmin && (
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-1.5 rounded-2xl">
              <button
                onClick={() => onTogglePublish(activity)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors ${
                  activity.isPublished
                    ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                }`}
                title={activity.isPublished ? 'Unpublish' : 'Publish'}
              >
                {activity.isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{activity.isPublished ? 'Published' : 'Draft'}</span>
              </button>

              <button
                onClick={() => onEditActivity(activity)}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Edit</span>
              </button>

              <button
                onClick={() => onDeleteActivity(activity)}
                className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          )}

          {/* Share & Meta info */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-mono flex items-center gap-2 transition-colors"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copiedLink ? 'Link Copied' : 'Share'}</span>
            </button>

            <span className="text-xs font-mono text-slate-500 hidden sm:inline">
              Submitted {activity.submissionDate}
            </span>
          </div>
        </div>

        {/* HERO TITLE SECTION (Matching Reference Screenshot 2) */}
        <div className="space-y-4">
          {/* Small Green Header Label: ACTIVITY 01 / E-WASTE & ENVIRONMENTAL MANAGEMENT */}
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-mono font-bold tracking-widest text-[#00ff88] uppercase">
              ACTIVITY {formattedNum}
            </span>
            <span className="text-slate-600 font-mono text-xs">/</span>
            <span className="text-xs sm:text-sm font-mono font-medium tracking-wider text-slate-400 uppercase">
              {activity.subject}
            </span>
          </div>

          {/* HUGE Editorial Display Typography: ACTIVITY 01 */}
          <h1 className="font-black text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tighter text-white uppercase font-sans select-none leading-none">
            ACTIVITY {formattedNum}
          </h1>

          {/* Full Activity Title */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-200 tracking-tight font-sans max-w-4xl">
            {activity.title}
          </h2>

          {activity.shortDescription && (
            <p className="text-base sm:text-lg text-slate-400 font-light max-w-3xl leading-relaxed pt-2">
              {activity.shortDescription}
            </p>
          )}
        </div>

        {/* HORIZONTAL ACTIVITY SWITCHER NAVIGATION (Matching Screenshot 1 & 2) */}
        <div className="pt-2 pb-4">
          <div className="text-[11px] font-mono tracking-widest text-slate-500 uppercase mb-3">
            QUICK ACTIVITY JUMP
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none">
            {allActivities.map((act) => {
              const num = act.activityNumber;
              const isActive = act.id === activity.id;
              return (
                <button
                  key={act.id}
                  onClick={() => onSelectActivity(act)}
                  className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                    isActive
                      ? 'bg-white text-slate-950 shadow-lg shadow-white/10 scale-105'
                      : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5'
                  }`}
                >
                  <span className={isActive ? 'text-emerald-600' : 'text-slate-500'}>●</span>
                  <span>ACTIVITY {num}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ============================================================ */}
        {/* ORDERED EDITORIAL CONTENT SECTIONS (Matching Screenshots 2 & 3) */}
        {/* ============================================================ */}

        <div className="space-y-8 sm:space-y-12">

          {/* ------------------------------------------------------------ */}
          {/* SECTION 01 / 02. OBJECTIVE */}
          {/* ------------------------------------------------------------ */}
          <div className="rounded-2xl bg-[#090d14]/70 border border-white/10 p-6 sm:p-8 md:p-10 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-mono font-bold tracking-widest text-[#00ff88] uppercase">
              <span>02. OBJECTIVE</span>
            </div>
            <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-normal">
              {activity.objective || activity.description || 'To analyze, quantify, and document e-waste mitigation practices and responsible hardware lifecycles.'}
            </p>
          </div>

          {/* ------------------------------------------------------------ */}
          {/* SECTION 02 / 03. EVIDENCE (Evidence Gallery + Posters + PDF) */}
          {/* ------------------------------------------------------------ */}
          <div className="rounded-2xl bg-[#090d14]/70 border border-white/10 p-6 sm:p-8 md:p-10 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-mono font-bold tracking-widest text-[#00ff88] uppercase">
                <span>03. EVIDENCE</span>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {activity.evidenceItems?.length || 1} Artifact(s)
              </span>
            </div>

            {activity.evidenceDescription && (
              <p className="text-sm text-slate-300 font-light leading-relaxed">
                {activity.evidenceDescription}
              </p>
            )}

            {/* Evidence Image Gallery (Matches Screenshot 2 Commitment Poster display) */}
            {activity.evidenceItems && activity.evidenceItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {activity.evidenceItems.map((item) => (
                  <div
                    key={item.id}
                    className="group relative rounded-2xl overflow-hidden bg-[#05080c] border border-white/10 flex flex-col"
                  >
                    {item.type === 'image' ? (
                      <div 
                        onClick={() => setSelectedImage(item)}
                        className="relative w-full aspect-[3/4] sm:aspect-[4/5] bg-slate-950 overflow-hidden cursor-pointer flex items-center justify-center"
                      >
                        <img
                          src={item.url}
                          alt={item.name || 'Evidence artifact'}
                          className="w-full h-full object-contain p-2 group-hover:scale-[1.02] transition-transform duration-300 select-none"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <span className="px-4 py-2 rounded-xl bg-white/90 text-slate-950 font-mono font-bold text-xs flex items-center gap-1.5 shadow-lg">
                            <Maximize2 className="w-3.5 h-3.5" />
                            Enlarge Evidence
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 flex flex-col items-center justify-center text-center bg-white/5 aspect-[4/3]">
                        <FileText className="w-12 h-12 text-emerald-400 mb-3" />
                        <span className="font-mono text-sm font-semibold text-white">{item.name}</span>
                        <span className="text-xs text-slate-400 font-mono mt-1">{item.fileSize || 'Document'}</span>
                      </div>
                    )}

                    {/* Caption Bar */}
                    <div className="p-4 bg-black/40 border-t border-white/5 flex items-center justify-between text-xs">
                      <div className="truncate pr-2">
                        <p className="text-slate-200 font-medium truncate">{item.name}</p>
                        {item.caption && (
                          <p className="text-slate-400 text-[11px] truncate mt-0.5">{item.caption}</p>
                        )}
                      </div>
                      <button
                        onClick={() => setSelectedImage(item)}
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0"
                        title="Enlarge"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : activity.coverImageUrl ? (
              <div 
                onClick={() => setSelectedImage({
                  id: 'cover',
                  url: activity.coverImageUrl!,
                  name: activity.title,
                  type: 'image'
                })}
                className="relative max-w-md mx-auto aspect-[3/4] rounded-2xl overflow-hidden bg-slate-950 border border-white/10 cursor-pointer group"
              >
                <img
                  src={activity.coverImageUrl}
                  alt={activity.title}
                  className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="px-4 py-2 rounded-xl bg-white text-slate-950 font-mono font-bold text-xs flex items-center gap-1.5 shadow-lg">
                    <Maximize2 className="w-3.5 h-3.5" />
                    Enlarge Poster
                  </span>
                </div>
              </div>
            ) : null}

            {/* Document PDF Preview & Download Actions */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => onOpenPdfViewer(activity)}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
                >
                  <FileText className="w-4 h-4" />
                  Preview PDF Submission
                </button>

                <a
                  href={activity.pdfUrl}
                  download
                  className="w-full sm:w-auto px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-mono font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  Download ({activity.fileSize})
                </a>
              </div>

              <span className="text-xs font-mono text-slate-400">
                Verified Roll No: 24101C0022
              </span>
            </div>
          </div>

          {/* ------------------------------------------------------------ */}
          {/* SECTION 03 / 04. WHAT I LEARNED (~150 WORDS) (Screenshot 3) */}
          {/* ------------------------------------------------------------ */}
          <div className="rounded-2xl bg-[#090d14]/70 border border-white/10 p-6 sm:p-8 md:p-10 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-mono font-bold tracking-widest text-[#00ff88] uppercase">
              <span>04. WHAT I LEARNED (~150 WORDS)</span>
            </div>
            <div className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal whitespace-pre-line space-y-4">
              {activity.whatILearned || (
                'Through analyzing global e-waste trajectories, I learned that improper hardware disposal releases toxic heavy metals such as lead, mercury, and cadmium into ground soil while exhausting non-renewable rare earth minerals. Understanding the end-to-end lifecycle of consumer electronics reveals that hardware longevity is heavily dictated by software optimization, repairability, and modular system design. As an IT engineering student, I realized that writing efficient code and advocating for open technical documentation directly extends component lifespans, reducing premature device obsolescence across modern digital infrastructures.'
              )}
            </div>
          </div>

          {/* ------------------------------------------------------------ */}
          {/* SECTION 04 / 05. SUSTAINABILITY CONNECTION (Screenshot 3) */}
          {/* ------------------------------------------------------------ */}
          <div className="rounded-2xl bg-[#090d14]/70 border border-white/10 p-6 sm:p-8 md:p-10 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-mono font-bold tracking-widest text-[#00ff88] uppercase">
              <Leaf className="w-4 h-4 text-[#00ff88]" />
              <span>05. SUSTAINABILITY CONNECTION</span>
            </div>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
              {activity.sustainabilityConnection || (
                'This activity helps reduce e-waste by establishing strict guidelines for modular system design, hardware component recycling, and software optimization that prevents functional devices from being rendered obsolete by heavy software bloat.'
              )}
            </p>
          </div>

          {/* ------------------------------------------------------------ */}
          {/* SECTION 05 / 06. REFLECTION (Screenshot 3 Structured Questions) */}
          {/* ------------------------------------------------------------ */}
          <div className="rounded-2xl bg-[#090d14]/70 border border-white/10 p-6 sm:p-8 md:p-10 shadow-2xl space-y-6">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-mono font-bold tracking-widest text-[#00ff88] uppercase">
              <span>06. REFLECTION</span>
            </div>

            <div className="pl-4 sm:pl-6 border-l-2 border-emerald-500/80 space-y-6">
              {/* Question 1: What surprised me? */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 font-mono font-bold text-xs sm:text-sm text-emerald-400 uppercase tracking-wide">
                  <span>• WHAT SURPRISED ME?</span>
                </div>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal pl-4">
                  {reflection.whatSurprisedMe || 'The sheer volume of functional hardware discarded simply due to unoptimized software and absence of documentation.'}
                </p>
              </div>

              {/* Question 2: What challenge did I face? */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 font-mono font-bold text-xs sm:text-sm text-emerald-400 uppercase tracking-wide">
                  <span>• WHAT CHALLENGE DID I FACE?</span>
                </div>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal pl-4">
                  {reflection.whatChallengedMe || 'Balancing peak computational performance requirements with low-energy, sustainable hardware utilization across modern development environments.'}
                </p>
              </div>

              {/* Question 3: What will I do differently? */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 font-mono font-bold text-xs sm:text-sm text-emerald-400 uppercase tracking-wide">
                  <span>• WHAT WILL I DO DIFFERENTLY?</span>
                </div>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal pl-4">
                  {reflection.whatWillIDoDifferently || 'Prioritize lightweight software architectures, advocate for repairable hardware standards, and champion technical documentation for long-term device maintenance.'}
                </p>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------ */}
          {/* SECTION 06 / 07. REFERENCES (Numbered list with clickable URLs) */}
          {/* ------------------------------------------------------------ */}
          <div className="rounded-2xl bg-[#090d14]/70 border border-white/10 p-6 sm:p-8 md:p-10 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-mono font-bold tracking-widest text-[#00ff88] uppercase">
              <span>07. REFERENCES</span>
            </div>

            <div className="space-y-3 font-mono text-xs sm:text-sm">
              {activity.references && activity.references.length > 0 ? (
                activity.references.map((ref, idx) => (
                  <div key={ref.id || idx} className="flex items-start gap-2.5">
                    <span className="text-emerald-400 font-bold shrink-0">[{idx + 1}]</span>
                    {ref.url ? (
                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-300 hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5 underline decoration-white/20 underline-offset-4"
                      >
                        <span>{ref.text}</span>
                        <ExternalLink className="w-3 h-3 text-emerald-400 shrink-0" />
                      </a>
                    ) : (
                      <span className="text-slate-300">{ref.text}</span>
                    )}
                  </div>
                ))
              ) : (
                <>
                  <div className="flex items-start gap-2.5">
                    <span className="text-emerald-400 font-bold">[1]</span>
                    <a
                      href="https://www.itu.int/en/ITU-D/Environment/Pages/Spotlight/Global-Ewaste-Monitor.aspx"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-300 hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5 underline decoration-white/20"
                    >
                      UNEP Global E-Waste Monitor Report
                      <ExternalLink className="w-3 h-3 text-emerald-400" />
                    </a>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-emerald-400 font-bold">[2]</span>
                    <a
                      href="https://www.ban.org/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-300 hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5 underline decoration-white/20"
                    >
                      Basel Action Network (BAN) E-Waste Standards
                      <ExternalLink className="w-3 h-3 text-emerald-400" />
                    </a>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-emerald-400 font-bold">[3]</span>
                    <a
                      href="https://ieeexplore.ieee.org/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-300 hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5 underline decoration-white/20"
                    >
                      IEEE Sustainable Systems & Hardware Engineering
                      <ExternalLink className="w-3 h-3 text-emerald-400" />
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>

        {/* BOTTOM PAGINATION CONTROLS (Prev / Next Activity) */}
        <div className="pt-12 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {prevActivity ? (
            <button
              onClick={() => {
                onSelectActivity(prevActivity);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="p-6 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 text-left transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400 group-hover:text-emerald-400 transition-colors mb-2">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>PREVIOUS ACTIVITY</span>
              </div>
              <div>
                <span className="font-mono text-xs font-bold text-slate-500">
                  ACTIVITY {prevActivity.activityNumber}
                </span>
                <p className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
                  {prevActivity.title}
                </p>
              </div>
            </button>
          ) : <div />}

          {nextActivity && (
            <button
              onClick={() => {
                onSelectActivity(nextActivity);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="p-6 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 text-right transition-all group flex flex-col justify-between items-end sm:col-start-2"
            >
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400 group-hover:text-emerald-400 transition-colors mb-2">
                <span>NEXT ACTIVITY</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-mono text-xs font-bold text-slate-500">
                  ACTIVITY {nextActivity.activityNumber}
                </span>
                <p className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
                  {nextActivity.title}
                </p>
              </div>
            </button>
          )}
        </div>

      </div>

      {/* Lightbox for Evidence Images */}
      <LightboxModal
        isOpen={Boolean(selectedImage)}
        imageUrl={selectedImage?.url || null}
        title={selectedImage?.name}
        caption={selectedImage?.caption}
        onClose={() => setSelectedImage(null)}
      />
    </div>
  );
};
