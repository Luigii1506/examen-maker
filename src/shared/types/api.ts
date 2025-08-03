// 🌐 API TYPES
// ============
// Tipos para requests, responses y API contracts

import type { PaginationParams, PaginatedResponse } from "./global";

// 📡 Base API Response
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

// 📊 Standard API Responses
export type ApiSuccess<T> = ApiResponse<T> & { success: true; data: T };
export type ApiFailure = ApiResponse<never> & { success: false; error: string };
export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

// 📄 Paginated API Response
export interface PaginatedApiResponse<T>
  extends ApiResponse<PaginatedResponse<T>> {
  success: true;
  data: PaginatedResponse<T>;
}

// 🔐 Auth API Types
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    emailVerified: boolean;
  };
  session: {
    token: string;
    expiresAt: string;
  };
}

// 👥 User Management API Types
export interface CreateUserRequest {
  name: string;
  email: string;
  role: string;
  password?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: string;
  status?: "active" | "banned";
}

export interface UserListRequest extends PaginationParams {
  role?: string;
  status?: string;
  search?: string;
}

// 📁 File Upload API Types
export interface UploadRequest {
  file: File;
  category?: string;
  isPublic?: boolean;
}

export interface UploadResponse {
  id: string;
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  category?: string;
}

// 🎛️ Feature Flags API Types
export interface FeatureFlagUpdateRequest {
  flags: Record<string, boolean>;
}

export interface FeatureFlagsResponse {
  flags: Record<string, boolean>;
  overrides: Record<string, boolean>;
  lastUpdated: string;
}

// 🔍 Search API Types
export interface SearchRequest {
  query: string;
  type?: "users" | "files" | "all";
  limit?: number;
  filters?: Record<string, unknown>;
}

export interface SearchResult {
  id: string;
  type: string;
  title: string;
  description?: string;
  url?: string;
  relevance: number;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  took: number; // milliseconds
}
