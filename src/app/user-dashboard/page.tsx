"use client";

import { useState } from "react";
import { useProtectedPage } from "@/shared/hooks/useAuth";
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
} from "lucide-react";

// Mock data - later this will come from our features
const mockExamStatus = {
  available: true,
  completed: false,
  score: null,
  attempts: 0,
  maxAttempts: 3,
  lastAttempt: null,
  certificateReady: false,
};

const mockPreviousExams = [
  {
    id: 1,
    date: "2024-01-15",
    score: 85,
    status: "approved" as const,
    certificate: true,
  },
  {
    id: 2,
    date: "2024-06-20",
    score: 72,
    status: "failed" as const,
    certificate: false,
  },
];

const mockUserProfile = {
  company: "National Bank of Mexico",
  position: "AML Compliance Officer",
};

export default function UserDashboardPage() {
  const { isLoading, isAuthenticated, user, isAdmin } = useProtectedPage();
  const router = useRouter();
  const [examStatus] = useState(mockExamStatus);
  const [previousExams] = useState(mockPreviousExams);
  const [userProfile] = useState(mockUserProfile);

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge variant="success">Approved</Badge>;
      case "failed":
        return <Badge variant="error">Failed</Badge>;
      case "pending":
        return <Badge variant="warning">Pending</Badge>;
      default:
        return <Badge variant="default">Available</Badge>;
    }
  };

  const getProgressPercentage = () => {
    return (examStatus.attempts / examStatus.maxAttempts) * 100;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect admins to admin dashboard
  if (isAdmin) {
    router.replace("/dashboard");
    return null;
  }

  // Only show if user is authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Exam Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Exam Status */}
            <Card className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <BookOpen className="h-5 w-5 text-blue-900" />
                <h3 className="text-lg font-semibold">
                  2024 Certification Exam
                </h3>
              </div>
              <p className="text-gray-600 mb-6">
                Anti-Money Laundering Certification
              </p>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Current status:</span>
                  {getStatusBadge(
                    examStatus.completed ? "completed" : "available"
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-medium">Attempts used:</span>
                  <span className="text-gray-700">
                    {examStatus.attempts} of {examStatus.maxAttempts}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Attempt progress</span>
                    <span>
                      {examStatus.attempts}/{examStatus.maxAttempts}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getProgressPercentage()}%` }}
                    ></div>
                  </div>
                </div>

                {examStatus.available && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-blue-800 font-medium">
                          Exam Available
                        </p>
                        <p className="text-blue-700 text-sm">
                          You have a new exam attempt available. Duration: 120
                          minutes.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <Button
                    className="bg-blue-900 hover:bg-blue-800"
                    disabled={
                      !examStatus.available ||
                      examStatus.attempts >= examStatus.maxAttempts
                    }
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Start Exam
                  </Button>
                  {examStatus.certificateReady && (
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download Certificate
                    </Button>
                  )}
                </div>
              </div>
            </Card>

            {/* Previous Exams */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-2">Exam History</h3>
              <p className="text-gray-600 mb-6">
                Results from previous attempts
              </p>

              <div className="space-y-4">
                {previousExams.map((exam) => (
                  <div
                    key={exam.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {exam.status === "approved" ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          Exam from{" "}
                          {new Date(exam.date).toLocaleDateString("en-US")}
                        </p>
                        <p className="text-sm text-gray-500">
                          Score: {exam.score}%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(exam.status)}
                      {exam.certificate && (
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
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
                  <span className="font-medium">{previousExams.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">
                    Certificates obtained
                  </span>
                  <span className="font-medium">
                    {previousExams.filter((e) => e.certificate).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Overall average</span>
                  <span className="font-medium">
                    {Math.round(
                      previousExams.reduce((acc, e) => acc + e.score, 0) /
                        previousExams.length
                    )}
                    %
                  </span>
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
