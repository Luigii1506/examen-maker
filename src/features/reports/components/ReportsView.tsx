"use client";

import { useState } from "react";
import { Button, Card, Badge } from "@/core/components";
import {
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  FileText,
  Users,
  Award,
  Clock,
  Filter,
  RefreshCw,
} from "lucide-react";

// Mock data - later this will come from our reports features
const mockStats = {
  totalCandidates: 342,
  totalExams: 8,
  totalCertificates: 156,
  averageScore: 74.2,
  passRate: 68.5,
  monthlyGrowth: 12.3,
};

const mockExamStats = [
  {
    examName: "AML Basic Certification",
    attempts: 145,
    passed: 98,
    failed: 47,
    averageScore: 76.2,
    passRate: 67.6,
  },
  {
    examName: "AML Intermediate Certification",
    attempts: 89,
    passed: 49,
    failed: 40,
    averageScore: 71.8,
    passRate: 55.1,
  },
  {
    examName: "AML Advanced Certification",
    attempts: 34,
    passed: 12,
    failed: 22,
    averageScore: 65.4,
    passRate: 35.3,
  },
];

const mockTimelineData = [
  { month: "Jan", attempts: 45, passed: 32, certificates: 28 },
  { month: "Feb", attempts: 52, passed: 38, certificates: 35 },
  { month: "Mar", attempts: 48, passed: 35, certificates: 32 },
  { month: "Apr", attempts: 61, passed: 43, certificates: 40 },
  { month: "May", attempts: 58, passed: 41, certificates: 38 },
  { month: "Jun", attempts: 67, passed: 48, certificates: 45 },
];

const mockInstitutionStats = [
  { name: "Banco Nacional", candidates: 45, passRate: 82.2, certificates: 37 },
  {
    name: "Financiera Central",
    candidates: 32,
    passRate: 75.0,
    certificates: 24,
  },
  { name: "Credit Union", candidates: 28, passRate: 64.3, certificates: 18 },
  {
    name: "Seguros Metropolitanos",
    candidates: 21,
    passRate: 71.4,
    certificates: 15,
  },
  { name: "Casa de Bolsa", candidates: 19, passRate: 68.4, certificates: 13 },
];

export default function ReportsView() {
  const [dateRange, setDateRange] = useState("last-30-days");
  const [selectedInstitution, setSelectedInstitution] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  const generateReport = (type: string) => {
    console.log(`Generating ${type} report...`);
    // Implement report generation logic here
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Reports & Analytics
          </h2>
          <p className="text-gray-600">
            Monitor system performance and certification metrics
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Date Range and Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="last-7-days">Last 7 days</option>
            <option value="last-30-days">Last 30 days</option>
            <option value="last-90-days">Last 90 days</option>
            <option value="last-6-months">Last 6 months</option>
            <option value="last-year">Last year</option>
          </select>

          <select
            value={selectedInstitution}
            onChange={(e) => setSelectedInstitution(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Institutions</option>
            {mockInstitutionStats.map((institution) => (
              <option key={institution.name} value={institution.name}>
                {institution.name}
              </option>
            ))}
          </select>

          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {dateRange === "last-30-days"
                ? "Dec 21, 2023 - Jan 20, 2024"
                : "Custom range"}
            </span>
          </div>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Candidates</p>
              <p className="text-2xl font-bold text-gray-900">
                {mockStats.totalCandidates}
              </p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
          <div className="mt-2 flex items-center">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-600 ml-1">
              +{mockStats.monthlyGrowth}%
            </span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Exams</p>
              <p className="text-2xl font-bold text-gray-900">
                {mockStats.totalExams}
              </p>
            </div>
            <FileText className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Certificates Issued</p>
              <p className="text-2xl font-bold text-gray-900">
                {mockStats.totalCertificates}
              </p>
            </div>
            <Award className="h-8 w-8 text-purple-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {mockStats.averageScore}%
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-orange-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pass Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {mockStats.passRate}%
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Duration</p>
              <p className="text-2xl font-bold text-gray-900">95min</p>
            </div>
            <Clock className="h-8 w-8 text-gray-600" />
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "overview"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("exams")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "exams"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Exam Performance
          </button>
          <button
            onClick={() => setActiveTab("institutions")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "institutions"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Institutions
          </button>
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Timeline Chart Placeholder */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Monthly Trends
            </h3>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Chart will be implemented here</p>
                <p className="text-xs text-gray-400">Shows trends over time</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <p className="text-gray-600">Total Attempts</p>
                <p className="font-semibold text-blue-600">
                  {mockTimelineData.reduce(
                    (acc, item) => acc + item.attempts,
                    0
                  )}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-600">Passed</p>
                <p className="font-semibold text-green-600">
                  {mockTimelineData.reduce((acc, item) => acc + item.passed, 0)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-600">Certificates</p>
                <p className="font-semibold text-purple-600">
                  {mockTimelineData.reduce(
                    (acc, item) => acc + item.certificates,
                    0
                  )}
                </p>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Reports
            </h3>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => generateReport("exam-performance")}
              >
                <FileText className="h-4 w-4 mr-3" />
                Exam Performance Report
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => generateReport("certificate-summary")}
              >
                <Award className="h-4 w-4 mr-3" />
                Certificate Summary Report
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => generateReport("institution-analysis")}
              >
                <Users className="h-4 w-4 mr-3" />
                Institution Analysis Report
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => generateReport("compliance-audit")}
              >
                <BarChart3 className="h-4 w-4 mr-3" />
                Compliance Audit Report
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Exam Performance Tab */}
      {activeTab === "exams" && (
        <Card className="overflow-hidden">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              Exam Performance Analysis
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Exam
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Attempts
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Passed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Failed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pass Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg. Score
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockExamStats.map((exam, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">
                        {exam.examName}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {exam.attempts}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-green-600">
                        {exam.passed}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-red-600">
                        {exam.failed}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span
                          className={`text-sm font-medium ${
                            exam.passRate >= 70
                              ? "text-green-600"
                              : exam.passRate >= 50
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {exam.passRate.toFixed(1)}%
                        </span>
                        <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              exam.passRate >= 70
                                ? "bg-green-500"
                                : exam.passRate >= 50
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${exam.passRate}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {exam.averageScore.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Institutions Tab */}
      {activeTab === "institutions" && (
        <Card className="overflow-hidden">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              Institution Performance
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Institution
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Candidates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pass Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Certificates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockInstitutionStats.map((institution, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">
                        {institution.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {institution.candidates}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`text-sm font-medium ${
                          institution.passRate >= 75
                            ? "text-green-600"
                            : institution.passRate >= 60
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {institution.passRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {institution.certificates}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={
                          institution.passRate >= 75
                            ? "success"
                            : institution.passRate >= 60
                            ? "warning"
                            : "error"
                        }
                      >
                        {institution.passRate >= 75
                          ? "Excellent"
                          : institution.passRate >= 60
                          ? "Good"
                          : "Needs Improvement"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
