import type { RoleName } from "@/core/auth/config/permissions";

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  role: RoleName; // Now supports: super_admin | admin | user
  image?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  lastLogin?: string;
  banned?: boolean | null;
  banReason?: string | null;
  banExpires?: string | null;
  status?: "active" | "banned";
}

export interface UserFormData {
  name: string;
  email: string;
  role: RoleName; // Now supports: super_admin | admin | user
  password?: string;
}

export interface UserStats {
  total: number;
  active: number;
  banned: number;
  admins: number;
}
