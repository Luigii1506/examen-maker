"use client";

import { useState } from "react";
import { Button, Card, Badge } from "@/core/components";
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
} from "lucide-react";

// Mock data - later this will come from our admin-exams features
const mockExams = [
  {
    id: 1,
    title: "AML Certification Exam 2024 - Basic",
    description:
      "Basic level certification exam for Anti-Money Laundering compliance",
    category: "Basic Certification",
    duration: 120, // minutes
    totalQuestions: 50,
    passingScore: 70,
    status: "Active",
    attempts: 145,
    passRate: 68,
    averageScore: 72.5,
    createdAt: "2024-01-15",
    lastAttempt: "2024-01-20",
  },
  {
    id: 2,
    title: "AML Certification Exam 2024 - Intermediate",
    description:
      "Intermediate level certification exam for AML compliance officers",
    category: "Intermediate Certification",
    duration: 150,
    totalQuestions: 75,
    passingScore: 75,
    status: "Active",
    attempts: 89,
    passRate: 55,
    averageScore: 68.2,
    createdAt: "2024-01-16",
    lastAttempt: "2024-01-19",
  },
  {
    id: 3,
    title: "AML Certification Exam 2024 - Advanced",
    description:
      "Advanced level certification exam for senior compliance officers",
    category: "Advanced Certification",
    duration: 180,
    totalQuestions: 100,
    passingScore: 80,
    status: "Draft",
    attempts: 12,
    passRate: 42,
    averageScore: 62.8,
    createdAt: "2024-01-18",
    lastAttempt: "2024-01-18",
  },
];

const mockResults = [
  {
    id: 1,
    candidateName: "Juan Carlos Pérez",
    candidateEmail: "juan.perez@banco.com",
    examTitle: "AML Certification Exam 2024 - Basic",
    score: 85,
    passed: true,
    duration: 95, // minutes taken
    completedAt: "2024-01-20T10:30:00Z",
    attempts: 1,
  },
  {
    id: 2,
    candidateName: "María García López",
    candidateEmail: "maria.garcia@financiera.com",
    examTitle: "AML Certification Exam 2024 - Intermediate",
    score: 72,
    passed: false,
    duration: 142,
    completedAt: "2024-01-19T14:15:00Z",
    attempts: 2,
  },
  {
    id: 3,
    candidateName: "Carlos Rodriguez",
    candidateEmail: "carlos.rodriguez@credit.com",
    examTitle: "AML Certification Exam 2024 - Basic",
    score: 92,
    passed: true,
    duration: 87,
    completedAt: "2024-01-19T16:45:00Z",
    attempts: 1,
  },
];

export default function ExamManagementView() {
  const [activeTab, setActiveTab] = useState("exams");
  const [exams] = useState(mockExams);
  const [results] = useState(mockResults);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "success";
      case "Draft":
        return "warning";
      case "Archived":
        return "default";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Active":
        return <CheckCircle className="h-4 w-4" />;
      case "Draft":
        return <AlertCircle className="h-4 w-4" />;
      case "Archived":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const filteredExams = exams.filter(
    (exam) =>
      exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredResults = results.filter(
    (result) =>
      result.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.candidateEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.examTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <p className="text-2xl font-bold text-gray-900">{exams.length}</p>
            </div>
            <BookOpen className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Exams</p>
              <p className="text-2xl font-bold text-green-600">
                {exams.filter((e) => e.status === "Active").length}
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
                {exams.reduce((acc, exam) => acc + exam.attempts, 0)}
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
                {Math.round(
                  exams.reduce((acc, exam) => acc + exam.passRate, 0) /
                    exams.length
                )}
                %
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-orange-600" />
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("exams")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "exams"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Exams
          </button>
          <button
            onClick={() => setActiveTab("results")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "results"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Results
          </button>
        </nav>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={
              activeTab === "exams" ? "Search exams..." : "Search results..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
                {filteredExams.map((exam) => (
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
                          exam.passRate >= 70
                            ? "text-green-600"
                            : exam.passRate >= 50
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {exam.passRate}%
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
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
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

      {/* Results Tab */}
      {activeTab === "results" && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Candidate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Exam
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Result
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attempts
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completed
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredResults.map((result) => (
                  <tr key={result.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {result.candidateName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {result.candidateEmail}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">
                        {result.examTitle}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {result.score}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={result.passed ? "success" : "error"}>
                        {result.passed ? (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            <span className="ml-1">Passed</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4" />
                            <span className="ml-1">Failed</span>
                          </>
                        )}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {result.duration}min
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {result.attempts}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {new Date(result.completedAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
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

      {/* Create Exam Dialog Placeholder */}
      {showCreateDialog && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <Card className="w-full max-w-2xl mx-4 max-h-screen overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Create New Exam</h3>
              <p className="text-gray-600 mb-4">
                Exam creation form will be implemented here.
              </p>
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                >
                  Cancel
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Create Exam
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
