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

  const getQuestionTypeColor = (type: string) => {
    switch (type) {
      case "MULTIPLE_CHOICE":
        return "bg-blue-100 text-blue-800";
      case "TRUE_FALSE":
        return "bg-green-100 text-green-800";
      case "MATCHING":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCognitiveTypeColor = (type: string) => {
    switch (type) {
      case "REMEMBER":
        return "bg-blue-100 text-blue-800";
      case "UNDERSTAND":
        return "bg-green-100 text-green-800";
      case "APPLY":
        return "bg-amber-100 text-amber-800";
      case "ANALYZE":
        return "bg-purple-100 text-purple-800";
      case "EVALUATE":
        return "bg-red-100 text-red-800";
      case "CREATE":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "BASIC":
        return "bg-emerald-100 text-emerald-800";
      case "INTERMEDIATE":
        return "bg-yellow-100 text-yellow-800";
      case "ADVANCED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const renderQuestionContent = () => {
    if (!currentQ) return null;

    switch (currentQ.type) {
      case "TRUE_FALSE":
        return (
          <div className="space-y-4">
            {["True", "False"].map((option, index) => {
              const isSelected = answers[currentQ.id] === option;
              return (
                <Card
                  key={index}
                  className={`border-2 cursor-pointer transition-colors ${
                    isSelected
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => handleAnswerChange(currentQ.id, option)}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-center space-x-3">
                      {isSelected ? (
                        <CheckCircle className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-400" />
                      )}
                      <span className="text-lg font-medium">{option}</span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        );

      default: // MULTIPLE_CHOICE
        return (
          <div className="space-y-3">
            {currentQ.options
              .sort((a, b) => a.order - b.order)
              .map((option) => {
                const isSelected = answers[currentQ.id] === option.id;
                return (
                  <Card
                    key={option.id}
                    className={`border-2 cursor-pointer transition-colors ${
                      isSelected
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => handleAnswerChange(currentQ.id, option.id)}
                  >
                    <div className="p-4">
                      <div className="flex items-start space-x-3">
                        {isSelected ? (
                          <CheckCircle className="h-5 w-5 text-blue-600 mt-1" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-400 mt-1" />
                        )}
                        <span className="text-sm leading-relaxed">
                          {option.text}
                        </span>
                      </div>
                    </div>
                  </Card>
                );
              })}
          </div>
        );
    }
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
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b h-16 flex-shrink-0">
        <div className="px-6 py-4 h-full">
          <div className="flex justify-between items-center h-full">
            {/* Logo y Sistema */}
            <div className="flex items-center space-x-4">
              <div className="bg-blue-900 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">
                  {exam.title}
                </h1>
                <p className="text-sm text-gray-600">
                  {exam.category} • {exam.difficulty}
                </p>
              </div>
            </div>

            {/* Info del Candidato */}
            <div className="flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-lg">
              <User className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  {user.name}
                </p>
                <p className="text-xs text-gray-600">{user.email}</p>
              </div>
            </div>

            {/* Controles */}
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Pause className="h-4 w-4 mr-1" />
                Pause
              </Button>
              <Button variant="outline" size="sm">
                <HelpCircle className="h-4 w-4 mr-1" />
                Help
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-1" />
                Exit
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Panel Lateral Izquierdo */}
        <div className="w-80 bg-white shadow-lg border-r flex flex-col">
          {/* Título del Panel */}
          <div className="p-4 border-b bg-gray-50">
            <h2 className="font-bold text-gray-800 text-center">
              Question List
            </h2>
          </div>

          {/* Grid de Preguntas */}
          <div className="p-4 border-b flex-1 overflow-y-auto">
            <div className="grid grid-cols-8 gap-1 mb-4">
              {questions.map((question, index) => {
                const isAnswered = answers[question.id];
                const isMarked = markedForReview.has(question.id);
                const isCurrent = index === currentQuestion;

                return (
                  <button
                    key={question.id}
                    onClick={() => setCurrentQuestion(index)}
                    className={`
                      w-8 h-8 text-xs font-semibold rounded border transition-colors
                      ${
                        isCurrent
                          ? "bg-blue-600 text-white border-blue-600"
                          : isAnswered
                          ? "bg-green-500 text-white border-green-500"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }
                      ${isMarked ? "ring-2 ring-yellow-400" : ""}
                    `}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>

            {/* Leyenda */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-600 rounded"></div>
                <span>Current</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Answered</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-white rounded border border-gray-300"></div>
                <span>Pending</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-white rounded border border-gray-300 ring-2 ring-yellow-400"></div>
                <span>Marked</span>
              </div>
            </div>
          </div>

          {/* Timer y Progreso */}
          <div className="p-4 border-b">
            <div className="text-center mb-4">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Clock className="h-5 w-5 text-gray-600" />
                <span
                  className={`text-xl font-bold ${
                    timeLeft < 300 ? "text-red-600" : "text-gray-800"
                  }`}
                >
                  {formatTime(timeLeft)}
                </span>
              </div>
              <p className="text-sm text-gray-600">Time Remaining</p>
            </div>

            <div className="text-center">
              <p className="text-lg font-bold text-gray-800 mb-1">
                {answeredQuestions}/{questions.length}
              </p>
              <p className="text-sm text-gray-600 mb-2">Completed</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${(answeredQuestions / questions.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Botón Terminar */}
          <div className="p-4">
            <Button
              onClick={() => setShowConfirmDialog(true)}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Submit Exam
            </Button>
          </div>
        </div>

        {/* Área Principal - Preguntas */}
        <div className="flex-1 flex flex-col">
          {/* Contenido de la Pregunta */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              {/* Header de la Pregunta */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-800">
                    Question {currentQuestion + 1}.
                  </h2>
                  <div className="flex items-center space-x-2">
                    <Badge className={getQuestionTypeColor(currentQ.type)}>
                      <Brain className="h-4 w-4 mr-1" />
                      {currentQ.type.replace("_", " ")}
                    </Badge>
                    <Badge
                      className={getCognitiveTypeColor(currentQ.cognitiveType)}
                    >
                      <Lightbulb className="h-4 w-4 mr-1" />
                      {currentQ.cognitiveType}
                    </Badge>
                    <Badge className={getDifficultyColor(currentQ.difficulty)}>
                      {currentQ.difficulty}
                    </Badge>
                    <Badge variant="outline">{currentQ.points} points</Badge>
                  </div>
                </div>

                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Category:</span>{" "}
                    {currentQ.category}
                  </p>
                </div>

                {currentQ.scenario && (
                  <Card className="mb-6 border-blue-200 bg-blue-50">
                    <div className="p-4">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="h-5 w-5 text-blue-600 mt-1" />
                        <div>
                          <h4 className="font-bold text-blue-900 mb-2">
                            Scenario
                          </h4>
                          <p className="text-blue-800 text-sm">
                            {currentQ.scenario}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                <div className="mb-6">
                  <p className="text-gray-900 leading-relaxed">
                    {currentQ.text}
                  </p>
                </div>

                <div className="text-center mb-6">
                  <p className="text-gray-700 font-medium bg-gray-100 inline-block px-4 py-2 rounded">
                    Select the correct answer
                  </p>
                </div>
              </div>

              {/* Opciones de Respuesta */}
              {renderQuestionContent()}
            </div>
          </div>

          {/* Navegación Inferior */}
          <div className="bg-white border-t p-4 flex-shrink-0">
            <div className="max-w-4xl mx-auto flex justify-between items-center">
              <Button
                variant="outline"
                onClick={() =>
                  setCurrentQuestion((prev) => Math.max(0, prev - 1))
                }
                disabled={currentQuestion === 0}
                className="flex items-center space-x-2"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => handleMarkForReview(currentQ.id)}
                className={`flex items-center space-x-2 ${
                  markedForReview.has(currentQ.id)
                    ? "bg-yellow-50 border-yellow-300 text-yellow-800"
                    : ""
                }`}
              >
                <Flag className="h-4 w-4" />
                <span>
                  {markedForReview.has(currentQ.id) ? "Unmark" : "Mark"}
                </span>
              </Button>

              <Button
                onClick={() =>
                  setCurrentQuestion((prev) =>
                    Math.min(questions.length - 1, prev + 1)
                  )
                }
                disabled={currentQuestion === questions.length - 1}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Submit Dialog */}
      {showConfirmDialog && <ConfirmSubmitDialog />}
    </div>
  );
}
