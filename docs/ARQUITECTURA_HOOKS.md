# 🏗️ **Arquitectura de Hooks - Estructura Correcta**

## 🎯 **Principio: Encapsulación por Features**

Cada feature mantiene su propia lógica encapsulada. Los hooks solo van en `shared/` si son verdaderamente compartidos entre **múltiples features diferentes**.

## ✅ **Estructura Final Correcta**

```
src/
├── shared/hooks/
│   ├── useAuth.ts              ← ✅ Compartido: auth para toda la app
│   ├── useFeatureFlags.tsx     ← ✅ Compartido: feature flags globales
│   └── usePermissions.ts       ← ✅ Compartido: permisos en múltiples features
├── features/
│   ├── exams/                  ← 👤 Feature para USUARIOS
│   │   └── hooks/
│   │       ├── index.ts        ← Export de hooks de usuario
│   │       └── useUserExams.ts ← useUserExams(), useExam()
│   └── admin-exams/            ← 👨‍💼 Feature para ADMINISTRADORES
│       └── hooks/
│           ├── index.ts        ← Export de hooks de admin
│           └── useAdminExams.ts ← useAdminExams(), useQuestionsForExam()
└── app/
    ├── user-dashboard/         ← Página que usa features/exams
    └── exam/                   ← Página que usa features/exams
```

## 🔍 **¿Cuándo va en `shared/`?**

### ✅ **SÍ va en shared/**

```typescript
// Hooks usados por MÚLTIPLES features diferentes
useAuth()           ← auth + admin-auth + user-profile
usePermissions()    ← admin-exams + admin-users + reports
useFeatureFlags()   ← exams + admin-exams + certifications
```

### ❌ **NO va en shared/**

```typescript
// Hooks específicos de UNA sola feature
useUserExams()      ← Solo para feature "exams"
useAdminExams()     ← Solo para feature "admin-exams"
useFileUpload()     ← Solo para feature "file-upload"
```

## 📂 **Imports Correctos**

### **Para Features de Usuario:**

```typescript
// ✅ CORRECTO
import { useUserExams, useExam } from "@/features/exams/hooks";

// ❌ INCORRECTO
import { useUserExams } from "@/shared/hooks/useUserExams";
```

### **Para Features de Admin:**

```typescript
// ✅ CORRECTO
import { useAdminExams } from "@/features/admin-exams/hooks";

// ❌ INCORRECTO
import { useAdminExams } from "@/shared/hooks/useAdminExams";
```

### **Para Hooks Compartidos:**

```typescript
// ✅ CORRECTO - Estos SÍ van en shared
import { useAuth } from "@/shared/hooks/useAuth";
import { usePermissions } from "@/shared/hooks/usePermissions";
```

## 🎉 **Ventajas de esta Arquitectura**

✅ **Encapsulación**: Cada feature maneja su propia lógica  
✅ **Mantenibilidad**: Fácil encontrar y modificar hooks específicos  
✅ **Reutilización**: `shared/` solo para código verdaderamente compartido  
✅ **Escalabilidad**: Agregar nuevas features no afecta las existentes  
✅ **Claridad**: Imports expresan claramente las dependencias

## 🔄 **Migración Completada**

```diff
- src/shared/hooks/useUserExams.ts
+ src/features/exams/hooks/useUserExams.ts

- import { useUserExams } from "@/shared/hooks/useUserExams";
+ import { useUserExams } from "@/features/exams/hooks";
```

**¡Ahora la arquitectura sigue correctamente el patrón por features!** 🚀
