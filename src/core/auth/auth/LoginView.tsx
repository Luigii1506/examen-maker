"use client";

import React, { useState } from "react";
import { Mail, Lock } from "lucide-react";

import { authClient } from "@/core/auth/auth-client";
import AuthContainer from "./AuthContainer";
import InputField from "./InputField";
import Button from "./Button";
import SocialButton from "./SocialButton";

interface LoginViewProps {
  onSwitchToRegister: () => void;
  onSwitchToForgotPassword: () => void;
  showSocialLogin?: boolean;
}

const LoginView: React.FC<LoginViewProps> = ({
  onSwitchToRegister,
  onSwitchToForgotPassword,
  showSocialLogin = true,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = "El email es requerido";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Formato de email inválido";
    }

    if (!password) {
      newErrors.password = "La contraseña es requerida";
    } else if (password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result.error) {
        // Manejo de errores específicos de better-auth
        switch (result.error.message) {
          case "Invalid email or password":
            setError("Email o contraseña incorrectos");
            break;
          case "User not found":
            setError("No existe una cuenta con este email");
            break;
          case "Account is banned":
            setError(
              "Tu cuenta ha sido suspendida. Contacta al administrador."
            );
            break;
          default:
            setError(result.error.message || "Error al iniciar sesión");
        }
      } else {
        // Login exitoso - el middleware manejará la redirección
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Error durante el login:", error);
      setError("Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError("");

    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });

      if (result.error) {
        setError("Error al conectar con Google: " + result.error.message);
      }
      // Si es exitoso, better-auth redirigirá automáticamente
    } catch (error) {
      console.error("Error durante Google login:", error);
      setError("Error al conectar con Google");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <AuthContainer
      title="Bienvenido de vuelta"
      subtitle="Ingresa a tu cuenta para continuar"
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

        {showSocialLogin && (
          <>
            <SocialButton
              provider="google"
              onClick={handleGoogleLogin}
              loading={googleLoading}
              disabled={loading}
            />
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">
                  o continúa con email
                </span>
              </div>
            </div>
          </>
        )}

        <InputField
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={setEmail}
          icon={<Mail size={20} />}
          error={errors.email}
          required
          disabled={loading || googleLoading}
        />

        <InputField
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={setPassword}
          icon={<Lock size={20} />}
          error={errors.password}
          required
          disabled={loading || googleLoading}
        />

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onSwitchToForgotPassword}
            className="text-sm text-blue-600 hover:text-blue-700 transition-colors duration-200 hover:underline"
            disabled={loading || googleLoading}
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        <Button type="submit" loading={loading} disabled={googleLoading}>
          Iniciar Sesión
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-slate-600">
          ¿No tienes una cuenta?{" "}
          <button
            onClick={onSwitchToRegister}
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 hover:underline"
            disabled={loading || googleLoading}
          >
            Regístrate aquí
          </button>
        </p>
      </div>
    </AuthContainer>
  );
};

export default LoginView;
