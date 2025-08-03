// 🌍 GLOBAL TYPES
// ===============
// Tipos base reutilizables en todo el sistema

// 📝 Base Entity Interface
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// 📊 Pagination Types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// 🔍 Search and Filter Types
export interface SearchParams {
  query?: string;
  filters?: Record<string, unknown>;
}

// 📱 UI State Types
export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

export interface ActionState extends LoadingState {
  isSuccess?: boolean;
  message?: string;
}

// 🎭 Component Props Base
export interface ComponentWithClassName {
  className?: string;
}

export interface ComponentWithChildren {
  children: React.ReactNode;
}

// 🔒 Auth Related Types
export interface AuthUser extends BaseEntity {
  email: string;
  name: string;
  role: string;
  status: "active" | "banned" | "pending";
  emailVerified: boolean;
  image?: string | null;
  lastLogin?: string;
}

// 📊 Stats and Analytics Types
export interface BaseStats {
  total: number;
  growth?: {
    value: number;
    percentage: number;
    trend: "up" | "down" | "stable";
  };
}

// 🔧 Configuration Types
export interface EnvironmentConfig {
  NODE_ENV: "development" | "production" | "test";
  NEXT_PUBLIC_APP_URL: string;
  NEXT_PUBLIC_API_URL: string;
}

// 🎯 Feature Flag Types (re-export from core)
export type { FeatureFlag, FeatureGroup } from "@/core/config";

// 📦 Module Configuration Types (re-export from core)
export type { ModuleName, ModuleConfig } from "@/core/config";
