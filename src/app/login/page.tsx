"use client";

import { useAuth } from "@/shared/hooks/useAuth";
import { useRouter } from "next/navigation";
import LoginView from "@/core/auth/auth/LoginView";

export default function LoginPage() {
  const { isLoading } = useAuth();
  const router = useRouter();

  const handleSwitchToRegister = () => {
    router.push("/register");
  };

  const handleSwitchToForgotPassword = () => {
    router.push("/forgot-password");
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

  return (
    <LoginView
      onSwitchToRegister={handleSwitchToRegister}
      onSwitchToForgotPassword={handleSwitchToForgotPassword}
      showSocialLogin={true}
    />
  );
}
