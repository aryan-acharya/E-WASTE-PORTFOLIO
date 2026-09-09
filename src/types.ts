export type NavSection = 'home' | 'overview' | 'assignments';

export type SubjectName = 'E-Waste & Environmental Management';

export type AssignmentCategory = 'All' | 'Reports' | 'Research' | 'Activities' | 'Presentations' | 'Practicals';

export type AssignmentType = 'Report' | 'Research' | 'Activity' | 'Presentation' | 'Practical';

export interface Subject {
  id: string;
  name: SubjectName;
  code: string;
  faculty: string;
  facultyTitle: string;
  credits: number;
  semester: string;
  assignmentCount: number;
  description: string;
  badgeColor: string;
  iconName: string;
}

export interface AssignmentReference {
  id: string;
  text: string;
  url?: string;
}

export interface EvidenceItem {
  id: string;
  url: string;
  name: string;
  type: 'image' | 'pdf' | 'video' | 'file';
  caption?: string;
  description?: string;
  fileSize?: string;
  createdAt?: string;
}

export interface StructuredReflection {
  whatSurprisedMe: string;
  whatChallengedMe: string;
  whatWillIDoDifferently: string;
}

export interface Assignment {
  id: string;
  activityNumber: number; // 1, 2, 3...
  activityCode?: string; // e.g. "ACTIVITY 01"
  title: string;
  slug: string; // e.g. "activity-01"
  shortDescription?: string;
  description?: string; // alias/fallback
  
  // 01 / 02. OBJECTIVE
  objective: string;
  
  // 02 / 03. EVIDENCE
  evidenceDescription?: string;
  evidenceItems?: EvidenceItem[];
  coverImageUrl?: string;
  
  // 03 / 04. WHAT I LEARNED
  whatILearned: string;
  
  // 04 / 05. SUSTAINABILITY CONNECTION
  sustainabilityConnection: string;
  
  // 05 / 06. REFLECTION
  reflection: StructuredReflection | string;
  
  // 06 / 07. REFERENCES
  references?: AssignmentReference[];
  
  // PDF Document
  pdfUrl: string;
  fileSize: string;
  
  // Meta
  subject: SubjectName;
  weekNumber: number;
  submissionDate: string; // ISO date format YYYY-MM-DD
  type: AssignmentType;
  category?: AssignmentCategory;
  tagPill?: string; // e.g. "ACTIVITY"
  status: 'Completed' | 'Evaluated' | 'Submitted';
  isPublished?: boolean;
}

export type SortOption = 'latest' | 'oldest' | 'title-asc' | 'title-desc' | 'week-asc' | 'week-desc';

export interface ProfileInfo {
  name: string;
  rollNumber: string;
  degree: string;
  branch: string;
  semester: string;
  academicYear: string;
  tagline: string;
  description: string;
  initials: string;
  email: string;
  department: string;
}

