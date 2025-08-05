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

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case "MULTIPLE_CHOICE":
        return <Circle className="h-4 w-4" />;
      case "TRUE_FALSE":
        return <CheckCircle className="h-4 w-4" />;
      case "MATCHING":
        return <Target className="h-4 w-4" />;
      default:
        return <Brain className="h-4 w-4" />;
    }
  };

  const getCognitiveTypeIcon = (type: string) => {
    switch (type) {
      case "REMEMBER":
        return <BookOpen className="h-4 w-4" />;
      case "UNDERSTAND":
        return <Lightbulb className="h-4 w-4" />;
      case "APPLY":
        return <Target className="h-4 w-4" />;
      case "ANALYZE":
        return <Search className="h-4 w-4" />;
      default:
        return <Brain className="h-4 w-4" />;
    }
  };

  const getQuestionTypeColor = (type: string) => {
    switch (type) {
      case "MULTIPLE_CHOICE":
        return "info";
      case "TRUE_FALSE":
        return "success";
      case "MATCHING":
        return "warning";
      default:
        return "default";
    }
  };

  const getCognitiveTypeColor = (type: string) => {
    switch (type) {
      case "REMEMBER":
        return "info";
      case "UNDERSTAND":
        return "success";
      case "APPLY":
        return "warning";
      case "ANALYZE":
        return "error";
      default:
        return "default";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "BASIC":
        return "success";
      case "INTERMEDIATE":
        return "warning";
      case "ADVANCED":
        return "error";
      default:
        return "default";
    }
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

    switch (currentQ.type) {
      case "TRUE_FALSE":
        return (
          <div className="space-y-4">
            {["True", "False"].map((option, index) => (
              <div
                key={index}
                className={`group relative overflow-hidden rounded-2xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                  answers[currentQ.id] === option
                    ? "border-green-400 bg-gradient-to-r from-green-50 to-green-100 shadow-lg shadow-green-200/50"
                    : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-md"
                }`}
                onClick={() => handleAnswerChange(currentQ.id, option)}
              >
                <div className="p-6">
                  <div className="flex items-center justify-center space-x-4">
                    <div
                      className={`w-6 h-6 rounded-full border-3 transition-all duration-300 ${
                        answers[currentQ.id] === option
                          ? "border-green-500 bg-green-500 shadow-lg shadow-green-300/50"
                          : "border-gray-300 group-hover:border-blue-400"
                      }`}
                    >
                      {answers[currentQ.id] === option && (
                        <div className="w-full h-full rounded-full bg-white scale-50 flex items-center justify-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                      )}
                    </div>
                    <span
                      className={`text-xl font-semibold cursor-pointer transition-colors ${
                        answers[currentQ.id] === option
                          ? "text-green-800"
                          : "text-gray-700 group-hover:text-blue-700"
                      }`}
                    >
                      {option}
                    </span>
                  </div>
                </div>

                {/* Selection indicator */}
                {answers[currentQ.id] === option && (
                  <div className="absolute top-3 right-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        );

      default: // MULTIPLE_CHOICE
        return (
          <div className="space-y-4">
            {currentQ.options
              .sort((a, b) => a.order - b.order)
              .map((option, index) => {
                const isSelected = answers[currentQ.id] === option.id;
                const optionLetter = String.fromCharCode(65 + index); // A, B, C, D

                return (
                  <div
                    key={option.id}
                    className={`group relative overflow-hidden rounded-2xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-[1.01] ${
                      isSelected
                        ? "border-blue-400 bg-gradient-to-r from-blue-50 to-blue-100 shadow-lg shadow-blue-200/50"
                        : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-md hover:bg-gray-50"
                    }`}
                    onClick={() => handleAnswerChange(currentQ.id, option.id)}
                  >
                    <div className="p-5">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 mt-1">
                          <div
                            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                              isSelected
                                ? "border-blue-500 bg-blue-500 text-white shadow-lg shadow-blue-300/50"
                                : "border-gray-300 text-gray-600 group-hover:border-blue-400 group-hover:text-blue-600"
                            }`}
                          >
                            {isSelected ? "✓" : optionLetter}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <span
                            className={`text-gray-900 cursor-pointer leading-relaxed font-medium transition-colors ${
                              isSelected
                                ? "text-blue-900"
                                : "group-hover:text-blue-800"
                            }`}
                          >
                            {option.text}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Selection indicator */}
                    {isSelected && (
                      <div className="absolute top-3 right-3">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    )}

                    {/* Hover effect line */}
                    <div
                      className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300 ${
                        isSelected ? "w-full" : "w-0 group-hover:w-full"
                      }`}
                    ></div>
                  </div>
                );
              })}
          </div>
        );
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-white via-gray-50 to-white shadow-lg border-b border-gray-200 h-20 flex-shrink-0">
        <div className="px-8 py-4 h-full">
          <div className="flex justify-between items-center h-full">
            {/* Logo and System */}
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-2xl shadow-lg">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {exam.title}
                </h1>
                <p className="text-sm text-gray-600 font-medium">
                  {exam.category} • {exam.difficulty}
                </p>
              </div>
            </div>

            {/* Exam Status Indicator */}
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-600">
                  Exam Session
                </div>
                <div className="text-lg font-bold text-blue-600">
                  {exam.title}
                </div>
              </div>

              <div className="w-px h-12 bg-gray-300"></div>

              {/* Candidate Info */}
              <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-3 rounded-2xl border border-blue-200 shadow-sm">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{user.name}</p>
                  <p className="text-xs text-blue-700 font-medium">
                    Exam Candidate
                  </p>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                className="bg-white hover:bg-gray-50 border-2 border-gray-300 hover:border-yellow-400 px-4 py-2 font-semibold shadow-md transition-all duration-300"
              >
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-white hover:bg-blue-50 border-2 border-gray-300 hover:border-blue-400 px-4 py-2 font-semibold shadow-md transition-all duration-300"
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                Help
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="bg-white hover:bg-red-50 border-2 border-gray-300 hover:border-red-400 text-gray-700 hover:text-red-700 px-4 py-2 font-semibold shadow-md transition-all duration-300"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Exit
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Side Panel */}
        <div className="w-80 bg-white shadow-xl flex flex-col">
          {/* Panel Title */}
          <div className="p-6 bg-gradient-to-b from-gray-50 to-white">
            <h2 className="font-semibold text-gray-700 text-center tracking-wide">
              Question Navigator
            </h2>
          </div>

          {/* Questions Grid */}
          <div className="p-5 flex-1 overflow-y-auto">
            <div className="grid grid-cols-8 gap-3 mb-6">
              {questions.map((question, index) => {
                const isCurrent = index === currentQuestion;
                const isAnswered = answers[question.id];
                const isMarked = markedForReview.has(question.id);

                return (
                  <button
                    key={question.id}
                    onClick={() => setCurrentQuestion(index)}
                    className={`
                      w-9 h-9 text-xs font-medium rounded-lg transition-all duration-200 hover:scale-105
                      ${
                        isCurrent
                          ? "bg-slate-700 text-white shadow-lg shadow-slate-300/50"
                          : isAnswered
                          ? "bg-emerald-100 text-emerald-800 shadow-md hover:shadow-lg border border-emerald-200"
                          : "bg-white text-gray-500 shadow-sm hover:shadow-md hover:bg-gray-50 border border-gray-200"
                      }
                      ${isMarked ? "ring-2 ring-amber-300 ring-offset-1" : ""}
                    `}
                  >
                    {isAnswered && !isCurrent && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full"></div>
                    )}
                    {index + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="bg-gray-50 rounded-xl p-3 shadow-sm">
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-slate-700 rounded-md shadow-sm"></div>
                  <span className="font-medium">Current</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-emerald-100 rounded-md shadow-sm border border-emerald-200 flex items-center justify-center">
                    <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                  </div>
                  <span className="font-medium">Answered</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-white rounded-md shadow-sm border border-gray-200"></div>
                  <span className="font-medium">Pending</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-white rounded-md shadow-sm border border-gray-200 ring-2 ring-amber-300"></div>
                  <span className="font-medium">Marked</span>
                </div>
              </div>
            </div>
          </div>

          {/* Timer and Progress - Compact */}
          <div className="p-5 bg-gray-50 shadow-sm">
            {/* Timer Section */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-600">
                    Time
                  </span>
                </div>
                <span className="text-lg font-semibold text-gray-800 tracking-wide">
                  {formatTime(timeLeft)}
                </span>
              </div>
              {timeLeft < 600 && ( // 10 minutes warning
                <div className="flex items-center justify-center py-1 px-2 bg-amber-100 rounded-md">
                  <span className="text-amber-700 font-medium text-xs">
                    ⚠ Low Time
                  </span>
                </div>
              )}
            </div>

            {/* Progress Section */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-600">
                    Progress
                  </span>
                </div>
                <span className="text-lg font-semibold text-gray-800">
                  {answeredQuestions}/{questions.length}
                </span>
              </div>

              <div className="mb-2">
                <div className="w-full bg-gray-200 rounded-full h-2 shadow-inner">
                  <div
                    className="bg-slate-600 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${(answeredQuestions / questions.length) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>
                  {Math.round((answeredQuestions / questions.length) * 100)}%
                  Complete
                </span>
                <span>{markedForReview.size} Marked</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="p-5">
            <Button
              className="w-full bg-slate-700 hover:bg-slate-800 text-white font-medium py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={() => setShowConfirmDialog(true)}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Submit Exam
            </Button>
          </div>
        </div>

        {/* Main Area */}
        <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-100">
          {/* Question Content */}
          <div className="flex-1 p-8 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              {/* Question Header */}
              <div className="mb-8">
                {/* Question Number and Status */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-lg">
                          {currentQuestion + 1}
                        </span>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          Question {currentQuestion + 1}
                        </h2>
                        <p className="text-gray-600 text-sm">
                          of {questions.length} questions
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {answers[currentQ.id] && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-green-100 border border-green-300 rounded-lg">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-green-800 font-medium text-sm">
                            Answered
                          </span>
                        </div>
                      )}
                      {markedForReview.has(currentQ.id) && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 border border-yellow-300 rounded-lg">
                          <Flag className="h-4 w-4 text-yellow-600" />
                          <span className="text-yellow-800 font-medium text-sm">
                            Marked
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Question Properties */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                      <div className="flex items-center gap-2 mb-1">
                        {getQuestionTypeIcon(currentQ.type)}
                        <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                          Type
                        </span>
                      </div>
                      <Badge
                        variant={getQuestionTypeColor(currentQ.type)}
                        className="w-full justify-center"
                      >
                        {currentQ.type.replace("_", " ")}
                      </Badge>
                    </div>

                    <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                      <div className="flex items-center gap-2 mb-1">
                        {getCognitiveTypeIcon(currentQ.cognitiveType)}
                        <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
                          Level
                        </span>
                      </div>
                      <Badge
                        variant={getCognitiveTypeColor(currentQ.cognitiveType)}
                        className="w-full justify-center"
                      >
                        {currentQ.cognitiveType}
                      </Badge>
                    </div>

                    <div className="p-3 bg-orange-50 rounded-xl border border-orange-100">
                      <div className="flex items-center gap-2 mb-1">
                        <Target className="h-3 w-3 text-orange-600" />
                        <span className="text-xs font-semibold text-orange-700 uppercase tracking-wide">
                          Difficulty
                        </span>
                      </div>
                      <Badge
                        variant={getDifficultyColor(currentQ.difficulty)}
                        className="w-full justify-center"
                      >
                        {currentQ.difficulty}
                      </Badge>
                    </div>

                    <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                      <div className="flex items-center gap-2 mb-1">
                        <Circle className="h-3 w-3 text-green-600" />
                        <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">
                          Points
                        </span>
                      </div>
                      <div className="text-xl font-bold text-green-800 text-center">
                        {currentQ.points}
                      </div>
                    </div>
                  </div>

                  {/* Category */}
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                      <BookOpen className="h-4 w-4 text-gray-600" />
                      <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        Category
                      </span>
                    </div>
                    <p className="text-gray-800 font-medium">
                      {currentQ.category}
                    </p>
                  </div>
                </div>

                {/* Scenario */}
                {currentQ.scenario && (
                  <div className="bg-white rounded-2xl p-6 border border-amber-200 shadow-sm mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-amber-900">
                        Scenario
                      </h3>
                    </div>
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                      <p className="text-amber-800 leading-relaxed">
                        {currentQ.scenario}
                      </p>
                    </div>
                  </div>
                )}

                {/* Question Text */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <HelpCircle className="h-4 w-4 text-gray-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Question
                    </h3>
                  </div>
                  <div className="p-6 bg-gray-50 border border-gray-200 rounded-xl">
                    <p className="text-gray-900 leading-relaxed text-lg font-medium">
                      {currentQ.text}
                    </p>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 shadow-sm mb-8">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <Lightbulb className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-blue-800 font-semibold text-lg">
                      Select the correct answer below
                    </p>
                  </div>
                </div>
              </div>

              {/* Answer Options */}
              <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Target className="h-4 w-4 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Answer Options
                  </h3>
                </div>

                {renderQuestionContent()}
              </div>
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="bg-gradient-to-r from-white via-gray-50 to-white border-t border-gray-200 p-6 flex-shrink-0 shadow-lg">
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentQuestion((prev) => Math.max(0, prev - 1))
                  }
                  disabled={currentQuestion === 0}
                  className="bg-white hover:bg-gray-50 border-2 border-gray-300 hover:border-gray-400 px-6 py-3 font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  <ChevronLeft className="h-5 w-5 mr-2" />
                  Previous
                </Button>

                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => handleMarkForReview(currentQ.id)}
                    className={`px-6 py-3 font-semibold transition-all duration-300 border-2 shadow-md ${
                      markedForReview.has(currentQ.id)
                        ? "bg-gradient-to-r from-yellow-100 to-yellow-200 border-yellow-400 text-yellow-800 hover:from-yellow-200 hover:to-yellow-300"
                        : "bg-white hover:bg-gray-50 border-gray-300 hover:border-yellow-400 text-gray-700 hover:text-yellow-700"
                    }`}
                  >
                    <Flag className="h-5 w-5 mr-2" />
                    {markedForReview.has(currentQ.id)
                      ? "Unmark"
                      : "Mark for Review"}
                  </Button>

                  <div className="text-center px-4">
                    <div className="text-sm font-medium text-gray-600">
                      Question
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      {currentQuestion + 1} of {questions.length}
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() =>
                    setCurrentQuestion((prev) =>
                      Math.min(questions.length - 1, prev + 1)
                    )
                  }
                  disabled={currentQuestion === questions.length - 1}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed border-0"
                >
                  {currentQuestion === questions.length - 1 ? "Finish" : "Next"}
                  <ChevronRight className="h-5 w-5 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Dialog */}
      {showConfirmDialog && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <Card className="w-96 mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                Confirm Exam Submission
              </h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to submit your exam?
                <br />
                <br />
                Questions answered: {answeredQuestions} of {questions.length}
                <br />
                This action cannot be undone.
              </p>
              <div className="flex space-x-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleSubmitExam}
                >
                  Submit Exam
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
