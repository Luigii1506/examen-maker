"use client";

import { useProtectedPage } from "@/shared/hooks/useAuth";
import { authClient } from "@/core/auth/auth-client";
import { useRouter } from "next/navigation";

export default function UserDashboardPage() {
  const { isLoading, isAuthenticated, user, isAdmin } = useProtectedPage();
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

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si es admin, redirigir al dashboard de admin
  if (isAdmin) {
    router.replace("/dashboard");
    return null;
  }

  // Esta página solo se muestra si el usuario está autenticado
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Mi Panel</h1>
            </div>

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
              </div>

              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Welcome Card */}
          <div className="bg-white rounded-lg shadow p-6 col-span-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Bienvenido, {user.name}! 👋
            </h2>
            <p className="text-gray-600">
              Este es tu panel de usuario personal. Aquí puedes gestionar tu
              perfil y configuraciones.
            </p>
          </div>

          {/* User Info Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Mi Información
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Email:
                </label>
                <p className="text-gray-900">{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Rol:
                </label>
                <p className="text-gray-900">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Usuario
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Estado:
                </label>
                <p className="text-gray-900">
                  {user.emailVerified ? (
                    <span className="inline-flex items-center gap-1 text-green-600">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Verificado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-yellow-600">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Email Pendiente
                    </span>
                  )}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Miembro desde:
                </label>
                <p className="text-gray-900">
                  {new Date(user.createdAt).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Acciones Rápidas
            </h3>
            <div className="space-y-3">
              <button className="w-full text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                <div className="font-medium text-gray-900">Editar Perfil</div>
                <div className="text-sm text-gray-500">
                  Actualiza tu información personal
                </div>
              </button>
              <button className="w-full text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                <div className="font-medium text-gray-900">Configuración</div>
                <div className="text-sm text-gray-500">
                  Ajusta tus preferencias
                </div>
              </button>
              <button className="w-full text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                <div className="font-medium text-gray-900">Seguridad</div>
                <div className="text-sm text-gray-500">
                  Cambia tu contraseña
                </div>
              </button>
            </div>
          </div>

          {/* Activity Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Actividad Reciente
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Último acceso:</span>
                <span className="font-semibold text-gray-900">Ahora</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Sesiones activas:</span>
                <span className="font-semibold text-gray-900">1</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Perfil completo:</span>
                <span className="font-semibold text-green-600">
                  {user.emailVerified ? "100%" : "90%"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
