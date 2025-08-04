"use client";

import { useState } from "react";
import { Button, Card, Badge, Modal } from "@/core/components";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Eye,
  Download,
  BookOpen,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  X,
  FileText,
  Target,
} from "lucide-react";
import { useExams } from "../hooks";
import { ExamForm } from "./";
import {
  Exam,
  CreateExamInput,
  UpdateExamInput,
  EXAM_DIFFICULTY_LABELS,
  EXAM_STATUS_LABELS,
} from "../types/exam";

export default function ExamManagementView() {
  const {
    exams,
    loading,
    error,
    stats,
    pagination,
    filters,
    updateFilters,
    createExam,
    updateExam,
    deleteExam,
    getExam,
  } = useExams();

  const [activeTab, setActiveTab] = useState("exams");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [viewingExam, setViewingExam] = useState<Exam | null>(null);

  // Handlers
  const handleCreateExam = async (data: CreateExamInput) => {
    try {
      await createExam(data);
      setShowCreateDialog(false);
    } catch (error) {
      console.error("Failed to create exam:", error);
    }
  };

  const handleEditExam = async (data: UpdateExamInput) => {
    if (!editingExam) return;
    try {
      await updateExam(editingExam.id, data);
      setShowEditDialog(false);
      setEditingExam(null);
    } catch (error) {
      console.error("Failed to update exam:", error);
    }
  };

  const handleDeleteExam = async (examId: string) => {
    if (window.confirm("Are you sure you want to delete this exam?")) {
      try {
        await deleteExam(examId);
      } catch (error) {
        console.error("Failed to delete exam:", error);
      }
    }
  };

  const openEditDialog = (exam: Exam) => {
    setEditingExam(exam);
    setShowEditDialog(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "success";
      case "DRAFT":
        return "warning";
      case "ARCHIVED":
        return "default";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <CheckCircle className="h-4 w-4" />;
      case "DRAFT":
        return <AlertCircle className="h-4 w-4" />;
      case "ARCHIVED":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Apply search filter
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    updateFilters({ search: value, page: 1 });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Exams & Results</h2>
          <p className="text-gray-600">
            Manage exams and monitor candidate performance
          </p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setShowCreateDialog(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Exam
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Exams</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <BookOpen className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Exams</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.active}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Attempts</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.totalAttempts}
              </p>
            </div>
            <Users className="h-8 w-8 text-purple-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Pass Rate</p>
              <p className="text-2xl font-bold text-orange-600">
                {stats.averagePassRate}%
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-orange-600" />
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search exams..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </Card>

      {/* Exams Tab */}
      {activeTab === "exams" && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Exam
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Questions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attempts
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pass Rate
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
                {exams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="text-sm font-medium text-gray-900">
                          {exam.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {exam.description}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {exam.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {exam.duration}min
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {exam.totalQuestions}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {exam.attempts}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`text-sm font-medium ${
                          (exam.passRate || 0) >= 70
                            ? "text-green-600"
                            : (exam.passRate || 0) >= 50
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {exam.passRate || 0}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getStatusColor(exam.status)}>
                        {getStatusIcon(exam.status)}
                        <span className="ml-1">{exam.status}</span>
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewingExam(exam)}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(exam)}
                          title="Edit Exam"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteExam(exam.id)}
                          title="Delete Exam"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modals */}
      {showCreateDialog && (
        <ExamForm
          onSave={
            handleCreateExam as (
              data: CreateExamInput | UpdateExamInput
            ) => Promise<void>
          }
          onCancel={() => setShowCreateDialog(false)}
          isLoading={loading}
        />
      )}

      {showEditDialog && editingExam && (
        <ExamForm
          exam={editingExam}
          onSave={
            handleEditExam as (
              data: CreateExamInput | UpdateExamInput
            ) => Promise<void>
          }
          onCancel={() => {
            setShowEditDialog(false);
            setEditingExam(null);
          }}
          isLoading={loading}
        />
      )}

      {/* Exam Details Modal */}
      {viewingExam && (
        <Modal
          isOpen={true}
          onClose={() => setViewingExam(null)}
          title="Exam Details"
          description="View comprehensive exam information and statistics"
          size="xl"
          className="bg-gradient-to-br from-white to-gray-50/50"
        >
          <div className="p-6">
            {/* Exam Overview */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Exam Information
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-sm font-medium text-gray-600 mb-1 block">
                      Title
                    </label>
                    <p className="text-gray-900 font-semibold text-lg">
                      {viewingExam.title}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-sm font-medium text-gray-600 mb-1 block">
                      Category
                    </label>
                    <p className="text-gray-900 font-medium">
                      {viewingExam.category}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-sm font-medium text-gray-600 mb-1 block">
                      Difficulty Level
                    </label>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          viewingExam.difficulty === "BASIC"
                            ? "bg-green-500"
                            : viewingExam.difficulty === "INTERMEDIATE"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                      ></div>
                      <span className="text-gray-900 font-medium">
                        {EXAM_DIFFICULTY_LABELS[viewingExam.difficulty]}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-sm font-medium text-gray-600 mb-1 block">
                      Status
                    </label>
                    <Badge
                      variant={getStatusColor(viewingExam.status)}
                      className="text-sm"
                    >
                      {getStatusIcon(viewingExam.status)}
                      <span className="ml-2">
                        {EXAM_STATUS_LABELS[viewingExam.status]}
                      </span>
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-sm font-medium text-gray-600 mb-1 block">
                      Duration
                    </label>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-900 font-medium">
                        {viewingExam.duration} minutes
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-sm font-medium text-gray-600 mb-1 block">
                      Total Questions
                    </label>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-900 font-medium">
                        {viewingExam.totalQuestions} questions
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-sm font-medium text-gray-600 mb-1 block">
                      Passing Score
                    </label>
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-900 font-medium">
                        {viewingExam.passingScore}% required
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-sm font-medium text-gray-600 mb-1 block">
                      Total Attempts
                    </label>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-900 font-medium">
                        {viewingExam.attempts || 0} attempts
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {viewingExam.description && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <label className="text-sm font-medium text-gray-600 mb-2 block">
                    Description
                  </label>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-gray-900 leading-relaxed">
                      {viewingExam.description}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Statistics Section */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Performance Statistics
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-200">
                  <div className="text-2xl font-bold text-blue-800 mb-1">
                    {viewingExam.attempts || 0}
                  </div>
                  <div className="text-blue-600 text-sm font-medium">
                    Total Attempts
                  </div>
                </div>

                <div className="bg-green-50 rounded-xl p-4 text-center border border-green-200">
                  <div className="text-2xl font-bold text-green-800 mb-1">
                    {viewingExam.passRate || 0}%
                  </div>
                  <div className="text-green-600 text-sm font-medium">
                    Pass Rate
                  </div>
                </div>

                <div className="bg-amber-50 rounded-xl p-4 text-center border border-amber-200">
                  <div className="text-2xl font-bold text-amber-800 mb-1">
                    {viewingExam.averageScore || 0}%
                  </div>
                  <div className="text-amber-600 text-sm font-medium">
                    Average Score
                  </div>
                </div>
              </div>

              {(viewingExam.attempts || 0) === 0 && (
                <div className="mt-6 text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">
                    No attempts recorded yet
                  </p>
                  <p className="text-gray-400 text-sm">
                    Statistics will appear once candidates start taking this
                    exam
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-6">
              <div className="text-center px-4">
                <p className="text-sm text-gray-600">
                  Created:{" "}
                  {new Date(viewingExam.createdAt).toLocaleDateString()}
                </p>
                <p className="text-xs text-gray-500">
                  Last Updated:{" "}
                  {new Date(viewingExam.updatedAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setViewingExam(null);
                    openEditDialog(viewingExam);
                  }}
                  className="bg-white hover:bg-gray-50"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Exam
                </Button>

                <Button
                  onClick={() => setViewingExam(null)}
                  className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
