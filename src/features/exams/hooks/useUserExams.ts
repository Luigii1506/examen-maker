import { useState, useEffect } from "react";

// ===========================================
// TYPES
// ===========================================

interface ExamAttempt {
  id: string;
  status: string;
  startedAt: string;
  finishedAt?: string;
  percentage?: number;
  passed: boolean;
}

interface UserAttempts {
  total: number;
  completed: number;
  available: boolean;
  lastAttempt: ExamAttempt | null;
  hasPassed: boolean;
}

interface UserExam {
  id: string;
  title: string;
  description?: string;
  duration: number;
  category: string;
  difficulty: string;
  totalQuestions: number;
  passingScore: number;
  status?: string; // NEW: Exam status (ASSIGNED, STARTED, ACTIVE, etc.)
  examType?: string; // NEW: Exam type (SCHEDULED, SELF_PACED, PUBLIC)
  timeRemaining?: number; // NEW: Time remaining in milliseconds (for SCHEDULED)
  isAssigned?: boolean; // NEW: Whether user is assigned vs public access
  createdAt: string;
  updatedAt: string;
  userAttempts: UserAttempts;
}

interface UseUserExamsState {
  exams: UserExam[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

// ===========================================
// USER EXAMS HOOK
// ===========================================

export function useUserExams(): UseUserExamsState {
  const [exams, setExams] = useState<UserExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExams = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/exams");

      if (!response.ok) {
        throw new Error("Failed to fetch exams");
      }

      const data = await response.json();
      setExams(data.exams || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching exams:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  return {
    exams,
    loading,
    error,
    refresh: fetchExams,
  };
}

// ===========================================
// SINGLE EXAM HOOK
// ===========================================

interface ExamQuestion {
  id: string;
  text: string;
  type: string;
  cognitiveType: string;
  category: string;
  difficulty: string;
  points: number;
  order?: number;
  scenario?: string;
  options: Array<{
    id: string;
    text: string;
    order: number;
  }>;
}

interface ExamData {
  id: string;
  title: string;
  description?: string;
  duration: number;
  category: string;
  difficulty: string;
  totalQuestions: number;
  passingScore: number;
  questions: ExamQuestion[];
  userAttempts: {
    total: number;
    completed: number;
    available: boolean;
    hasPassed: boolean;
    inProgress: ExamAttempt | null;
  };
}

interface UseExamState {
  exam: ExamData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useExam(examId: string): UseExamState {
  const [exam, setExam] = useState<ExamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExam = async () => {
    if (!examId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/exams/${examId}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Exam not found or not available");
        }
        if (response.status === 403) {
          throw new Error("No available attempts remaining");
        }
        throw new Error("Failed to fetch exam");
      }

      const data = await response.json();
      setExam(data.exam);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching exam:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExam();
  }, [examId]);

  return {
    exam,
    loading,
    error,
    refetch: fetchExam,
  };
}
