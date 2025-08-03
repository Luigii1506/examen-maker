"use client";

import React, { useState } from "react";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { authClient } from "@/core/auth/auth-client";
import AuthContainer from "./AuthContainer";
import InputField from "./InputField";
import Button from "./Button";

interface ForgotPasswordViewProps {
  onBackToLogin: () => void;
}

const ForgotPasswordView: React.FC<ForgotPasswordViewProps> = ({
  onBackToLogin,
}) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validación básica del email
    if (!email) {
      setError("El correo electrónico es obligatorio");
      setLoading(false);
      return;
    }

    // Validación de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Por favor, ingresa un correo electrónico válido");
      setLoading(false);
      return;
    }

    try {
      // Llamada a la función de restablecimiento de contraseña de Better Auth
      const response = await authClient.forgetPassword({
        email: email,
        redirectTo: "/reset-password", // URL para redireccionar desde el email
      });

      if (response.data) {
        // Email enviado exitosamente
        console.log("Email de recuperación enviado:", response.data);
        setEmailSent(true);
      } else if (response.error) {
        // Manejo de errores específicos de better-auth
        console.error("Error al enviar email:", response.error);
        if (response.error.message?.includes("User not found")) {
          setError("No se encontró una cuenta con ese correo electrónico");
        } else {
          setError(
            response.error.message || "Error al enviar el email de recuperación"
          );
        }
      }
    } catch (err: unknown) {
      // Manejar errores inesperados
      console.error("Error inesperado:", err);
      if (err instanceof Error) {
        setError(`Ocurrió un error inesperado: ${err.message}`);
      } else {
        setError("Ocurrió un error desconocido");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendAnother = () => {
    setEmailSent(false);
    setError("");
    // Mantener el email para facilitar reenvío
  };

  // Pantalla de éxito - email enviado
  if (emailSent) {
    return (
      <AuthContainer
        title="Revisa tu email"
        subtitle="Te hemos enviado un enlace para restablecer tu contraseña"
      >
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>

          <div className="space-y-3">
            <p className="text-slate-600">
              Hemos enviado un enlace de recuperación a:
            </p>
            <p className="font-medium text-slate-900 bg-blue-50 px-3 py-2 rounded-lg">
              {email}
            </p>
            <p className="text-sm text-slate-500">
              El enlace expirará en 1 hora. Revisa tu bandeja de entrada y sigue
              las instrucciones.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl">
            <p className="text-sm text-slate-600">
              Si no ves el email en tu bandeja de entrada, revisa tu carpeta de
              spam o promociones.
            </p>
          </div>

          <div className="space-y-3">
            <Button onClick={handleSendAnother} variant="primary">
              Enviar otro enlace
            </Button>

            <Button
              onClick={onBackToLogin}
              variant="outline"
              className="flex items-center justify-center gap-2"
            >
              <ArrowLeft size={20} />
              Volver al login
            </Button>
          </div>
        </div>
      </AuthContainer>
    );
  }

  // Formulario principal
  return (
    <AuthContainer
      title="Recuperar contraseña"
      subtitle="Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error general */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <InputField
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={setEmail}
          icon={<Mail size={20} />}
          error=""
          required
          disabled={loading}
        />

        <Button type="submit" loading={loading} disabled={!email}>
          Enviar enlace de recuperación
        </Button>

        <Button
          onClick={onBackToLogin}
          variant="outline"
          type="button"
          disabled={loading}
        >
          <div className="flex items-center gap-2">
            <ArrowLeft size={20} />
            Volver al login
          </div>
        </Button>
      </form>

      {/* Enlaces adicionales */}
      <div className="mt-6 text-center space-y-2">
        <p className="text-sm text-slate-600">
          ¿No tienes una cuenta?{" "}
          <button
            onClick={() => (window.location.href = "/register")}
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 hover:underline"
            disabled={loading}
          >
            Regístrate aquí
          </button>
        </p>
      </div>
    </AuthContainer>
  );
};

export default ForgotPasswordView;
