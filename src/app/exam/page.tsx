"use client";

import { useState, useEffect } from "react";
import { useProtectedPage } from "@/shared/hooks/useAuth";
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
} from "lucide-react";

// Mock exam data - later this will come from our exam features
const mockExamData = {
  title: "AML Certification Exam 2024",
  duration: 7200, // 2 hours in seconds
  totalQuestions: 50,
  passingScore: 70,
};

const mockQuestions = [
  {
    id: 1,
    type: "Multiple Choice",
    cognitiveType: "Remember",
    category: "International Regulatory Framework",
    difficulty: "Basic",
    text: "What are the main obligations of financial institutions in Mexico regarding compliance with the Federal Law for the Prevention and Identification of Operations with Illegal Resources (LFPIORPI)?",
    scenario: null,
    questionType: "multiple_choice",
    options: [
      "A. Comply with Anti-Money Laundering Law only involves reporting unusual operations without additional measures needed.",
      "B. Financial institutions must implement internal controls, operation monitoring, client identification and suspicious activity reports.",
      "C. Obligations are limited to creating a file with client information, without need to report suspicious activities.",
      "D. Financial institutions have no direct responsibility in Money Laundering Prevention Law compliance.",
    ],
    correctAnswer: "B",
    points: 2,
  },
  {
    id: 2,
    type: "True/False",
    cognitiveType: "Understand",
    category: "Compliance Principles",
    difficulty: "Basic",
    text: "The 'Know Your Customer' (KYC) principle only requires requesting official identification from the client to meet minimum AML regulatory requirements.",
    scenario: null,
    questionType: "true_false",
    options: ["True", "False"],
    correctAnswer: "False",
    explanation:
      "The KYC principle is much broader and includes identification, verification, risk assessment and continuous client monitoring.",
    points: 2,
  },
  {
    id: 3,
    type: "Multiple Choice",
    cognitiveType: "Apply",
    category: "Suspicious Operations Detection",
    difficulty: "Intermediate",
    text: "A financial institution client makes a series of cash deposits, each below the reporting threshold, but together exceed the amount established in regulation. What type of practice is this client carrying out?",
    scenario:
      "Scenario: Business client makes 15 deposits of $9,500 each during one week, totaling $142,500. The reporting threshold is $10,000 per individual operation. The client argues these are daily sales from their grocery business.",
    questionType: "multiple_choice",
    options: [
      "A. Structuring (operation fragmentation) - Must be reported as suspicious operation",
      "B. Asset undervaluation - Requires additional document verification",
      "C. Geographic dispersion - It's normal business practice",
      "D. Temporal segmentation - No special action required",
    ],
    correctAnswer: "A",
    points: 4,
  },
];

export default function ExamPage() {
  const { isLoading, isAuthenticated, user, isAdmin } = useProtectedPage();
  const router = useRouter();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [timeLeft, setTimeLeft] = useState(mockExamData.duration);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(
    new Set()
  );
  const [examStarted, setExamStarted] = useState(true); // Set to true for demo

  // Generate more questions for simulation
  const allQuestions = [...mockQuestions];
  for (let i = 4; i <= mockExamData.totalQuestions; i++) {
    const baseQuestion = mockQuestions[(i - 1) % 3];
    allQuestions.push({
      ...baseQuestion,
      id: i,
      text: `${baseQuestion.text} (Variant ${i})`,
    });
  }

  useEffect(() => {
    if (!examStarted) return;

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
  }, [examStarted]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
  };

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleMarkForReview = (questionId: number) => {
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

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case "Multiple Choice":
        return <Circle className="h-4 w-4" />;
      case "True/False":
        return <CheckCircle className="h-4 w-4" />;
      case "Matching":
        return <Target className="h-4 w-4" />;
      default:
        return <Brain className="h-4 w-4" />;
    }
  };

  const getCognitiveTypeIcon = (type: string) => {
    switch (type) {
      case "Remember":
        return <BookOpen className="h-4 w-4" />;
      case "Understand":
        return <Lightbulb className="h-4 w-4" />;
      case "Apply":
        return <Target className="h-4 w-4" />;
      case "Analyze":
        return <Search className="h-4 w-4" />;
      default:
        return <Brain className="h-4 w-4" />;
    }
  };

  const getQuestionTypeColor = (type: string) => {
    switch (type) {
      case "Multiple Choice":
        return "info";
      case "True/False":
        return "success";
      case "Matching":
        return "warning";
      default:
        return "default";
    }
  };

  const getCognitiveTypeColor = (type: string) => {
    switch (type) {
      case "Remember":
        return "info";
      case "Understand":
        return "success";
      case "Apply":
        return "warning";
      case "Analyze":
        return "error";
      default:
        return "default";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Basic":
        return "success";
      case "Intermediate":
        return "warning";
      case "Advanced":
        return "error";
      default:
        return "default";
    }
  };

  const answeredQuestions = Object.keys(answers).length;
  const currentQ = allQuestions[currentQuestion];

  const renderQuestionContent = () => {
    switch (currentQ.questionType) {
      case "true_false":
        return (
          <div className="space-y-4">
            {currentQ.options.map((option, index) => (
              <Card
                key={index}
                className={`border-2 cursor-pointer transition-colors ${
                  answers[currentQ.id] === option
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => handleAnswerChange(currentQ.id, option)}
              >
                <div className="p-6">
                  <div className="flex items-center justify-center space-x-3">
                    <div
                      className={`w-4 h-4 rounded-full border-2 ${
                        answers[currentQ.id] === option
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-300"
                      }`}
                    >
                      {answers[currentQ.id] === option && (
                        <div className="w-full h-full rounded-full bg-white scale-50"></div>
                      )}
                    </div>
                    <span className="text-lg font-medium cursor-pointer">
                      {option}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        );

      default: // multiple_choice
        return (
          <div className="space-y-3">
            {currentQ.options.map((option, index) => (
              <Card
                key={index}
                className={`border-2 cursor-pointer transition-colors ${
                  answers[currentQ.id] === option
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => handleAnswerChange(currentQ.id, option)}
              >
                <div className="p-4">
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-4 h-4 rounded-full border-2 mt-1 ${
                        answers[currentQ.id] === option
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-300"
                      }`}
                    >
                      {answers[currentQ.id] === option && (
                        <div className="w-full h-full rounded-full bg-white scale-50"></div>
                      )}
                    </div>
                    <span className="text-sm leading-relaxed cursor-pointer">
                      {option}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        );
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600">Loading exam...</p>
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
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b h-16 flex-shrink-0">
        <div className="px-6 py-4 h-full">
          <div className="flex justify-between items-center h-full">
            {/* Logo and System */}
            <div className="flex items-center space-x-4">
              <div className="bg-blue-900 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">AML System</h1>
                <p className="text-sm text-gray-600">Certification Exam</p>
              </div>
            </div>

            {/* Candidate Info */}
            <div className="flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-lg">
              <User className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  {user.name}
                </p>
                <p className="text-xs text-gray-600">Compliance Officer</p>
              </div>
            </div>

            {/* Controls */}
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
        {/* Side Panel */}
        <div className="w-80 bg-white shadow-lg border-r flex flex-col">
          {/* Panel Title */}
          <div className="p-4 border-b bg-gray-50">
            <h2 className="font-bold text-gray-800 text-center">
              Question Navigator
            </h2>
          </div>

          {/* Questions Grid */}
          <div className="p-4 border-b flex-1 overflow-y-auto">
            <div className="grid grid-cols-8 gap-1 mb-4">
              {allQuestions.map((question, index) => (
                <button
                  key={question.id}
                  onClick={() => setCurrentQuestion(index)}
                  className={`
                    w-8 h-8 text-xs font-semibold rounded border transition-colors
                    ${
                      index === currentQuestion
                        ? "bg-blue-600 text-white border-blue-600"
                        : answers[question.id]
                        ? "bg-green-500 text-white border-green-500"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }
                    ${
                      markedForReview.has(question.id)
                        ? "ring-2 ring-yellow-400"
                        : ""
                    }
                  `}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            {/* Legend */}
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

          {/* Timer and Progress */}
          <div className="p-4 border-b">
            <div className="text-center mb-4">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Clock className="h-5 w-5 text-gray-600" />
                <span className="text-xl font-bold text-gray-800">
                  {formatTime(timeLeft)}
                </span>
              </div>
              <p className="text-sm text-gray-600">Time Remaining</p>
            </div>

            <div className="text-center">
              <p className="text-lg font-bold text-gray-800 mb-1">
                {answeredQuestions}/{mockExamData.totalQuestions}
              </p>
              <p className="text-sm text-gray-600 mb-2">Completed</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      (answeredQuestions / mockExamData.totalQuestions) * 100
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="p-4">
            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={() => setShowConfirmDialog(true)}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Submit Exam
            </Button>
          </div>
        </div>

        {/* Main Area */}
        <div className="flex-1 flex flex-col">
          {/* Question Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              {/* Question Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-800">
                    Question {currentQuestion + 1}.
                  </h2>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getQuestionTypeColor(currentQ.type)}>
                      {getQuestionTypeIcon(currentQ.type)}
                      <span className="ml-1">{currentQ.type}</span>
                    </Badge>
                    <Badge
                      variant={getCognitiveTypeColor(currentQ.cognitiveType)}
                    >
                      {getCognitiveTypeIcon(currentQ.cognitiveType)}
                      <span className="ml-1">{currentQ.cognitiveType}</span>
                    </Badge>
                    <Badge variant={getDifficultyColor(currentQ.difficulty)}>
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

              {/* Answer Options */}
              {renderQuestionContent()}
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="bg-white border-t p-4 flex-shrink-0">
            <div className="max-w-4xl mx-auto flex justify-between items-center">
              <Button
                variant="outline"
                onClick={() =>
                  setCurrentQuestion((prev) => Math.max(0, prev - 1))
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
                    ? "bg-yellow-50 border-yellow-300 text-yellow-800"
                    : ""
                }
              >
                <Flag className="h-4 w-4 mr-2" />
                Mark for Review
              </Button>

              <Button
                onClick={() =>
                  setCurrentQuestion((prev) =>
                    Math.min(allQuestions.length - 1, prev + 1)
                  )
                }
                disabled={currentQuestion === allQuestions.length - 1}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96 mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                Confirm Exam Submission
              </h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to submit your exam?
                <br />
                <br />
                Questions answered: {answeredQuestions} of{" "}
                {mockExamData.totalQuestions}
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
