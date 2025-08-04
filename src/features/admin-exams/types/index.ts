// Types and interfaces for the exam administration system

// Export new question management types
export * from "./question";

export interface AdminExam extends Exam {
  creatorId: string;
  statistics: ExamStatistics;
  configuration: ExamConfiguration;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  duration: number;
  category: string;
  difficulty: "basic" | "intermediate" | "advanced";
  questionCount: number;
  minimumScore: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExamStatistics {
  totalAttempts: number;
  completedAttempts: number;
  passedAttempts: number;
  averageTime: number;
  averageScore: number;
  passRate: number;
  lastAttempt: Date;
}

export interface ExamConfiguration {
  allowRetries: boolean;
  maxAttempts: number;
  timeBetweenAttempts: number; // in hours
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showImmediateResult: boolean;
  allowFreeNavigation: boolean;
}

export interface AdminQuestion {
  id: string;
  examId: string;
  text: string;
  type: "multiple_choice" | "true_false" | "text";
  options?: QuestionOption[];
  correctAnswer: string | string[];
  points: number;
  order: number;
  explanation?: string;
  references?: string[];
  statistics: QuestionStatistics;
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuestionStatistics {
  timesAnswered: number;
  timesCorrect: number;
  correctPercentage: number;
  averageResponseTime: number;
}

export interface ExamTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  structure: TemplateStructure[];
  active: boolean;
}

export interface TemplateStructure {
  category: string;
  questionCount: number;
  difficulty: "basic" | "intermediate" | "advanced";
  pointsPerQuestion: number;
}
