"use client";

import { useAuth } from "@/shared/hooks/useAuth";
import { authClient } from "@/core/auth/auth-client";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { isLoading, isAuthenticated, user, isAdmin } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/login");
          },
        },
      });
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const goToDashboard = () => {
    const dashboardUrl = isAdmin ? "/dashboard" : "/user-dashboard";
    router.push(dashboardUrl);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="pt-8 pb-16">
          <nav className="flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Mi Aplicación
              </h1>
            </div>

            <div className="flex items-center gap-4">
              {isLoading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              ) : isAuthenticated && user ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {user.image && (
                      <img
                        src={user.image}
                        alt={user.name}
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <span className="text-sm font-medium text-gray-700">
                      {user.name}
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        isAdmin
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {isAdmin ? "Admin" : "Usuario"}
                    </span>
                  </div>
                  <button
                    onClick={goToDashboard}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Mi Panel
                  </button>
                  <button
                    onClick={handleLogout}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => router.push("/login")}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Iniciar Sesión
                  </button>
                  <button
                    onClick={() => router.push("/register")}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Registrarse
                  </button>
                </div>
              )}
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <main className="text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8">
              Sistema de Gestión
              <span className="block text-blue-600">con Roles</span>
            </h1>

            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              Una aplicación completa con autenticación, gestión de usuarios y
              sistema de roles para administradores y usuarios regulares.
            </p>

            {isLoading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : isAuthenticated ? (
              <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  ¡Sesión Activa!
                </h2>

                <p className="text-gray-600 mb-6">
                  Bienvenido de vuelta, <strong>{user?.name}</strong>. Tienes
                  una sesión activa como {isAdmin ? "administrador" : "usuario"}
                  .
                </p>

                <div className="grid grid-cols-1 gap-4">
                  <button
                    onClick={goToDashboard}
                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
                  >
                    Ir a mi {isAdmin ? "Panel de Admin" : "Dashboard"}
                  </button>

                  {isAdmin && (
                    <div className="text-sm text-gray-500 bg-red-50 p-3 rounded-md">
                      <strong>Permisos de administrador:</strong> Puedes
                      gestionar usuarios, cambiar roles, banear/desbanear
                      usuarios y más.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Usuarios Regulares
                  </h3>

                  <ul className="text-gray-600 space-y-2 mb-6">
                    <li>• Panel personal</li>
                    <li>• Gestión de perfil</li>
                    <li>• Configuraciones personales</li>
                    <li>• Estadísticas de actividad</li>
                  </ul>

                  <button
                    onClick={() => router.push("/register")}
                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
                  >
                    Registrarse
                  </button>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-red-200">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-red-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                    </svg>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Administradores
                  </h3>

                  <ul className="text-gray-600 space-y-2 mb-6">
                    <li>• Gestión completa de usuarios</li>
                    <li>• Cambio de roles</li>
                    <li>• Banear/desbanear usuarios</li>
                    <li>• Estadísticas del sistema</li>
                  </ul>

                  <button
                    onClick={() => router.push("/login")}
                    className="w-full bg-red-600 text-white px-6 py-3 rounded-md font-medium hover:bg-red-700 transition-colors"
                  >
                    Acceso Admin
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Features Section */}
        <section className="mt-32 mb-16">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Características Principales
            </h2>
            <p className="text-lg text-gray-600">
              Sistema completo de autenticación y gestión de usuarios
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Seguridad Avanzada
              </h3>
              <p className="text-gray-600">
                Sistema de autenticación robusto con Better Auth y gestión de
                sesiones seguras.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Gestión de Roles
              </h3>
              <p className="text-gray-600">
                Sistema de roles completo que permite diferentes niveles de
                acceso y permisos.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-purple-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Paneles Personalizados
              </h3>
              <p className="text-gray-600">
                Interfaces adaptadas para cada tipo de usuario con
                funcionalidades específicas.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
