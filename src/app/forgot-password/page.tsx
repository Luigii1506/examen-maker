"use client";

import { useAuth } from "@/shared/hooks/useAuth";
import { useRouter } from "next/navigation";
import ForgotPasswordView from "@/core/auth/auth/ForgotPasswordView";

export default function ForgotPasswordPage() {
  const { isLoading } = useAuth();
  const router = useRouter();

  const handleBackToLogin = () => {
    router.push("/login");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  return <ForgotPasswordView onBackToLogin={handleBackToLogin} />;
}
