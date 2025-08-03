# 🧩 Modules - Sistema Modular

> **Funcionalidades opcionales plug-and-play**

## 🎯 Propósito

El directorio `modules/` contiene **funcionalidades opcionales** que pueden **activarse o desactivarse** dinámicamente según las necesidades del proyecto. Cada módulo es **independiente** y **plug-and-play**.

## 📁 Estructura Actual

```
modules/
├── 📁 file-upload/           # Gestión completa de archivos
│   ├── components/          # UI del módulo
│   ├── hooks/              # Lógica reutilizable
│   ├── services/           # Upload providers (local, S3)
│   ├── types/              # Interfaces del módulo
│   ├── utils/              # Utilidades específicas
│   ├── config/             # Configuración del módulo
│   └── index.ts            # API pública del módulo
└── 📤 [futuros-módulos]/    # Payments, Chat, Analytics, etc.
```

## 🏗️ Anatomía de un Módulo

### **📋 Estructura Estándar**

```typescript
mi-modulo/
├── 🧩 components/           # React components
│   ├── ModuleView.tsx      # Vista principal
│   ├── ModuleCard.tsx      # Componentes específicos
│   └── index.ts            # Exportaciones
├── 🪝 hooks/               # Custom hooks
│   ├── useModuleData.ts    # Hook principal
│   └── index.ts            # Exportaciones
├── 🔧 services/            # Lógica de negocio
│   ├── module-api.ts       # Comunicación API
│   ├── module-utils.ts     # Utilidades
│   └── index.ts            # Exportaciones
├── 📝 types/               # TypeScript interfaces
│   └── index.ts            # Tipos del módulo
├── ⚙️ config/              # Configuración
│   └── index.ts            # Settings del módulo
├── 🛠️ utils/               # Utilidades específicas
│   └── index.ts            # Helper functions
└── 📤 index.ts             # API PÚBLICA del módulo
```

## 🎮 Módulos Actuales

### **📁 [`file-upload/`](./file-upload/README.md) - Gestión de Archivos**

**🎯 Funcionalidad:**

- Upload de archivos local y S3
- Gestión de categorías
- Galerías de imágenes
- Estadísticas de uso

**🚀 Uso Básico:**

```typescript
import {
  FileUploader, // Componente de upload
  FileManager, // Gestión completa
  useFileUpload, // Hook de upload
  useFileManager, // Hook de gestión
} from "@/modules/file-upload";

function MyComponent() {
  const { uploadFile, isUploading } = useFileUpload();

  return (
    <div>
      <FileUploader onUpload={uploadFile} />
      <FileManager />
    </div>
  );
}
```

**⚙️ Activación:**

```typescript
// En feature flags
FILE_UPLOAD: true; // ✅ Módulo activo
```

## 🚀 Cómo Usar Módulos

### **🔍 Importar Módulo Completo**

```typescript
// ✅ API pública limpia
import {
  FileUploader,
  FileManager,
  useFileUpload,
} from "@/modules/file-upload";
```

### **❌ NO hacer importaciones profundas**

```typescript
// ❌ Evitar esto
import { FileUploader } from "@/modules/file-upload/components/FileUploader";

// ✅ Hacer esto
import { FileUploader } from "@/modules/file-upload";
```

### **🎛️ Control de Activación**

```typescript
// Hook para verificar si módulo está activo
import { useFeatureFlag } from "@/core/config";

function MyFeature() {
  const isFileUploadEnabled = useFeatureFlag("FILE_UPLOAD");

  if (!isFileUploadEnabled) {
    return <div>Funcionalidad no disponible</div>;
  }

  return <FileManager />;
}
```

## ➕ Crear Nuevo Módulo

### **1. 🏗️ Crear Estructura**

```bash
# Crear directorio del módulo
mkdir src/modules/mi-nuevo-modulo

# Crear subdirectorios estándar
cd src/modules/mi-nuevo-modulo
mkdir components hooks services types config utils

# Crear archivos index
touch components/index.ts hooks/index.ts services/index.ts
touch types/index.ts config/index.ts utils/index.ts index.ts
```

### **2. 📝 Definir API Pública**

```typescript
// src/modules/mi-nuevo-modulo/index.ts
// 🎯 MI NUEVO MÓDULO INDEX
// =========================
// Exportaciones públicas del módulo

// 🧩 Componentes principales
export { default as ModuloView } from "./components/ModuloView";
export { default as ModuloCard } from "./components/ModuloCard";

// 🪝 Hooks
export { useModuloData } from "./hooks/useModuloData";

// 📝 Tipos (solo los necesarios externamente)
export type { ModuloData, ModuloConfig } from "./types";

// ⚙️ Configuración pública
export { MODULO_CONFIG } from "./config";
```

### **3. 🎛️ Configurar Feature Flag**

```typescript
// src/core/config/feature-flags.ts
export const FEATURE_FLAGS = {
  // ... otros flags
  MI_NUEVO_MODULO: false, // ⚙️ Inicialmente desactivado
} as const;

// src/core/config/modules.ts
export const MODULE_CONFIG = {
  MI_NUEVO_MODULO: {
    name: "Mi Nuevo Módulo",
    description: "Descripción del módulo",
    version: "1.0.0",
    dependencies: [], // Otros módulos requeridos
  },
};
```

### **4. 🌐 Crear Rutas API (si necesario)**

```bash
# Crear endpoint del módulo
mkdir src/app/api/modules/mi-nuevo-modulo
touch src/app/api/modules/mi-nuevo-modulo/route.ts
```

### **5. 📚 Documentar Módulo**

```bash
# Crear README específico
touch src/modules/mi-nuevo-modulo/README.md
```

## 📝 Convenciones de Módulos

### **🏗️ Principios de Diseño**

- **INDEPENDENCIA** - Cero dependencias entre módulos
- **PLUG-AND-PLAY** - Activar/desactivar sin breaking changes
- **API LIMPIA** - Exportaciones controladas en `index.ts`
- **FEATURE FLAGS** - Control dinámico de activación

### **📂 Estándares de Estructura**

```typescript
// ✅ Estructura requerida
modulo/
├── components/         # REQUERIDO - UI del módulo
├── hooks/             # RECOMENDADO - Lógica reutilizable
├── services/          # RECOMENDADO - Business logic
├── types/             # REQUERIDO - Interfaces TypeScript
├── index.ts           # REQUERIDO - API pública
└── README.md          # REQUERIDO - Documentación
```

### **🎨 Nomenclatura**

- **Directorios**: `kebab-case` (`file-upload`, `payment-gateway`)
- **Componentes**: `PascalCase` (`FileUploader`, `PaymentForm`)
- **Hooks**: `camelCase` (`useFileUpload`, `usePayment`)
- **Tipos**: `PascalCase` (`FileData`, `PaymentConfig`)

## 🔗 Integración con Core

### **🎛️ Feature Flags**

```typescript
// Los módulos se controlan desde el core
import { useFeatureFlag } from "@/core/config";

const isModuleEnabled = useFeatureFlag("MI_MODULO");
```

### **🔐 Permisos**

```typescript
// Los permisos se definen en el core
import { PermissionGate } from "@/core/auth";

<PermissionGate requiredPermissions={["module.mi_modulo.read"]}>
  <MiModuloComponent />
</PermissionGate>;
```

### **🧩 Componentes Base**

```typescript
// Usar componentes del core cuando sea posible
import { Button, Card, LoadingSpinner } from "@/core/components";
```

## 📋 Checklist para Nuevo Módulo

### **✅ Estructura**

- [ ] Directorio con nombre `kebab-case`
- [ ] Subdirectorios estándar (`components/`, `hooks/`, etc.)
- [ ] Archivo `index.ts` con API pública
- [ ] Archivo `README.md` con documentación

### **✅ Configuración**

- [ ] Feature flag en `core/config/feature-flags.ts`
- [ ] Configuración en `core/config/modules.ts`
- [ ] Rutas API en `app/api/modules/` (si necesario)

### **✅ Código**

- [ ] Componentes principales implementados
- [ ] Hooks de funcionalidad principal
- [ ] Tipos TypeScript definidos
- [ ] Tests básicos (recomendado)

### **✅ Integración**

- [ ] Importable desde `@/modules/nombre-modulo`
- [ ] Compatible con feature flags
- [ ] Respeta permisos de usuario
- [ ] No break otros módulos

## 🎯 Módulos Futuros Sugeridos

```typescript
// 💳 Payments
modules/payment-gateway/     # Stripe, PayPal integration

// 💬 Chat/Messaging
modules/messaging/           # Real-time chat system

// 📊 Analytics
modules/analytics/           # User tracking and insights

// 📧 Email Marketing
modules/email-campaigns/     # Email automation

// 🛒 E-commerce
modules/shopping-cart/       # Shopping and checkout

// 🤖 AI Integration
modules/ai-assistant/        # ChatGPT, AI features
```

---

**💡 Tip:** Cada módulo debe ser **completamente independiente** y **bien documentado**. Si necesitas compartir lógica entre módulos, probablemente debería ir en `shared/`.
