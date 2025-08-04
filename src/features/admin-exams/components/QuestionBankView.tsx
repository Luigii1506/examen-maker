"use client";

import { useState } from "react";
import { Button, Card, Badge } from "@/core/components";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Eye,
  FileText,
  Target,
  BookOpen,
  Brain,
  AlertCircle,
  RefreshCw,
  X,
} from "lucide-react";
import { useQuestions } from "../hooks";
import {
  Question,
  QuestionType,
  QuestionDifficulty,
  QuestionStatus,
  CreateQuestionInput,
  UpdateQuestionInput,
  QUESTION_CATEGORIES,
  QUESTION_TYPE_LABELS,
  DIFFICULTY_LABELS,
} from "../types";
import QuestionForm from "./QuestionForm";

export default function QuestionBankView() {
  const {
    questions,
    pagination,
    stats,
    filters,
    loading,
    error,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    getQuestion,
    updateFilters,
    goToPage,
    goToNextPage,
    goToPrevPage,
  } = useQuestions({
    page: 1,
    limit: 10,
    status: QuestionStatus.ACTIVE,
  });

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [viewingQuestion, setViewingQuestion] = useState<Question | null>(null);
  const [viewingQuestionLoading, setViewingQuestionLoading] = useState(false);
  const [deletingQuestion, setDeletingQuestion] = useState<Question | null>(
    null
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "MULTIPLE_CHOICE":
        return <FileText className="h-4 w-4" />;
      case "TRUE_FALSE":
        return <Target className="h-4 w-4" />;
      case "MATCHING":
        return <BookOpen className="h-4 w-4" />;
      default:
        return <Brain className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
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

  const handleCreateQuestion = async (
    data: CreateQuestionInput | UpdateQuestionInput
  ) => {
    try {
      await createQuestion(data as CreateQuestionInput);
      setShowCreateDialog(false);
    } catch (error) {
      console.error("Failed to create question:", error);
    }
  };

  const handleEditQuestion = async (
    data: CreateQuestionInput | UpdateQuestionInput
  ) => {
    if (!editingQuestion) return;

    try {
      await updateQuestion(editingQuestion.id, data as UpdateQuestionInput);
      setEditingQuestion(null);
    } catch (error) {
      console.error("Failed to update question:", error);
    }
  };

  const handleDeleteQuestion = async (question: Question) => {
    setDeletingQuestion(question);
  };

  const confirmDelete = async () => {
    if (!deletingQuestion) return;

    try {
      await deleteQuestion(deletingQuestion.id);
      setDeletingQuestion(null);
    } catch (error) {
      console.error("Failed to delete question:", error);
    }
  };

  const handleViewQuestion = (question: Question) => {
    // Use the question data we already have instead of making another API call
    setViewingQuestion(question);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Question Bank</h2>
          <p className="text-gray-600">Manage exam questions and test items</p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => updateFilters({ page: 1 })}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50 p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-red-800">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Questions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Questions</p>
              <p className="text-2xl font-bold text-green-600">
                {questions.filter((q) => q.status === "ACTIVE").length}
              </p>
            </div>
            <Target className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.categories}
              </p>
            </div>
            <BookOpen className="h-8 w-8 text-purple-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Points</p>
              <p className="text-2xl font-bold text-orange-600">
                {stats.averagePoints}
              </p>
            </div>
            <Brain className="h-8 w-8 text-orange-600" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search questions..."
                value={filters.search || ""}
                onChange={(e) =>
                  updateFilters({ search: e.target.value, page: 1 })
                }
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={filters.category || ""}
            onChange={(e) =>
              updateFilters({ category: e.target.value || undefined, page: 1 })
            }
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {QUESTION_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={filters.difficulty || ""}
            onChange={(e) =>
              updateFilters({
                difficulty: (e.target.value as QuestionDifficulty) || undefined,
                page: 1,
              })
            }
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Difficulties</option>
            {Object.values(QuestionDifficulty).map((difficulty) => (
              <option key={difficulty} value={difficulty}>
                {DIFFICULTY_LABELS[difficulty]}
              </option>
            ))}
          </select>

          <select
            value={filters.type || ""}
            onChange={(e) =>
              updateFilters({
                type: (e.target.value as QuestionType) || undefined,
                page: 1,
              })
            }
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            {Object.values(QuestionType).map((type) => (
              <option key={type} value={type}>
                {QUESTION_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Questions Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Question
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Difficulty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Points
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center">
                      <RefreshCw className="h-6 w-6 animate-spin text-blue-600 mr-2" />
                      <span className="text-gray-600">
                        Loading questions...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : questions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center">
                    <div className="text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">No questions found</p>
                      <p className="text-sm">
                        Try adjusting your filters or create a new question.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                questions.map((question) => (
                  <tr key={question.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {question.text}
                        </p>
                        <p className="text-xs text-gray-500">
                          ID: {question.id}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getTypeColor(question.type)}>
                        {getTypeIcon(question.type)}
                        <span className="ml-1">
                          {QUESTION_TYPE_LABELS[question.type]}
                        </span>
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">
                        {question.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getDifficultyColor(question.difficulty)}>
                        {DIFFICULTY_LABELS[question.difficulty]}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {question.points}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={
                          question.status === "ACTIVE" ? "success" : "default"
                        }
                      >
                        {question.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewQuestion(question)}
                          title="View question"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingQuestion(question)}
                          title="Edit question"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteQuestion(question)}
                          title="Delete question"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      {!loading && questions.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} questions
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevPage}
              disabled={pagination.page <= 1 || loading}
            >
              Previous
            </Button>

            <div className="flex items-center space-x-1">
              {Array.from(
                { length: Math.min(5, pagination.totalPages) },
                (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={pagination.page === page ? "primary" : "outline"}
                      size="sm"
                      onClick={() => goToPage(page)}
                      disabled={loading}
                    >
                      {page}
                    </Button>
                  );
                }
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={pagination.page >= pagination.totalPages || loading}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Create Question Dialog */}
      {showCreateDialog && (
        <QuestionForm
          onSave={handleCreateQuestion}
          onCancel={() => setShowCreateDialog(false)}
          isLoading={loading}
        />
      )}

      {/* Edit Question Dialog */}
      {editingQuestion && (
        <QuestionForm
          question={editingQuestion}
          onSave={handleEditQuestion}
          onCancel={() => setEditingQuestion(null)}
          isLoading={loading}
        />
      )}

      {/* View Question Dialog */}
      {(viewingQuestion || viewingQuestionLoading) && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center border-b pb-4 mb-4">
                <h3 className="text-lg font-semibold">Question Details</h3>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setViewingQuestion(null);
                    setViewingQuestionLoading(false);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {viewingQuestionLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-blue-600 mr-2" />
                  <span className="text-gray-600">
                    Loading question details...
                  </span>
                </div>
              ) : viewingQuestion ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Question Text
                    </h4>
                    <p className="text-gray-700">{viewingQuestion.text}</p>
                  </div>

                  {viewingQuestion.scenario && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Scenario
                      </h4>
                      <p className="text-gray-700">
                        {viewingQuestion.scenario}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Type</h4>
                      <Badge variant={getTypeColor(viewingQuestion.type)}>
                        {getTypeIcon(viewingQuestion.type)}
                        <span className="ml-1">
                          {QUESTION_TYPE_LABELS[viewingQuestion.type]}
                        </span>
                      </Badge>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">
                        Difficulty
                      </h4>
                      <Badge
                        variant={getDifficultyColor(viewingQuestion.difficulty)}
                      >
                        {DIFFICULTY_LABELS[viewingQuestion.difficulty]}
                      </Badge>
                    </div>
                  </div>

                  {/* Show options for non-matching questions */}
                  {viewingQuestion.type !== "MATCHING" &&
                    viewingQuestion.options.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          Options
                        </h4>
                        <div className="space-y-2">
                          {viewingQuestion.options.map((option, index) => (
                            <div
                              key={option.id}
                              className="flex items-center space-x-2"
                            >
                              <span
                                className={`w-4 h-4 rounded-full ${
                                  option.isCorrect
                                    ? "bg-green-500"
                                    : "bg-gray-300"
                                }`}
                              ></span>
                              <span
                                className={
                                  option.isCorrect ? "font-medium" : ""
                                }
                              >
                                {option.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Show matching information for matching questions */}
                  {viewingQuestion.type === "MATCHING" && (
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900 mb-2">
                        Matching Items
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">
                            Left Column
                          </h5>
                          <div className="space-y-2">
                            {viewingQuestion.leftColumn?.map((item, index) => (
                              <div
                                key={index}
                                className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-md text-sm"
                              >
                                {item}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Right Column */}
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">
                            Right Column
                          </h5>
                          <div className="space-y-2">
                            {viewingQuestion.rightColumn?.map((item, index) => (
                              <div
                                key={index}
                                className="px-3 py-2 bg-green-50 border border-green-200 rounded-md text-sm"
                              >
                                {item}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Correct Matches */}
                      {viewingQuestion.correctMatches &&
                        Object.keys(viewingQuestion.correctMatches).length >
                          0 && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-2">
                              Correct Matches
                            </h5>
                            <div className="space-y-2">
                              {Object.entries(
                                viewingQuestion.correctMatches
                              ).map(([leftItem, rightItem], index) => (
                                <div
                                  key={index}
                                  className="flex items-center space-x-3 p-3 bg-gray-50 border border-gray-200 rounded-md"
                                >
                                  <div className="px-3 py-1 bg-blue-100 border border-blue-300 rounded text-sm font-medium">
                                    {leftItem}
                                  </div>
                                  <span className="text-gray-400">→</span>
                                  <div className="px-3 py-1 bg-green-100 border border-green-300 rounded text-sm font-medium">
                                    {rightItem}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  )}

                  {viewingQuestion.explanation && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Explanation
                      </h4>
                      <p className="text-gray-700">
                        {viewingQuestion.explanation}
                      </p>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingQuestion && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <Card className="w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Confirm Delete
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this question? This action
                cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setDeletingQuestion(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDelete}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {loading ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
