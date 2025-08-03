/**
 * 🎯 SIMPLIFIED PERMISSION HOOKS
 *
 * Clean and minimal permission checking for React components
 */

import { useCallback } from "react";
import { authClient } from "@/core/auth/auth-client";
import { useAuth } from "@/shared/hooks/useAuth";
import {
  accessControl,
  PREDEFINED_ROLES,
  ROLE_HIERARCHY,
  canManageRole,
  getRoleLevel,
  getAssignableRoles,
} from "@/core/auth/config/permissions";

export type Permission = Record<string, string[]>;
export type RoleName = keyof typeof PREDEFINED_ROLES;

/**
 * 🔐 usePermissions - Main permission hook
 */
export function usePermissions() {
  const { user } = useAuth();

  const hasPermission = useCallback(
    async (permissions: Permission): Promise<boolean> => {
      if (!user) return false;

      try {
        const result = await authClient.admin.hasPermission({
          permissions,
        });

        return result.data?.success || false;
      } catch (error) {
        console.error("Error checking permissions:", error);
        return false;
      }
    },
    [user]
  );

  const canAccess = useCallback(
    (permissions: Permission): boolean => {
      if (!user?.role) return false;

      // For super_admin, always return true
      if (user.role === "super_admin") return true;

      try {
        return authClient.admin.checkRolePermission({
          permissions,
          role: user.role as "admin" | "user", // Better Auth only recognizes these two
        });
      } catch (error) {
        console.error("Error checking role permissions:", error);
        return false;
      }
    },
    [user?.role]
  );

  const canManageUserRole = useCallback(
    (targetRole: RoleName): boolean => {
      if (!user?.role) return false;
      return canManageRole(user.role as RoleName, targetRole);
    },
    [user?.role]
  );

  const currentRole = (user?.role as RoleName) || "user";
  const currentLevel = getRoleLevel(currentRole);
  const isAdmin = () =>
    currentRole === "admin" || currentRole === "super_admin";
  const isSuperAdmin = () => currentRole === "super_admin";
  const getManageableRoles = () => getAssignableRoles(currentRole);

  return {
    hasPermission,
    canAccess,
    canManageUserRole,
    currentRole,
    currentLevel,
    isAdmin,
    isSuperAdmin,
    getManageableRoles,
  };
}

/**
 * 👥 useUserManagement - Hook for user management operations
 */
export function useUserManagement() {
  const { canAccess, hasPermission } = usePermissions();

  return {
    canCreateUsers: () => canAccess({ user: ["create"] }),
    canEditUsers: () => canAccess({ user: ["update"] }),
    canDeleteUsers: () => canAccess({ user: ["delete"] }),
    canSetUserRoles: () => canAccess({ user: ["set-role"] }),
    canBanUsers: () => canAccess({ user: ["ban"] }),
    canViewSessions: () => canAccess({ session: ["list"] }),

    hasUserCreatePermission: () => hasPermission({ user: ["create"] }),
    hasUserUpdatePermission: () => hasPermission({ user: ["update"] }),
    hasUserDeletePermission: () => hasPermission({ user: ["delete"] }),
  };
}
