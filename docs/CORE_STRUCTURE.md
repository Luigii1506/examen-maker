# 🏗️ Core Structure Documentation

## 📋 **Visión General**

El directorio `src/core/` contiene toda la funcionalidad fundamental que estará presente en **todas** las aplicaciones, independientemente del dominio de negocio específico.

## 🎯 **Principio Arquitectónico**

> _"Si es fundamental para cualquier aplicación que maneja usuarios, va en core"_

**Core incluye:**

- ✅ **Authentication** - Sistema de autenticación base
- ✅ **Dashboard** - Interfaz principal de administración
- ✅ **User Management** - Gestión de usuarios y roles
- ✅ **Admin Tools** - Herramientas de administración (feature flags, etc.)

**Modules incluye:**

- ✅ **File Upload** - Carga de archivos (opcional)
- ✅ **Payments** - Procesamiento de pagos (opcional)
- ✅ **E-commerce** - Funcionalidades de tienda (opcional)

## 📁 **Estructura del Core**

```
src/core/
├── admin/                    # 🎛️ Sistema completo de administración
│   ├── components/           # 🧩 Componentes base de admin
│   │   ├── AdminLayout.tsx   # Layout principal de administración
│   │   └── index.ts
│   ├── dashboard/            # 🏠 Dashboard principal
│   │   ├── page.tsx
│   │   └── index.ts
│   ├── users/                # 👥 Gestión de usuarios
│   │   ├── components/
│   │   │   ├── DashboardView.tsx
│   │   │   ├── UsersView.tsx
│   │   │   ├── UserCard.tsx
│   │   │   └── UserModal.tsx
│   │   └── index.ts
│   ├── feature-flags/        # 🎛️ Feature flags
│   │   ├── components/
│   │   │   ├── FeatureFlagsAdmin.tsx
│   │   │   └── FeatureFlagCard.tsx
│   │   ├── types/
│   │   └── index.ts
│   └── index.ts              # Exportaciones de admin
├── auth/                     # 🔐 Autenticación y autorización
│   ├── auth/
│   └── config/
└── index.ts                  # Exportaciones centralizadas
```

## 🔄 **Migración Realizada**

### **Antes (features/)**

```typescript
// ❌ ANTES - Features dispersas
import { DashboardView } from "@/features/dashboard/components";
import { UsersView } from "@/features/user-management/components";
```

### **Ahora (core/admin/)**

```typescript
// ✅ AHORA - Admin centralizado
import { DashboardView, UsersView } from "@/core/admin/users/components";
import { FeatureFlagsAdmin } from "@/core/admin/feature-flags";
import { AdminDashboardPage } from "@/core/admin/dashboard";
```

## 📊 **Importaciones Recomendadas**

### **Desde Core**

```typescript
// Componentes principales
import {
  AdminDashboardPage,
  DashboardView,
  UsersView,
  FeatureFlagsAdmin,
} from "@/core";

// Específicos por módulo
import { UsersView } from "@/core/admin/users";
import { FeatureFlagsAdmin } from "@/core/admin/feature-flags";
```

### **Desde Modules (opcionales)**

```typescript
// Solo si el módulo está habilitado
import { FilesView } from "@/modules/file-upload";
import { PaymentForm } from "@/modules/payments";
```

## 🎛️ **Feature Flags Integration**

El core se integra perfectamente con el sistema de feature flags:

```typescript
// Core features (siempre disponibles)
const coreFlags = {
  authentication: true,
  userManagement: true,
  dashboard: true,
  advancedUserManagement: true,
};

// Module features (controladas por feature flags)
const moduleFlags = {
  fileUpload: MODULE_CONFIG.fileUpload.enabled,
  payments: MODULE_CONFIG.stripePayments.enabled,
  ecommerce: MODULE_CONFIG.ecommerce.enabled,
};
```

## 🚀 **Beneficios de esta Estructura**

### **1. Reutilización**

- El core es 100% reutilizable entre proyectos
- Solo cambias los módulos según las necesidades

### **2. Mantenimiento**

- Actualizaciones al core benefician a todos los proyectos
- Separación clara entre funcionalidad base y específica

### **3. Escalabilidad**

- Fácil agregar nuevos módulos sin afectar el core
- Feature flags controlan qué está activo

### **4. Arquitectura Clara**

- Dependencias unidireccionales (modules → core, nunca al revés)
- Separación de responsabilidades evidente

## 📝 **Reglas de Desarrollo**

### **✅ Permitido**

- Core puede importar de `@/shared`
- Core puede importar de `@/config`
- Modules pueden importar de `@/core`
- Modules pueden importar de `@/shared`

### **❌ Prohibido**

- Core NO puede importar de `@/modules`
- Un module NO puede importar de otro module directamente

## 🔧 **Configuración en Routes**

```typescript
// app/dashboard/page.tsx
export { default } from "@/core/admin/dashboard/page";

// app/admin/feature-flags/page.tsx
export { default } from "@/core/admin/components/FeatureFlagsAdmin";
```

## 📚 **Próximos Pasos**

1. **Standardización**: Aplicar esta estructura a todos los nuevos proyectos
2. **Templates**: Crear templates de proyecto con core pre-configurado
3. **CLI Tools**: Herramientas para generar módulos que sigan estas convenciones
4. **Documentation**: Mantener esta documentación actualizada con nuevos patterns

---

> **Nota**: Esta estructura garantiza que cualquier nueva aplicación pueda beneficiarse inmediatamente de toda la funcionalidad core sin código duplicado.
