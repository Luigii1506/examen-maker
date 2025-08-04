// 🏠 CORE DASHBOARD PAGE
// ====================
// Dashboard principal del sistema - ubicado en core porque es fundamental
// en todas las aplicaciones que manejan autenticación

"use client";

import { useState } from "react";
import { useAdminPage } from "@/shared/hooks/useAuth";
import { AdminLayout, SystemSettingsView } from "@/core/admin/components";
import { UsersView } from "@/core/admin/users/components";
import { Shield, AlertTriangle } from "lucide-react";
import { FeatureFlagsAdmin } from "@/core/admin/feature-flags";
// [2024-06-10] Fixed import for DashboardView to use default import as per lint error.
// Also, kept all other imports and logic unchanged for correctness and context compliance.
import { FilesView } from "@/modules/file-upload/components";
import { useFeatureFlag } from "@/shared/hooks/useFeatureFlags";
import DashboardView from "./components/DashboardView";

// Import new admin views for certification management
import {
  QuestionBankView,
  ExamManagementView,
} from "@/features/admin-exams/components";
import { CertificateManagementView } from "@/features/admin-certifications/components";
import { ReportsView } from "@/features/reports/components";

export default function AdminDashboardPage() {
  const { isLoading, isAuthenticated, user, isAdmin } = useAdminPage();
  const [currentView, setCurrentView] = useState("dashboard");

  // 🎛️ Feature Flags para control de acceso
  const fileUploadEnabled = useFeatureFlag("fileUpload");

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-slate-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Authentication check
  if (!isAuthenticated || !user) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-lg font-semibold text-slate-700">
            Acceso Requerido
          </h2>
          <p className="mt-2 text-slate-600">
            Necesitas iniciar sesión para acceder al dashboard.
          </p>
        </div>
      </div>
    );
  }

  // Permission check - use our new permission system
  // The showAdminPanel check was removed as per the edit hint.
  // The usePermissions hook was removed as per the edit hint.
  // The currentRole and currentLevel variables were removed as per the edit hint.

  // Render appropriate view based on current selection
  const renderCurrentView = () => {
    switch (currentView) {
      case "users":
        // Simple admin check - if user is admin or super_admin, allow access
        if (!isAdmin) {
          return (
            <div className="text-center py-12">
              <Shield className="mx-auto h-8 w-8 text-slate-400" />
              <p className="mt-2 text-slate-600">
                No tienes permisos para gestionar usuarios.
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Necesitas ser administrador para acceder a esta sección.
              </p>
            </div>
          );
        }
        return <UsersView />;

      case "files":
        // Files - solo si fileUpload está habilitado
        if (!fileUploadEnabled) {
          return (
            <div className="text-center py-12">
              <Shield className="mx-auto h-8 w-8 text-slate-400" />
              <p className="mt-2 text-slate-600">
                El módulo de archivos está deshabilitado.
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Contacta al administrador para habilitarlo.
              </p>
            </div>
          );
        }
        return <FilesView onViewChange={setCurrentView} />;

      case "feature-flags":
        // Feature flags - solo para administradores
        if (!isAdmin) {
          return (
            <div className="text-center py-12">
              <Shield className="mx-auto h-8 w-8 text-slate-400" />
              <p className="mt-2 text-slate-600">
                No tienes permisos para administrar feature flags.
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Necesitas ser administrador para acceder a esta sección.
              </p>
            </div>
          );
        }
        return <FeatureFlagsAdmin />;

      // Certification Management Views
      case "questions":
        // Question Bank Management
        if (!isAdmin) {
          return (
            <div className="text-center py-12">
              <Shield className="mx-auto h-8 w-8 text-slate-400" />
              <p className="mt-2 text-slate-600">
                You do not have permission to manage question bank.
              </p>
              <p className="text-sm text-slate-500 mt-1">
                You need administrator access to view this section.
              </p>
            </div>
          );
        }
        return <QuestionBankView />;

      case "exams":
        // Exam and Results Management
        if (!isAdmin) {
          return (
            <div className="text-center py-12">
              <Shield className="mx-auto h-8 w-8 text-slate-400" />
              <p className="mt-2 text-slate-600">
                You do not have permission to manage exams and results.
              </p>
              <p className="text-sm text-slate-500 mt-1">
                You need administrator access to view this section.
              </p>
            </div>
          );
        }
        return <ExamManagementView />;

      case "certificates":
        // Certificate Management
        if (!isAdmin) {
          return (
            <div className="text-center py-12">
              <Shield className="mx-auto h-8 w-8 text-slate-400" />
              <p className="mt-2 text-slate-600">
                You do not have permission to manage certificates.
              </p>
              <p className="text-sm text-slate-500 mt-1">
                You need administrator access to view this section.
              </p>
            </div>
          );
        }
        return <CertificateManagementView />;

      case "reports":
        // Reports and Analytics
        if (!isAdmin) {
          return (
            <div className="text-center py-12">
              <Shield className="mx-auto h-8 w-8 text-slate-400" />
              <p className="mt-2 text-slate-600">
                You do not have permission to view reports.
              </p>
              <p className="text-sm text-slate-500 mt-1">
                You need administrator access to view this section.
              </p>
            </div>
          );
        }
        return <ReportsView />;

      case "settings":
        // System Settings
        if (!isAdmin) {
          return (
            <div className="text-center py-12">
              <Shield className="mx-auto h-8 w-8 text-slate-400" />
              <p className="mt-2 text-slate-600">
                You do not have permission to modify system settings.
              </p>
              <p className="text-sm text-slate-500 mt-1">
                You need administrator access to view this section.
              </p>
            </div>
          );
        }
        return <SystemSettingsView />;

      default:
        return <DashboardView onViewChange={setCurrentView} />;
    }
  };

  return (
    <AdminLayout
      user={user}
      currentView={currentView}
      onViewChange={setCurrentView}
    >
      {renderCurrentView()}
    </AdminLayout>
  );
}
