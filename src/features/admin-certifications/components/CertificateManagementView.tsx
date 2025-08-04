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
  Award,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Mail,
  FileText,
} from "lucide-react";

// Mock data - later this will come from our admin-certifications features
const mockCertificates = [
  {
    id: 1,
    candidateName: "Juan Carlos Pérez",
    candidateEmail: "juan.perez@banco.com",
    examTitle: "AML Certification Exam 2024 - Basic",
    score: 85,
    status: "Active",
    issuedDate: "2024-01-20",
    expiryDate: "2025-01-20",
    certificateNumber: "AML-2024-001",
    downloadCount: 3,
    lastDownloaded: "2024-01-21",
  },
  {
    id: 2,
    candidateName: "María García López",
    candidateEmail: "maria.garcia@financiera.com",
    examTitle: "AML Certification Exam 2024 - Intermediate",
    score: 78,
    status: "Active",
    issuedDate: "2024-01-18",
    expiryDate: "2025-01-18",
    certificateNumber: "AML-2024-002",
    downloadCount: 1,
    lastDownloaded: "2024-01-18",
  },
  {
    id: 3,
    candidateName: "Carlos Rodriguez",
    candidateEmail: "carlos.rodriguez@credit.com",
    examTitle: "AML Certification Exam 2024 - Basic",
    score: 92,
    status: "Expiring Soon",
    issuedDate: "2023-02-15",
    expiryDate: "2024-02-15",
    certificateNumber: "AML-2023-045",
    downloadCount: 5,
    lastDownloaded: "2024-01-15",
  },
  {
    id: 4,
    candidateName: "Ana Fernández",
    candidateEmail: "ana.fernandez@seguros.com",
    examTitle: "AML Certification Exam 2024 - Advanced",
    score: 82,
    status: "Revoked",
    issuedDate: "2023-08-10",
    expiryDate: "2024-08-10",
    certificateNumber: "AML-2023-078",
    downloadCount: 2,
    lastDownloaded: "2023-12-05",
  },
];

const certificationTypes = [
  { name: "Basic AML Certification", duration: 12, color: "green" },
  { name: "Intermediate AML Certification", duration: 24, color: "blue" },
  { name: "Advanced AML Certification", duration: 36, color: "purple" },
  { name: "Senior Compliance Officer", duration: 48, color: "orange" },
];

export default function CertificateManagementView() {
  const [certificates] = useState(mockCertificates);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "success";
      case "Expiring Soon":
        return "warning";
      case "Expired":
        return "error";
      case "Revoked":
        return "default";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Active":
        return <CheckCircle className="h-4 w-4" />;
      case "Expiring Soon":
        return <AlertCircle className="h-4 w-4" />;
      case "Expired":
        return <XCircle className="h-4 w-4" />;
      case "Revoked":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Award className="h-4 w-4" />;
    }
  };

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  };

  const filteredCertificates = certificates.filter((cert) => {
    const matchesSearch =
      cert.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.candidateEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || cert.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Certificate Management
          </h2>
          <p className="text-gray-600">
            Manage and monitor AML certification certificates
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Bulk Renewal
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Issue Certificate
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Certificates</p>
              <p className="text-2xl font-bold text-gray-900">
                {certificates.length}
              </p>
            </div>
            <Award className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">
                {certificates.filter((c) => c.status === "Active").length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Expiring Soon</p>
              <p className="text-2xl font-bold text-yellow-600">
                {
                  certificates.filter((c) => c.status === "Expiring Soon")
                    .length
                }
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-yellow-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Expired</p>
              <p className="text-2xl font-bold text-red-600">
                {certificates.filter((c) => c.status === "Expired").length}
              </p>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Revoked</p>
              <p className="text-2xl font-bold text-gray-600">
                {certificates.filter((c) => c.status === "Revoked").length}
              </p>
            </div>
            <XCircle className="h-8 w-8 text-gray-600" />
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
                placeholder="Search certificates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Expiring Soon">Expiring Soon</option>
            <option value="Expired">Expired</option>
            <option value="Revoked">Revoked</option>
          </select>
        </div>
      </Card>

      {/* Certificates Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Certificate
                </th>
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
                  Issued Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry Date
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
              {filteredCertificates.map((certificate) => (
                <tr key={certificate.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {certificate.certificateNumber}
                      </p>
                      <p className="text-xs text-gray-500">
                        Downloads: {certificate.downloadCount}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {certificate.candidateName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {certificate.candidateEmail}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">
                      {certificate.examTitle}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      {certificate.score}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {new Date(certificate.issuedDate).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`text-sm ${
                        isExpiringSoon(certificate.expiryDate)
                          ? "text-yellow-600 font-medium"
                          : "text-gray-900"
                      }`}
                    >
                      {new Date(certificate.expiryDate).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={getStatusColor(certificate.status)}>
                      {getStatusIcon(certificate.status)}
                      <span className="ml-1">{certificate.status}</span>
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        title="View Certificate"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Download Certificate"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Send Email">
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Renew Certificate"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Revoke Certificate"
                      >
                        <XCircle className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Certification Types */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Certification Types
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {certificationTypes.map((type, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{type.name}</h4>
                <Award className={`h-5 w-5 text-${type.color}-600`} />
              </div>
              <p className="text-sm text-gray-600">
                Valid for {type.duration} months
              </p>
              <div className="mt-3">
                <Button variant="outline" size="sm" className="w-full">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Results Summary */}
      <div className="text-sm text-gray-600 text-center">
        Showing {filteredCertificates.length} of {certificates.length}{" "}
        certificates
      </div>

      {/* Issue Certificate Dialog Placeholder */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-screen overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                Issue New Certificate
              </h3>
              <p className="text-gray-600 mb-4">
                Certificate issuance form will be implemented here.
              </p>
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                >
                  Cancel
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Issue Certificate
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
