// 🎯 GLOBAL CONSTANTS
// ===================
// Constantes reutilizables en todo el sistema

// 📏 Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,
} as const;

// 📁 File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: {
    IMAGES: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    DOCUMENTS: ["application/pdf", "text/plain", "text/csv"],
    ALL: ["image/*", "application/pdf", "text/*"],
  },
  CATEGORIES: ["profile", "documents", "general"],
} as const;

// 🎭 UI Constants
export const UI = {
  BREAKPOINTS: {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    "2XL": 1536,
  },
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 5000,
  ANIMATION_DURATION: 200,
} as const;

// 🔐 Auth
export const AUTH = {
  SESSION_DURATION: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  PASSWORD_MIN_LENGTH: 8,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
} as const;

// 🌐 API
export const API = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  HEADERS: {
    CONTENT_TYPE: "application/json",
    ACCEPT: "application/json",
  },
} as const;

// 📊 Status
export const STATUS = {
  USER: ["active", "banned", "pending"] as const,
  HTTP: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_ERROR: 500,
  },
} as const;

// 🎯 Feature Flags
export const FEATURES = {
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes
  BATCH_SIZE: 50,
} as const;
