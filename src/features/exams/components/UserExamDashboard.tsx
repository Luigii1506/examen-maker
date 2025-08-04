"use client";

import { useState } from "react";
import { useProtectedPage } from "@/shared/hooks/useAuth";
import { useUserExams } from "../hooks";
import { authClient } from "@/core/auth/auth-client";
import { useRouter } from "next/navigation";
import { Button, Card, Badge, LoadingSpinner } from "@/core/components";
import {
  User,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Download,
  Calendar,
  Award,
  BookOpen,
  LogOut,
  AlertCircle,
  Play,
  RefreshCw,
  Users,
  Globe,
  Timer,
  AlertTriangle,
} from "lucide-react";

const mockUserProfile = {
  company: "National Bank of Mexico",
  position: "AML Compliance Officer",
};

export default function UserExamDashboard() {
  const { isLoading, isAuthenticated, user, isAdmin } = useProtectedPage();
  const {
    exams,
    loading: examsLoading,
    error: examsError,
    refresh,
  } = useUserExams();
  const router = useRouter();
  const [userProfile] = useState(mockUserProfile);

  const handleStartExam = (examId: string) => {
    router.push(`/exam?id=${examId}`);
  };

  const handleLogout = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/login");
          },
        },
      });
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const getStatusBadge = (exam: {
    userAttempts: { hasPassed: boolean; completed: number; available: boolean };
    status?: string;
    examType?: string;
  }) => {
    if (exam.userAttempts.hasPassed) {
      return <Badge variant="success">Passed</Badge>;
    }
    if (exam.userAttempts.completed > 0) {
      return <Badge variant="error">Failed</Badge>;
    }

    // Special status for different exam types
    if (exam.examType === "SCHEDULED") {
      if (exam.status === "ASSIGNED") {
        return <Badge variant="warning">Waiting for Start</Badge>;
      }
      if (exam.status === "STARTED") {
        return <Badge variant="success">Active</Badge>;
      }
      if (exam.status === "COMPLETED") {
        return <Badge variant="default">Ended</Badge>;
      }
    }

    if (exam.userAttempts.available) {
      return <Badge variant="default">Available</Badge>;
    }
    return <Badge variant="warning">No Attempts Left</Badge>;
  };

  const getDifficultyColor = (difficulty: string) => {
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

  const getExamTypeInfo = (examType: string) => {
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

  // Loading state
  if (isLoading || examsLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600">
            {isLoading ? "Verifying authentication..." : "Loading exams..."}
          </p>
        </div>
      </div>
    );
  }

  // Only show if user is authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  // Calculate statistics
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-900 p-2 rounded-lg">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  AML Certification System
                </h1>
                <p className="text-sm text-gray-500">Student Portal</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{userProfile.position}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome, {user.name}
          </h2>
          <p className="text-gray-600">
            {userProfile.company} • {userProfile.position}
          </p>
        </div>

        {/* Error State */}
        {examsError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-800">Error loading exams: {examsError}</p>
              <Button variant="outline" size="sm" onClick={refresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Exam Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Available Exams */}
            <Card className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <BookOpen className="h-5 w-5 text-blue-900" />
                <h3 className="text-lg font-semibold">Available Exams</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Anti-Money Laundering Certification Exams
              </p>

              <div className="space-y-6">
                {exams.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      No exams available at this time
                    </p>
                  </div>
                ) : (
                  // Group exams by type and render each group
                  (() => {
                    const groupedExams = {
                      SCHEDULED: exams.filter(
                        (exam) => exam.examType === "SCHEDULED"
                      ),
                      SELF_PACED: exams.filter(
                        (exam) => exam.examType === "SELF_PACED"
                      ),
                      PUBLIC: exams.filter(
                        (exam) => exam.examType === "PUBLIC"
                      ),
                    };

                    return Object.entries(groupedExams)
                      .map(([type, typeExams]) => {
                        if (typeExams.length === 0) return null;

                        const typeInfo = getExamTypeInfo(type);
                        const TypeIcon = typeInfo.icon;

                        return (
                          <div key={type} className="space-y-4">
                            {/* Type Header */}
                            <div className="flex items-center space-x-3 pb-2 border-b border-gray-200">
                              <div
                                className={`w-6 h-6 rounded-lg flex items-center justify-center ${typeInfo.bgColor}`}
                              >
                                <TypeIcon
                                  className={`h-4 w-4 ${typeInfo.textColor}`}
                                />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">
                                  {typeInfo.label} Exams
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {typeInfo.description}
                                </p>
                              </div>
                              <Badge
                                variant={typeInfo.color}
                                className="ml-auto"
                              >
                                {typeExams.length}
                              </Badge>
                            </div>

                            {/* Exams in this type */}
                            <div className="space-y-3">
                              {typeExams.map((exam) => (
                                <div
                                  key={exam.id}
                                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-2 mb-1">
                                        <h4 className="font-semibold text-gray-900">
                                          {exam.title}
                                        </h4>
                                        {exam.examType === "SCHEDULED" &&
                                          exam.timeRemaining && (
                                            <div className="flex items-center space-x-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                                              <Timer className="h-3 w-3" />
                                              <span>
                                                {Math.ceil(
                                                  exam.timeRemaining /
                                                    (1000 * 60)
                                                )}
                                                m left
                                              </span>
                                            </div>
                                          )}
                                      </div>
                                      {exam.description && (
                                        <p className="text-sm text-gray-600">
                                          {exam.description}
                                        </p>
                                      )}

                                      {/* Type-specific status messages */}
                                      {exam.examType === "SCHEDULED" &&
                                        exam.status === "ASSIGNED" && (
                                          <div className="flex items-center space-x-1 mt-2 text-xs text-yellow-600">
                                            <AlertTriangle className="h-3 w-3" />
                                            <span>
                                              Waiting for administrator to start
                                              exam
                                            </span>
                                          </div>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      {getStatusBadge(exam)}
                                      <Badge
                                        variant={getDifficultyColor(
                                          exam.difficulty
                                        )}
                                      >
                                        {exam.difficulty}
                                      </Badge>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm text-gray-600">
                                    <div className="flex items-center space-x-1">
                                      <Clock className="h-4 w-4" />
                                      <span>{exam.duration} min</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <FileText className="h-4 w-4" />
                                      <span>
                                        {exam.totalQuestions} questions
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <Award className="h-4 w-4" />
                                      <span>{exam.passingScore}% to pass</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <Calendar className="h-4 w-4" />
                                      <span>
                                        {exam.userAttempts.completed}/3 attempts
                                      </span>
                                    </div>
                                  </div>

                                  {exam.userAttempts.lastAttempt && (
                                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                      <p className="text-sm font-medium text-gray-700">
                                        Last Attempt:
                                      </p>
                                      <div className="flex items-center justify-between text-sm text-gray-600">
                                        <span>
                                          {new Date(
                                            exam.userAttempts.lastAttempt.startedAt
                                          ).toLocaleDateString()}
                                        </span>
                                        <span className="font-medium">
                                          Score:{" "}
                                          {exam.userAttempts.lastAttempt
                                            .percentage || 0}
                                          %
                                        </span>
                                      </div>
                                    </div>
                                  )}

                                  <div className="flex space-x-3">
                                    <Button
                                      className={typeInfo.buttonColor}
                                      disabled={!exam.userAttempts.available}
                                      onClick={() => handleStartExam(exam.id)}
                                    >
                                      <Play className="h-4 w-4 mr-2" />
                                      {exam.examType === "PUBLIC"
                                        ? "Practice"
                                        : "Start Exam"}
                                    </Button>
                                    {exam.userAttempts.hasPassed && (
                                      <Button variant="outline">
                                        <Download className="h-4 w-4 mr-2" />
                                        Download Certificate
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })
                      .filter(Boolean);
                  })()
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <User className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Profile</h3>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">Company</p>
                  <p className="text-sm text-gray-900">{userProfile.company}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Position</p>
                  <p className="text-sm text-gray-900">
                    {userProfile.position}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-sm text-gray-900">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <div className="flex items-center space-x-1">
                    {user.emailVerified ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-600">Verified</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm text-yellow-600">
                          Pending Verification
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Stats */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Statistics</h3>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Completed exams</span>
                  <span className="font-medium">{completedExams.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">
                    Certificates obtained
                  </span>
                  <span className="font-medium">{passedExams.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Overall average</span>
                  <span className="font-medium">{averageScore}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Member since</span>
                  <span className="font-medium">
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </Card>

            {/* Important Notice */}
            <Card className="p-6 border-blue-200 bg-blue-50">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">
                Important Information
              </h3>
              <p className="text-sm text-blue-800">
                Certificates are valid for 2 years. Make sure to renew your
                certification before expiration.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
