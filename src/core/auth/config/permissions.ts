/**
 * 🎯 SIMPLIFIED PERMISSION SYSTEM
 *
 * Focused only on user management - clean and minimal
 */

import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements } from "better-auth/plugins/admin/access";

// 🔗 SIMPLIFIED PERMISSIONS - Only Better Auth defaults
export const COMPLETE_PERMISSIONS = {
  ...defaultStatements, // Better Auth built-in permissions (user, session)

  // Override user permissions to include "read"
  user: [
    "create",
    "read", // ← Adding this for user viewing
    "list",
    "set-role",
    "ban",
    "impersonate",
    "delete",
    "set-password",
    "update",
  ],
} as const;

// 🏗️ CREATE ACCESS CONTROL INSTANCE
export const accessControl = createAccessControl(COMPLETE_PERMISSIONS);

// 👑 SIMPLIFIED ROLES - Only what you need

/**
 * 🔴 SUPER ADMIN - Full system access
 */
export const superAdminRole = accessControl.newRole({
  user: [
    "create",
    "read",
    "list",
    "update",
    "delete",
    "ban",
    "impersonate",
    "set-role",
    "set-password",
  ],
  session: ["list", "revoke", "delete"],
});

/**
 * 🟠 ADMIN - User management
 */
export const adminRole = accessControl.newRole({
  user: [
    "create",
    "read",
    "list",
    "update",
    "delete",
    "ban",
    "set-role",
    "set-password",
  ],
  session: ["list", "revoke", "delete"],
});

/**
 * 🔵 USER - Basic access
 */
export const userRole = accessControl.newRole({
  // Basic user permissions - can view their own profile
  session: ["list", "revoke", "delete"],
});

// 📦 ROLES COLLECTION
export const PREDEFINED_ROLES = {
  super_admin: superAdminRole,
  admin: adminRole,
  user: userRole,
} as const;

// 📋 ROLE HIERARCHY
export const ROLE_HIERARCHY = {
  super_admin: 100,
  admin: 80,
  user: 20,
} as const;

// 🎨 ROLE DISPLAY INFO
export const ROLE_INFO = {
  super_admin: {
    name: "Super Administrador",
    description: "Acceso completo al sistema",
    color: "red",
    icon: "👑",
  },
  admin: {
    name: "Administrador",
    description: "Gestión de usuarios",
    color: "orange",
    icon: "🛡️",
  },
  user: {
    name: "Usuario",
    description: "Usuario estándar",
    color: "green",
    icon: "👤",
  },
} as const;

// 🔧 UTILITY FUNCTIONS
export function getRoleLevel(role: keyof typeof ROLE_HIERARCHY): number {
  return ROLE_HIERARCHY[role] || 0;
}

export function canManageRole(
  managerRole: keyof typeof ROLE_HIERARCHY,
  targetRole: keyof typeof ROLE_HIERARCHY
): boolean {
  return getRoleLevel(managerRole) > getRoleLevel(targetRole);
}

export function getAssignableRoles(
  currentUserRole: keyof typeof ROLE_HIERARCHY
): Array<keyof typeof ROLE_HIERARCHY> {
  const currentLevel = getRoleLevel(currentUserRole);
  return Object.entries(ROLE_HIERARCHY)
    .filter(([_, level]) => level < currentLevel)
    .map(([role, _]) => role as keyof typeof ROLE_HIERARCHY);
}

// 🎯 EXPORTS
export {
  accessControl as ac,
  COMPLETE_PERMISSIONS as permissions,
  PREDEFINED_ROLES as roles,
};

export type RoleName = keyof typeof ROLE_INFO;
