# 🔐 Core Auth - Sistema de Autenticación

> **Sistema completo de autenticación y autorización**

## 🎯 Propósito

El directorio `core/auth/` contiene **todo el sistema de autenticación y autorización** de la aplicación, incluyendo Better Auth integration, manejo de roles, permisos, componentes de UI y hooks reutilizables.

## 📁 Estructura

```
auth/
├── 🔧 auth.ts             # Configuración principal de Better Auth
├── 📱 auth-client.ts      # Cliente de Better Auth para frontend
├── 🧩 auth/               # Componentes UI de autenticación
│   ├── AuthContainer.tsx  # Container principal
│   ├── LoginView.tsx      # Vista de login
│   ├── RegisterView.tsx   # Vista de registro
│   ├── ForgotPasswordView.tsx # Recuperación de contraseña
│   ├── PermissionGate.tsx # Control de permisos
│   ├── Button.tsx         # Botón de auth
│   ├── InputField.tsx     # Campo de entrada
│   ├── SocialButton.tsx   # Botones sociales
│   └── index.ts           # Exportaciones de componentes
├── ⚙️ config/             # Configuración de auth
│   ├── permissions.ts     # Definición de permisos
│   └── index.ts           # Exportaciones de config
└── 📤 [exports via core/index.ts] # API pública
```

## 🔧 Configuración Principal

### **🏗️ Better Auth Setup**

```typescript
// core/auth/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 días
    updateAge: 60 * 60 * 24, // 1 día
  },
});
```

### **📱 Cliente Frontend**

```typescript
// core/auth/auth-client.ts
import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL!,
});

export const { signIn, signUp, signOut, getSession, useSession } = authClient;
```

## 🧩 Componentes de Autenticación

### **🔐 `AuthContainer` - Container Principal**

```typescript
import { AuthContainer } from "@/core/auth";

function AuthPage() {
  return (
    <AuthContainer
      mode="login" // "login" | "register" | "forgot-password"
      redirectTo="/dashboard"
      showSocialLogin={true}
      enableGoogleAuth={true}
      enableGithubAuth={true}
    />
  );
}
```

### **👤 `LoginView` - Vista de Login**

```typescript
import { LoginView } from "@/core/auth";

function LoginPage() {
  const handleSuccess = (user) => {
    console.log("Usuario logueado:", user);
    router.push("/dashboard");
  };

  return (
    <LoginView
      onSuccess={handleSuccess}
      onError={(error) => console.error(error)}
      showRememberMe={true}
      showForgotPassword={true}
      enableSocialLogin={true}
    />
  );
}
```

### **📝 `RegisterView` - Vista de Registro**

```typescript
import { RegisterView } from "@/core/auth";

function RegisterPage() {
  return (
    <RegisterView
      onSuccess={(user) => router.push("/welcome")}
      requireEmailVerification={true}
      showTermsAndConditions={true}
      enableSocialLogin={true}
    />
  );
}
```

### **🔒 `PermissionGate` - Control de Permisos**

```typescript
import { PermissionGate } from "@/core/auth";

function ProtectedComponent() {
  return (
    <PermissionGate
      requiredPermissions={["admin.read"]}
      requireAll={true} // true = AND, false = OR
      fallback={<div>Sin permisos</div>}
      redirectTo="/unauthorized"
    >
      <AdminContent />
    </PermissionGate>
  );
}
```

## 🎯 Sistema de Permisos

### **📋 Definición de Permisos**

```typescript
// core/auth/config/permissions.ts
export const PERMISSIONS = {
  // Administración
  "admin.read": "Ver panel de administración",
  "admin.write": "Editar configuración del sistema",
  "admin.users.read": "Ver usuarios",
  "admin.users.write": "Editar usuarios",
  "admin.users.delete": "Eliminar usuarios",

  // Feature Flags
  "admin.feature_flags.read": "Ver feature flags",
  "admin.feature_flags.write": "Editar feature flags",

  // Archivos
  "files.read": "Ver archivos",
  "files.upload": "Subir archivos",
  "files.delete": "Eliminar archivos",

  // Módulos específicos
  "module.file_upload.use": "Usar módulo de archivos",
  "module.payments.use": "Usar módulo de pagos",
} as const;

export type Permission = keyof typeof PERMISSIONS;
```

### **👥 Roles del Sistema**

```typescript
// core/auth/config/permissions.ts
export const PREDEFINED_ROLES = {
  super_admin: {
    name: "Super Administrador",
    description: "Acceso completo al sistema",
    permissions: Object.keys(PERMISSIONS) as Permission[],
  },
  admin: {
    name: "Administrador",
    description: "Administrador del sistema",
    permissions: [
      "admin.read",
      "admin.users.read",
      "admin.users.write",
      "admin.feature_flags.read",
      "files.read",
      "files.upload",
    ] as Permission[],
  },
  user: {
    name: "Usuario",
    description: "Usuario estándar",
    permissions: [
      "files.read",
      "files.upload",
      "module.file_upload.use",
    ] as Permission[],
  },
} as const;
```

## 🪝 Hooks de Autenticación

### **👤 `useAuth` - Hook Principal**

```typescript
import { useAuth } from "@/shared/hooks";

function MyComponent() {
  const {
    user, // Usuario actual
    isAuthenticated, // ¿Está autenticado?
    isLoading, // ¿Está cargando?
    login, // Función de login
    logout, // Función de logout
    register, // Función de registro
    updateProfile, // Actualizar perfil
    error, // Errores de auth
  } = useAuth();

  if (isLoading) return <div>Cargando...</div>;

  if (!isAuthenticated) {
    return <LoginView onSuccess={() => window.location.reload()} />;
  }

  return (
    <div>
      <h1>Bienvenido, {user?.name}</h1>
      <button onClick={logout}>Cerrar Sesión</button>
    </div>
  );
}
```

### **🔐 `usePermissions` - Hook de Permisos**

```typescript
import { usePermissions } from "@/shared/hooks";

function PermissionExample() {
  const {
    hasPermission, // Verificar permiso individual
    hasAnyPermission, // Verificar múltiples (OR)
    hasAllPermissions, // Verificar múltiples (AND)
    userRole, // Rol del usuario
    userPermissions, // Lista de permisos
  } = usePermissions();

  const canDeleteUsers = hasPermission("admin.users.delete");
  const canAdminArea = hasAnyPermission(["admin.read", "admin.users.read"]);
  const canFullAdmin = hasAllPermissions([
    "admin.read",
    "admin.write",
    "admin.users.write",
  ]);

  return (
    <div>
      <p>Rol: {userRole}</p>
      {canDeleteUsers && <button>Eliminar Usuario</button>}
      {canAdminArea && <AdminSection />}
      {canFullAdmin && <SuperAdminTools />}
    </div>
  );
}
```

### **🛡️ `useAdminPage` y `useProtectedPage`**

```typescript
import { useAdminPage, useProtectedPage } from "@/shared/hooks";

// Para páginas de admin
function AdminDashboard() {
  const { isAuthorized, isLoading } = useAdminPage({
    requiredPermissions: ["admin.read"],
    redirectTo: "/unauthorized",
  });

  if (isLoading) return <div>Verificando permisos...</div>;
  if (!isAuthorized) return null; // Se redirige automáticamente

  return <AdminContent />;
}

// Para páginas protegidas generales
function UserProfile() {
  const { user, isLoading } = useProtectedPage({
    redirectTo: "/login",
  });

  if (isLoading) return <div>Cargando...</div>;

  return <ProfileContent user={user} />;
}
```

## 🚀 Casos de Uso Comunes

### **🔐 Login/Logout Básico**

```typescript
import { useAuth } from "@/shared/hooks";
import { LoginView } from "@/core/auth";

function AuthExample() {
  const { isAuthenticated, user, logout } = useAuth();

  if (!isAuthenticated) {
    return (
      <LoginView
        onSuccess={() => window.location.reload()}
        enableSocialLogin={true}
      />
    );
  }

  return (
    <div>
      <p>Hola, {user?.name}</p>
      <button onClick={logout}>Salir</button>
    </div>
  );
}
```

### **🛡️ Protección de Rutas**

```typescript
import { PermissionGate } from "@/core/auth";

function ProtectedRoute() {
  return (
    <PermissionGate
      requiredPermissions={["admin.users.read"]}
      fallback={<div>No tienes acceso a esta sección</div>}
    >
      <UsersManagement />
    </PermissionGate>
  );
}
```

### **👥 Gestión de Roles**

```typescript
import { usePermissions } from "@/shared/hooks";

function RoleBasedComponent() {
  const { userRole, hasPermission } = usePermissions();

  const renderByRole = () => {
    switch (userRole) {
      case "super_admin":
        return <SuperAdminDashboard />;
      case "admin":
        return <AdminDashboard />;
      case "user":
        return <UserDashboard />;
      default:
        return <GuestView />;
    }
  };

  return (
    <div>
      {renderByRole()}

      {hasPermission("files.upload") && <FileUploadSection />}
    </div>
  );
}
```

## 🌐 Integración con API Routes

### **🔒 Middleware de Autenticación**

```typescript
// middleware.ts (raíz del proyecto)
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/core/auth/auth";

export async function middleware(request: NextRequest) {
  // Verificar sesión
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  // Rutas protegidas
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!session?.user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Verificar permisos de admin
    if (!session.user.role?.includes("admin")) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
```

### **🛡️ Protección de API Routes**

```typescript
// app/api/admin/users/route.ts
import { auth } from "@/core/auth/auth";
import { hasPermission } from "@/core/auth/config/permissions";

export async function GET(request: Request) {
  // Verificar autenticación
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  // Verificar permisos
  if (!hasPermission(session.user, "admin.users.read")) {
    return Response.json({ error: "Sin permisos" }, { status: 403 });
  }

  // Lógica de la API
  const users = await getUsers();
  return Response.json(users);
}
```

## ⚙️ Configuración de Providers Sociales

### **🔗 Google OAuth**

```typescript
// .env.local
GOOGLE_CLIENT_ID = your_google_client_id;
GOOGLE_CLIENT_SECRET = your_google_client_secret;
```

### **🐙 GitHub OAuth**

```typescript
// .env.local
GITHUB_CLIENT_ID = your_github_client_id;
GITHUB_CLIENT_SECRET = your_github_client_secret;
```

### **📧 Configuración de Email**

```typescript
// core/auth/auth.ts
export const auth = betterAuth({
  // ... otras configuraciones
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, token }) => {
      // Enviar email de recuperación
      await sendPasswordResetEmail(user.email, token);
    },
    sendVerificationEmail: async ({ user, token }) => {
      // Enviar email de verificación
      await sendVerificationEmail(user.email, token);
    },
  },
});
```

## 🎨 Personalización de UI

### **🎨 Estilos Personalizados**

```typescript
// Los componentes usan Tailwind CSS y pueden personalizarse
import { LoginView } from "@/core/auth";

function CustomLogin() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <LoginView
        className="max-w-md mx-auto pt-20"
        showLogo={true}
        logoUrl="/my-logo.png"
        primaryColor="indigo"
      />
    </div>
  );
}
```

### **🔧 Configuración de Campos**

```typescript
import { RegisterView } from "@/core/auth";

function CustomRegister() {
  return (
    <RegisterView
      fields={[
        { name: "name", label: "Nombre Completo", required: true },
        { name: "email", label: "Correo", type: "email", required: true },
        {
          name: "password",
          label: "Contraseña",
          type: "password",
          required: true,
        },
        { name: "company", label: "Empresa", required: false },
      ]}
      validation={{
        password: {
          minLength: 8,
          requireUppercase: true,
          requireNumbers: true,
        },
      }}
    />
  );
}
```

## 🔧 Scripts de Administración

### **👑 Crear Super Admin**

```bash
# Script disponible en scripts/
npm run create-super-admin
```

### **👥 Crear Usuarios de Prueba**

```bash
npm run create-test-users
```

### **⬆️ Promover Usuario a Admin**

```bash
npm run make-admin
```

## 🛡️ Seguridad

### **🔒 Mejores Prácticas Implementadas**

- **Sesiones seguras** con Better Auth
- **Verificación de email** obligatoria
- **Rate limiting** en endpoints de auth
- **Sanitización** de inputs
- **CSRF protection** automática
- **Secure cookies** en producción

### **🔐 Configuración de Seguridad**

```typescript
// core/auth/auth.ts
export const auth = betterAuth({
  // ... otras configuraciones
  security: {
    csrfProtection: true,
    rateLimit: {
      window: 15 * 60 * 1000, // 15 minutos
      max: 5, // 5 intentos
    },
    sessionSecurity: {
      sameSite: "strict",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    },
  },
});
```

## 🔗 Integración con Otros Sistemas

### **🎛️ Con Feature Flags**

```typescript
import { useAuth, useFeatureFlag } from "@/shared/hooks";

function ConditionalAuth() {
  const { isAuthenticated } = useAuth();
  const enableSocialLogin = useFeatureFlag("SOCIAL_LOGIN");

  return (
    <LoginView enableSocialLogin={enableSocialLogin && !isAuthenticated} />
  );
}
```

### **📊 Con Base de Datos**

```typescript
// El sistema se integra automáticamente con Prisma
// Las tablas de usuarios se crean vía migraciones
// Roles y permisos se almacenan en BD
```

---

**💡 Tip:** El sistema de auth es el **corazón de la seguridad**. Siempre verificar permisos tanto en frontend como backend. Usa Better Auth para máxima seguridad y flexibilidad.
