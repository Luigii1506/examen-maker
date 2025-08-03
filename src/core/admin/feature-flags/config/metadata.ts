// 🗂️ FEATURE FLAGS METADATA CONFIGURATION
// =======================================
// Configuración centralizada de metadata para feature flags

import type { FeatureFlag } from "@/core/config/feature-flags";

export interface FeatureFlagMetadata {
  name: string;
  description: string;
  icon: string;
  isPremium?: boolean;
  dependencies?: FeatureFlag[];
}

export const FEATURE_FLAG_METADATA: Record<FeatureFlag, FeatureFlagMetadata> = {
  // 🛡️ Core Features
  authentication: {
    name: "Autenticación",
    description:
      "Sistema de autenticación con login, registro y recuperación de contraseña",
    icon: "Shield",
  },
  roleBasedAccess: {
    name: "Control de Acceso por Roles",
    description:
      "Control de acceso basado en roles (Admin, Moderador, Usuario)",
    icon: "UserCog",
    dependencies: ["authentication"],
  },
  userManagement: {
    name: "Gestión de Usuarios",
    description:
      "Gestión completa de usuarios: crear, editar, eliminar, banear",
    icon: "User",
    dependencies: ["authentication", "roleBasedAccess"],
  },
  dashboard: {
    name: "Dashboard",
    description: "Panel de administración con navegación y layout principal",
    icon: "BarChart3",
    dependencies: ["authentication"],
  },

  // 📦 Module Features
  fileUpload: {
    name: "Carga de Archivos",
    description: "Sistema de carga de archivos con soporte para Amazon S3",
    icon: "Upload",
    dependencies: ["authentication", "dashboard"],
  },
  payments: {
    name: "Pagos",
    description: "Integración con Stripe para procesamiento de pagos",
    icon: "CreditCard",
    isPremium: true,
    dependencies: ["authentication", "userManagement"],
  },
  inventory: {
    name: "Inventario",
    description: "Sistema de gestión de inventario y productos",
    icon: "Package",
    dependencies: ["authentication", "dashboard"],
  },
  ecommerce: {
    name: "E-commerce",
    description: "Funcionalidades completas de tienda online",
    icon: "ShoppingCart",
    isPremium: true,
    dependencies: ["authentication", "payments", "inventory"],
  },
  aiIntegration: {
    name: "Integración de IA",
    description: "Integración con servicios de inteligencia artificial",
    icon: "Bot",
    isPremium: true,
    dependencies: ["authentication"],
  },
  analytics: {
    name: "Analytics",
    description: "Sistema de análisis y métricas de uso",
    icon: "BarChart3",
    dependencies: ["authentication", "dashboard"],
  },

  // 🧪 Experimental Features
  betaFeatures: {
    name: "Funciones Beta",
    description: "Acceso a funcionalidades en fase beta",
    icon: "Zap",
  },
  debugMode: {
    name: "Modo Debug",
    description: "Herramientas de depuración para desarrolladores",
    icon: "Settings",
  },
  newDashboard: {
    name: "Nuevo Dashboard",
    description: "Versión renovada del panel de administración",
    icon: "BarChart3",
    dependencies: ["dashboard"],
  },

  // 🎨 UI Features
  darkMode: {
    name: "Modo Oscuro",
    description: "Tema oscuro para toda la aplicación",
    icon: "Moon",
  },
  animations: {
    name: "Animaciones",
    description: "Animaciones y transiciones mejoradas en la interfaz",
    icon: "Zap",
  },
  notifications: {
    name: "Notificaciones",
    description: "Sistema de notificaciones push y en tiempo real",
    icon: "Bell",
    dependencies: ["authentication"],
  },

  // ⚙️ Admin Features
  advancedUserManagement: {
    name: "Gestión Avanzada de Usuarios",
    description: "Herramientas avanzadas para administrar usuarios",
    icon: "UserCog",
    dependencies: ["userManagement"],
  },
  systemLogs: {
    name: "Logs del Sistema",
    description: "Registro y visualización de logs del sistema",
    icon: "FileText",
    dependencies: ["authentication"],
  },
  dataExport: {
    name: "Exportación de Datos",
    description: "Herramientas para exportar datos del sistema",
    icon: "Download",
    dependencies: ["authentication"],
  },
};

// 🔍 Helper function para obtener metadata de un flag
export function getFeatureFlagMetadata(flag: FeatureFlag): FeatureFlagMetadata {
  return FEATURE_FLAG_METADATA[flag];
}

// 📊 Helper function para obtener flags por categoría
export function getFeatureFlagsByCategory(category: string): FeatureFlag[] {
  // Implementar lógica según la categoría si es necesario
  return Object.keys(FEATURE_FLAG_METADATA) as FeatureFlag[];
}
