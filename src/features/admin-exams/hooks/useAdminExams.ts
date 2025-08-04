import { useState, useEffect, useCallback } from "react";
import {
  Exam,
  ExamFilters,
  ExamsResponse,
  CreateExamInput,
  UpdateExamInput,
  ExamDifficulty,
  ExamStatus,
} from "../types/exam";

// ===========================================
// HOOK STATE INTERFACE
// ===========================================

interface UseAdminExamsState {
  // Data
  exams: Exam[];
  currentExam: Exam | null;

  // Pagination
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  // Statistics
  stats: {
    total: number;
    active: number;
    draft: number;
    archived: number;
    totalAttempts: number;
    averagePassRate: number;
  };

  // Filters
  filters: ExamFilters;

  // UI State
  loading: boolean;
  error: string | null;

  // Operations
  fetchExams: (filters?: ExamFilters) => Promise<void>;
  createExam: (data: CreateExamInput) => Promise<Exam>;
  updateExam: (id: string, data: UpdateExamInput) => Promise<Exam>;
  deleteExam: (id: string) => Promise<void>;
  getExam: (id: string) => Promise<Exam>;
  assignUsers: (examId: string, userIds: string[]) => Promise<void>;
  unassignUser: (examId: string, userId: string) => Promise<void>;
  startExam: (examId: string) => Promise<void>;
  endExam: (examId: string) => Promise<void>;

  // Filter operations
  updateFilters: (newFilters: Partial<ExamFilters>) => void;
  resetFilters: () => void;

  // Pagination operations
  goToPage: (page: number) => void;
  goToNextPage: () => void;
  goToPrevPage: () => void;
}

// ===========================================
// DEFAULT VALUES
// ===========================================

const defaultFilters: ExamFilters = {
  page: 1,
  limit: 10,
  search: "",
  category: undefined,
  difficulty: undefined,
  status: undefined,
  examType: undefined,
};

const defaultPagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
};

const defaultStats = {
  total: 0,
  active: 0,
  draft: 0,
  archived: 0,
  totalAttempts: 0,
  averagePassRate: 0,
};

// ===========================================
// HOOK IMPLEMENTATION
// ===========================================

export function useAdminExams(
  initialFilters?: Partial<ExamFilters>
): UseAdminExamsState {
  // State
  const [exams, setExams] = useState<Exam[]>([]);
  const [currentExam, setCurrentExam] = useState<Exam | null>(null);
  const [pagination, setPagination] = useState(defaultPagination);
  const [stats, setStats] = useState(defaultStats);
  const [filters, setFilters] = useState<ExamFilters>({
    ...defaultFilters,
    ...initialFilters,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ===========================================
  // API OPERATIONS
  // ===========================================

  const fetchExams = useCallback(
    async (newFilters?: ExamFilters) => {
      try {
        setLoading(true);
        setError(null);

        const activeFilters = newFilters || filters;
        const params = new URLSearchParams();

        if (activeFilters.search) params.append("search", activeFilters.search);
        if (activeFilters.category)
          params.append("category", activeFilters.category);
        if (activeFilters.difficulty)
          params.append("difficulty", activeFilters.difficulty);
        if (activeFilters.status) params.append("status", activeFilters.status);
        if (activeFilters.examType)
          params.append("examType", activeFilters.examType);
        if (activeFilters.page)
          params.append("page", activeFilters.page.toString());
        if (activeFilters.limit)
          params.append("limit", activeFilters.limit.toString());

        console.log("Fetching exams with params:", params.toString());

        const response = await fetch(`/api/admin/exams?${params.toString()}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch exams");
        }

        const data: ExamsResponse = await response.json();

        setExams(data.exams);
        setPagination(data.pagination);
        setStats(data.stats);

        if (newFilters) {
          setFilters(newFilters);
        }
      } catch (err) {
        console.error("Failed to fetch exams:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch exams");
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  const createExam = useCallback(
    async (data: CreateExamInput): Promise<Exam> => {
      try {
        setLoading(true);
        setError(null);

        console.log("Sending exam data:", data);

        const response = await fetch("/api/admin/exams", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create exam");
        }

        const newExam: Exam = await response.json();

        // Refresh the exams list
        await fetchExams();

        return newExam;
      } catch (err) {
        console.error("Failed to create exam:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create exam";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [fetchExams]
  );

  const updateExam = useCallback(
    async (id: string, data: UpdateExamInput): Promise<Exam> => {
      try {
        setLoading(true);
        setError(null);

        console.log("Updating exam:", id, data);

        const response = await fetch(`/api/admin/exams/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update exam");
        }

        const updatedExam: Exam = await response.json();

        // Update the exam in the local state
        setExams((prevExams) =>
          prevExams.map((exam) => (exam.id === id ? updatedExam : exam))
        );

        // Update current exam if it's the one being updated
        if (currentExam?.id === id) {
          setCurrentExam(updatedExam);
        }

        return updatedExam;
      } catch (err) {
        console.error("Failed to update exam:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update exam";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [currentExam?.id]
  );

  const deleteExam = useCallback(
    async (id: string): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/admin/exams/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete exam");
        }

        // Remove exam from local state or update if archived
        const responseData = await response.json();

        if (responseData.exam) {
          // Exam was archived, update it
          setExams((prevExams) =>
            prevExams.map((exam) => (exam.id === id ? responseData.exam : exam))
          );
        } else {
          // Exam was deleted, remove it
          setExams((prevExams) => prevExams.filter((exam) => exam.id !== id));
        }

        // Clear current exam if it was deleted
        if (currentExam?.id === id) {
          setCurrentExam(null);
        }

        // Refresh stats
        await fetchExams();
      } catch (err) {
        console.error("Failed to delete exam:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete exam";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [currentExam?.id, fetchExams]
  );

  const getExam = useCallback(async (id: string): Promise<Exam> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/exams/${id}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch exam");
      }

      const exam: Exam = await response.json();
      setCurrentExam(exam);

      return exam;
    } catch (err) {
      console.error("Failed to fetch exam:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch exam";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // ===========================================
  // NEW: EXAM ASSIGNMENT & CONTROL OPERATIONS
  // ===========================================

  const assignUsers = useCallback(
    async (examId: string, userIds: string[]): Promise<void> => {
      try {
        const response = await fetch(`/api/admin/exams/${examId}/assignments`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userIds }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to assign users");
        }

        // Refresh exams to update assignment counts
        await fetchExams();
      } catch (err) {
        console.error("Failed to assign users:", err);
        throw new Error(
          err instanceof Error ? err.message : "Failed to assign users"
        );
      }
    },
    [fetchExams]
  );

  const unassignUser = useCallback(
    async (examId: string, userId: string): Promise<void> => {
      try {
        const response = await fetch(`/api/admin/exams/${examId}/assignments`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to unassign user");
        }

        // Refresh exams to update assignment counts
        await fetchExams();
      } catch (err) {
        console.error("Failed to unassign user:", err);
        throw new Error(
          err instanceof Error ? err.message : "Failed to unassign user"
        );
      }
    },
    [fetchExams]
  );

  const startExam = useCallback(
    async (examId: string): Promise<void> => {
      try {
        const response = await fetch(`/api/admin/exams/${examId}/start`, {
          method: "POST",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to start exam");
        }

        // Refresh exams to update status
        await fetchExams();
      } catch (err) {
        console.error("Failed to start exam:", err);
        throw new Error(
          err instanceof Error ? err.message : "Failed to start exam"
        );
      }
    },
    [fetchExams]
  );

  const endExam = useCallback(
    async (examId: string): Promise<void> => {
      try {
        const response = await fetch(`/api/admin/exams/${examId}/start`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to end exam");
        }

        // Refresh exams to update status
        await fetchExams();
      } catch (err) {
        console.error("Failed to end exam:", err);
        throw new Error(
          err instanceof Error ? err.message : "Failed to end exam"
        );
      }
    },
    [fetchExams]
  );

  // ===========================================
  // FILTER OPERATIONS
  // ===========================================

  const updateFilters = useCallback(
    (newFilters: Partial<ExamFilters>) => {
      const updatedFilters = { ...filters, ...newFilters };
      setFilters(updatedFilters);
      fetchExams(updatedFilters);
    },
    [filters, fetchExams]
  );

  const resetFilters = useCallback(() => {
    const resetFilters = { ...defaultFilters };
    setFilters(resetFilters);
    fetchExams(resetFilters);
  }, [fetchExams]);

  // ===========================================
  // PAGINATION OPERATIONS
  // ===========================================

  const goToPage = useCallback(
    (page: number) => {
      updateFilters({ page });
    },
    [updateFilters]
  );

  const goToNextPage = useCallback(() => {
    if (pagination.page < pagination.totalPages) {
      updateFilters({ page: pagination.page + 1 });
    }
  }, [pagination.page, pagination.totalPages, updateFilters]);

  const goToPrevPage = useCallback(() => {
    if (pagination.page > 1) {
      updateFilters({ page: pagination.page - 1 });
    }
  }, [pagination.page, updateFilters]);

  // ===========================================
  // EFFECTS
  // ===========================================

  // Initial fetch
  useEffect(() => {
    fetchExams();
  }, []); // Only run once on mount

  // Return hook interface
  return {
    // Data
    exams,
    currentExam,
    pagination,
    stats,
    filters,

    // UI State
    loading,
    error,

    // Operations
    fetchExams,
    createExam,
    updateExam,
    deleteExam,
    getExam,
    assignUsers,
    unassignUser,
    startExam,
    endExam,

    // Filter operations
    updateFilters,
    resetFilters,

    // Pagination operations
    goToPage,
    goToNextPage,
    goToPrevPage,
  };
}

// ===========================================
// ADDITIONAL HOOKS
// ===========================================

// Hook for fetching available questions for exam assignment
export function useQuestionsForExam() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = useCallback(
    async (filters: Record<string, string | boolean> = {}) => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== "") {
            params.append(key, value.toString());
          }
        });

        const response = await fetch(
          `/api/admin/exams/questions?${params.toString()}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch questions");
        }

        const data = await response.json();
        setQuestions(data.questions);

        return data;
      } catch (err) {
        console.error("Failed to fetch questions:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch questions"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    questions,
    loading,
    error,
    fetchQuestions,
  };
}

export default useAdminExams;
