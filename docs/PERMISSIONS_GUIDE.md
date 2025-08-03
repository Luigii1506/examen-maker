# 🛡️ Sistema de Permisos - Guía Completa

Este boilerplate incluye un sistema completo de roles y permisos que extiende Better Auth de manera inteligente.

## 🎯 **Características Principales**

### ✅ **Integrado con Better Auth**

- Aprovecha el Admin Plugin y Access Control de Better Auth
- No reinventa la rueda, extiende funcionalidad existente
- Compatible con todas las funciones de Better Auth

### ✅ **Sistema Robusto de Permisos**

- 6 roles predefinidos: Super Admin, Admin, Editor, Moderator, User, Guest
- 8 recursos con acciones granulares
- Jerarquía de roles con validaciones automáticas
- Permisos extensibles fácilmente

### ✅ **Componentes React Listos**

- Hooks personalizados para chequeo de permisos
- Componentes de protección (PermissionGate, AdminGate, etc.)
- Feature flags para control de UI
- Estados de carga y manejo de errores

### ✅ **Configuración Modular**

- Sistema fácil de extender y personalizar
- Configuración por archivos separados
- Documentación completa y ejemplos

---

## 🏗️ **Arquitectura del Sistema**

### **1. Sistema de Permisos Base** (`src/lib/auth/permissions.ts`)

```typescript
// Recursos predefinidos
const RESOURCES = {
  users: ["create", "read", "update", "delete", "ban", "impersonate"],
  content: ["create", "read", "update", "delete", "publish", "moderate"],
  analytics: ["read", "export", "create", "delete"],
  settings: ["read", "update", "backup", "restore"],
  security: ["read", "audit", "configure"],
  api: ["create", "read", "update", "delete"],
};

// Roles predefinidos con jerarquía
super_admin: 100; // Acceso completo
admin: 80; // Gestión administrativa
editor: 60; // Gestión de contenido
moderator: 40; // Moderación
user: 20; // Usuario básico
guest: 0; // Acceso mínimo
```

### **2. Hooks de Permisos** (`src/hooks/usePermissions.ts`)

```typescript
// Hook principal
const { hasPermission, canAccess, isAdmin } = usePermissions();

// Hooks especializados
const { canCreateUsers, canEditUsers } = useUserManagement();
const { canCreateContent, canPublishContent } = useContentManagement();
const { showAdminPanel, showUserManagement } = useFeatureFlags();
```

### **3. Componentes de Protección** (`src/components/auth/PermissionGate.tsx`)

```typescript
// Protección por permisos
<PermissionGate permissions={{ user: ['create'] }}>
  <CreateUserButton />
</PermissionGate>

// Protección por rol
<AdminGate requireSuperAdmin={true}>
  <SystemSettings />
</AdminGate>

// Protección específica
<UserManagementGate action="delete">
  <DeleteUserButton />
</UserManagementGate>
```

---

## 🚀 **Guía de Uso Rápido**

### **1. Configuración Inicial**

El sistema ya está preconfigurado en:

- ✅ `src/lib/auth.ts` - Better Auth con permisos
- ✅ `src/lib/auth-client.ts` - Cliente con permisos
- ✅ `src/hooks/usePermissions.ts` - Hooks de permisos
- ✅ `src/components/auth/PermissionGate.tsx` - Componentes de protección

### **2. Proteger Rutas de Dashboard**

```typescript
// src/app/dashboard/page.tsx
export default function DashboardPage() {
  const { user, isAdmin } = useAuth();

  if (!isAdmin()) {
    return <div>Acceso denegado</div>;
  }

  return (
    <AdminLayout user={user}>
      <DashboardContent />
    </AdminLayout>
  );
}
```

### **3. Proteger Componentes**

```typescript
// Mostrar botón solo si puede crear usuarios
<UserManagementGate action="create">
  <button onClick={createUser}>Crear Usuario</button>
</UserManagementGate>

// Múltiples permisos
<PermissionGate permissions={{
  content: ['create', 'publish'],
  analytics: ['read']
}}>
  <AdvancedEditor />
</PermissionGate>

// Por nivel de rol
<PermissionGate minLevel={80}>
  <AdminOnlyFeature />
</PermissionGate>
```

### **4. Chequeos en Código**

```typescript
// Hook de permisos
const { canAccess, hasPermission } = usePermissions();

// Chequeo síncrono (local)
const canEdit = canAccess({ content: ["update"] });

// Chequeo asíncrono (servidor)
const confirmed = await hasPermission({ user: ["delete"] });

// Feature flags
const { showUserManagement, showSystemSettings } = useFeatureFlags();
```

---

## 🎨 **Personalización y Extensión**

### **1. Agregar Nuevos Recursos**

```typescript
// src/lib/auth/permissions.ts
export const CUSTOM_PERMISSIONS = {
  ...BOILERPLATE_PERMISSIONS,
  blog: ["create", "edit", "publish", "delete"],
  comments: ["create", "read", "moderate", "delete"],
};

// Crear nuevo access control
const customAC = createAccessControl(CUSTOM_PERMISSIONS);

// Crear rol personalizado
const blogAdminRole = customAC.newRole({
  blog: ["create", "edit", "publish"],
  comments: ["moderate", "delete"],
  content: ["read"],
});
```

### **2. Crear Hooks Personalizados**

```typescript
// src/hooks/useBlogPermissions.ts
export function useBlogPermissions() {
  const { canAccess } = usePermissions();

  return {
    canCreatePost: () => canAccess({ blog: ["create"] }),
    canPublishPost: () => canAccess({ blog: ["publish"] }),
    canModerateComments: () => canAccess({ comments: ["moderate"] }),
  };
}
```

### **3. Componentes de Protección Personalizados**

```typescript
// src/components/blog/BlogGate.tsx
interface BlogGateProps {
  children: ReactNode;
  action: "create" | "edit" | "publish" | "delete";
}

export const BlogGate: React.FC<BlogGateProps> = ({ children, action }) => {
  return (
    <PermissionGate permissions={{ blog: [action] }}>{children}</PermissionGate>
  );
};
```

---

## 📊 **Ejemplos de Configuración por Tipo de App**

### **1. SaaS Application**

```typescript
const SAAS_PERMISSIONS = {
  ...BOILERPLATE_PERMISSIONS,
  subscription: ["read", "upgrade", "cancel"],
  billing: ["read", "update", "export"],
  workspace: ["create", "read", "update", "delete"],
  integrations: ["read", "configure", "disable"],
};

const customerRole = ac.newRole({
  subscription: ["read", "upgrade"],
  billing: ["read"],
  workspace: ["read", "update"],
});
```

### **2. E-commerce**

```typescript
const ECOMMERCE_PERMISSIONS = {
  ...BOILERPLATE_PERMISSIONS,
  products: ["create", "read", "update", "delete", "publish"],
  orders: ["read", "update", "cancel", "refund"],
  inventory: ["read", "update", "adjust"],
  customers: ["read", "update", "support"],
};

const storeManagerRole = ac.newRole({
  products: ["create", "read", "update", "publish"],
  orders: ["read", "update"],
  inventory: ["read", "update"],
  customers: ["read", "support"],
});
```

### **3. Content Management**

```typescript
const CMS_PERMISSIONS = {
  ...BOILERPLATE_PERMISSIONS,
  posts: ["create", "read", "update", "delete", "publish", "schedule"],
  pages: ["create", "read", "update", "delete", "publish"],
  media: ["upload", "read", "organize", "delete"],
  themes: ["read", "customize", "install"],
};

const editorRole = ac.newRole({
  posts: ["create", "read", "update"],
  pages: ["read", "update"],
  media: ["upload", "read", "organize"],
});
```

---

## 🔧 **API de Better Auth Disponible**

### **Gestión de Usuarios**

```typescript
// Crear usuario
await authClient.admin.createUser({
  email: "user@example.com",
  password: "password123",
  name: "Usuario",
  role: "editor",
});

// Cambiar rol
await authClient.admin.setRole({
  userId: "user-id",
  role: "admin",
});

// Banear usuario
await authClient.admin.banUser({
  userId: "user-id",
  banReason: "Spam",
  banExpiresIn: 7 * 24 * 60 * 60, // 7 días
});

// Listar usuarios
const users = await authClient.admin.listUsers({
  limit: 50,
  offset: 0,
  searchValue: "john",
  searchField: "name",
});
```

### **Chequeo de Permisos**

```typescript
// Chequear permisos del usuario actual
const canManageUsers = await authClient.admin.hasPermission({
  permissions: { user: ["create", "update"] },
});

// Chequear permisos de rol específico
const adminCanDelete = authClient.admin.checkRolePermission({
  role: "admin",
  permissions: { user: ["delete"] },
});
```

---

## 🛠️ **Scripts de Configuración**

### **Crear Primer Super Admin**

```typescript
// scripts/create-super-admin.ts
import { auth } from "@/lib/auth";

async function createSuperAdmin() {
  const user = await auth.api.signUpEmail({
    body: {
      email: "admin@yourapp.com",
      password: "secure-password",
      name: "Super Admin",
    },
  });

  if (user.user) {
    await auth.api.setRole({
      body: {
        userId: user.user.id,
        role: "super_admin",
      },
    });

    console.log("✅ Super Admin created successfully!");
  }
}

createSuperAdmin();
```

### **Migrar Datos Existentes**

```typescript
// scripts/migrate-user-roles.ts
async function migrateUserRoles() {
  const users = await auth.api.listUsers({
    body: { limit: 1000 },
  });

  for (const user of users.users) {
    // Lógica para asignar roles basado en datos existentes
    let role = "user";

    if (user.email.includes("admin")) {
      role = "admin";
    }

    await auth.api.setRole({
      body: {
        userId: user.id,
        role,
      },
    });
  }

  console.log("✅ User roles migrated!");
}
```

---

## 🔒 **Mejores Prácticas de Seguridad**

### **1. Principio de Menor Privilegio**

- Asigna el rol mínimo necesario
- Revisa permisos regularmente
- Usa roles específicos en lugar de admin universal

### **2. Validación Dual**

```typescript
// Validar en cliente Y servidor
const ClientComponent = () => {
  const { canAccess } = usePermissions();

  if (!canAccess({ user: ["delete"] })) {
    return null;
  }

  const handleDelete = async () => {
    // Better Auth validará en servidor automáticamente
    await authClient.admin.removeUser({ userId });
  };

  return <button onClick={handleDelete}>Eliminar</button>;
};
```

### **3. Auditoría de Acciones**

```typescript
// Better Auth hooks proporcionan auditoría automática
databaseHooks: {
  user: {
    update: {
      before: async (user, context) => {
        console.log(`User ${context.user?.id} updating ${user.id}`);
        return { data: user };
      };
    }
  }
}
```

---

## 📚 **Recursos Adicionales**

- [Documentación de Better Auth](https://better-auth.com)
- [Admin Plugin Guide](https://better-auth.com/docs/plugins/admin)
- [Access Control](https://better-auth.com/docs/plugins/admin#access-control)
- [Organization Plugin](https://better-auth.com/docs/plugins/organization) (para multi-tenancy)

---

## 🎉 **¡Tu Boilerplate está Listo!**

Este sistema te proporciona:

1. ✅ **Autenticación completa** con email/password
2. ✅ **Roles y permisos granulares** listos para usar
3. ✅ **Componentes React** para proteger UI
4. ✅ **Hooks personalizados** para lógica de permisos
5. ✅ **Dashboard administrativo** completamente funcional
6. ✅ **Sistema extensible** para cualquier tipo de aplicación
7. ✅ **Documentación completa** y ejemplos de uso
8. ✅ **Mejores prácticas** de seguridad incluidas

¡Empieza a construir tu aplicación con autenticación y permisos robustos desde el día 1! 🚀
