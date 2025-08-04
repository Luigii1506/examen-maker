"use client";

import { useState } from "react";
import { Button, Badge, Modal } from "@/core/components";
import {
  Clock,
  Users,
  BookOpen,
  Play,
  Edit,
  Trash2,
  UserPlus,
  Eye,
  Calendar,
  CheckCircle,
  AlertCircle,
  Settings,
  Globe,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Exam,
  EXAM_TYPE_LABELS,
  EXAM_STATUS_LABELS,
  EXAM_DIFFICULTY_LABELS,
  ExamType,
} from "../types/exam";

// ===========================================
// INTERFACES
// ===========================================

interface ExamTypeCardsProps {
  exams: Exam[];
  onEdit: (exam: Exam) => void;
  onDelete: (examId: string) => void;
  onAssignUsers: (exam: Exam) => void;
  onStartExam: (exam: Exam) => void;
  onViewDetails: (exam: Exam) => void;
}

// ===========================================
// EXAM TYPE CARD COMPONENT
// ===========================================

interface ExamCardProps {
  exam: Exam;
  onEdit: (exam: Exam) => void;
  onDelete: (examId: string) => void;
  onAssignUsers: (exam: Exam) => void;
  onStartExam: (exam: Exam) => void;
  onViewDetails: (exam: Exam) => void;
}

function ExamCard({
  exam,
  onEdit,
  onDelete,
  onAssignUsers,
  onStartExam,
  onViewDetails,
}: ExamCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Get exam type styling
  const getTypeColor = (type: ExamType) => {
    switch (type) {
      case "SCHEDULED":
        return "blue";
      case "SELF_PACED":
        return "green";
      case "PUBLIC":
        return "purple";
      default:
        return "gray";
    }
  };

  const getTypeIcon = (type: ExamType) => {
    switch (type) {
      case "SCHEDULED":
        return Clock;
      case "SELF_PACED":
        return Users;
      case "PUBLIC":
        return Globe;
      default:
        return BookOpen;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "default";
      case "ASSIGNED":
        return "warning";
      case "STARTED":
        return "success";
      case "ACTIVE":
        return "success";
      case "COMPLETED":
        return "default";
      case "ARCHIVED":
        return "default";
      case "SUSPENDED":
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

  const typeColor = getTypeColor(exam.examType);
  const TypeIcon = getTypeIcon(exam.examType);

  // Determine available actions based on exam type and status
  const canAssignUsers =
    (exam.examType === "SCHEDULED" || exam.examType === "SELF_PACED") &&
    exam.status !== "COMPLETED" &&
    exam.status !== "ARCHIVED";

  const canStartExam =
    exam.examType === "SCHEDULED" &&
    exam.status === "ASSIGNED" &&
    (exam.assignments?.length || 0) > 0;

  const assignedUsersCount = exam.assignments?.length || 0;
  const completedCount =
    exam.assignments?.filter((a) => a.status === "COMPLETED").length || 0;

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    typeColor === "blue" && "bg-blue-100",
                    typeColor === "green" && "bg-green-100",
                    typeColor === "purple" && "bg-purple-100"
                  )}
                >
                  <TypeIcon
                    className={cn(
                      "h-4 w-4",
                      typeColor === "blue" && "text-blue-600",
                      typeColor === "green" && "text-green-600",
                      typeColor === "purple" && "text-purple-600"
                    )}
                  />
                </div>
                <Badge variant={typeColor as any}>
                  {EXAM_TYPE_LABELS[exam.examType]}
                </Badge>
                <Badge variant={getStatusColor(exam.status)}>
                  {EXAM_STATUS_LABELS[exam.status]}
                </Badge>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {exam.title}
              </h3>
              {exam.description && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {exam.description}
                </p>
              )}
            </div>
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" onClick={() => onEdit(exam)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Exam Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{exam.duration} min</span>
            </div>
            <div className="flex items-center space-x-1">
              <BookOpen className="h-4 w-4" />
              <span>{exam.totalQuestions} questions</span>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-4 w-4" />
              <span>{exam.passingScore}% to pass</span>
            </div>
            <div>
              <Badge variant={getDifficultyColor(exam.difficulty)}>
                {EXAM_DIFFICULTY_LABELS[exam.difficulty]}
              </Badge>
            </div>
          </div>
        </div>

        {/* Type-specific content */}
        <div className="p-6">
          {exam.examType === "SCHEDULED" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <UserCheck className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">
                    {assignedUsersCount} users assigned
                  </span>
                </div>
                {exam.status === "STARTED" && exam.examEndsAt && (
                  <div className="flex items-center space-x-1 text-sm text-green-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>
                      Ends: {new Date(exam.examEndsAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {exam.status === "COMPLETED" && (
                <div className="text-sm text-gray-600">
                  Completed: {completedCount}/{assignedUsersCount} users
                </div>
              )}

              <div className="flex space-x-2">
                {canAssignUsers && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAssignUsers(exam)}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Manage Users
                  </Button>
                )}

                {canStartExam && (
                  <Button
                    size="sm"
                    onClick={() => onStartExam(exam)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Exam
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetails(exam)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </div>
            </div>
          )}

          {exam.examType === "SELF_PACED" && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">
                  {assignedUsersCount} users can access this exam
                </span>
              </div>

              <div className="text-sm text-gray-600">
                Users can start this exam whenever they're ready
              </div>

              <div className="flex space-x-2">
                {canAssignUsers && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAssignUsers(exam)}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Manage Users
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetails(exam)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </div>
            </div>
          )}

          {exam.examType === "PUBLIC" && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">
                  Available to all users
                </span>
              </div>

              <div className="text-sm text-gray-600">
                Anyone can take this exam without assignment
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetails(exam)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Modal
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        title="Delete Exam"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete "{exam.title}"? This action cannot
            be undone.
          </p>

          {assignedUsersCount > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-800 font-medium">
                  This exam has {assignedUsersCount} assigned users
                </span>
              </div>
            </div>
          )}

          <div className="flex space-x-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onDelete(exam.id);
                setShowDeleteDialog(false);
              }}
            >
              Delete Exam
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

// ===========================================
// MAIN COMPONENT
// ===========================================

export default function ExamTypeCards({
  exams,
  onEdit,
  onDelete,
  onAssignUsers,
  onStartExam,
  onViewDetails,
}: ExamTypeCardsProps) {
  // Group exams by type
  const groupedExams = {
    SCHEDULED: exams.filter((exam) => exam.examType === "SCHEDULED"),
    SELF_PACED: exams.filter((exam) => exam.examType === "SELF_PACED"),
    PUBLIC: exams.filter((exam) => exam.examType === "PUBLIC"),
  };

  const ExamSection = ({
    title,
    description,
    icon: Icon,
    color,
    exams,
  }: {
    title: string;
    description: string;
    icon: any;
    color: string;
    exams: Exam[];
  }) => (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <div
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            color === "blue" && "bg-blue-100",
            color === "green" && "bg-green-100",
            color === "purple" && "bg-purple-100"
          )}
        >
          <Icon
            className={cn(
              "h-4 w-4",
              color === "blue" && "text-blue-600",
              color === "green" && "text-green-600",
              color === "purple" && "text-purple-600"
            )}
          />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        <Badge variant={color as any} className="ml-auto">
          {exams.length}
        </Badge>
      </div>

      {exams.length === 0 ? (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
          <Icon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p>No {title.toLowerCase()} exams yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {exams.map((exam) => (
            <ExamCard
              key={exam.id}
              exam={exam}
              onEdit={onEdit}
              onDelete={onDelete}
              onAssignUsers={onAssignUsers}
              onStartExam={onStartExam}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      <ExamSection
        title="Scheduled Exams"
        description="Controlled timing with assigned users"
        icon={Clock}
        color="blue"
        exams={groupedExams.SCHEDULED}
      />

      <ExamSection
        title="Self-Paced Exams"
        description="Assigned users can start anytime"
        icon={Users}
        color="green"
        exams={groupedExams.SELF_PACED}
      />

      <ExamSection
        title="Public Exams"
        description="Open access for all users"
        icon={Globe}
        color="purple"
        exams={groupedExams.PUBLIC}
      />
    </div>
  );
}
