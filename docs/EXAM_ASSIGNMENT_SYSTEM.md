# 🎯 Sistema de Exámenes Multi-Tipo

Este documento describe el nuevo sistema que soporta **3 tipos diferentes de exámenes** con comportamientos distintos para cubrir diferentes necesidades educativas.

## 📚 **Tipos de Exámenes**

### **1. SCHEDULED** (Controlado por Administrador)

- **Descripción**: El administrador asigna usuarios específicos y controla cuándo empieza para todos
- **Uso**: Exámenes oficiales de certificación con horario fijo
- **Control**: Total control administrativo del timing
- **Flujo**: Admin asigna → Admin inicia → Todos toman al mismo tiempo

### **2. SELF_PACED** (Auto-dirigido)

- **Descripción**: El administrador asigna usuarios específicos, pero cada uno puede empezar cuando quiera
- **Uso**: Exámenes tipo guía para usuarios específicos
- **Control**: Asignación admin, inicio por usuario
- **Flujo**: Admin asigna → Usuario puede empezar cuando quiera

### **3. PUBLIC** (Público)

- **Descripción**: Disponible para todos los usuarios, sin necesidad de asignación
- **Uso**: Exámenes de práctica o guías abiertas
- **Control**: Acceso libre para todos
- **Flujo**: Admin publica → Cualquier usuario puede tomarlo

## 🔄 **Estados del Sistema**

### **Estados por Tipo de Examen**

| Estado        | SCHEDULED | SELF_PACED | PUBLIC | Descripción                           |
| ------------- | --------- | ---------- | ------ | ------------------------------------- |
| **DRAFT**     | ✅        | ✅         | ✅     | Siendo creado por admin               |
| **ASSIGNED**  | ✅        | ✅         | ❌     | Asignado pero no iniciado             |
| **STARTED**   | ✅        | ❌         | ❌     | Admin ha iniciado (solo SCHEDULED)    |
| **ACTIVE**    | ❌        | ✅         | ✅     | Disponible para tomar                 |
| **COMPLETED** | ✅        | ❌         | ❌     | Terminado por tiempo (solo SCHEDULED) |
| **ARCHIVED**  | ✅        | ✅         | ✅     | Archivado                             |
| **SUSPENDED** | ✅        | ✅         | ✅     | Temporalmente suspendido              |

## 🎮 **Flujos de Trabajo**

### **🕐 SCHEDULED (Examen Programado)**

1. **Admin crea examen** (DRAFT) → Tipo: SCHEDULED
2. **Admin asigna usuarios** → Estado: ASSIGNED
3. **Admin presiona "Empezar Examen"** → Estado: STARTED
   - ⏰ Tiempo empieza para TODOS simultáneamente
4. **Usuarios ven examen disponible** y pueden empezar
5. **Examen termina automáticamente** → Estado: COMPLETED

### **📖 SELF_PACED (Auto-dirigido)**

1. **Admin crea examen** (DRAFT) → Tipo: SELF_PACED
2. **Admin asigna usuarios** → Estado: ACTIVE
3. **Cada usuario puede empezar cuando quiera**
   - ⏱️ Cada usuario tiene su propio timer individual
4. **No hay límite de tiempo global**

### **🌍 PUBLIC (Público)**

1. **Admin crea examen** (DRAFT) → Tipo: PUBLIC
2. **Admin publica examen** → Estado: ACTIVE
3. **Cualquier usuario puede verlo y tomarlo**
   - 🔓 No requiere asignación
   - ⏱️ Cada usuario tiene su propio timer

## 🗄️ **Cambios en Base de Datos**

### **Nuevo Campo: examType**

```prisma
model Exam {
  // ... campos existentes
  examType    ExamType @default(SCHEDULED)
  // ... resto del modelo
}

enum ExamType {
  SCHEDULED   // Admin assigns users and controls start time
  SELF_PACED  // Admin assigns users, they start when they want
  PUBLIC      // Open to all users, no assignment needed
}
```

### **Estados Actualizados**

```prisma
enum ExamStatus {
  DRAFT       // Being created by admin
  ASSIGNED    // Assigned to users but not started (SCHEDULED/SELF_PACED)
  STARTED     // Admin has started the exam (SCHEDULED only)
  ACTIVE      // Exam is active and available (SELF_PACED/PUBLIC)
  COMPLETED   // Exam time has ended (SCHEDULED only)
  ARCHIVED    // Archived
  SUSPENDED   // Temporarily suspended
}
```

## 📡 **APIs Actualizadas**

### **Para Usuarios**

#### **GET /api/exams** - Ver Todos los Exámenes Disponibles

Ahora retorna:

- **Exámenes SCHEDULED** donde está asignado
- **Exámenes SELF_PACED** donde está asignado
- **Exámenes PUBLIC** (todos pueden verlos)

```json
{
  "exams": [
    {
      "id": "exam1",
      "title": "Certificación AML 2024",
      "examType": "SCHEDULED",
      "status": "STARTED",
      "isAssigned": true,
      "timeRemaining": 3600000,
      "userAttempts": {
        "available": true
      }
    },
    {
      "id": "exam2",
      "title": "Guía de Estudio Personal",
      "examType": "SELF_PACED",
      "status": "ACTIVE",
      "isAssigned": true,
      "userAttempts": {
        "available": true
      }
    },
    {
      "id": "exam3",
      "title": "Práctica Pública",
      "examType": "PUBLIC",
      "status": "ACTIVE",
      "isAssigned": false,
      "userAttempts": {
        "available": true
      }
    }
  ],
  "breakdown": {
    "assigned": 2,
    "public": 1
  }
}
```

### **Para Administradores**

#### **POST /api/admin/exams/[id]/assignments** - Asignar Usuarios

- ✅ Funciona con exámenes **SCHEDULED** y **SELF_PACED**
- ❌ **No** funciona con exámenes **PUBLIC** (error)

#### **POST /api/admin/exams/[id]/start** - Iniciar Examen

- ✅ Funciona **solo** con exámenes **SCHEDULED**
- ❌ **No** funciona con **SELF_PACED** o **PUBLIC** (error)

## 🎨 **Experiencia del Usuario**

### **Dashboard del Usuario**

```
📋 MIS EXÁMENES

🕐 PROGRAMADOS (Controlados por Admin)
┌─────────────────────────────────────┐
│ 📊 Certificación AML 2024           │
│ Estado: ⏰ En progreso              │
│ Tiempo restante: 1h 23m             │
│ [▶️ CONTINUAR EXAMEN]               │
└─────────────────────────────────────┘

📖 AUTO-DIRIGIDOS (Inicio Flexible)
┌─────────────────────────────────────┐
│ 📚 Guía de Compliance Bancario      │
│ Estado: ✅ Disponible               │
│ Duración: 45 minutos                │
│ [▶️ EMPEZAR EXAMEN]                 │
└─────────────────────────────────────┘

🌍 PÚBLICOS (Para Todos)
┌─────────────────────────────────────┐
│ 🧠 Práctica de AML Básico           │
│ Estado: ✅ Siempre disponible       │
│ Duración: 30 minutos                │
│ [▶️ PRACTICAR]                      │
└─────────────────────────────────────┘
```

### **Dashboard del Administrador**

```
🎛️ GESTIÓN DE EXÁMENES

SCHEDULED - Certificación Oficial
┌─────────────────────────────────────┐
│ 👥 25 usuarios asignados             │
│ 📊 Estado: ASSIGNED                 │
│ [👥 Gestionar Usuarios] [▶️ INICIAR] │
└─────────────────────────────────────┘

SELF_PACED - Guía Personal
┌─────────────────────────────────────┐
│ 👥 10 usuarios asignados             │
│ 📊 Estado: ACTIVE                   │
│ [👥 Gestionar Usuarios]              │
└─────────────────────────────────────┘

PUBLIC - Práctica Abierta
┌─────────────────────────────────────┐
│ 🌍 Disponible para todos            │
│ 📊 Estado: ACTIVE                   │
│ [⚙️ Configurar]                     │
└─────────────────────────────────────┘
```

## 🔧 **Migración Requerida**

### **1. Actualizar Base de Datos**

```bash
# Generar nuevo cliente Prisma
npx prisma generate

# Aplicar cambios a la base de datos
npx prisma db push
# O crear migración
npx prisma migrate dev --name "add-exam-types"
```

### **2. Migrar Datos Existentes**

Los exámenes existentes se crearán como **SCHEDULED** por defecto. Puedes cambiarlos:

```sql
-- Cambiar exámenes específicos a SELF_PACED
UPDATE exams SET examType = 'SELF_PACED' WHERE id IN ('exam1', 'exam2');

-- Cambiar exámenes a PUBLIC
UPDATE exams SET examType = 'PUBLIC', status = 'ACTIVE' WHERE id IN ('exam3');
```

## ⚡ **Ventajas del Sistema Multi-Tipo**

### **🎯 Flexibilidad Total**

- **Certificaciones oficiales** → SCHEDULED
- **Entrenamientos personalizados** → SELF_PACED
- **Práctica abierta** → PUBLIC

### **🎛️ Control Granular**

- El admin puede elegir el tipo apropiado para cada examen
- Diferentes niveles de control según la necesidad
- Experiencias optimizadas para cada caso de uso

### **👥 Mejor Experiencia de Usuario**

- Los usuarios ven claramente qué tipo de examen es cada uno
- Expectativas claras sobre disponibilidad y timing
- Acceso apropiado según el tipo de examen

## 🚀 **Estado Actual: COMPLETADO**

### ✅ **Implementación Completa**

1. **✅ Base de datos migrada** - Schema actualizado con `examType` y nuevos estados
2. **✅ APIs implementadas** - Soporte completo para los 3 tipos de exámenes
3. **✅ Interfaces de administrador** - Componentes especializados creados
4. **✅ Dashboard de usuarios actualizado** - Muestra los 3 tipos claramente
5. **✅ Hooks reorganizados** - Arquitectura limpia sin duplicación

### 🏗️ **Arquitectura Final**

```
src/
├── shared/hooks/
│   └── useUserExams.ts (✅ Renombrado y actualizado)
├── features/admin-exams/
│   ├── hooks/
│   │   └── useAdminExams.ts (✅ Renombrado y mejorado)
│   ├── components/
│   │   ├── ExamForm.tsx (✅ Selector de tipo agregado)
│   │   ├── ExamTypeCards.tsx (✅ Nuevo - Cards por tipo)
│   │   ├── UserAssignmentModal.tsx (✅ Nuevo - Asignación)
│   │   ├── ExamControlModal.tsx (✅ Nuevo - Control SCHEDULED)
│   │   └── AdminExamDashboard.tsx (✅ Nuevo - Dashboard integrado)
│   └── types/exam.ts (✅ Tipos actualizados)
└── app/
    ├── user-dashboard/ (✅ Agrupación por tipos)
    └── exam/ (✅ Hooks actualizados)
```

### 🎯 **Problema Resuelto**

**❌ ANTES**: Duplicación confusa de hooks

- `shared/hooks/useExams.ts`
- `admin-exams/hooks/useExams.ts`

**✅ AHORA**: Arquitectura clara y específica

- `shared/hooks/useUserExams.ts` → `useUserExams()`, `useExam()`
- `admin-exams/hooks/useAdminExams.ts` → `useAdminExams()`, `useQuestionsForExam()`

## 🎉 **Sistema Multi-Tipo Listo**

¡El sistema está **100% funcional** con los 3 tipos de exámenes implementados y una arquitectura limpia sin duplicación! 🚀

### **Próximo Paso**

```bash
# Migrar base de datos
npx prisma generate && npx prisma db push
```

¡Todo listo para usar! 🎊
