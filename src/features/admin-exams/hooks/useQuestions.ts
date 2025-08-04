import { useState, useEffect } from "react";
import {
  Question,
  QuestionsResponse,
  CreateQuestionInput,
  UpdateQuestionInput,
  QuestionFilters,
} from "../types";

export function useQuestions(initialFilters: QuestionFilters = {}) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [stats, setStats] = useState({
    total: 0,
    averagePoints: 0,
    categories: 0,
  });
  const [filters, setFilters] = useState<QuestionFilters>(initialFilters);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams();

      if (filters.search) searchParams.set("search", filters.search);
      if (filters.category) searchParams.set("category", filters.category);
      if (filters.difficulty)
        searchParams.set("difficulty", filters.difficulty);
      if (filters.type) searchParams.set("type", filters.type);
      if (filters.status) searchParams.set("status", filters.status);
      searchParams.set("page", (filters.page || 1).toString());
      searchParams.set("limit", (filters.limit || 10).toString());

      const response = await fetch(`/api/admin/questions?${searchParams}`);

      if (!response.ok) {
        throw new Error("Failed to fetch questions");
      }

      const data: QuestionsResponse = await response.json();

      setQuestions(data.questions);
      setPagination(data.pagination);
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const createQuestion = async (
    data: CreateQuestionInput
  ): Promise<Question> => {
    setLoading(true);
    setError(null);

    try {
      console.log("Sending question data:", data);

      const response = await fetch("/api/admin/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        throw new Error(errorData.error || "Failed to create question");
      }

      const result = await response.json();
      await fetchQuestions(); // Refresh the list
      return result.question;
    } catch (err) {
      console.error("Create question error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to create question"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateQuestion = async (
    id: string,
    data: UpdateQuestionInput
  ): Promise<Question> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/questions/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update question");
      }

      const result = await response.json();
      await fetchQuestions(); // Refresh the list
      return result.question;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update question"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteQuestion = async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/questions/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete question");
      }

      await fetchQuestions(); // Refresh the list
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete question"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getQuestion = async (id: string): Promise<Question> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/questions/${id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch question");
      }

      const result = await response.json();
      return result.question;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch question");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateFilters = (newFilters: Partial<QuestionFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  // Fetch questions when filters change
  useEffect(() => {
    fetchQuestions();
  }, [filters]);

  return {
    // Data
    questions,
    pagination,
    stats,
    filters,
    loading,
    error,

    // Actions
    createQuestion,
    updateQuestion,
    deleteQuestion,
    getQuestion,
    fetchQuestions,
    updateFilters,
    resetFilters,

    // Pagination helpers
    goToPage: (page: number) => updateFilters({ page }),
    goToNextPage: () =>
      updateFilters({
        page: Math.min(pagination.page + 1, pagination.totalPages),
      }),
    goToPrevPage: () =>
      updateFilters({ page: Math.max(pagination.page - 1, 1) }),
  };
}
