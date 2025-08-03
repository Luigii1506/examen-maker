"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/core/auth/auth-client";

import type { User } from "@/shared/types/user";

interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  isAdmin: boolean;
}

export function useAuth(requireAuth: boolean = false): AuthState {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession();

        if (session.data?.user) {
          setIsAuthenticated(true);
          const userData = session.data.user as User;
          setUser(userData);
          setIsAdmin(
            userData.role === "admin" || userData.role === "super_admin"
          );

          // Si está en una página de auth y ya está logueado, redirigir
          const authPages = ["/login", "/register", "/forgot-password"];
          if (authPages.includes(window.location.pathname)) {
            const urlParams = new URLSearchParams(window.location.search);
            const callbackUrl = urlParams.get("callbackUrl") || "/";
            router.replace(callbackUrl);
          }
        } else {
          setIsAuthenticated(false);
          setUser(null);
          setIsAdmin(false);

          // Si requiere auth y no está logueado, redirigir a login
          if (requireAuth) {
            const currentPath = window.location.pathname;
            router.replace(
              `/login?callbackUrl=${encodeURIComponent(currentPath)}`
            );
          }
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        setIsAuthenticated(false);
        setUser(null);
        setIsAdmin(false);

        if (requireAuth) {
          router.replace("/login");
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [requireAuth, router]);

  return { isLoading, isAuthenticated, user, isAdmin };
}

// Hook específico para páginas protegidas
export function useProtectedPage(): AuthState {
  return useAuth(true);
}

// Hook específico para páginas de admin
export function useAdminPage(): AuthState {
  const authState = useAuth(true);
  const router = useRouter();

  useEffect(() => {
    if (
      !authState.isLoading &&
      authState.isAuthenticated &&
      !authState.isAdmin
    ) {
      // Si no es admin, redirigir a página de usuario
      router.replace("/");
    }
  }, [
    authState.isLoading,
    authState.isAuthenticated,
    authState.isAdmin,
    router,
  ]);

  return authState;
}

// Hook específico para páginas públicas
export function usePublicPage(): AuthState {
  return useAuth(false);
}

// Hook para refrescar el estado de autenticación
export function useRefreshAuth() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshAuth = async () => {
    setIsRefreshing(true);
    try {
      // Forzar una nueva verificación de sesión
      const session = await authClient.getSession();
      return !!session.data?.user;
    } catch (error) {
      console.error("Error refreshing auth:", error);
      return false;
    } finally {
      setIsRefreshing(false);
    }
  };

  return { refreshAuth, isRefreshing };
}
