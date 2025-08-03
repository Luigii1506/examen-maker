import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rutas que requieren autenticación
const protectedRoutes = [
  "/dashboard",
  "/user-dashboard",
  "/profile",
  "/settings",
];

// Rutas solo para admin
const adminRoutes = ["/dashboard"];

// Rutas solo para usuarios regulares
const userRoutes = ["/user-dashboard"];

// Rutas que NO deben ser accesibles si ya estás logueado
const authRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

// Rutas públicas (accesibles para todos)
const publicRoutes = ["/", "/about", "/contact"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes, static files, and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") // archivos estáticos
  ) {
    return NextResponse.next();
  }

  // Verificar si hay sesión activa y obtener información del usuario
  const sessionInfo = await checkSession(request);
  const isAuthenticated = sessionInfo.isAuthenticated;
  const userRole = sessionInfo.role;
  const isAdmin = userRole === "admin" || userRole === "super_admin";

  // 🔒 RUTAS PROTEGIDAS: Requieren autenticación
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      // Redirigir a login si no está autenticado
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // 👑 RUTAS DE ADMIN: Solo para administradores
    if (adminRoutes.some((route) => pathname.startsWith(route))) {
      if (!isAdmin) {
        // Si no es admin, redirigir al dashboard de usuario
        return NextResponse.redirect(new URL("/user-dashboard", request.url));
      }
    }

    // 👤 RUTAS DE USUARIO: Solo para usuarios regulares (redirigir admin a su dashboard)
    if (userRoutes.some((route) => pathname.startsWith(route))) {
      if (isAdmin) {
        // Si es admin, redirigir al dashboard de admin
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    return NextResponse.next();
  }

  // 🚫 RUTAS DE AUTH: No accesibles si ya está logueado
  if (authRoutes.some((route) => pathname === route)) {
    if (isAuthenticated) {
      // Redirigir donde el usuario quería ir originalmente o a su dashboard apropiado
      const callbackUrl = request.nextUrl.searchParams.get("callbackUrl");

      if (callbackUrl) {
        return NextResponse.redirect(new URL(callbackUrl, request.url));
      }

      // Redirigir al dashboard apropiado según el rol
      const dashboardUrl = isAdmin ? "/dashboard" : "/user-dashboard";
      return NextResponse.redirect(new URL(dashboardUrl, request.url));
    }
    return NextResponse.next();
  }

  // 🌐 RUTAS PÚBLICAS: Siempre accesibles
  if (publicRoutes.some((route) => pathname === route)) {
    return NextResponse.next();
  }

  // Por defecto, permitir acceso
  return NextResponse.next();
}

// Función para verificar la sesión con better-auth
async function checkSession(request: NextRequest): Promise<{
  isAuthenticated: boolean;
  role?: string;
}> {
  try {
    const sessionToken = request.cookies.get(
      "better-auth.session_token"
    )?.value;

    if (!sessionToken) {
      return { isAuthenticated: false };
    }

    // Verificar con la API de better-auth
    const response = await fetch(new URL("/api/auth/session", request.url), {
      headers: {
        Cookie: request.headers.get("cookie") || "",
      },
    });

    if (response.ok) {
      const session = await response.json();
      if (session.user) {
        return {
          isAuthenticated: true,
          role: session.user.role || "user",
        };
      }
    }

    return { isAuthenticated: false };
  } catch (error) {
    console.error("Error checking session:", error);
    return { isAuthenticated: false };
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
