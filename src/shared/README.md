# 🤝 Shared - Recursos Compartidos

> **Recursos reutilizables entre módulos y dominios**

## 🎯 Propósito

El directorio `shared/` contiene **recursos compartidos** que pueden ser utilizados por cualquier módulo, componente o funcionalidad del sistema. Es la **biblioteca común** de la aplicación.

## 📁 Estructura

```
shared/
├── 🪝 hooks/              # Custom hooks reutilizables
│   ├── useAuth.ts         # Autenticación global
│   ├── useFeatureFlags.tsx # Control de feature flags
│   ├── usePermissions.ts  # Sistema de permisos
│   └── index.ts           # Exportaciones de hooks
├── 📝 types/              # Tipos TypeScript globales
│   ├── user.ts           # Tipos de usuario
│   ├── global.ts         # Tipos base (BaseEntity, etc.)
│   ├── api.ts            # Contratos de API
│   ├── database.ts       # Extensiones de Prisma
│   └── index.ts          # Exportaciones de tipos
├── 🛠️ utils/              # Utilidades compartidas
│   ├── cn.ts             # Combinar clases CSS
│   └── index.ts          # Exportaciones de utils
└── 📤 index.ts            # API pública de shared
```

## 🪝 Hooks Compartidos

### **🔐 `useAuth` - Autenticación Global**

```typescript
import { useAuth } from "@/shared/hooks";

function MyComponent() {
  const {
    user, // Usuario actual
    isAuthenticated, // Estado de autenticación
    login, // Función de login
    logout, // Función de logout
    isLoading, // Estado de carga
  } = useAuth();

  if (isLoading) return <div>Cargando...</div>;
  if (!isAuthenticated) return <LoginForm />;

  return <div>Bienvenido, {user?.name}</div>;
}
```

### **🎛️ `useFeatureFlags` - Control de Funcionalidades**

```typescript
import { useFeatureFlag, useFeatureFlags } from "@/shared/hooks";

function ConditionalFeature() {
  // Hook individual
  const isEnabled = useFeatureFlag("NEW_FEATURE");

  // Hook completo
  const { flags, isEnabled: checkFlag } = useFeatureFlags();

  if (!isEnabled) return null;

  return <NewFeatureComponent />;
}
```

### **🔐 `usePermissions` - Control de Permisos**

```typescript
import { usePermissions } from "@/shared/hooks";

function AdminOnlyComponent() {
  const {
    hasPermission, // Verificar permiso individual
    hasAnyPermission, // Verificar múltiples permisos (OR)
    hasAllPermissions, // Verificar múltiples permisos (AND)
    userRole, // Rol del usuario
  } = usePermissions();

  if (!hasPermission("admin.read")) {
    return <div>Sin permisos</div>;
  }

  return <AdminPanel />;
}
```

## 📝 Tipos Compartidos

### **👤 Tipos de Usuario**

```typescript
import type { User, UserFormData, UserStats } from "@/shared/types";

// Ejemplo de uso
const createUser = (data: UserFormData): Promise<User> => {
  // Lógica de creación
};
```

### **🌍 Tipos Globales**

```typescript
import type {
  BaseEntity, // Entidad base con id, timestamps
  PaginationParams, // Parámetros de paginación
  LoadingState, // Estados de carga
  AuthUser, // Usuario autenticado
} from "@/shared/types";

// Ejemplo: Entidad que extiende BaseEntity
interface Product extends BaseEntity {
  name: string;
  price: number;
}
```

### **🌐 Tipos de API**

```typescript
import type {
  ApiResponse, // Respuesta estándar de API
  ApiError, // Error estándar de API
  PaginatedResponse, // Respuesta paginada
} from "@/shared/types";

// Ejemplo de uso
const fetchUsers = async (): Promise<ApiResponse<User[]>> => {
  // Lógica de fetch
};
```

### **🗃️ Tipos de Base de Datos**

```typescript
import type {
  PrismaEntity, // Extensión de Prisma
  QueryOptions, // Opciones de consulta
  DatabaseError, // Errores de DB
} from "@/shared/types";
```

## 🛠️ Utilidades Compartidas

### **🎨 `cn` - Combinar Clases CSS**

```typescript
import { cn } from "@/shared/utils";

function Button({ className, variant = "primary", ...props }) {
  return (
    <button
      className={cn(
        "px-4 py-2 rounded", // Clases base
        {
          "bg-blue-500": variant === "primary",
          "bg-gray-500": variant === "secondary",
        },
        className // Clases adicionales
      )}
      {...props}
    />
  );
}
```

## 🚀 Cómo Usar Shared

### **🔍 Importar Recursos**

```typescript
// ✅ Importar desde la API pública
import {
  useAuth, // Hook
  usePermissions, // Hook
  User, // Tipo
  ApiResponse, // Tipo
  cn, // Utilidad
} from "@/shared";

// ✅ También funciona por categoría
import { useAuth } from "@/shared/hooks";
import { User } from "@/shared/types";
import { cn } from "@/shared/utils";
```

### **❌ NO hacer importaciones profundas**

```typescript
// ❌ Evitar esto
import { useAuth } from "@/shared/hooks/useAuth";

// ✅ Hacer esto
import { useAuth } from "@/shared/hooks";
// o
import { useAuth } from "@/shared";
```

## ➕ Agregar Nuevos Recursos

### **🪝 Nuevo Hook Compartido**

```typescript
// 1. Crear el hook
// src/shared/hooks/useMyHook.ts
export function useMyHook() {
  // Lógica del hook
}

// 2. Exportar en hooks/index.ts
export { useMyHook } from "./useMyHook";

// 3. Re-exportar en shared/index.ts (automático)
```

### **📝 Nuevo Tipo Compartido**

```typescript
// 1. Agregar tipo a archivo existente o crear nuevo
// src/shared/types/myTypes.ts
export interface MyType {
  id: string;
  name: string;
}

// 2. Exportar en types/index.ts
export type { MyType } from "./myTypes";

// 3. Disponible automáticamente en shared/index.ts
```

### **🛠️ Nueva Utilidad Compartida**

```typescript
// 1. Crear utilidad
// src/shared/utils/myUtil.ts
export function myUtil(input: string): string {
  return input.toLowerCase();
}

// 2. Exportar en utils/index.ts
export { myUtil } from "./myUtil";

// 3. Disponible automáticamente
```

## 📝 Convenciones de Shared

### **🏗️ Principios Fundamentales**

- **REUTILIZABLE** - Útil para múltiples módulos/componentes
- **GENÉRICO** - No específico de un dominio particular
- **ESTABLE** - API bien definida y consistente
- **DOCUMENTADO** - Ejemplos claros de uso

### **🚫 Qué NO incluir en Shared**

- ❌ Lógica específica de un módulo
- ❌ Componentes UI complejos (van en `core/components`)
- ❌ Configuración específica (va en `core/config`)
- ❌ Business logic específica (va en módulos)

### **✅ Qué SÍ incluir en Shared**

- ✅ Hooks reutilizables entre módulos
- ✅ Tipos TypeScript globales
- ✅ Utilidades de formateo/validación
- ✅ Helpers comunes (fechas, strings, etc.)

### **📂 Estructura Requerida**

```typescript
// Cada categoría debe tener:
categoria/
├── archivo1.ts          # Implementaciones
├── archivo2.ts          # Más implementaciones
└── index.ts             # ✅ REQUERIDO - Exportaciones públicas
```

### **📤 Patrón de Exportaciones**

```typescript
// shared/hooks/index.ts
export { useAuth, useAdminPage, useProtectedPage } from "./useAuth";
export {
  useFeatureFlags,
  useFeatureFlag,
  FeatureFlagsProvider,
} from "./useFeatureFlags";
export { usePermissions } from "./usePermissions";

// shared/index.ts
export * from "./hooks";
export * from "./types";
export * from "./utils";
```

## 🔧 Type Guards Incluidos

```typescript
import { isApiSuccess, isApiError } from "@/shared/types";

// Verificar respuesta exitosa
const response = await api.getUsers();
if (isApiSuccess(response)) {
  // TypeScript sabe que response.data existe
  console.log(response.data);
}

// Verificar error
if (isApiError(response)) {
  // TypeScript sabe que response.error existe
  console.error(response.error);
}
```

## 🎯 Casos de Uso Comunes

### **🔐 Control de Acceso**

```typescript
import { useAuth, usePermissions } from "@/shared";

function ProtectedComponent() {
  const { isAuthenticated } = useAuth();
  const { hasPermission } = usePermissions();

  if (!isAuthenticated) return <LoginPrompt />;
  if (!hasPermission("feature.read")) return <NoAccess />;

  return <FeatureContent />;
}
```

### **🎛️ Funcionalidades Condicionales**

```typescript
import { useFeatureFlag } from "@/shared";

function ConditionalUI() {
  const showNewDesign = useFeatureFlag("NEW_UI_DESIGN");

  return showNewDesign ? <NewDesign /> : <OldDesign />;
}
```

### **🎨 Estilos Condicionales**

```typescript
import { cn } from "@/shared";

function StatusBadge({ status, className }) {
  return (
    <span
      className={cn(
        "px-2 py-1 rounded text-sm",
        {
          "bg-green-100 text-green-800": status === "active",
          "bg-red-100 text-red-800": status === "inactive",
        },
        className
      )}
    >
      {status}
    </span>
  );
}
```

## 🔗 Integración con Otros Dominios

### **⬆️ Usado por Core**

```typescript
// Core usa shared para funcionalidades base
import { useAuth } from "@/shared"; // En core/auth
```

### **⬆️ Usado por Modules**

```typescript
// Módulos usan shared para funcionalidades comunes
import { useFeatureFlag } from "@/shared"; // En modules/
```

### **⬇️ NO usa dependencias**

- Shared **NO** debe importar de `core/` o `modules/`
- Debe ser **independiente** y **autocontenido**

---

**💡 Tip:** Si algo se usa en 2+ módulos diferentes, probablemente debería estar en `shared/`. ¡Es el corazón reutilizable de tu aplicación!
