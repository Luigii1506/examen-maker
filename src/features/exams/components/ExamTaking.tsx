"use client";

import { useState, useEffect } from "react";
import { useProtectedPage } from "@/shared/hooks/useAuth";
import { useExam } from "../hooks";
import { authClient } from "@/core/auth/auth-client";
import { useRouter } from "next/navigation";
import { Button, Card, Badge, LoadingSpinner } from "@/core/components";
import {
  Clock,
  Flag,
  AlertTriangle,
  CheckCircle,
  Circle,
  Brain,
  BookOpen,
  Target,
  Search,
  Lightbulb,
  Pause,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  User,
  Timer,
  FileText,
  AlertCircle,
  Home,
} from "lucide-react";

interface ExamTakingProps {
  examId: string;
}

export default function ExamTaking({ examId }: ExamTakingProps) {
  const { isLoading, isAuthenticated, user, isAdmin } = useProtectedPage();
  const router = useRouter();

  // Get exam data
  const {
    exam,
    loading: examLoading,
    error: examError,
  } = useExam(examId || "");

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(
    new Set()
  );
  const [examStarted, setExamStarted] = useState(false);

  // Set timer when exam loads
  useEffect(() => {
    if (exam && !examStarted) {
      setTimeLeft(exam.duration * 60); // Convert minutes to seconds
      setExamStarted(true);
    }
  }, [exam, examStarted]);

  useEffect(() => {
    if (!examStarted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examStarted, timeLeft]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleMarkForReview = (questionId: string) => {
    setMarkedForReview((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleSubmitExam = () => {
    // Navigate to results page
    router.push("/exam-results");
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

  const goBackToDashboard = () => {
    router.push("/user-dashboard");
  };

  // Loading state
  if (isLoading || examLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600">
            {isLoading ? "Verifying authentication..." : "Loading exam..."}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (examError || !examId) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Card className="w-96 mx-4 p-6">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Exam Not Available
            </h2>
            <p className="text-gray-600 mb-6">
              {examError || "No exam ID provided"}
            </p>
            <Button onClick={goBackToDashboard}>
              <Home className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Only show if user is authenticated and exam is loaded
  if (!isAuthenticated || !user || !exam) {
    return null;
  }

  const questions = exam.questions || [];
  const currentQ = questions[currentQuestion];
  const answeredQuestions = Object.keys(answers).length;

  const renderQuestionContent = () => {
    if (!currentQ) return null;

    return (
      <div className="space-y-6">
        {/* Question Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-500">
                  Question {currentQuestion + 1} of {questions.length}
                </span>
                {markedForReview.has(currentQ.id) && (
                  <Flag className="h-4 w-4 text-yellow-500" />
                )}
              </div>
              <Badge variant="outline" className="text-xs">
                {currentQ.points} {currentQ.points === 1 ? "point" : "points"}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {currentQ.category}
              </Badge>
            </div>

            {/* Scenario if exists */}
            {currentQ.scenario && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-2">
                  <BookOpen className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-2">Scenario</h4>
                    <p className="text-blue-800 text-sm leading-relaxed">
                      {currentQ.scenario}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Question Text */}
            <div className="prose prose-gray max-w-none">
              <h3 className="text-lg font-semibold text-gray-900 leading-relaxed">
                {currentQ.text}
              </h3>
            </div>
          </div>
        </div>

        {/* Answer Options */}
        <div className="space-y-3">
          {currentQ.options
            .sort((a, b) => a.order - b.order)
            .map((option) => {
              const isSelected = answers[currentQ.id] === option.id;
              return (
                <label
                  key={option.id}
                  className={`
                    flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-all
                    ${
                      isSelected
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }
                  `}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {isSelected ? (
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <span
                      className={`
                        text-sm leading-relaxed
                        ${
                          isSelected
                            ? "text-blue-900 font-medium"
                            : "text-gray-700"
                        }
                      `}
                    >
                      {option.text}
                    </span>
                  </div>
                  <input
                    type="radio"
                    name={`question-${currentQ.id}`}
                    value={option.id}
                    checked={isSelected}
                    onChange={() => handleAnswerChange(currentQ.id, option.id)}
                    className="sr-only"
                  />
                </label>
              );
            })}
        </div>
      </div>
    );
  };

  const ConfirmSubmitDialog = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-96 mx-4 p-6">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Submit Exam?
          </h2>
          <p className="text-gray-600 mb-2">
            You have answered {answeredQuestions} out of {questions.length}{" "}
            questions.
          </p>
          {answeredQuestions < questions.length && (
            <p className="text-yellow-600 text-sm mb-4">
              You still have {questions.length - answeredQuestions} unanswered
              questions.
            </p>
          )}
          <p className="text-gray-600 mb-6">
            Once submitted, you cannot change your answers.
          </p>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitExam}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Submit Exam
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-900 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {exam.title}
                </h1>
                <p className="text-sm text-gray-500">
                  {exam.category} • {exam.difficulty}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              {/* Timer */}
              <div className="flex items-center space-x-2 text-sm">
                <Timer className="h-4 w-4 text-gray-500" />
                <span
                  className={`font-medium ${
                    timeLeft < 300 ? "text-red-600" : "text-gray-700"
                  }`}
                >
                  {formatTime(timeLeft)}
                </span>
              </div>

              {/* Progress */}
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>
                  {answeredQuestions} / {questions.length}
                </span>
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${(answeredQuestions / questions.length) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-2">
                <div className="text-right text-sm">
                  <p className="font-medium text-gray-900">{user.name}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Content */}
          <div className="lg:col-span-3">
            <Card className="p-6 mb-6">{renderQuestionContent()}</Card>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentQuestion(Math.max(0, currentQuestion - 1))
                  }
                  disabled={currentQuestion === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleMarkForReview(currentQ.id)}
                  className={
                    markedForReview.has(currentQ.id)
                      ? "bg-yellow-50 border-yellow-300 text-yellow-700"
                      : ""
                  }
                >
                  <Flag className="h-4 w-4 mr-2" />
                  {markedForReview.has(currentQ.id) ? "Unmark" : "Mark"} for
                  Review
                </Button>
              </div>

              <div className="flex items-center space-x-3">
                {currentQuestion < questions.length - 1 ? (
                  <Button
                    onClick={() =>
                      setCurrentQuestion(
                        Math.min(questions.length - 1, currentQuestion + 1)
                      )
                    }
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={() => setShowConfirmDialog(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Submit Exam
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Question Grid */}
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Questions</h3>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((question, index) => {
                  const isAnswered = answers[question.id];
                  const isMarked = markedForReview.has(question.id);
                  const isCurrent = index === currentQuestion;

                  return (
                    <button
                      key={question.id}
                      onClick={() => setCurrentQuestion(index)}
                      className={`
                        w-8 h-8 text-xs font-medium rounded border-2 transition-all
                        ${
                          isCurrent
                            ? "border-blue-500 bg-blue-500 text-white"
                            : isAnswered
                            ? "border-green-500 bg-green-50 text-green-700"
                            : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                        }
                        ${isMarked ? "ring-2 ring-yellow-400" : ""}
                      `}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Legend */}
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Legend</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 rounded border-2 border-blue-500"></div>
                  <span>Current</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-50 border-2 border-green-500 rounded"></div>
                  <span>Answered</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded ring-2 ring-yellow-400"></div>
                  <span>Marked</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded"></div>
                  <span>Not answered</span>
                </div>
              </div>
            </Card>

            {/* Quick Stats */}
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Statistics</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Answered</span>
                  <span className="font-medium">{answeredQuestions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Remaining</span>
                  <span className="font-medium">
                    {questions.length - answeredQuestions}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Marked</span>
                  <span className="font-medium">{markedForReview.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">
                    {Math.round((answeredQuestions / questions.length) * 100)}%
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Confirm Submit Dialog */}
      {showConfirmDialog && <ConfirmSubmitDialog />}
    </div>
  );
}
