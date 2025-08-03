# 🏗️ Arquitectura del Código Fuente

> **Directorio principal del código fuente de la aplicación**

## 🎯 Propósito

Este directorio contiene **todo el código fuente** de la aplicación, organizado bajo una arquitectura modular enterprise-grade que separa claramente las responsabilidades y facilita el mantenimiento y escalabilidad.

## 📁 Estructura General

```
src/
├── 🏗️ core/              # Funcionalidades fundamentales del sistema
├── 🧩 modules/           # Módulos opcionales y funcionalidades específicas
├── 🤝 shared/            # Recursos compartidos entre dominios
├── 🛠️ lib/               # Utilidades comunes y lógica reutilizable
└── 🌐 app/               # Next.js App Router (rutas y páginas)
```

## 🏛️ Principios Arquitectónicos

### **🎯 Domain-Driven Design (DDD)**

- **`core/`** → Funcionalidades que **SIEMPRE** necesita la aplicación
- **`modules/`** → Funcionalidades **OPCIONALES** plug-and-play
- **`shared/`** → Recursos **REUTILIZABLES** entre dominios

### **📦 Modularidad**

- Cada módulo es **independiente** y puede activarse/desactivarse
- **Bajo acoplamiento** entre módulos
- **Alta cohesión** dentro de cada dominio

### **🔄 Escalabilidad**

- Estructura preparada para **crecer** sin refactoring masivo
- **Convenciones claras** para agregar nuevas funcionalidades
- **Separación limpia** de responsabilidades

## 🧭 Navegación Rápida

| Directorio                            | Propósito                    | Cuándo usar                            |
| ------------------------------------- | ---------------------------- | -------------------------------------- |
| **[`core/`](./core/README.md)**       | Auth, Admin, Config, UI Base | Funcionalidades **siempre necesarias** |
| **[`modules/`](./modules/README.md)** | File Upload, Payments, etc.  | Funcionalidades **opcionales**         |
| **[`shared/`](./shared/README.md)**   | Hooks, Types, Utils          | Recursos **compartidos**               |
| **[`lib/`](./lib/README.md)**         | Constants, Utilities         | Lógica **común reutilizable**          |
| **[`app/`](./app/)**                  | Pages, API Routes, Layout    | **Rutas Next.js**                      |

## 🚀 Cómo Empezar

### **🔍 Para Nuevos Desarrolladores**

1. **Leer este README** (punto de entrada)
2. **Explorar [`core/`](./core/README.md)** (funcionalidades base)
3. **Revisar [`shared/`](./shared/README.md)** (recursos comunes)
4. **Entender [`modules/`](./modules/README.md)** (funcionalidades opcionales)

### **➕ Para Agregar Nueva Funcionalidad**

1. **¿Es funcionalidad core?** → Ir a [`core/`](./core/README.md)
2. **¿Es módulo opcional?** → Ir a [`modules/`](./modules/README.md)
3. **¿Es recurso compartido?** → Ir a [`shared/`](./shared/README.md)
4. **¿Es utilidad común?** → Ir a [`lib/`](./lib/README.md)

## 📝 Convenciones Generales

### **📂 Estructura de Directorios**

```typescript
dominio/
├── components/           # Componentes React
├── hooks/               # Custom hooks
├── services/            # Lógica de negocio
├── types/               # Tipos TypeScript
├── utils/               # Utilidades específicas
├── config/              # Configuración
└── index.ts             # Exportaciones públicas
```

### **📤 Exportaciones**

- **Siempre** usar `index.ts` para exportaciones públicas
- **Evitar** exportaciones directas desde archivos internos
- **Mantener** API limpia y bien definida

### **🎨 Nomenclatura**

- **PascalCase** → Componentes React (`UserCard.tsx`)
- **camelCase** → Hooks, funciones (`useAuth.ts`)
- **kebab-case** → Directorios (`feature-flags/`)
- **UPPER_CASE** → Constantes (`API_BASE_URL`)

## 🔗 Documentación Relacionada

- **[Arquitectura Enterprise](../docs/ENTERPRISE_ARCHITECTURE.md)** - Visión completa del sistema
- **[Estructura Mejorada](../docs/IMPROVED_ARCHITECTURE.md)** - Decisiones arquitectónicas
- **[Guía de Permisos](../docs/PERMISSIONS_GUIDE.md)** - Sistema de roles y permisos
- **[Sistema de Roles](../docs/SISTEMA-ROLES.md)** - Configuración de roles

## ⚡ Quick Start Commands

```bash
# 🏃‍♂️ Desarrollo
npm run dev

# 🔨 Build
npm run build

# 🧪 Tests
npm run test

# 🔍 Linting
npm run lint

# 📁 Administración (scripts utilitarios)
npm run create-super-admin
npm run create-test-users
```

---

**💡 Tip:** Cada subdirectorio tiene su propio README con información específica. ¡Explóralos para entender mejor cada dominio!
