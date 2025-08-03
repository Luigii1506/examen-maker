# 🏗️ Core - Funcionalidades Fundamentales

> **Funcionalidades que SIEMPRE necesita la aplicación**

## 🎯 Propósito

El directorio `core/` contiene todas las **funcionalidades fundamentales** que son **siempre necesarias** para el funcionamiento de la aplicación, independientemente de los módulos opcionales que se activen.

## 📁 Estructura

```
core/
├── 🔐 auth/              # Sistema de autenticación y autorización
├── 🎛️ admin/             # Panel de administración completo
├── 🔧 config/            # Configuración global (feature flags, environment)
├── 🧩 components/        # Componentes UI base reutilizables
├── 🗃️ database/          # Prisma schema y configuración DB
├── 🛠️ utils/             # Utilidades específicas del core
└── 📤 index.ts           # Exportaciones públicas del core
```

## 🧩 Dominios Principales

### **🔐 [`auth/`](./auth/README.md) - Autenticación**

- **Better Auth** integration
- **Sistema de roles** y permisos
- **Componentes de auth** (Login, Register, etc.)
- **Hooks** (`useAuth`, `usePermissions`)

```typescript
// Ejemplo de uso
import { useAuth, PermissionGate } from "@/core/auth";

function MyComponent() {
  const { user, isAuthenticated } = useAuth();

  return (
    <PermissionGate requiredPermissions={["admin.read"]}>
      <AdminPanel />
    </PermissionGate>
  );
}
```

### **🎛️ [`admin/`](./admin/README.md) - Administración**

- **Dashboard principal** con métricas
- **Gestión de usuarios** completa
- **Feature flags** management
- **Layout de admin** (`AdminLayout`)

```typescript
// Estructura del admin
admin/
├── components/          # AdminLayout, componentes compartidos
├── dashboard/          # Vista principal del dashboard
├── users/              # Gestión de usuarios
├── feature-flags/      # Administración de feature flags
└── index.ts           # Exportaciones públicas
```

### **🔧 [`config/`](./config/) - Configuración**

- **Feature flags** (`feature-flags.ts`)
- **Variables de entorno** (`environment.ts`)
- **Configuración de módulos** (`modules.ts`)

```typescript
// Ejemplo de feature flags
import { useFeatureFlag } from "@/core/config";

function NewFeature() {
  const isEnabled = useFeatureFlag("NEW_FEATURE");

  if (!isEnabled) return null;

  return <div>Nueva funcionalidad</div>;
}
```

### **🧩 [`components/`](./components/) - UI Base**

- **Button, Card, Badge** - Componentes básicos
- **LoadingSpinner** - Estados de carga
- **Styled components** consistentes

```typescript
// Componentes base reutilizables
import { Button, Card, Badge } from "@/core/components";

function MyCard() {
  return (
    <Card>
      <h3>Título</h3>
      <Badge variant="success">Activo</Badge>
      <Button variant="primary">Acción</Button>
    </Card>
  );
}
```

## 🚀 Cómo Usar

### **🔍 Explorar Funcionalidades Core**

```typescript
// Importar desde el core
import {
  useAuth, // Hook de autenticación
  PermissionGate, // Control de permisos
  AdminLayout, // Layout de admin
  Button, // Componente base
} from "@/core";
```

### **➕ Agregar Nueva Funcionalidad Core**

#### **1. ¿Es Autenticación/Autorización?**

```bash
# Ir a auth/
cd src/core/auth/
# Ver estructura en auth/README.md
```

#### **2. ¿Es Administración?**

```bash
# Ir a admin/
cd src/core/admin/
# Ver estructura en admin/README.md
```

#### **3. ¿Es Configuración Global?**

```bash
# Agregar a config/
touch src/core/config/nueva-config.ts
```

#### **4. ¿Es Componente UI Base?**

```bash
# Agregar a components/
touch src/core/components/ui/NuevoComponente.tsx
```

## 📝 Convenciones del Core

### **🏗️ Principios Fundamentales**

- **SIEMPRE NECESARIO** - Solo incluir funcionalidades indispensables
- **CERO DEPENDENCIAS** de módulos opcionales
- **API LIMPIA** - Exportaciones bien definidas en `index.ts`
- **ALTA CALIDAD** - Máxima estabilidad y testing

### **📂 Estructura de Subdominios**

```typescript
subdominio/
├── components/          # UI específica del subdominio
├── hooks/              # Lógica reutilizable
├── services/           # Lógica de negocio
├── types/              # Interfaces TypeScript
├── config/             # Configuración específica
└── index.ts            # API pública del subdominio
```

### **📤 Patrón de Exportaciones**

```typescript
// ❌ NO hacer esto
import { SpecificComponent } from "@/core/admin/components/SpecificComponent";

// ✅ Hacer esto
import { SpecificComponent } from "@/core/admin";
import { Button } from "@/core/components";
```

## 🔗 APIs Principales

### **🔐 Autenticación**

```typescript
import { useAuth, usePermissions, PermissionGate } from "@/core/auth";
```

### **🎛️ Administración**

```typescript
import { AdminLayout, FeatureFlagsAdmin, UsersView } from "@/core/admin";
```

### **🔧 Configuración**

```typescript
import { useFeatureFlag, environmentConfig } from "@/core/config";
```

### **🧩 Componentes**

```typescript
import { Button, Card, Badge, LoadingSpinner } from "@/core/components";
```

## ⚠️ Consideraciones Importantes

### **🚫 Qué NO incluir en Core**

- ❌ Funcionalidades **opcionales** (van en `modules/`)
- ❌ **Recursos compartidos** genéricos (van en `shared/`)
- ❌ **Lógica específica** de negocio (va en `modules/`)
- ❌ **Dependencias externas** no críticas

### **✅ Qué SÍ incluir en Core**

- ✅ **Autenticación** (siempre necesaria)
- ✅ **Configuración global** (feature flags, env)
- ✅ **UI base** (botones, cards básicos)
- ✅ **Admin panel** (gestión del sistema)

## 🧭 Navegación

| Área           | Descripción                  | README                                 |
| -------------- | ---------------------------- | -------------------------------------- |
| **Auth**       | Autenticación y autorización | [`auth/README.md`](./auth/README.md)   |
| **Admin**      | Panel de administración      | [`admin/README.md`](./admin/README.md) |
| **Config**     | Configuración global         | `config/`                              |
| **Components** | UI base reutilizable         | `components/`                          |
| **Database**   | Prisma y esquemas            | `database/`                            |

---

**💡 Tip:** El core debe ser **estable** y **bien documentado**. Cualquier cambio aquí afecta a toda la aplicación.
