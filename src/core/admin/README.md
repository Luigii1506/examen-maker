# 🎛️ Core Admin - Sistema de Administración

> **Panel de administración completo del sistema**

## 🎯 Propósito

El directorio `core/admin/` contiene **todo el sistema de administración** del sistema, incluyendo dashboard, gestión de usuarios, feature flags y componentes de layout. Es el **centro de control** de la aplicación.

## 📁 Estructura

```
admin/
├── 🧩 components/         # Componentes compartidos del admin
│   ├── AdminLayout.tsx   # Layout principal de admin
│   └── index.ts          # Exportaciones de componentes
├── 🏠 dashboard/          # Dashboard principal con métricas
│   ├── page.tsx         # Vista del dashboard
│   └── index.ts         # Exportaciones del dashboard
├── 👥 users/             # Gestión completa de usuarios
│   ├── components/      # UI de gestión de usuarios
│   └── index.ts         # Exportaciones de users
├── 🎛️ feature-flags/     # Administración de feature flags
│   ├── components/      # UI de feature flags
│   ├── config/          # Configuración y metadata
│   ├── types/           # Tipos específicos
│   └── index.ts         # Exportaciones de feature flags
└── 📤 index.ts           # API pública del admin
```

## 🏠 Dashboard Principal

### **📊 Vista del Dashboard**

```typescript
import { AdminDashboardPage } from "@/core/admin/dashboard";

// El dashboard incluye:
// - Métricas del sistema
// - Estadísticas de usuarios
// - Gestión rápida de feature flags
// - Vista de usuarios activos
```

### **🎯 Funcionalidades**

- **Métricas en tiempo real** del sistema
- **Gestión rápida** de usuarios
- **Control de feature flags** integrado
- **Vista consolidada** de todas las funciones de admin

## 👥 Gestión de Usuarios

### **🔍 Componentes Disponibles**

```typescript
import {
  UsersView, // Vista principal de usuarios
  UserCard, // Tarjeta individual de usuario
  UserModal, // Modal de edición/creación
  DashboardView, // Vista integrada en dashboard
} from "@/core/admin/users";
```

### **🚀 Uso Básico**

```typescript
function AdminUsers() {
  return (
    <AdminLayout>
      <UsersView />
    </AdminLayout>
  );
}
```

### **🎯 Funcionalidades**

- **Lista paginada** de usuarios
- **Filtros avanzados** (rol, estado, fecha)
- **Edición inline** de información
- **Cambio de roles** y permisos
- **Estadísticas** de usuarios

## 🎛️ Feature Flags Administration

### **🎮 Componentes Principales**

```typescript
import {
  FeatureFlagsAdmin, // Administración completa
  FeatureFlagCard, // Tarjeta individual de flag
} from "@/core/admin/feature-flags";
```

### **⚙️ Configuración Centralizada**

```typescript
import {
  FEATURE_FLAG_METADATA, // Metadata de flags
  CATEGORY_CONFIG, // Configuración de categorías
  getFeatureFlagMetadata, // Helper de metadata
  getCategoryConfig, // Helper de categorías
} from "@/core/admin/feature-flags/config";
```

### **🚀 Uso del Administrador**

```typescript
function FeatureFlagsPage() {
  return (
    <AdminLayout>
      <FeatureFlagsAdmin />
    </AdminLayout>
  );
}
```

### **🎯 Funcionalidades**

- **Control visual** de todos los feature flags
- **Categorización** por tipos (Core, Modules, UI, etc.)
- **Búsqueda y filtros** avanzados
- **Estadísticas** de activación
- **Gestión de dependencias** entre flags

## 🧩 AdminLayout

### **🏗️ Layout Principal**

```typescript
import { AdminLayout } from "@/core/admin/components";

function MyAdminPage() {
  return (
    <AdminLayout>
      <div>Contenido de mi página de admin</div>
    </AdminLayout>
  );
}
```

### **🎯 Características**

- **Sidebar de navegación** con todas las secciones
- **Header** con información del usuario
- **Control de permisos** integrado
- **Responsive design** para mobile/desktop
- **Breadcrumbs** automáticos

## 🚀 Cómo Usar el Admin

### **🔍 Importar Componentes**

```typescript
// ✅ Importar desde la API pública
import {
  AdminLayout, // Layout
  FeatureFlagsAdmin, // Feature flags
  UsersView, // Gestión de usuarios
  AdminDashboardPage, // Dashboard completo
} from "@/core/admin";

// ✅ También funciona por subdominios
import { AdminLayout } from "@/core/admin/components";
import { FeatureFlagsAdmin } from "@/core/admin/feature-flags";
import { UsersView } from "@/core/admin/users";
```

### **🛡️ Control de Acceso**

```typescript
import { PermissionGate } from "@/core/auth";
import { AdminLayout, UsersView } from "@/core/admin";

function ProtectedAdminPage() {
  return (
    <PermissionGate requiredPermissions={["admin.read"]}>
      <AdminLayout>
        <PermissionGate requiredPermissions={["admin.users.manage"]}>
          <UsersView />
        </PermissionGate>
      </AdminLayout>
    </PermissionGate>
  );
}
```

## ➕ Agregar Nueva Función de Admin

### **🏗️ Nueva Sección de Admin**

```typescript
// 1. Crear directorio de la nueva sección
mkdir src/core/admin/nueva-seccion
mkdir src/core/admin/nueva-seccion/components

// 2. Crear componente principal
// nueva-seccion/components/NuevaSeccionView.tsx
export default function NuevaSeccionView() {
  return (
    <div>
      <h1>Nueva Sección de Admin</h1>
      {/* Contenido de la sección */}
    </div>
  );
}

// 3. Exportar en nueva-seccion/index.ts
export { default as NuevaSeccionView } from "./components/NuevaSeccionView";

// 4. Re-exportar en admin/index.ts
export * from "./nueva-seccion";
```

### **🌐 Agregar Ruta API**

```typescript
// Crear endpoint en app/api/admin/
mkdir src/app/api/admin/nueva-seccion
touch src/app/api/admin/nueva-seccion/route.ts

// Implementar API
export async function GET() {
  // Lógica del endpoint
  return Response.json({ data: "Nueva sección data" });
}
```

### **🔐 Configurar Permisos**

```typescript
// En core/auth/config/permissions.ts
export const PERMISSIONS = {
  // ... otros permisos
  "admin.nueva_seccion.read": "Ver nueva sección",
  "admin.nueva_seccion.write": "Editar nueva sección",
  "admin.nueva_seccion.delete": "Eliminar en nueva sección",
};
```

### **🧭 Agregar a Navegación**

```typescript
// En AdminLayout.tsx, agregar al sidebar
const navigationItems = [
  // ... otros items
  {
    name: "Nueva Sección",
    href: "/admin/nueva-seccion",
    icon: IconComponent,
    requiredPermissions: ["admin.nueva_seccion.read"],
  },
];
```

## 📝 Convenciones del Admin

### **🏗️ Principios de Admin**

- **PROTEGIDO** - Siempre controlar permisos
- **CONSISTENTE** - Usar `AdminLayout` en todas las páginas
- **RESPONSIVE** - Funcionar en móvil y desktop
- **ACCESIBLE** - Cumplir estándares de accesibilidad

### **📂 Estructura de Nuevas Secciones**

```typescript
nueva-seccion/
├── components/          # UI de la sección
│   ├── SeccionView.tsx # Vista principal
│   ├── SeccionCard.tsx # Componentes específicos
│   └── index.ts        # Exportaciones
├── hooks/              # Lógica de la sección (opcional)
├── types/              # Tipos específicos (opcional)
└── index.ts            # API pública
```

### **🎨 Patrón de Componentes**

```typescript
// Todas las vistas de admin deben seguir este patrón
function AdminSeccionView() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Título de Sección</h1>
          <ActionButton />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contenido principal */}
        </div>
      </div>
    </AdminLayout>
  );
}
```

### **🔐 Control de Permisos Estándar**

```typescript
// Cada sección debe implementar control de permisos
import { PermissionGate } from "@/core/auth";

function SeccionProtegida() {
  return (
    <PermissionGate requiredPermissions={["admin.seccion.read"]}>
      <SeccionContent />
    </PermissionGate>
  );
}
```

## 🎯 Mejores Prácticas

### **🔒 Seguridad**

- **Siempre** verificar permisos en cliente Y servidor
- **Validar** todas las acciones críticas (cambio de roles, etc.)
- **Auditar** todas las acciones de admin

### **🎨 UX/UI**

- **Confirmaciones** para acciones destructivas
- **Loading states** durante operaciones
- **Feedback visual** para acciones exitosas/fallidas
- **Breadcrumbs** para navegación clara

### **⚡ Performance**

- **Paginación** en listas largas de datos
- **Lazy loading** para componentes pesados
- **Memoización** de cálculos costosos

## 🔗 Integraciones

### **🎛️ Con Feature Flags**

```typescript
import { useFeatureFlag } from "@/shared/hooks";

function ConditionalAdminFeature() {
  const isEnabled = useFeatureFlag("ADMIN_ADVANCED_FEATURES");

  if (!isEnabled) return null;

  return <AdvancedAdminPanel />;
}
```

### **👤 Con Sistema de Usuarios**

```typescript
import { useAuth, usePermissions } from "@/shared/hooks";

function UserSpecificAdmin() {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();

  return (
    <div>
      <p>Admin: {user?.name}</p>
      {hasPermission("admin.super") && <SuperAdminTools />}
    </div>
  );
}
```

---

**💡 Tip:** El admin debe ser **intuitivo** y **poderoso**. Cada función debe estar bien documentada y protegida con los permisos adecuados.
