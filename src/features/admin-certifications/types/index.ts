// Types and interfaces for the certification administration system

export interface AdminCertification {
  id: string;
  name: string;
  description: string;
  category: string;
  requirements: CertificationRequirements;
  template: CertificationTemplate;
  statistics: CertificationStatistics;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CertificationRequirements {
  requiredExams: RequiredExam[];
  minimumAverageScore: number;
  validityMonths: number;
  autoRenewal: boolean;
  prerequisites: string[]; // IDs of other certifications
  minimumExperience?: number; // years of experience
}

export interface RequiredExam {
  examId: string;
  minimumScore: number;
  required: boolean;
  weight: number; // weight in final average
}

export interface CertificationTemplate {
  id: string;
  name: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  design: "classic" | "modern" | "corporate";
  fields: CertificationField[];
}

export interface CertificationField {
  name: string;
  type: "text" | "date" | "number" | "qr" | "signature";
  position: { x: number; y: number };
  size: { width: number; height: number };
  style: FieldStyle;
  required: boolean;
}

export interface FieldStyle {
  font: string;
  size: number;
  color: string;
  alignment: "left" | "center" | "right";
  bold: boolean;
  italic: boolean;
}

export interface CertificationStatistics {
  totalIssued: number;
  totalActive: number;
  totalExpired: number;
  totalSuspended: number;
  averageTimeToObtain: number; // days
  autoRenewals: number;
  manualRenewals: number;
}

export interface CertificationProcess {
  id: string;
  userId: string;
  certificationId: string;
  status: "evaluating" | "approved" | "rejected" | "pending_documents";
  progress: number;
  completedRequirements: string[];
  pendingRequirements: string[];
  startDate: Date;
  completionDate?: Date;
  notes?: string;
  assignedAdmin?: string;
}
