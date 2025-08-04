"use client";

import { useState, useEffect } from "react";
import { Modal, Button, Input, Badge, LoadingSpinner } from "@/core/components";
import {
  Search,
  UserPlus,
  UserMinus,
  Users,
  CheckCircle,
  AlertCircle,
  X,
  Mail,
  Calendar,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Exam, ExamAssignment, EXAM_TYPE_LABELS } from "../types/exam";

// ===========================================
// TYPES
// ===========================================

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  emailVerified?: boolean;
  createdAt: string;
}

interface UserAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: Exam | null;
  onAssignUsers: (examId: string, userIds: string[]) => Promise<void>;
  onUnassignUser: (examId: string, userId: string) => Promise<void>;
}

// ===========================================
// MOCK USERS API HOOKS
// ===========================================

// This would be replaced with actual API calls
const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async (search?: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      params.append("limit", "50");

      const response = await fetch(`/api/admin/users?${params}`);
      if (!response.ok) throw new Error("Failed to fetch users");

      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  return { users, loading, error, fetchUsers };
};

const useExamAssignments = (examId?: string) => {
  const [assignments, setAssignments] = useState<ExamAssignment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAssignments = async () => {
    if (!examId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/exams/${examId}/assignments`);
      if (!response.ok) throw new Error("Failed to fetch assignments");

      const data = await response.json();
      setAssignments(data.assignments || []);
    } catch (err) {
      console.error("Failed to fetch assignments:", err);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [examId]);

  return { assignments, loading, refetch: fetchAssignments };
};

// ===========================================
// USER CARD COMPONENT
// ===========================================

interface UserCardProps {
  user: User;
  isAssigned: boolean;
  assignment?: ExamAssignment;
  onAssign: () => void;
  onUnassign: () => void;
  disabled: boolean;
}

function UserCard({
  user,
  isAssigned,
  assignment,
  onAssign,
  onUnassign,
  disabled,
}: UserCardProps) {
  return (
    <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-blue-600">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.name}
            </p>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Mail className="h-3 w-3" />
              <span className="truncate">{user.email}</span>
              {user.emailVerified && (
                <CheckCircle className="h-3 w-3 text-green-500" />
              )}
            </div>
            {assignment && (
              <div className="flex items-center space-x-1 mt-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-500">
                  Assigned{" "}
                  {new Date(assignment.assignedAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isAssigned && (
            <Badge variant="success" className="text-xs">
              Assigned
            </Badge>
          )}

          {isAssigned ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onUnassign}
              disabled={disabled}
              className="text-red-600 hover:bg-red-50"
            >
              <UserMinus className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={onAssign}
              disabled={disabled}
            >
              <UserPlus className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ===========================================
// MAIN COMPONENT
// ===========================================

export default function UserAssignmentModal({
  isOpen,
  onClose,
  exam,
  onAssignUsers,
  onUnassignUser,
}: UserAssignmentModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);

  const {
    users,
    loading: usersLoading,
    error: usersError,
    fetchUsers,
  } = useUsers();
  const {
    assignments,
    loading: assignmentsLoading,
    refetch: refetchAssignments,
  } = useExamAssignments(exam?.id);

  // Fetch users when modal opens or search changes
  useEffect(() => {
    if (isOpen) {
      fetchUsers(searchTerm);
    }
  }, [isOpen, searchTerm]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setSelectedUsers([]);
      setIsAssigning(false);
    }
  }, [isOpen]);

  const assignedUserIds = new Set(assignments.map((a) => a.userId));
  const availableUsers = users.filter((user) => !assignedUserIds.has(user.id));

  const handleAssignSelected = async () => {
    if (!exam || selectedUsers.length === 0) return;

    setIsAssigning(true);
    try {
      await onAssignUsers(exam.id, selectedUsers);
      setSelectedUsers([]);
      await refetchAssignments();
      await fetchUsers(searchTerm); // Refresh users list
    } catch (error) {
      console.error("Failed to assign users:", error);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleUnassignUser = async (userId: string) => {
    if (!exam) return;

    try {
      await onUnassignUser(exam.id, userId);
      await refetchAssignments();
      await fetchUsers(searchTerm); // Refresh users list
    } catch (error) {
      console.error("Failed to unassign user:", error);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  if (!exam) return null;

  const canAssignUsers =
    exam.examType === "SCHEDULED" || exam.examType === "SELF_PACED";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Assign Users to ${exam.title}`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Exam Info */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              {exam.examType === "SCHEDULED" ? (
                <Clock className="h-4 w-4 text-blue-600" />
              ) : (
                <Users className="h-4 w-4 text-green-600" />
              )}
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{exam.title}</h4>
              <p className="text-sm text-gray-600">
                {EXAM_TYPE_LABELS[exam.examType]} • {exam.duration} minutes •{" "}
                {exam.totalQuestions} questions
              </p>
            </div>
          </div>

          {!canAssignUsers && (
            <div className="flex items-center space-x-2 text-yellow-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">
                Public exams don't require user assignment - they're available
                to everyone
              </span>
            </div>
          )}
        </div>

        {canAssignUsers && (
          <>
            {/* Currently Assigned Users */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900">
                  Assigned Users ({assignments.length})
                </h4>
                {assignmentsLoading && <LoadingSpinner size="sm" />}
              </div>

              {assignments.length === 0 ? (
                <div className="text-center py-6 text-gray-500 border border-dashed border-gray-200 rounded-lg">
                  <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No users assigned yet</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {assignments.map((assignment) => (
                    <UserCard
                      key={assignment.id}
                      user={{
                        id: assignment.userId,
                        name: assignment.user?.name || "Unknown User",
                        email: assignment.user?.email || "",
                        role: assignment.user?.role || "",
                        emailVerified: true,
                        createdAt: assignment.assignedAt.toString(),
                      }}
                      isAssigned={true}
                      assignment={assignment}
                      onAssign={() => {}}
                      onUnassign={() => handleUnassignUser(assignment.userId)}
                      disabled={isAssigning}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Search and Add Users */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900">Add More Users</h4>
                {selectedUsers.length > 0 && (
                  <Button
                    onClick={handleAssignSelected}
                    disabled={isAssigning}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isAssigning ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                    ) : (
                      <UserPlus className="h-4 w-4 mr-2" />
                    )}
                    Assign {selectedUsers.length} User
                    {selectedUsers.length !== 1 ? "s" : ""}
                  </Button>
                )}
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Users List */}
              {usersError ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-800">{usersError}</span>
                  </div>
                </div>
              ) : usersLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : availableUsers.length === 0 ? (
                <div className="text-center py-6 text-gray-500 border border-dashed border-gray-200 rounded-lg">
                  <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>
                    {searchTerm
                      ? `No users found matching "${searchTerm}"`
                      : "All eligible users are already assigned"}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {availableUsers.map((user) => (
                    <div
                      key={user.id}
                      className={cn(
                        "cursor-pointer transition-colors",
                        selectedUsers.includes(user.id) &&
                          "bg-blue-50 border-blue-200"
                      )}
                      onClick={() => toggleUserSelection(user.id)}
                    >
                      <UserCard
                        user={user}
                        isAssigned={selectedUsers.includes(user.id)}
                        onAssign={() => toggleUserSelection(user.id)}
                        onUnassign={() => toggleUserSelection(user.id)}
                        disabled={isAssigning}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
