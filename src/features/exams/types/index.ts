// Types and interfaces for the exam system

export interface Exam {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  category: string;
  difficulty: "basic" | "intermediate" | "advanced";
  questionCount: number;
  minimumScore: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Question {
  id: string;
  examId: string;
  text: string;
  type: "multiple_choice" | "true_false" | "text";
  options?: QuestionOption[];
  correctAnswer: string | string[];
  points: number;
  order: number;
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuestionAttempt {
  questionId: string;
  selectedAnswer: string | string[];
  isCorrect: boolean;
  pointsEarned: number;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  userId: string;
  startedAt: Date;
  finishedAt?: Date;
  status: "in_progress" | "completed" | "abandoned";
  totalScore: number;
  earnedScore: number;
  percentage: number;
  passed: boolean;
  answers: QuestionAttempt[];
  timeElapsed: number; // in seconds
}
