// 🗂️ TEST DATA
// ============
// Datos de prueba reutilizables para todos los tests

// 👤 Datos de usuarios
export const testUsers = {
  admin: {
    id: "admin-123",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    permissions: ["admin.read", "admin.write", "admin.users.manage"],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  user: {
    id: "user-123",
    name: "Regular User",
    email: "user@example.com",
    role: "user",
    permissions: ["files.read", "files.upload"],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  superAdmin: {
    id: "super-admin-123",
    name: "Super Admin",
    email: "super@example.com",
    role: "super_admin",
    permissions: ["*"],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
};

// 🎛️ Feature flags de prueba
export const testFeatureFlags = {
  allEnabled: {
    FILE_UPLOAD: true,
    SOCIAL_LOGIN: true,
    ADMIN_FEATURES: true,
    ANALYTICS: true,
    NOTIFICATIONS: true,
  },
  allDisabled: {
    FILE_UPLOAD: false,
    SOCIAL_LOGIN: false,
    ADMIN_FEATURES: false,
    ANALYTICS: false,
    NOTIFICATIONS: false,
  },
  basicEnabled: {
    FILE_UPLOAD: true,
    SOCIAL_LOGIN: false,
    ADMIN_FEATURES: false,
    ANALYTICS: false,
    NOTIFICATIONS: true,
  },
};

// 📁 Datos de archivos
export const testFiles = {
  image: {
    id: "file-image-123",
    filename: "test-image.jpg",
    originalName: "test-image.jpg",
    size: 2048000, // 2MB
    mimeType: "image/jpeg",
    category: "images",
    url: "http://localhost:3000/uploads/test-image.jpg",
    thumbnailUrl: "http://localhost:3000/uploads/thumbs/test-image.jpg",
    userId: "user-123",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  document: {
    id: "file-doc-123",
    filename: "test-document.pdf",
    originalName: "test-document.pdf",
    size: 1024000, // 1MB
    mimeType: "application/pdf",
    category: "documents",
    url: "http://localhost:3000/uploads/test-document.pdf",
    thumbnailUrl: null,
    userId: "user-123",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  video: {
    id: "file-video-123",
    filename: "test-video.mp4",
    originalName: "test-video.mp4",
    size: 10240000, // 10MB
    mimeType: "video/mp4",
    category: "videos",
    url: "http://localhost:3000/uploads/test-video.mp4",
    thumbnailUrl: "http://localhost:3000/uploads/thumbs/test-video.jpg",
    userId: "admin-123",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
};

// 📡 Respuestas de API comunes
export const testApiResponses = {
  success: {
    users: {
      success: true,
      data: [testUsers.admin, testUsers.user],
      timestamp: "2024-01-01T00:00:00.000Z",
    },
    files: {
      success: true,
      data: [testFiles.image, testFiles.document],
      timestamp: "2024-01-01T00:00:00.000Z",
    },
    featureFlags: {
      success: true,
      data: testFeatureFlags.basicEnabled,
      timestamp: "2024-01-01T00:00:00.000Z",
    },
  },
  error: {
    unauthorized: {
      success: false,
      error: "No autorizado",
      code: "UNAUTHORIZED",
      timestamp: "2024-01-01T00:00:00.000Z",
    },
    forbidden: {
      success: false,
      error: "Sin permisos",
      code: "FORBIDDEN",
      timestamp: "2024-01-01T00:00:00.000Z",
    },
    notFound: {
      success: false,
      error: "Recurso no encontrado",
      code: "NOT_FOUND",
      timestamp: "2024-01-01T00:00:00.000Z",
    },
    serverError: {
      success: false,
      error: "Error interno del servidor",
      code: "INTERNAL_SERVER_ERROR",
      timestamp: "2024-01-01T00:00:00.000Z",
    },
  },
};

// 🔐 Datos de permisos
export const testPermissions = {
  admin: [
    "admin.read",
    "admin.write",
    "admin.users.read",
    "admin.users.write",
    "admin.users.delete",
    "admin.feature_flags.read",
    "admin.feature_flags.write",
    "files.read",
    "files.upload",
    "files.delete",
  ],
  user: ["files.read", "files.upload", "module.file_upload.use"],
  guest: [],
};

// 📊 Datos de estadísticas
export const testStats = {
  dashboard: {
    totalUsers: 150,
    activeUsers: 45,
    totalFiles: 1200,
    storageUsed: "2.3 GB",
    enabledFeatures: 8,
    recentActivity: [
      {
        id: "1",
        action: "user_registered",
        user: "nuevo@example.com",
        timestamp: "2024-01-01T12:00:00.000Z",
      },
      {
        id: "2",
        action: "file_uploaded",
        user: "user@example.com",
        timestamp: "2024-01-01T11:30:00.000Z",
      },
    ],
  },
  files: {
    totalFiles: 1200,
    totalSize: 2500000000, // 2.5GB in bytes
    byCategory: {
      images: 800,
      documents: 300,
      videos: 80,
      audio: 20,
    },
    byMonth: [
      { month: "Enero", count: 45 },
      { month: "Febrero", count: 67 },
      { month: "Marzo", count: 89 },
    ],
  },
};

// 🧪 Datos para formularios
export const testFormData = {
  validUser: {
    name: "Test User",
    email: "test@example.com",
    password: "SecurePassword123!",
    confirmPassword: "SecurePassword123!",
  },
  invalidUser: {
    name: "",
    email: "invalid-email",
    password: "123",
    confirmPassword: "different",
  },
  login: {
    valid: {
      email: "user@example.com",
      password: "password123",
    },
    invalid: {
      email: "wrong@example.com",
      password: "wrongpassword",
    },
  },
};

// 🎯 Estados de loading y error
export const testStates = {
  loading: {
    isLoading: true,
    error: null,
    data: null,
  },
  success: {
    isLoading: false,
    error: null,
    data: testUsers.user,
  },
  error: {
    isLoading: false,
    error: "Error de conexión",
    data: null,
  },
};

// 🎨 Configuraciones de viewport
export const testViewports = {
  mobile: {
    width: 375,
    height: 667,
  },
  tablet: {
    width: 768,
    height: 1024,
  },
  desktop: {
    width: 1024,
    height: 768,
  },
  largeDesktop: {
    width: 1920,
    height: 1080,
  },
};
