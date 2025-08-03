// 🎭 MOCK HELPERS
// ==============
// Utilidades para mocking de APIs, servicios y funciones

// 📡 Mock de API responses comunes
export const mockApiSuccess = <T>(data: T) => ({
  success: true,
  data,
  timestamp: new Date().toISOString(),
});

export const mockApiError = (error: string, code?: string) => ({
  success: false,
  error,
  code,
  timestamp: new Date().toISOString(),
});

// 🧹 Función para limpiar todos los mocks
export const clearAllMocks = () => {
  // Basic mock clearing functionality
  if (typeof jest !== "undefined") {
    jest.clearAllMocks?.();
    jest.resetModules?.();
  }
};

// 🔄 Utilidad para restaurar mocks originales
export const restoreMocks = () => {
  if (typeof jest !== "undefined") {
    jest.restoreAllMocks?.();
  }
};

// 🕐 Utilidades para mocking de tiempo
export const mockDate = (dateString: string) => {
  const mockDate = new Date(dateString);
  return mockDate;
};

export const mockTimestamp = (timestamp: number) => {
  return timestamp;
};

// 📱 Helpers para testing de estado
export const createMockUser = (overrides = {}) => ({
  id: "test-user-id",
  name: "Test User",
  email: "test@example.com",
  role: "user",
  ...overrides,
});

export const createMockAdmin = (overrides = {}) => ({
  id: "admin-user-id",
  name: "Admin User",
  email: "admin@example.com",
  role: "admin",
  ...overrides,
});

// 🎛️ Mock de feature flags
export const createMockFeatureFlags = (
  flags: Record<string, boolean> = {}
) => ({
  FILE_UPLOAD: false,
  SOCIAL_LOGIN: false,
  ADMIN_FEATURES: false,
  ...flags,
});

// 📁 Mock de file data
export const createMockFile = (overrides = {}) => ({
  id: "test-file-id",
  filename: "test-file.jpg",
  originalName: "test-file.jpg",
  size: 1024,
  mimeType: "image/jpeg",
  url: "http://localhost:3000/uploads/test-file.jpg",
  category: "images",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

// 🌐 Helper para crear mock de fetch response
export const createMockResponse = <T>(data: T, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  statusText: status === 200 ? "OK" : "Error",
  json: async () => data,
  text: async () => JSON.stringify(data),
});

// 🎯 Helpers para testing de navegación
export const createMockRouter = (overrides = {}) => ({
  pathname: "/",
  query: {},
  push: jest.fn?.() || (() => Promise.resolve(true)),
  replace: jest.fn?.() || (() => Promise.resolve(true)),
  back: jest.fn?.() || (() => {}),
  ...overrides,
});

// 🔐 Helpers para testing de permisos
export const createMockPermissions = (permissions: string[] = []) => ({
  userRole: "user",
  userPermissions: permissions,
  hasPermission: (permission: string) => permissions.includes(permission),
  hasAnyPermission: (perms: string[]) =>
    perms.some((p) => permissions.includes(p)),
  hasAllPermissions: (perms: string[]) =>
    perms.every((p) => permissions.includes(p)),
});
