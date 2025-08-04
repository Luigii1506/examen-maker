// Types and interfaces for the user profile system

export interface UserProfile {
  id: string;
  personalInfo: PersonalInfo;
  professionalInfo: ProfessionalInfo;
  progress: UserProgress;
  settings: UserSettings;
  statistics: UserStatistics;
  updatedAt: Date;
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  birthDate?: Date;
  profilePicture?: string;
  country: string;
  city: string;
  address?: string;
  postalCode?: string;
}

export interface ProfessionalInfo {
  company: string;
  position: string;
  department?: string;
  yearsOfExperience: number;
  industry: string;
  licenses: ProfessionalLicense[];
  education: UserEducation[];
  workExperience: WorkExperience[];
}

export interface ProfessionalLicense {
  name: string;
  number: string;
  issuingEntity: string;
  issuedAt: Date;
  expiresAt?: Date;
  active: boolean;
}

export interface UserEducation {
  institution: string;
  degree: string;
  educationLevel:
    | "high_school"
    | "technical"
    | "bachelor"
    | "master"
    | "doctorate";
  startDate: Date;
  endDate?: Date;
  inProgress: boolean;
}

export interface WorkExperience {
  company: string;
  position: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
}

export interface UserProgress {
  obtainedCertifications: number;
  availableCertifications: number;
  completionPercentage: number;
  completedExams: number;
  passedExams: number;
  overallAverage: number;
  studyHours: number;
  currentStreak: number; // consecutive days with activity
  maxStreak: number;
  lastActivity: Date;
}

export interface UserSettings {
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  accessibility: AccessibilitySettings;
  language: string;
  timezone: string;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  examReminders: boolean;
  certificationUpdates: boolean;
  progressReports: boolean;
  news: boolean;
}

export interface PrivacySettings {
  publicProfile: boolean;
  showProgress: boolean;
  showCertifications: boolean;
  allowContact: boolean;
  shareStatistics: boolean;
}

export interface AccessibilitySettings {
  fontSize: "small" | "medium" | "large" | "extra-large";
  contrast: "normal" | "high";
  animations: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
}

export interface UserStatistics {
  averageExamTime: number; // in minutes
  bestScore: number;
  worstScore: number;
  examsPerMonth: number;
  strongCategories: string[];
  weakCategories: string[];
  performanceTrend: "improving" | "stable" | "declining";
  achievements: UserAchievement[];
}

export interface UserAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  obtainedAt: Date;
  category: "exams" | "certifications" | "study" | "streak" | "special";
}
