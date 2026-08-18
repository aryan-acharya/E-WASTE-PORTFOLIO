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

export interface ActivityReflection {
  whatSurprisedMe?: string;
  whatChallengeFaced?: string;
  whatWillIDoDifferently?: string;
}

export interface Assignment {
  id: string;
  title: string;
  subject: SubjectName;
  weekNumber: number;
  submissionDate: string; // ISO date format YYYY-MM-DD
  description: string;
  pdfUrl: string;
  fileSize: string;
  type: AssignmentType;
  category?: AssignmentCategory;
  status: 'Completed' | 'Evaluated' | 'Submitted';
  marksObtained?: string;
  topics: string[];
  isPublished?: boolean;
  uploadedBy?: string;
  createdAt?: string;

  // Rich Activity Details (Matching User Visual Spec)
  activityNumber?: number; // 1 to 11
  activityCode?: string; // e.g. "ACTIVITY 01"
  tagPill?: string; // e.g. "PLEDGE", "AUDIT", "TEARDOWN", "LCA"
  objective?: string;
  evidenceUrl?: string;
  evidenceType?: 'image' | 'pdf' | 'custom_poster';
  evidencePosterData?: {
    title?: string;
    studentName?: string;
    rollNumber?: string;
    date?: string;
    pledgeLines?: string[];
  };
  whatILearned?: string;
  sustainabilityConnection?: string;
  reflection?: ActivityReflection;
  references?: string[];
}

export interface AdminUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAdmin: boolean;
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

