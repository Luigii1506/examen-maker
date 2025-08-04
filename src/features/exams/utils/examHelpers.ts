import { Clock, Users, Globe, BookOpen } from "lucide-react";

// ===========================================
// EXAM STATUS HELPERS
// ===========================================

export const getStatusBadgeProps = (exam: {
  userAttempts: { hasPassed: boolean; completed: number; available: boolean };
  status?: string;
  examType?: string;
}) => {
  if (exam.userAttempts.hasPassed) {
    return { variant: "success" as const, text: "Passed" };
  }
  if (exam.userAttempts.completed > 0) {
    return { variant: "error" as const, text: "Failed" };
  }

  // Special status for different exam types
  if (exam.examType === "SCHEDULED") {
    if (exam.status === "ASSIGNED") {
      return { variant: "warning" as const, text: "Waiting for Start" };
    }
    if (exam.status === "STARTED") {
      return { variant: "success" as const, text: "Active" };
    }
    if (exam.status === "COMPLETED") {
      return { variant: "default" as const, text: "Ended" };
    }
  }

  if (exam.userAttempts.available) {
    return { variant: "default" as const, text: "Available" };
  }
  return { variant: "warning" as const, text: "No Attempts Left" };
};

export const getDifficultyColor = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case "basic":
      return "success";
    case "intermediate":
      return "warning";
    case "advanced":
      return "error";
    default:
      return "default";
  }
};

export const getExamTypeInfo = (examType: string) => {
  switch (examType) {
    case "SCHEDULED":
      return {
        icon: Clock,
        color: "info" as const,
        bgColor: "bg-blue-100",
        textColor: "text-blue-600",
        buttonColor: "bg-blue-900 hover:bg-blue-800",
        label: "Scheduled",
        description: "Admin-controlled timing",
      };
    case "SELF_PACED":
      return {
        icon: Users,
        color: "success" as const,
        bgColor: "bg-green-100",
        textColor: "text-green-600",
        buttonColor: "bg-green-600 hover:bg-green-700",
        label: "Self-Paced",
        description: "Start when ready",
      };
    case "PUBLIC":
      return {
        icon: Globe,
        color: "warning" as const,
        bgColor: "bg-purple-100",
        textColor: "text-purple-600",
        buttonColor: "bg-purple-600 hover:bg-purple-700",
        label: "Public",
        description: "Open to everyone",
      };
    default:
      return {
        icon: BookOpen,
        color: "default" as const,
        bgColor: "bg-gray-100",
        textColor: "text-gray-600",
        buttonColor: "bg-blue-900 hover:bg-blue-800",
        label: "Exam",
        description: "",
      };
  }
};

// ===========================================
// TIME FORMATTING HELPERS
// ===========================================

export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
};

export const formatTimeRemaining = (milliseconds: number): string => {
  const minutes = Math.ceil(milliseconds / (1000 * 60));
  return `${minutes}m left`;
};

// ===========================================
// TYPES
// ===========================================

interface UserExam {
  userAttempts: {
    completed: number;
    hasPassed: boolean;
    lastAttempt?: {
      percentage?: number;
    } | null;
  };
  examType?: string;
}

// ===========================================
// EXAM STATISTICS HELPERS
// ===========================================

export const calculateExamStatistics = (exams: UserExam[]) => {
  const completedExams = exams.filter(
    (exam) => exam.userAttempts.completed > 0
  );
  const passedExams = exams.filter((exam) => exam.userAttempts.hasPassed);
  const averageScore =
    completedExams.length > 0
      ? Math.round(
          completedExams.reduce((acc, exam) => {
            const lastAttempt = exam.userAttempts.lastAttempt;
            return acc + (lastAttempt?.percentage || 0);
          }, 0) / completedExams.length
        )
      : 0;

  return {
    completedExams,
    passedExams,
    averageScore,
  };
};

// ===========================================
// EXAM GROUPING HELPERS
// ===========================================

export const groupExamsByType = (exams: UserExam[]) => {
  return {
    SCHEDULED: exams.filter((exam) => exam.examType === "SCHEDULED"),
    SELF_PACED: exams.filter((exam) => exam.examType === "SELF_PACED"),
    PUBLIC: exams.filter((exam) => exam.examType === "PUBLIC"),
  };
};
