/**
 * 🔐 PERMISSION GATE COMPONENT
 *
 * Conditionally renders content based on user permissions
 * Supports both server-side and client-side permission checking
 */

import React, { ReactNode, useEffect, useState } from "react";
import {
  usePermissions,
  useUserManagement,
  type Permission,
} from "@/shared/hooks/usePermissions";
import { type RoleName } from "@/core/auth/config/permissions";

interface PermissionGateProps {
  /** Child components to render if permission is granted */
  children: ReactNode;

  /** Fallback content to render if permission is denied */
  fallback?: ReactNode;

  /** Permissions to check (resource: actions) */
  permissions?: Permission;

  /** Required role (alternative to permissions) */
  requiredRole?: RoleName;

  /** Minimum role level required */
  minLevel?: number;

  /** Whether to use server-side permission checking */
  serverCheck?: boolean;

  /** Loading component while checking permissions */
  loading?: ReactNode;

  /** Whether to show loading state */
  showLoading?: boolean;
}

/**
 * PermissionGate - Renders children only if user has required permissions
 *
 * Examples:
 * ```tsx
 * // Check specific permissions
 * <PermissionGate permissions={{ user: ['create'] }}>
 *   <CreateUserButton />
 * </PermissionGate>
 *
 * // Check role
 * <PermissionGate requiredRole="admin">
 *   <AdminPanel />
 * </PermissionGate>
 *
 * // Check minimum level
 * <PermissionGate minLevel={80}>
 *   <AdvancedSettings />
 * </PermissionGate>
 * ```
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  fallback = null,
  permissions,
  requiredRole,
  minLevel,
  serverCheck = false,
  loading = <div className="animate-pulse bg-gray-200 h-4 w-16 rounded"></div>,
  showLoading = true,
}) => {
  const {
    hasPermission,
    canAccess,
    currentRole,
    currentLevel,
    isAdmin,
    isSuperAdmin,
  } = usePermissions();

  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(serverCheck);

  useEffect(() => {
    const checkPermissions = async () => {
      if (!currentRole) {
        setHasAccess(false);
        setIsLoading(false);
        return;
      }

      try {
        let allowed = false;

        if (permissions) {
          if (serverCheck) {
            allowed = await hasPermission(permissions);
          } else {
            allowed = canAccess(permissions);
          }
        }

        // Check by required role
        else if (requiredRole) {
          allowed =
            currentRole === requiredRole ||
            (requiredRole === "admin" && isSuperAdmin()) ||
            (requiredRole === "user" && isAdmin());
          console.log("2222", allowed, requiredRole);
        }
        // Check by minimum level
        else if (minLevel !== undefined) {
          allowed = currentLevel >= minLevel;
        }
        // No restrictions - allow if authenticated
        else {
          allowed = true;
        }

        setHasAccess(allowed);
      } catch (error) {
        console.error("Permission check failed:", error);
        setHasAccess(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkPermissions();
  }, [
    permissions,
    requiredRole,
    minLevel,
    serverCheck,
    hasPermission,
    canAccess,
    currentRole,
    currentLevel,
    isAdmin,
    isSuperAdmin,
  ]);

  // Show loading state
  if (isLoading && showLoading) {
    return <>{loading}</>;
  }

  // Show content if user has access
  if (hasAccess) {
    return <>{children}</>;
  }

  // Show fallback or nothing if no access
  return <>{fallback}</>;
};

/**
 * 👥 UserManagementGate - Specific gate for user management features
 */
interface UserManagementGateProps {
  children: ReactNode;
  fallback?: ReactNode;
  action:
    | "create"
    | "update"
    | "delete"
    | "ban"
    | "impersonate"
    | "set-role"
    | "set-password";
}

export const UserManagementGate: React.FC<UserManagementGateProps> = ({
  children,
  fallback,
  action,
}) => {
  return (
    <PermissionGate permissions={{ user: [action] }} fallback={fallback}>
      {children}
    </PermissionGate>
  );
};

/**
 * 🗂️ ContentManagementGate - Specific gate for content management
 */
interface ContentManagementGateProps {
  children: ReactNode;
  fallback?: ReactNode;
  action: "create" | "read" | "update" | "delete" | "publish" | "moderate";
}

export const ContentManagementGate: React.FC<ContentManagementGateProps> = ({
  children,
  fallback,
  action,
}) => {
  return (
    <PermissionGate permissions={{ content: [action] }} fallback={fallback}>
      {children}
    </PermissionGate>
  );
};

/**
 * 🛡️ AdminGate - Simplified gate for admin-only features
 */
interface AdminGateProps {
  children: ReactNode;
  fallback?: ReactNode;
  requireSuperAdmin?: boolean;
}

export const AdminGate: React.FC<AdminGateProps> = ({
  children,
  fallback,
  requireSuperAdmin = false,
}) => {
  return (
    <PermissionGate
      requiredRole={requireSuperAdmin ? "super_admin" : "admin"}
      fallback={fallback}
    >
      {children}
    </PermissionGate>
  );
};

/**
 * 📊 AnalyticsGate - Gate for analytics features
 */
interface AnalyticsGateProps {
  children: ReactNode;
  fallback?: ReactNode;
  action: "read" | "export" | "create" | "delete";
}

export const AnalyticsGate: React.FC<AnalyticsGateProps> = ({
  children,
  fallback,
  action,
}) => {
  return (
    <PermissionGate permissions={{ analytics: [action] }} fallback={fallback}>
      {children}
    </PermissionGate>
  );
};

/**
 * ⚙️ SettingsGate - Gate for system settings
 */
interface SettingsGateProps {
  children: ReactNode;
  fallback?: ReactNode;
  action: "read" | "update" | "backup" | "restore";
}

export const SettingsGate: React.FC<SettingsGateProps> = ({
  children,
  fallback,
  action,
}) => {
  return (
    <PermissionGate permissions={{ settings: [action] }} fallback={fallback}>
      {children}
    </PermissionGate>
  );
};
