// Types for Question Management
export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  cognitiveType: CognitiveType;
  category: string;
  difficulty: QuestionDifficulty;
  points: number;
  order?: number;
  status: QuestionStatus;
  scenario?: string;
  explanation?: string;
  correctAnswer: unknown;
  metadata?: Record<string, unknown>;

  // For matching questions
  leftColumn?: string[];
  rightColumn?: string[];
  correctMatches?: Record<string, string>;

  // Relationships
  examId?: string;
  exam?: {
    id: string;
    title: string;
  };
  options: QuestionOption[];

  // Timestamps
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

export interface CreateQuestionInput {
  text: string;
  type: QuestionType;
  cognitiveType: CognitiveType;
  category: string;
  difficulty: QuestionDifficulty;
  points: number;
  scenario?: string;
  explanation?: string;
  correctAnswer: unknown;
  options?: CreateQuestionOptionInput[];
  // For matching questions
  leftColumn?: string[];
  rightColumn?: string[];
  correctMatches?: Record<string, string>;
  examId?: string;
}

export interface CreateQuestionOptionInput {
  text: string;
  isCorrect: boolean;
  order: number;
}

export interface UpdateQuestionInput {
  text?: string;
  type?: QuestionType;
  cognitiveType?: CognitiveType;
  category?: string;
  difficulty?: QuestionDifficulty;
  points?: number;
  scenario?: string;
  explanation?: string;
  correctAnswer?: unknown;
  options?: UpdateQuestionOptionInput[];
  // For matching questions
  leftColumn?: string[];
  rightColumn?: string[];
  correctMatches?: Record<string, string>;
  status?: QuestionStatus;
  examId?: string;
}

export interface UpdateQuestionOptionInput {
  id?: string;
  text: string;
  isCorrect: boolean;
  order: number;
}

export interface QuestionFilters {
  search?: string;
  category?: string;
  difficulty?: QuestionDifficulty;
  type?: QuestionType;
  status?: QuestionStatus;
  page?: number;
  limit?: number;
}

export interface QuestionsResponse {
  questions: Question[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: {
    total: number;
    averagePoints: number;
    categories: number;
  };
}

// Enums
export enum QuestionType {
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
  TRUE_FALSE = "TRUE_FALSE",
  MATCHING = "MATCHING",
}

export enum CognitiveType {
  REMEMBER = "REMEMBER",
  UNDERSTAND = "UNDERSTAND",
  APPLY = "APPLY",
  ANALYZE = "ANALYZE",
  EVALUATE = "EVALUATE",
  CREATE = "CREATE",
}

export enum QuestionDifficulty {
  BASIC = "BASIC",
  INTERMEDIATE = "INTERMEDIATE",
  ADVANCED = "ADVANCED",
}

export enum QuestionStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  ARCHIVED = "ARCHIVED",
  UNDER_REVIEW = "UNDER_REVIEW",
}

// Constants
export const QUESTION_CATEGORIES = [
  "International Regulatory Framework",
  "Compliance Principles",
  "Suspicious Operations Detection",
  "Compliance Procedures",
  "Risk Management",
  "Customer Due Diligence",
  "Record Keeping",
  "Training and Awareness",
  "Technology and Systems",
  "Monitoring and Reporting",
] as const;

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  [QuestionType.MULTIPLE_CHOICE]: "Multiple Choice",
  [QuestionType.TRUE_FALSE]: "True/False",
  [QuestionType.MATCHING]: "Matching",
};

export const COGNITIVE_TYPE_LABELS: Record<CognitiveType, string> = {
  [CognitiveType.REMEMBER]: "Remember",
  [CognitiveType.UNDERSTAND]: "Understand",
  [CognitiveType.APPLY]: "Apply",
  [CognitiveType.ANALYZE]: "Analyze",
  [CognitiveType.EVALUATE]: "Evaluate",
  [CognitiveType.CREATE]: "Create",
};

export const DIFFICULTY_LABELS: Record<QuestionDifficulty, string> = {
  [QuestionDifficulty.BASIC]: "Basic",
  [QuestionDifficulty.INTERMEDIATE]: "Intermediate",
  [QuestionDifficulty.ADVANCED]: "Advanced",
};

export const STATUS_LABELS: Record<QuestionStatus, string> = {
  [QuestionStatus.ACTIVE]: "Active",
  [QuestionStatus.INACTIVE]: "Inactive",
  [QuestionStatus.ARCHIVED]: "Archived",
  [QuestionStatus.UNDER_REVIEW]: "Under Review",
};
