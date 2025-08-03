"use client";

import React, { useState } from "react";
import { User, Mail, Lock } from "lucide-react";
import { authClient } from "@/core/auth/auth-client";
import AuthContainer from "./AuthContainer";
import InputField from "./InputField";
import Button from "./Button";
import SocialButton from "./SocialButton";

interface RegisterViewProps {
  onSwitchToLogin: () => void;
  showSocialLogin?: boolean;
}

const RegisterView: React.FC<RegisterViewProps> = ({
  onSwitchToLogin,
  showSocialLogin = true,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name) {
      newErrors.name = "El nombre es requerido";
    } else if (formData.name.length < 2) {
      newErrors.name = "El nombre debe tener al menos 2 caracteres";
    }

    if (!formData.email) {
      newErrors.email = "El email es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Formato de email inválido";
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirma tu contraseña";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
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
      // Llamada a la función de registro de Better Auth
      const response = await authClient.signUp.email({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        callbackURL: "/", // URL para redirigir después del registro (el middleware manejará el resto)
      });

      if (response.data) {
        // Registro exitoso
        console.log("Registro exitoso:", response.data);
        setSuccess(true);
      } else if (response.error) {
        // Manejo de errores específicos de better-auth
        switch (response.error.message) {
          case "Email already exists":
            setError("Ya existe una cuenta con este email");
            break;
          case "Weak password":
            setError("La contraseña es muy débil. Usa al menos 6 caracteres.");
            break;
          case "Invalid email":
            setError("El formato del email no es válido");
            break;
          default:
            setError(response.error.message || "Error al registrar usuario");
        }
      }
    } catch (err: unknown) {
      console.error("Error inesperado:", err);
      if (err instanceof Error) {
        setError(`Ocurrió un error inesperado: ${err.message}`);
      } else {
        setError("Ocurrió un error desconocido.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setGoogleLoading(true);
    setError("");

    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });

      if (result.error) {
        setError("Error al registrarse con Google: " + result.error.message);
      }
      // Si es exitoso, better-auth redirigirá automáticamente
    } catch (error) {
      console.error("Error durante Google register:", error);
      setError("Error al conectar con Google");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleBackToRegister = () => {
    setSuccess(false);
    setError("");
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setErrors({});
  };

  // Si el registro fue exitoso, mostrar mensaje de confirmación
  if (success) {
    return (
      <AuthContainer title="¡Registro Exitoso!" subtitle="">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <div className="space-y-3">
            <p className="text-gray-600">
              Tu cuenta ha sido creada exitosamente.
            </p>
            <p className="text-sm text-gray-500">
              Revisa tu correo electrónico para verificar tu cuenta y completar
              el registro.
            </p>
          </div>

          <div className="space-y-3">
            <Button onClick={onSwitchToLogin} variant="primary">
              Ir al Login
            </Button>

            <button
              onClick={handleBackToRegister}
              className="w-full text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 hover:underline"
            >
              Registrar otra cuenta
            </button>
          </div>
        </div>
      </AuthContainer>
    );
  }

  return (
    <AuthContainer
      title="Crear cuenta"
      subtitle="Regístrate para comenzar tu experiencia"
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
              onClick={handleGoogleRegister}
              loading={googleLoading}
              disabled={loading}
              text="Registrarse con Google"
            />
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">
                  o regístrate con email
                </span>
              </div>
            </div>
          </>
        )}

        <InputField
          type="text"
          placeholder="Nombre completo"
          value={formData.name}
          onChange={(value) => handleChange("name", value)}
          icon={<User size={20} />}
          error={errors.name}
          required
          disabled={loading || googleLoading}
        />

        <InputField
          type="email"
          placeholder="Correo electrónico"
          value={formData.email}
          onChange={(value) => handleChange("email", value)}
          icon={<Mail size={20} />}
          error={errors.email}
          required
          disabled={loading || googleLoading}
        />

        <InputField
          type="password"
          placeholder="Contraseña (mínimo 6 caracteres)"
          value={formData.password}
          onChange={(value) => handleChange("password", value)}
          icon={<Lock size={20} />}
          error={errors.password}
          required
          disabled={loading || googleLoading}
        />

        <InputField
          type="password"
          placeholder="Confirmar contraseña"
          value={formData.confirmPassword}
          onChange={(value) => handleChange("confirmPassword", value)}
          icon={<Lock size={20} />}
          error={errors.confirmPassword}
          required
          disabled={loading || googleLoading}
        />

        <Button type="submit" loading={loading} disabled={googleLoading}>
          Crear Cuenta
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-slate-600">
          ¿Ya tienes una cuenta?{" "}
          <button
            onClick={onSwitchToLogin}
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 hover:underline"
            disabled={loading || googleLoading}
          >
            Inicia sesión aquí
          </button>
        </p>
      </div>
    </AuthContainer>
  );
};

export default RegisterView;
