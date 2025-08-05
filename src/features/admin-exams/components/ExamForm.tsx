"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Input,
  Select,
  TextArea,
  FormField,
} from "@/core/components";
import {
  BookOpen,
  Clock,
  Target,
  Plus,
  Search,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  FileText,
  Brain,
  Users,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Exam,
  CreateExamInput,
  UpdateExamInput,
  ExamFormState,
  ExamDifficulty,
  ExamStatus,
  ExamType,
  EXAM_CATEGORIES,
  EXAM_DIFFICULTY_LABELS,
  EXAM_STATUS_LABELS,
  EXAM_TYPE_LABELS,
  EXAM_VALIDATION,
  Question,
} from "../types/exam";
import { useQuestionsForExam } from "../hooks/useAdminExams";
import {
  QUESTION_TYPE_LABELS,
  COGNITIVE_TYPE_LABELS,
  DIFFICULTY_LABELS,
} from "../types/question";

// ===========================================
// INTERFACES
// ===========================================

interface ExamFormProps {
  exam?: Exam;
  onSave: (data: CreateExamInput | UpdateExamInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

// ===========================================
// STEP COMPONENTS
// ===========================================

interface StepIndicatorProps {
  currentStep: ExamFormState["currentStep"];
  onStepClick?: (step: ExamFormState["currentStep"]) => void;
}

function StepIndicator({ currentStep, onStepClick }: StepIndicatorProps) {
  const steps = [
    { key: "basic" as const, label: "Basic Information", icon: FileText },
    { key: "questions" as const, label: "Questions", icon: Brain },
    { key: "review" as const, label: "Review", icon: Check },
  ];

  return (
    <div className="flex items-center justify-center space-x-8 mb-8">
      {steps.map((step, index) => {
        const isActive = currentStep === step.key;
        const isCompleted =
          steps.findIndex((s) => s.key === currentStep) > index;
        const Icon = step.icon;

        return (
          <div key={step.key} className="flex items-center">
            <div
              className={cn(
                "flex items-center space-x-3 cursor-pointer transition-all duration-200",
                onStepClick && "hover:scale-105"
              )}
              onClick={() => onStepClick?.(step.key)}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                  isActive &&
                    "bg-blue-500 text-white shadow-lg shadow-blue-300/50",
                  isCompleted &&
                    "bg-green-500 text-white shadow-lg shadow-green-300/50",
                  !isActive && !isCompleted && "bg-gray-100 text-gray-400"
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span
                className={cn(
                  "font-medium transition-colors",
                  isActive && "text-blue-600",
                  isCompleted && "text-green-600",
                  !isActive && !isCompleted && "text-gray-400"
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "w-16 h-0.5 mx-4 transition-colors",
                  isCompleted ? "bg-green-300" : "bg-gray-200"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ===========================================
// QUESTION SELECTION COMPONENT
// ===========================================

interface QuestionSelectionProps {
  selectedQuestions: Question[];
  onQuestionsChange: (questions: Question[]) => void;
  excludeExamId?: string;
}

function QuestionSelection({
  selectedQuestions,
  onQuestionsChange,
  excludeExamId,
}: QuestionSelectionProps) {
  const { questions, loading, fetchQuestions } = useQuestionsForExam();
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    type: "",
    difficulty: "",
    category: "",
  });

  useEffect(() => {
    fetchQuestions({
      ...(excludeExamId && { excludeExamId }),
      search: searchTerm,
      ...filters,
    });
  }, [searchTerm, filters, excludeExamId, fetchQuestions]);

  const handleQuestionToggle = (question: Question) => {
    const isSelected = selectedQuestions.some((q) => q.id === question.id);
    if (isSelected) {
      onQuestionsChange(selectedQuestions.filter((q) => q.id !== question.id));
    } else {
      onQuestionsChange([...selectedQuestions, question]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <FormField label="Search Questions">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search questions..."
                className="pl-10"
              />
            </div>
          </FormField>

          <FormField label="Type">
            <Select
              value={filters.type}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, type: e.target.value }))
              }
            >
              <option value="">All Types</option>
              {Object.entries(QUESTION_TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Difficulty">
            <Select
              value={filters.difficulty}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, difficulty: e.target.value }))
              }
            >
              <option value="">All Difficulties</option>
              {Object.entries(DIFFICULTY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Category">
            <Select
              value={filters.category}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, category: e.target.value }))
              }
            >
              <option value="">All Categories</option>
              {/* Add question categories here */}
            </Select>
          </FormField>
        </div>
      </div>

      {/* Selected Questions Summary */}
      {selectedQuestions.length > 0 && (
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Check className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">
                  {selectedQuestions.length} Questions Selected
                </h3>
                <p className="text-blue-700 text-sm">
                  Total Points:{" "}
                  {selectedQuestions.reduce((sum, q) => sum + q.points, 0)}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onQuestionsChange([])}
              className="text-blue-700 border-blue-300"
            >
              Clear All
            </Button>
          </div>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading questions...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No questions found matching your criteria</p>
          </div>
        ) : (
          questions.map((question: Question) => {
            const isSelected = selectedQuestions.some(
              (q) => q.id === question.id
            );
            return (
              <div
                key={question.id}
                className={cn(
                  "p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
                  isSelected
                    ? "border-blue-400 bg-blue-50 shadow-md"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                )}
                onClick={() => handleQuestionToggle(question)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={cn(
                          "w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all",
                          isSelected
                            ? "border-blue-500 bg-blue-500 text-white"
                            : "border-gray-300 text-gray-400"
                        )}
                      >
                        {isSelected ? "✓" : "?"}
                      </span>
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded-md font-medium">
                        {QUESTION_TYPE_LABELS[question.type]}
                      </span>
                      <span className="text-xs px-2 py-1 bg-yellow-100 rounded-md font-medium">
                        {DIFFICULTY_LABELS[question.difficulty]}
                      </span>
                      <span className="text-xs px-2 py-1 bg-purple-100 rounded-md font-medium">
                        {question.points} pts
                      </span>
                    </div>
                    <p className="text-gray-900 font-medium mb-1 line-clamp-2">
                      {question.text}
                    </p>
                    <p className="text-gray-600 text-sm">
                      Category: {question.category}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ===========================================
// MAIN COMPONENT
// ===========================================

export default function ExamForm({
  exam,
  onSave,
  onCancel,
  isLoading = false,
}: ExamFormProps) {
  const isEditing = !!exam;

  // Form state
  const [formState, setFormState] = useState<ExamFormState>({
    title: exam?.title || "",
    description: exam?.description || "",
    category: exam?.category || EXAM_CATEGORIES[0],
    difficulty: exam?.difficulty || ExamDifficulty.BASIC,
    examType: exam?.examType || "SCHEDULED", // Default to SCHEDULED
    duration: exam?.duration || 60,
    passingScore: exam?.passingScore || 70,
    selectedQuestions: exam?.questions || [],
    currentStep: "basic",
    errors: {},
    isSubmitting: false,
  });

  // Validation
  const validateBasicInfo = () => {
    const errors: Record<string, string> = {};

    if (!formState.title.trim()) {
      errors.title = "Title is required";
    } else if (formState.title.length < EXAM_VALIDATION.TITLE.MIN_LENGTH) {
      errors.title = `Title must be at least ${EXAM_VALIDATION.TITLE.MIN_LENGTH} characters`;
    } else if (formState.title.length > EXAM_VALIDATION.TITLE.MAX_LENGTH) {
      errors.title = `Title must not exceed ${EXAM_VALIDATION.TITLE.MAX_LENGTH} characters`;
    }

    if (
      formState.description &&
      formState.description.length > EXAM_VALIDATION.DESCRIPTION.MAX_LENGTH
    ) {
      errors.description = `Description must not exceed ${EXAM_VALIDATION.DESCRIPTION.MAX_LENGTH} characters`;
    }

    if (formState.duration < EXAM_VALIDATION.DURATION.MIN_MINUTES) {
      errors.duration = `Duration must be at least ${EXAM_VALIDATION.DURATION.MIN_MINUTES} minutes`;
    } else if (formState.duration > EXAM_VALIDATION.DURATION.MAX_MINUTES) {
      errors.duration = `Duration must not exceed ${EXAM_VALIDATION.DURATION.MAX_MINUTES} minutes`;
    }

    if (formState.passingScore < EXAM_VALIDATION.PASSING_SCORE.MIN) {
      errors.passingScore = `Passing score must be at least ${EXAM_VALIDATION.PASSING_SCORE.MIN}%`;
    } else if (formState.passingScore > EXAM_VALIDATION.PASSING_SCORE.MAX) {
      errors.passingScore = `Passing score must not exceed ${EXAM_VALIDATION.PASSING_SCORE.MAX}%`;
    }

    setFormState((prev) => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  };

  const validateQuestions = () => {
    const errors: Record<string, string> = {};

    if (
      formState.selectedQuestions.length < EXAM_VALIDATION.QUESTIONS.MIN_COUNT
    ) {
      errors.questions = `Exam must have at least ${EXAM_VALIDATION.QUESTIONS.MIN_COUNT} questions`;
    } else if (
      formState.selectedQuestions.length > EXAM_VALIDATION.QUESTIONS.MAX_COUNT
    ) {
      errors.questions = `Exam cannot have more than ${EXAM_VALIDATION.QUESTIONS.MAX_COUNT} questions`;
    }

    setFormState((prev) => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  };

  // Step navigation
  const handleNextStep = () => {
    if (formState.currentStep === "basic" && validateBasicInfo()) {
      setFormState((prev) => ({ ...prev, currentStep: "questions" }));
    } else if (formState.currentStep === "questions" && validateQuestions()) {
      setFormState((prev) => ({ ...prev, currentStep: "review" }));
    }
  };

  const handlePrevStep = () => {
    if (formState.currentStep === "questions") {
      setFormState((prev) => ({ ...prev, currentStep: "basic" }));
    } else if (formState.currentStep === "review") {
      setFormState((prev) => ({ ...prev, currentStep: "questions" }));
    }
  };

  const handleStepClick = (step: ExamFormState["currentStep"]) => {
    if (step === "basic") {
      setFormState((prev) => ({ ...prev, currentStep: "basic" }));
    } else if (step === "questions" && validateBasicInfo()) {
      setFormState((prev) => ({ ...prev, currentStep: "questions" }));
    } else if (
      step === "review" &&
      validateBasicInfo() &&
      validateQuestions()
    ) {
      setFormState((prev) => ({ ...prev, currentStep: "review" }));
    }
  };

  // Form submission
  const handleSubmit = async () => {
    if (!validateBasicInfo() || !validateQuestions()) {
      return;
    }

    try {
      setFormState((prev) => ({ ...prev, isSubmitting: true }));

      const examData = {
        title: formState.title.trim(),
        description: formState.description.trim() || undefined,
        category: formState.category,
        difficulty: formState.difficulty,
        examType: formState.examType,
        duration: formState.duration,
        passingScore: formState.passingScore,
        questionIds: formState.selectedQuestions.map((q) => q.id),
        ...(isEditing && { status: exam.status }),
      };

      await onSave(examData);
    } catch (error) {
      console.error("Failed to save exam:", error);
    } finally {
      setFormState((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (formState.currentStep) {
      case "basic":
        return (
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Basic Information
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <FormField
                    label="Exam Title"
                    required
                    error={formState.errors.title}
                    hint="Clear, descriptive title for the exam"
                  >
                    <Input
                      value={formState.title}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          title: e.target.value,
                          errors: { ...prev.errors, title: "" },
                        }))
                      }
                      placeholder="e.g., AML Certification Exam 2024 - Basic Level"
                      error={!!formState.errors.title}
                    />
                  </FormField>
                </div>

                <FormField
                  label="Category"
                  required
                  hint="Select the appropriate certification category"
                >
                  <Select
                    value={formState.category}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                  >
                    {EXAM_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </Select>
                </FormField>

                <FormField
                  label="Difficulty Level"
                  required
                  hint="Choose the appropriate difficulty level"
                >
                  <Select
                    value={formState.difficulty}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        difficulty: e.target.value as ExamDifficulty,
                      }))
                    }
                  >
                    {Object.entries(EXAM_DIFFICULTY_LABELS).map(
                      ([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      )
                    )}
                  </Select>
                </FormField>

                <FormField
                  label="Exam Type"
                  required
                  hint="Choose how this exam will be managed and accessed"
                >
                  <Select
                    value={formState.examType}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        examType: e.target.value as ExamType,
                      }))
                    }
                  >
                    {Object.entries(EXAM_TYPE_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </Select>

                  {/* Exam Type Description */}
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    {formState.examType === "SCHEDULED" && (
                      <div className="flex items-start space-x-2">
                        <Clock className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-gray-700">
                          <p className="font-medium text-blue-900 mb-1">
                            Scheduled Exam
                          </p>
                          <p>
                            You assign specific users and control when the exam
                            starts for everyone simultaneously. All participants
                            will have the same time limit.
                          </p>
                        </div>
                      </div>
                    )}
                    {formState.examType === "SELF_PACED" && (
                      <div className="flex items-start space-x-2">
                        <Users className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-gray-700">
                          <p className="font-medium text-green-900 mb-1">
                            Self-Paced Exam
                          </p>
                          <p>
                            You assign specific users, but each can start the
                            exam whenever they want. Great for personalized
                            training or study guides.
                          </p>
                        </div>
                      </div>
                    )}
                    {formState.examType === "PUBLIC" && (
                      <div className="flex items-start space-x-2">
                        <BookOpen className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-gray-700">
                          <p className="font-medium text-purple-900 mb-1">
                            Public Exam
                          </p>
                          <p>
                            Available to all users without assignment. Perfect
                            for practice exams or general knowledge tests that
                            anyone can take.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </FormField>

                <FormField
                  label="Duration (minutes)"
                  required
                  error={formState.errors.duration}
                  hint="Time allowed for completing the exam"
                >
                  <Input
                    type="number"
                    value={formState.duration}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        duration: parseInt(e.target.value) || 0,
                        errors: { ...prev.errors, duration: "" },
                      }))
                    }
                    min={EXAM_VALIDATION.DURATION.MIN_MINUTES}
                    max={EXAM_VALIDATION.DURATION.MAX_MINUTES}
                    error={!!formState.errors.duration}
                  />
                </FormField>

                <FormField
                  label="Passing Score (%)"
                  required
                  error={formState.errors.passingScore}
                  hint="Minimum percentage required to pass"
                >
                  <Input
                    type="number"
                    value={formState.passingScore}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        passingScore: parseInt(e.target.value) || 0,
                        errors: { ...prev.errors, passingScore: "" },
                      }))
                    }
                    min={EXAM_VALIDATION.PASSING_SCORE.MIN}
                    max={EXAM_VALIDATION.PASSING_SCORE.MAX}
                    error={!!formState.errors.passingScore}
                  />
                </FormField>

                <div className="md:col-span-2">
                  <FormField
                    label="Description"
                    error={formState.errors.description}
                    hint="Optional description providing more details about the exam"
                  >
                    <TextArea
                      value={formState.description}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          description: e.target.value,
                          errors: { ...prev.errors, description: "" },
                        }))
                      }
                      placeholder="Detailed description of the exam content, objectives, and requirements..."
                      rows={4}
                      error={!!formState.errors.description}
                    />
                  </FormField>
                </div>
              </div>
            </div>
          </div>
        );

      case "questions":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Brain className="h-4 w-4 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Select Questions
                </h3>
              </div>

              {formState.errors.questions && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-red-800 text-sm font-medium">
                      {formState.errors.questions}
                    </span>
                  </div>
                </div>
              )}

              <QuestionSelection
                selectedQuestions={formState.selectedQuestions}
                onQuestionsChange={(questions) =>
                  setFormState((prev) => ({
                    ...prev,
                    selectedQuestions: questions,
                    errors: { ...prev.errors, questions: "" },
                  }))
                }
                excludeExamId={exam?.id}
              />
            </div>
          </div>
        );

      case "review":
        return (
          <div className="space-y-6">
            {/* Exam Summary */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Check className="h-4 w-4 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Review Exam
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Title
                    </label>
                    <p className="text-gray-900 font-medium">
                      {formState.title}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Category
                    </label>
                    <p className="text-gray-900">{formState.category}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Difficulty
                    </label>
                    <p className="text-gray-900">
                      {EXAM_DIFFICULTY_LABELS[formState.difficulty]}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Duration
                    </label>
                    <p className="text-gray-900">
                      {formState.duration} minutes
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Passing Score
                    </label>
                    <p className="text-gray-900">{formState.passingScore}%</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Questions
                    </label>
                    <p className="text-gray-900">
                      {formState.selectedQuestions.length} questions
                    </p>
                  </div>
                </div>
              </div>

              {formState.description && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <label className="text-sm font-medium text-gray-600">
                    Description
                  </label>
                  <p className="text-gray-900 mt-1">{formState.description}</p>
                </div>
              )}
            </div>

            {/* Questions Summary */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-4">
                Questions Summary
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="p-3 bg-blue-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-800">
                    {formState.selectedQuestions.length}
                  </div>
                  <div className="text-blue-600 text-sm">Total Questions</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-800">
                    {formState.selectedQuestions.reduce(
                      (sum, q) => sum + q.points,
                      0
                    )}
                  </div>
                  <div className="text-green-600 text-sm">Total Points</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-800">
                    {Math.round(
                      formState.selectedQuestions.reduce(
                        (sum, q) => sum + q.points,
                        0
                      ) / formState.selectedQuestions.length
                    ) || 0}
                  </div>
                  <div className="text-purple-600 text-sm">
                    Avg Points/Question
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      title={isEditing ? "Edit Exam" : "Create New Exam"}
      description={
        isEditing
          ? "Modify exam details and configuration"
          : "Set up a new certification exam"
      }
      size="xl"
      className="bg-gradient-to-br from-white to-gray-50/50"
    >
      <div className="p-6">
        {/* Step Indicator */}
        <StepIndicator
          currentStep={formState.currentStep}
          onStepClick={handleStepClick}
        />

        {/* Step Content */}
        {renderStepContent()}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-8">
          <div className="flex items-center gap-3">
            {formState.currentStep !== "basic" && (
              <Button
                variant="outline"
                onClick={handlePrevStep}
                disabled={formState.isSubmitting}
                className="bg-white hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
            )}
          </div>

          <div className="text-center px-4">
            <p className="text-sm text-gray-600">
              Step{" "}
              {formState.currentStep === "basic"
                ? 1
                : formState.currentStep === "questions"
                ? 2
                : 3}{" "}
              of 3
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={formState.isSubmitting}
            >
              Cancel
            </Button>

            {formState.currentStep === "review" ? (
              <Button
                onClick={handleSubmit}
                disabled={formState.isSubmitting || isLoading}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white min-w-24"
              >
                {formState.isSubmitting || isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {isEditing ? "Updating..." : "Creating..."}
                  </div>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    {isEditing ? "Update Exam" : "Create Exam"}
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNextStep}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
