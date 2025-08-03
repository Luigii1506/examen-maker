# 🚀 Next.js 15 Enterprise Boilerplate

> **Boilerplate enterprise-grade con arquitectura modular, testing completo y mejores prácticas**

## ✨ Características

### 🏗️ **Arquitectura Enterprise**

- **Arquitectura modular** con separación clara de responsabilidades
- **Domain-Driven Design** (DDD) con dominios `core`, `modules`, `shared`
- **Feature flags** para control dinámico de funcionalidades
- **Sistema de permisos** granular y escalable

### 🔐 **Autenticación & Autorización**

- **Better Auth** integration completa
- **OAuth social** (Google, GitHub)
- **Sistema de roles** configurable
- **Middleware de protección** automático

### 🧪 **Testing Completo**

- **Jest** + **React Testing Library** para unit/integration tests
- **Playwright** para E2E testing multi-browser
- **Utilidades de testing** personalizadas
- **Coverage reporting** completo

### 📁 **Gestión de Archivos**

- **Upload local** y **S3** configurable
- **Categorización** automática
- **Galerías** y vistas de archivos
- **Estadísticas** de uso

### 🎛️ **Admin Panel**

- **Dashboard** con métricas en tiempo real
- **Gestión de usuarios** completa
- **Feature flags** management
- **Layout responsive** y accesible

## 🛠️ Tech Stack

### **Frontend**

- **Next.js 15** (App Router)
- **TypeScript** para type safety
- **Tailwind CSS** para styling
- **Lucide React** para iconografía

### **Backend & Database**

- **Prisma** ORM con PostgreSQL
- **Better Auth** para autenticación
- **API Routes** organizadas por dominio

### **Testing**

- **Jest** + **React Testing Library**
- **Playwright** para E2E
- **MSW** para API mocking
- **Custom testing utilities**

### **DevOps & Tools**

- **Docker** & **Docker Compose**
- **ESLint** + **Prettier**
- **TypeScript** strict mode
- **Git hooks** con Husky

## 🚀 Quick Start

### **1. 📥 Installation**

```bash
# Clonar el repositorio
git clone <your-repo-url>
cd nextjs-boilerplate

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
```

### **2. 🗄️ Database Setup**

```bash
# Generar cliente Prisma
npm run db:generate

# Ejecutar migraciones
npm run db:migrate

# (Opcional) Agregar datos semilla
npm run db:seed
```

### **3. 🏃‍♂️ Development**

```bash
# Iniciar servidor de desarrollo
npm run dev

# Verificar que todo funciona
npm test
```

### **4. 🎭 E2E Testing**

```bash
# Ejecutar tests End-to-End
npm run test:e2e
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## 📁 Arquitectura del Proyecto

```
📂 Estructura del Proyecto
├── 🏗️ src/
│   ├── 🔧 core/              # Funcionalidades fundamentales
│   │   ├── auth/             # Sistema de autenticación
│   │   ├── admin/            # Panel de administración
│   │   ├── config/           # Configuración global
│   │   ├── components/       # UI base reutilizable
│   │   └── database/         # Prisma & schemas
│   ├── 🧩 modules/           # Módulos opcionales
│   │   └── file-upload/      # Gestión de archivos
│   ├── 🤝 shared/            # Recursos compartidos
│   │   ├── hooks/            # Custom hooks
│   │   ├── types/            # Tipos TypeScript
│   │   ├── utils/            # Utilidades
│   │   └── testing/          # 🧪 Utilidades de testing
│   ├── 🛠️ lib/               # Lógica común
│   │   ├── constants/        # Constantes globales
│   │   └── utils/            # Funciones puras
│   └── 🌐 app/               # Next.js App Router
├── 🧪 __tests__/             # Tests globales
├── 🎭 e2e/                   # Tests End-to-End
├── 📁 scripts/               # Scripts de utilidad
└── 📚 docs/                  # Documentación
```

## 🧪 Testing System

### **🏃‍♂️ Comandos de Testing**

```bash
# Unit & Integration Tests
npm test                    # Ejecutar todos los tests
npm run test:watch          # Modo watch
npm run test:coverage       # Con coverage
npm run test:unit           # Solo unit tests
npm run test:integration    # Solo integration tests

# E2E Tests
npm run test:e2e           # Ejecutar E2E tests
npm run test:e2e:ui        # Con UI visual
npm run test:e2e:headed    # Ver browser
npm run test:e2e:debug     # Debug mode

# All Tests
npm run test:all           # Unit + E2E tests
```

### **📊 Coverage Goals**

- **Líneas**: 80%+
- **Funciones**: 85%+
- **Branches**: 75%+
- **Statements**: 80%+

Para documentación detallada del testing, ver [README-TESTING.md](./README-TESTING.md)

## 🎛️ Feature Flags

El sistema incluye feature flags para control dinámico:

```typescript
import { useFeatureFlag } from "@/shared/hooks";

function ConditionalFeature() {
  const isEnabled = useFeatureFlag("NEW_FEATURE");

  if (!isEnabled) return null;

  return <NewFeature />;
}
```

## 👥 Gestión de Usuarios

### **📋 Scripts Disponibles**

```bash
# Crear super administrador
npm run create-super-admin

# Crear usuarios de prueba
npm run create-test-users

# Promover usuario a admin
npm run make-admin

# Actualizar rol de usuario
npm run update-user-role
```

## 🚢 Deployment

### **🐳 Docker**

```bash
# Configurar variables de entorno
cp .env.example .env

# Ejecutar con Docker Compose
docker compose up --build
```

### **☁️ Vercel**

```bash
# Deploy automático en Vercel
# Solo conecta tu repositorio Git
```

## 📖 Documentación

### **🏗️ Arquitectura**

- **[Arquitectura del Código](./src/README.md)** - Estructura general
- **[Core System](./src/core/README.md)** - Funcionalidades fundamentales
- **[Módulos](./src/modules/README.md)** - Sistema modular
- **[Shared Resources](./src/shared/README.md)** - Recursos compartidos

### **🧪 Testing**

- **[Sistema de Testing](./README-TESTING.md)** - Documentación completa
- **[Testing Utilities](./src/shared/testing/README.md)** - Utilidades compartidas

### **📚 Documentación Específica**

- **[Autenticación](./src/core/auth/README.md)** - Sistema de auth
- **[Admin Panel](./src/core/admin/README.md)** - Panel de administración
- **[File Upload](./src/modules/file-upload/README.md)** - Gestión de archivos

## 🎯 Roadmap

### **🔜 Próximas Features**

- [ ] **Email templates** con React Email
- [ ] **Notifications system** en tiempo real
- [ ] **Analytics dashboard** integrado
- [ ] **API rate limiting** avanzado
- [ ] **Multi-tenancy** support

### **🔮 Future Modules**

- [ ] **Payment gateway** (Stripe/PayPal)
- [ ] **Chat system** en tiempo real
- [ ] **Content management** system
- [ ] **E-commerce** functionality

## 🤝 Contributing

1. **Fork** el proyecto
2. **Crear** feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** cambios (`git commit -m 'Add AmazingFeature'`)
4. **Push** a branch (`git push origin feature/AmazingFeature`)
5. **Abrir** Pull Request

### **📋 Guidelines**

- Seguir la **arquitectura modular** existente
- Escribir **tests** para nuevas features
- Mantener **coverage** alto (80%+)
- Documentar **cambios** en README correspondiente

## 📄 License

Este proyecto está bajo la licencia MIT. Ver [LICENSE](./LICENSE) para más detalles.

## 🙏 Acknowledgments

- **[Next.js](https://nextjs.org/)** - Framework React
- **[Prisma](https://prisma.io/)** - ORM TypeScript
- **[Better Auth](https://www.better-auth.com/)** - Autenticación
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS
- **[Playwright](https://playwright.dev/)** - E2E Testing

---

**💡 Tip:** Este boilerplate está diseñado para **escalar**. Cada nueva feature que agregues seguirá la arquitectura modular existente, facilitando el mantenimiento y la evolución del proyecto.

**�� ¡Happy coding!**
