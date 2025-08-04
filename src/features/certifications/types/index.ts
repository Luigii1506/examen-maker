// Types and interfaces for the certification system

export interface Certification {
  id: string;
  userId: string;
  examId: string;
  title: string;
  category: string;
  obtainedAt: Date;
  expiresAt?: Date;
  earnedScore: number;
  minimumScore: number;
  percentage: number;
  status: "active" | "expired" | "suspended";
  serialNumber: string;
  verificationCode: string;
}

export interface CertificationRequirements {
  id: string;
  name: string;
  description: string;
  requiredExams: string[];
  minimumAverageScore: number;
  validityMonths: number;
  autoRenewal: boolean;
  prerequisites: string[]; // IDs of other required certifications
}

export interface CertificationProgress {
  certificationId: string;
  userId: string;
  progress: number; // completion percentage
  completedExams: string[];
  pendingExams: string[];
  canObtain: boolean;
  estimatedCompletionDate?: Date;
}

export interface CertificationHistory {
  id: string;
  certificationId: string;
  userId: string;
  action: "obtained" | "renewed" | "suspended" | "revoked";
  date: Date;
  reason?: string;
  adminId?: string;
}
