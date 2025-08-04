"use client";

import { useState } from "react";
import { Button, Modal } from "@/core/components";
import { Plus } from "lucide-react";
import { useAdminExams } from "../hooks/useAdminExams";
import {
  ExamForm,
  ExamTypeCards,
  UserAssignmentModal,
  ExamControlModal,
} from "./";
import { Exam, CreateExamInput, UpdateExamInput } from "../types/exam";

// ===========================================
// MAIN ADMIN DASHBOARD COMPONENT
// ===========================================

export default function AdminExamDashboard() {
  // Hooks
  const {
    exams,
    loading,
    error,
    createExam,
    updateExam,
    deleteExam,
    assignUsers,
    unassignUser,
    startExam,
    endExam,
  } = useAdminExams();

  // State
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showControlModal, setShowControlModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ===========================================
  // EVENT HANDLERS
  // ===========================================

  const handleCreateExam = async (data: CreateExamInput) => {
    setIsSubmitting(true);
    try {
      await createExam(data);
      setShowCreateDialog(false);
    } catch (error) {
      console.error("Failed to create exam:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditExam = (exam: Exam) => {
    setSelectedExam(exam);
    setShowEditDialog(true);
  };

  const handleUpdateExam = async (data: UpdateExamInput) => {
    if (!selectedExam) return;

    setIsSubmitting(true);
    try {
      await updateExam(selectedExam.id, data);
      setShowEditDialog(false);
      setSelectedExam(null);
    } catch (error) {
      console.error("Failed to update exam:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExam = async (examId: string) => {
    try {
      await deleteExam(examId);
    } catch (error) {
      console.error("Failed to delete exam:", error);
    }
  };

  const handleAssignUsers = (exam: Exam) => {
    setSelectedExam(exam);
    setShowAssignmentModal(true);
  };

  const handleStartExam = (exam: Exam) => {
    setSelectedExam(exam);
    setShowControlModal(true);
  };

  const handleViewDetails = (exam: Exam) => {
    setSelectedExam(exam);
    setShowControlModal(true);
  };

  const handleAssignUsersSubmit = async (examId: string, userIds: string[]) => {
    await assignUsers(examId, userIds);
  };

  const handleUnassignUser = async (examId: string, userId: string) => {
    await unassignUser(examId, userId);
  };

  const handleStartExamSubmit = async (examId: string) => {
    await startExam(examId);
  };

  const handleEndExamSubmit = async (examId: string) => {
    await endExam(examId);
  };

  // ===========================================
  // RENDER
  // ===========================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Exam Management
              </h1>
              <p className="text-sm text-gray-600">
                Manage all types of exams: Scheduled, Self-Paced, and Public
              </p>
            </div>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Exam
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading exams...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600">Error: {error}</p>
          </div>
        ) : (
          <ExamTypeCards
            exams={exams}
            onEdit={handleEditExam}
            onDelete={handleDeleteExam}
            onAssignUsers={handleAssignUsers}
            onStartExam={handleStartExam}
            onViewDetails={handleViewDetails}
          />
        )}
      </div>

      {/* Create Exam Modal */}
      <Modal
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        title="Create New Exam"
        size="xl"
      >
        <ExamForm
          onSave={handleCreateExam}
          onCancel={() => setShowCreateDialog(false)}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* Edit Exam Modal */}
      <Modal
        isOpen={showEditDialog}
        onClose={() => {
          setShowEditDialog(false);
          setSelectedExam(null);
        }}
        title="Edit Exam"
        size="xl"
      >
        <ExamForm
          exam={selectedExam}
          onSave={handleUpdateExam}
          onCancel={() => {
            setShowEditDialog(false);
            setSelectedExam(null);
          }}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* User Assignment Modal */}
      <UserAssignmentModal
        isOpen={showAssignmentModal}
        onClose={() => {
          setShowAssignmentModal(false);
          setSelectedExam(null);
        }}
        exam={selectedExam}
        onAssignUsers={handleAssignUsersSubmit}
        onUnassignUser={handleUnassignUser}
      />

      {/* Exam Control Modal */}
      <ExamControlModal
        isOpen={showControlModal}
        onClose={() => {
          setShowControlModal(false);
          setSelectedExam(null);
        }}
        exam={selectedExam}
        onStartExam={handleStartExamSubmit}
        onEndExam={handleEndExamSubmit}
      />
    </div>
  );
}
