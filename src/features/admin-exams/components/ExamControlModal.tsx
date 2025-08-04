"use client";

import { useState, useEffect } from "react";
import { Modal, Button, Badge, LoadingSpinner } from "@/core/components";
import {
  Play,
  Square,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  Calendar,
  Timer,
  User,
  Trophy,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Exam,
  ExamAssignment,
  EXAM_TYPE_LABELS,
  EXAM_STATUS_LABELS,
} from "../types/exam";

// ===========================================
// TYPES
// ===========================================

interface ExamControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: Exam | null;
  onStartExam: (examId: string) => Promise<void>;
  onEndExam: (examId: string) => Promise<void>;
}

interface ExamStats {
  totalAssigned: number;
  started: number;
  completed: number;
  averageProgress: number;
  timeRemaining?: number;
}

// ===========================================
// HOOKS
// ===========================================

const useExamControl = (examId?: string) => {
  const [assignments, setAssignments] = useState<ExamAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<ExamStats>({
    totalAssigned: 0,
    started: 0,
    completed: 0,
    averageProgress: 0,
  });

  const fetchExamData = async () => {
    if (!examId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/exams/${examId}/assignments`);
      if (!response.ok) throw new Error("Failed to fetch exam data");

      const data = await response.json();
      const assignments = data.assignments || [];
      setAssignments(assignments);

      // Calculate stats
      const totalAssigned = assignments.length;
      const started = assignments.filter((a) => a.status === "STARTED").length;
      const completed = assignments.filter(
        (a) => a.status === "COMPLETED"
      ).length;
      const averageProgress =
        totalAssigned > 0
          ? Math.round(((started + completed) / totalAssigned) * 100)
          : 0;

      setStats({
        totalAssigned,
        started,
        completed,
        averageProgress,
      });
    } catch (err) {
      console.error("Failed to fetch exam data:", err);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExamData();

    // Set up polling for live updates when exam is active
    let interval: NodeJS.Timeout;
    if (examId) {
      interval = setInterval(fetchExamData, 10000); // Update every 10 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [examId]);

  return { assignments, loading, stats, refetch: fetchExamData };
};

// ===========================================
// USER STATUS COMPONENT
// ===========================================

interface UserStatusProps {
  assignment: ExamAssignment;
}

function UserStatus({ assignment }: UserStatusProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ASSIGNED":
        return "default";
      case "STARTED":
        return "warning";
      case "COMPLETED":
        return "success";
      case "CANCELLED":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ASSIGNED":
        return Clock;
      case "STARTED":
        return Timer;
      case "COMPLETED":
        return CheckCircle;
      case "CANCELLED":
        return AlertCircle;
      default:
        return User;
    }
  };

  const StatusIcon = getStatusIcon(assignment.status);

  return (
    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
          <span className="text-xs font-medium text-gray-600">
            {assignment.user?.name?.charAt(0)?.toUpperCase() || "?"}
          </span>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">
            {assignment.user?.name || "Unknown User"}
          </p>
          <p className="text-xs text-gray-500">
            {assignment.user?.email || ""}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Badge variant={getStatusColor(assignment.status)}>
          <StatusIcon className="h-3 w-3 mr-1" />
          {assignment.status.charAt(0) +
            assignment.status.slice(1).toLowerCase()}
        </Badge>

        {assignment.status === "STARTED" && (
          <div className="text-xs text-gray-500">In progress</div>
        )}

        {assignment.status === "COMPLETED" && (
          <div className="text-xs text-green-600 flex items-center space-x-1">
            <Trophy className="h-3 w-3" />
            <span>Done</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ===========================================
// STATS CARD COMPONENT
// ===========================================

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: any;
  color?: string;
  subtitle?: string;
}

function StatsCard({
  title,
  value,
  icon: Icon,
  color = "blue",
  subtitle,
}: StatsCardProps) {
  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg">
      <div className="flex items-center space-x-3">
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            color === "blue" && "bg-blue-100",
            color === "green" && "bg-green-100",
            color === "yellow" && "bg-yellow-100",
            color === "purple" && "bg-purple-100"
          )}
        >
          <Icon
            className={cn(
              "h-5 w-5",
              color === "blue" && "text-blue-600",
              color === "green" && "text-green-600",
              color === "yellow" && "text-yellow-600",
              color === "purple" && "text-purple-600"
            )}
          />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

// ===========================================
// MAIN COMPONENT
// ===========================================

export default function ExamControlModal({
  isOpen,
  onClose,
  exam,
  onStartExam,
  onEndExam,
}: ExamControlModalProps) {
  const [isStarting, setIsStarting] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [showConfirmStart, setShowConfirmStart] = useState(false);
  const [showConfirmEnd, setShowConfirmEnd] = useState(false);

  const { assignments, loading, stats, refetch } = useExamControl(exam?.id);

  // Calculate time remaining for started exams
  const timeRemaining = exam?.examEndsAt
    ? Math.max(0, new Date(exam.examEndsAt).getTime() - new Date().getTime())
    : null;

  const formatTimeRemaining = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const handleStartExam = async () => {
    if (!exam) return;

    setIsStarting(true);
    try {
      await onStartExam(exam.id);
      setShowConfirmStart(false);
      await refetch();
    } catch (error) {
      console.error("Failed to start exam:", error);
    } finally {
      setIsStarting(false);
    }
  };

  const handleEndExam = async () => {
    if (!exam) return;

    setIsEnding(true);
    try {
      await onEndExam(exam.id);
      setShowConfirmEnd(false);
      await refetch();
    } catch (error) {
      console.error("Failed to end exam:", error);
    } finally {
      setIsEnding(false);
    }
  };

  if (!exam) return null;

  const canStart =
    exam.examType === "SCHEDULED" &&
    exam.status === "ASSIGNED" &&
    stats.totalAssigned > 0;

  const canEnd = exam.examType === "SCHEDULED" && exam.status === "STARTED";

  const isActive = exam.status === "STARTED";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Control: ${exam.title}`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Exam Header */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{exam.title}</h4>
                <p className="text-sm text-gray-600">
                  {EXAM_TYPE_LABELS[exam.examType]} • {exam.duration} minutes •{" "}
                  {exam.totalQuestions} questions
                </p>
              </div>
            </div>
            <Badge variant={exam.status === "STARTED" ? "success" : "warning"}>
              {EXAM_STATUS_LABELS[exam.status]}
            </Badge>
          </div>

          {isActive && timeRemaining !== null && (
            <div className="flex items-center space-x-2 text-sm">
              <Timer className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-600">
                Time remaining: {formatTimeRemaining(timeRemaining)}
              </span>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Total Assigned"
              value={stats.totalAssigned}
              icon={Users}
              color="blue"
            />
            <StatsCard
              title="Started"
              value={stats.started}
              icon={Timer}
              color="yellow"
            />
            <StatsCard
              title="Completed"
              value={stats.completed}
              icon={CheckCircle}
              color="green"
            />
            <StatsCard
              title="Progress"
              value={`${stats.averageProgress}%`}
              icon={BarChart3}
              color="purple"
            />
          </div>
        )}

        {/* Control Actions */}
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-4">Exam Control</h4>

          {!isActive && stats.totalAssigned === 0 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  You need to assign users before starting the exam
                </span>
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            {canStart && (
              <Button
                onClick={() => setShowConfirmStart(true)}
                disabled={isStarting}
                className="bg-green-600 hover:bg-green-700"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Exam
              </Button>
            )}

            {canEnd && (
              <Button
                variant="outline"
                onClick={() => setShowConfirmEnd(true)}
                disabled={isEnding}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <Square className="h-4 w-4 mr-2" />
                End Exam
              </Button>
            )}

            {!canStart && !canEnd && exam.status === "COMPLETED" && (
              <div className="text-sm text-gray-600 p-2">
                This exam has been completed
              </div>
            )}
          </div>
        </div>

        {/* User Status List */}
        {assignments.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-4">
              Assigned Users ({assignments.length})
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {assignments.map((assignment) => (
                <UserStatus key={assignment.id} assignment={assignment} />
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      {/* Start Confirmation Modal */}
      <Modal
        isOpen={showConfirmStart}
        onClose={() => setShowConfirmStart(false)}
        title="Start Exam"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to start this exam? Once started, all assigned
            users will be able to take the exam and the timer will begin.
          </p>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-800 font-medium">
                Duration: {exam.duration} minutes
              </span>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-800">
                {stats.totalAssigned} users will be notified
              </span>
            </div>
          </div>

          <div className="flex space-x-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowConfirmStart(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStartExam}
              disabled={isStarting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isStarting ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Start Exam
            </Button>
          </div>
        </div>
      </Modal>

      {/* End Confirmation Modal */}
      <Modal
        isOpen={showConfirmEnd}
        onClose={() => setShowConfirmEnd(false)}
        title="End Exam"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to end this exam? This will immediately stop
            the exam for all users, even if time remains.
          </p>

          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-800 font-medium">
                {stats.started} users are currently taking the exam
              </span>
            </div>
          </div>

          <div className="flex space-x-3 justify-end">
            <Button variant="outline" onClick={() => setShowConfirmEnd(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleEndExam}
              disabled={isEnding}
            >
              {isEnding ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <Square className="h-4 w-4 mr-2" />
              )}
              End Exam
            </Button>
          </div>
        </div>
      </Modal>
    </Modal>
  );
}
