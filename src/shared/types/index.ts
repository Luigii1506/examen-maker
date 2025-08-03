// 📝 SHARED TYPES INDEX
// ====================
// Tipos compartidos entre módulos y features

// 👤 User Types
export type { User, UserFormData, UserStats } from "./user";

// 🌍 Global Base Types
export * from "./global";

// 🌐 API Contract Types
export * from "./api";

// 🗃️ Database & Prisma Types
export * from "./database";

// 🎯 Type Guards Utilities
import type { ApiResponse, ApiError } from "./api";

export function isApiSuccess<T>(
  response: ApiResponse<T>
): response is ApiResponse<T> & { success: true } {
  return response.success === true;
}

export function isApiError(response: ApiResponse): response is ApiError {
  return response.success === false;
}
