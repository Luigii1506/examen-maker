// ===========================================
// EXAM MANAGEMENT TYPES & INTERFACES
// ===========================================
// Complete type definitions for exam system

import {
  ExamDifficulty,
  ExamStatus,
  QuestionType,
  CognitiveType,
  QuestionDifficulty,
  QuestionStatus,
} from "@prisma/client";

// ===========================================
// NEW TYPES (until Prisma migration)
// ===========================================

export type ExamType =
  | "SCHEDULED" // Admin assigns users and controls start time
  | "SELF_PACED" // Admin assigns users, they start when they want
  | "PUBLIC"; // Open to all users, no assignment needed

export type AssignmentStatus =
  | "ASSIGNED" // User is assigned to the exam
  | "STARTED" // User has started taking the exam
  | "COMPLETED" // User has completed the exam
  | "CANCELLED"; // Assignment was cancelled

// ===========================================
// CORE INTERFACES
// ===========================================

export interface Exam {
  id: string;
  title: string;
  description?: string;
  duration: number; // Duration in minutes
  category: string;
  difficulty: ExamDifficulty;
  totalQuestions: number;
  passingScore: number; // Minimum score to pass (percentage)
  status: ExamStatus;
  examType: ExamType; // NEW: Type of exam (SCHEDULED/SELF_PACED/PUBLIC)

  // Global exam timing (for SCHEDULED exams)
  examStartedAt?: Date | null;
  examEndsAt?: Date | null;

  // Relationships
  questions?: Question[];
  assignments?: ExamAssignment[]; // NEW: Users assigned to this exam

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;

  // Statistics (computed fields)
  attempts?: number;
  passRate?: number;
  averageScore?: number;
  lastAttempt?: Date;
}

// ===========================================
// NEW ASSIGNMENT INTERFACE
// ===========================================

export interface ExamAssignment {
  id: string;
  examId: string;
  userId: string;
  status: AssignmentStatus;
  assignedAt: Date;
  assignedBy?: string | null;

  // Relationships
  user?: {
    id: string;
    name: string;
    email: string;
    role?: string;
  };
  exam?: Exam;
}

export interface Question {
  id: string;
  examId?: string;
  text: string;
  type: QuestionType;
  cognitiveType: CognitiveType;
  category: string;
  difficulty: QuestionDifficulty;
  points: number;
  order?: number;
  status: QuestionStatus;

  // Question-specific data
  scenario?: string;
  explanation?: string;
  correctAnswer: unknown; // Flexible for different question types
  metadata?: Record<string, unknown>;

  // For matching questions
  leftColumn?: string[];
  rightColumn?: string[];
  correctMatches?: Record<string, string>;

  // Relationships
  options: QuestionOption[];

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

export interface QuestionOption {
  id: string;
  questionId: string;
  text: string;
  isCorrect: boolean;
  order: number;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// ===========================================
// FORM INTERFACES
// ===========================================

export interface CreateExamInput {
  title: string;
  description?: string;
  duration: number;
  category: string;
  difficulty: ExamDifficulty;
  passingScore: number;
  examType: ExamType; // NEW: Type of exam
  questionIds?: string[]; // Questions to include in the exam
}

export interface UpdateExamInput {
  title?: string;
  description?: string;
  duration?: number;
  category?: string;
  difficulty?: ExamDifficulty;
  passingScore?: number;
  status?: ExamStatus;
  examType?: ExamType; // NEW: Type of exam
  questionIds?: string[]; // Questions to include in the exam
}

export interface ExamFilters {
  search?: string;
  category?: string;
  difficulty?: ExamDifficulty;
  status?: ExamStatus;
  examType?: ExamType; // NEW: Filter by exam type
  page?: number;
  limit?: number;
}

export interface QuestionSelectionFilters {
  search?: string;
  category?: string;
  type?: QuestionType;
  difficulty?: QuestionDifficulty;
  cognitiveType?: CognitiveType;
  status?: QuestionStatus;
  excludeExamId?: string; // Exclude questions already in this exam
}

// ===========================================
// API RESPONSE INTERFACES
// ===========================================

export interface ExamsResponse {
  exams: Exam[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: {
    total: number;
    active: number;
    draft: number;
    archived: number;
    totalAttempts: number;
    averagePassRate: number;
  };
}

export interface QuestionsForExamResponse {
  questions: Question[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: {
    total: number;
    byType: Record<QuestionType, number>;
    byDifficulty: Record<QuestionDifficulty, number>;
    byCognitiveType: Record<CognitiveType, number>;
  };
}

// ===========================================
// EXAM STATISTICS
// ===========================================

export interface ExamStatistics {
  examId: string;
  totalAttempts: number;
  passedAttempts: number;
  failedAttempts: number;
  averageScore: number;
  averageTime: number; // in minutes
  passRate: number; // percentage
  scoreDistribution: {
    range: string;
    count: number;
  }[];
  questionAnalytics: {
    questionId: string;
    questionText: string;
    correctAnswers: number;
    incorrectAnswers: number;
    successRate: number;
    averageTimeSpent: number; // in seconds
  }[];
}

// ===========================================
// CONSTANTS
// ===========================================

export const EXAM_CATEGORIES = [
  "Basic AML Certification",
  "Intermediate AML Certification",
  "Advanced AML Certification",
  "KYC Procedures",
  "Sanctions Compliance",
  "Transaction Monitoring",
  "Risk Assessment",
  "Regulatory Framework",
  "Customer Due Diligence",
  "Suspicious Activity Reporting",
] as const;

export const EXAM_DIFFICULTY_LABELS: Record<ExamDifficulty, string> = {
  BASIC: "Basic",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

// Temporary extended status labels (until Prisma migration)
export const EXAM_STATUS_LABELS = {
  DRAFT: "Draft",
  ASSIGNED: "Assigned", // NEW
  STARTED: "Started", // NEW
  ACTIVE: "Active",
  COMPLETED: "Completed", // NEW
  ARCHIVED: "Archived",
  SUSPENDED: "Suspended",
} as const;

export const EXAM_TYPE_LABELS: Record<ExamType, string> = {
  SCHEDULED: "Scheduled",
  SELF_PACED: "Self-Paced",
  PUBLIC: "Public",
};

export const ASSIGNMENT_STATUS_LABELS: Record<AssignmentStatus, string> = {
  ASSIGNED: "Assigned",
  STARTED: "Started",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  MULTIPLE_CHOICE: "Multiple Choice",
  TRUE_FALSE: "True/False",
  MATCHING: "Matching",
};

export const COGNITIVE_TYPE_LABELS: Record<CognitiveType, string> = {
  REMEMBER: "Remember",
  UNDERSTAND: "Understand",
  APPLY: "Apply",
  ANALYZE: "Analyze",
  EVALUATE: "Evaluate",
  CREATE: "Create",
};

export const QUESTION_DIFFICULTY_LABELS: Record<QuestionDifficulty, string> = {
  BASIC: "Basic",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

// ===========================================
// VALIDATION CONSTANTS
// ===========================================

export const EXAM_VALIDATION = {
  TITLE: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 200,
  },
  DESCRIPTION: {
    MAX_LENGTH: 1000,
  },
  DURATION: {
    MIN_MINUTES: 15,
    MAX_MINUTES: 480, // 8 hours
  },
  PASSING_SCORE: {
    MIN: 50,
    MAX: 100,
  },
  QUESTIONS: {
    MIN_COUNT: 5,
    MAX_COUNT: 200,
  },
} as const;

// ===========================================
// FORM STATES
// ===========================================

export interface ExamFormState {
  // Basic Info
  title: string;
  description: string;
  category: string;
  difficulty: ExamDifficulty;
  examType: ExamType; // NEW: Type of exam

  // Configuration
  duration: number;
  passingScore: number;

  // Questions
  selectedQuestions: Question[];

  // UI State
  currentStep: "basic" | "questions" | "review";
  errors: Record<string, string>;
  isSubmitting: boolean;
}

// Export enums for re-use
export {
  ExamDifficulty,
  ExamStatus,
  QuestionType,
  CognitiveType,
  QuestionDifficulty,
  QuestionStatus,
};
