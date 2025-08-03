# Sistema de Roles y Administración

Este documento describe el sistema de roles implementado en la aplicación Next.js con Better Auth.

## 🎯 Características Implementadas

### 1. Sistema de Roles

- **Admin**: Acceso completo al panel de administración
- **User**: Acceso al dashboard de usuario regular
- **Redirección automática** basada en roles

### 2. Paneles Diferenciados

- **Dashboard Admin** (`/dashboard`): Gestión completa de usuarios
- **Dashboard Usuario** (`/user-dashboard`): Panel personal para usuarios regulares

### 3. Funcionalidades de Administración

- ✅ Listar todos los usuarios con paginación
- ✅ Crear nuevos usuarios
- ✅ Cambiar roles de usuarios (user/admin)
- ✅ Banear/desbanear usuarios
- ✅ Eliminar usuarios
- ✅ Búsqueda de usuarios por email
- ✅ Estadísticas del sistema

## 🏗️ Arquitectura

### Archivos Principales

```
src/
├── lib/
│   ├── auth.ts                 # Configuración Better Auth + Admin Plugin
│   ├── auth-client.ts          # Cliente con adminClient plugin
│   └── prisma.ts              # Cliente Prisma
├── hooks/
│   └── useAuth.ts             # Hooks personalizados con roles
├── app/
│   ├── dashboard/             # Panel de administración
│   ├── user-dashboard/        # Panel de usuarios
│   ├── login/                 # Login mejorado
│   ├── register/              # Registro mejorado
│   └── forgot-password/       # Recuperación de contraseña
├── scripts/
│   └── make-admin.ts          # Script para crear administradores
└── middleware.ts              # Middleware con redirección por roles
```

### Configuración de Better Auth

```typescript
// src/lib/auth.ts
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  plugins: [
    admin({
      defaultRole: "user", // Rol por defecto para nuevos usuarios
    }),
  ],
  // ... otras configuraciones
});
```

### Cliente con Admin Plugin

```typescript
// src/lib/auth-client.ts
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  plugins: [adminClient()],
});
```

## 🚀 Configuración Inicial

### 1. Variables de Entorno

Asegúrate de tener estas variables en tu `.env`:

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:postgres@db:5432/mydb?schema=public"
POSTGRES_DB=mydb
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# Better Auth (REQUERIDAS)
BETTER_AUTH_SECRET="tu-secreto-aleatorio-de-32-caracteres"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# OAuth (opcional)
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

### 2. Base de Datos

```bash
# Levantar Docker
docker compose up

# Aplicar migraciones
docker compose exec app npx prisma db push

# Generar cliente
docker compose exec app npx prisma generate
```

### 3. Crear Primer Administrador

```bash
# Después de registrar tu primer usuario
npm run make-admin
```

## 🔐 Sistema de Middleware

El middleware maneja automáticamente:

### Rutas Protegidas

- `/dashboard` → Solo admins
- `/user-dashboard` → Solo usuarios regulares
- `/profile`, `/settings` → Cualquier usuario autenticado

### Redirecciones Automáticas

- **Admin intenta acceder a `/user-dashboard`** → Redirige a `/dashboard`
- **Usuario intenta acceder a `/dashboard`** → Redirige a `/user-dashboard`
- **No autenticado accede a ruta protegida** → Redirige a `/login`
- **Autenticado accede a `/login` o `/register`** → Redirige a su dashboard

### Rutas de Autenticación

- `/login`, `/register`, `/forgot-password` → No accesibles si ya estás logueado

## 🎛️ Hooks Personalizados

### `useAuth(requireAuth?)`

Hook básico que devuelve el estado de autenticación y rol del usuario.

```typescript
const { isLoading, isAuthenticated, user, isAdmin } = useAuth();
```

### `useAdminPage()`

Hook específico para páginas de admin. Redirige automáticamente si no es admin.

```typescript
const { isLoading, isAuthenticated, user, isAdmin } = useAdminPage();
```

### `useProtectedPage()`

Hook para páginas que requieren autenticación.

### `usePublicPage()`

Hook para páginas públicas que pueden mostrar estado de auth.

## 📊 Funcionalidades del Dashboard Admin

### Gestión de Usuarios

1. **Listar Usuarios**

   - Paginación (10 usuarios por página)
   - Búsqueda por email
   - Filtros y ordenamiento

2. **Crear Usuario**

   ```typescript
   await authClient.admin.createUser({
     email: "nuevo@email.com",
     name: "Nuevo Usuario",
     password: "contraseña-temporal",
     role: "user",
   });
   ```

3. **Cambiar Rol**

   ```typescript
   await authClient.admin.setRole({
     userId: "user-id",
     role: "admin", // o "user"
   });
   ```

4. **Banear Usuario**

   ```typescript
   await authClient.admin.banUser({
     userId: "user-id",
     banReason: "Violación de términos",
     banExpiresIn: 60 * 60 * 24 * 7, // 7 días
   });
   ```

5. **Desbanear Usuario**

   ```typescript
   await authClient.admin.unbanUser({ userId: "user-id" });
   ```

6. **Eliminar Usuario**
   ```typescript
   await authClient.admin.removeUser({ userId: "user-id" });
   ```

### Estadísticas

- Total de usuarios
- Usuarios activos
- Usuarios baneados
- Número de administradores

## 🌐 Flujo de Usuario

### Usuario Regular

1. **Registro** → Rol automático: `user`
2. **Login** → Redirige a `/user-dashboard`
3. **Dashboard Personal** → Gestión de perfil y configuraciones

### Administrador

1. **Login** → Redirige a `/dashboard`
2. **Panel Admin** → Gestión completa de usuarios
3. **Acciones Disponibles**:
   - Crear usuarios
   - Cambiar roles
   - Banear/desbanear
   - Eliminar usuarios
   - Ver estadísticas

### Redirección Inteligente

- Si intenta acceder a una ruta incorrecta según su rol, se redirige automáticamente
- Mantiene la URL de callback para redirección después del login

## 🛠️ Desarrollo

### Agregar Nuevos Roles

1. Actualizar el plugin admin en `auth.ts`
2. Modificar los hooks en `useAuth.ts`
3. Actualizar el middleware con las nuevas reglas
4. Crear rutas específicas para el nuevo rol

### Extensiones Futuras

- **Permisos granulares** usando el sistema de permisos de Better Auth
- **Equipos y organizaciones** usando el plugin Organization
- **Auditoría** de acciones administrativas
- **Notificaciones** para cambios de rol/estado

## 🐛 Troubleshooting

### Error: "Module not found: better-auth/client/plugins"

```bash
npm install better-auth@^1.3.3
```

### Error: "Cannot read properties of undefined"

Verifica que `BETTER_AUTH_SECRET` esté configurado en `.env`

### Usuario no puede acceder después de registro

Ejecuta el script para crear admin:

```bash
npm run make-admin
```

### Problemas de redirección

Verifica que las rutas estén correctamente definidas en `middleware.ts`

## 📝 Comandos Útiles

```bash
# Desarrollo
npm run dev

# Base de datos
npm run db:push          # Aplicar cambios de schema
npm run db:studio        # Abrir Prisma Studio
npm run db:migrate       # Crear migración

# Administración
npm run make-admin       # Convertir primer usuario en admin

# Docker
docker compose up        # Levantar servicios
docker compose down      # Bajar servicios
```

## 🔒 Consideraciones de Seguridad

1. **Variables de Entorno**: Nunca commitees archivos `.env`
2. **BETTER_AUTH_SECRET**: Usa un secreto fuerte en producción
3. **Roles**: Valida roles tanto en cliente como servidor
4. **Middleware**: Todas las rutas protegidas deben pasar por middleware
5. **API Routes**: Verifica permisos en endpoints de administración

---

¡El sistema de roles está listo para usar! 🎉
