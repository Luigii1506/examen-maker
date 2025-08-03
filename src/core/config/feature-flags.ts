/**
 * 🎛️ SISTEMA DE FEATURE FLAGS
 *
 * Control granular de funcionalidades en tiempo de ejecución.
 * Permite activar/desactivar features sin deploys.
 */

import { MODULE_CONFIG, type ModuleName } from "./modules";

export const FEATURE_FLAGS = {
  // 🔥 CORE FEATURES - Base del sistema
  authentication: true,
  roleBasedAccess: true,
  userManagement: true,
  dashboard: true,

  // 🧩 MODULE FEATURES - Dependientes de configuración
  fileUpload: MODULE_CONFIG.fileUpload.enabled,
  payments: MODULE_CONFIG.stripePayments.enabled,
  inventory: MODULE_CONFIG.inventory.enabled,
  ecommerce: MODULE_CONFIG.ecommerce.enabled,
  aiIntegration: MODULE_CONFIG.ai.enabled,
  analytics: MODULE_CONFIG.analytics.enabled,

  // 🧪 EXPERIMENTAL FEATURES - Solo en desarrollo
  betaFeatures: process.env.ENABLE_BETA_FEATURES === "true",
  debugMode: process.env.NODE_ENV === "development",
  newDashboard: process.env.FEATURE_NEW_DASHBOARD === "true",

  // 🎨 UI/UX FEATURES
  darkMode: process.env.FEATURE_DARK_MODE === "true",
  animations: process.env.FEATURE_ANIMATIONS !== "false", // Default true
  notifications: true,

  // 🔧 ADMIN FEATURES
  advancedUserManagement: true,
  systemLogs: process.env.FEATURE_SYSTEM_LOGS === "true",
  dataExport: process.env.FEATURE_DATA_EXPORT === "true",
} as const;

// 🎯 HOOK PARA USAR FEATURE FLAGS
export function useFeatureFlag(flag: keyof typeof FEATURE_FLAGS): boolean {
  return FEATURE_FLAGS[flag];
}

// 🔍 UTILIDADES
export function isFeatureEnabled(flag: keyof typeof FEATURE_FLAGS): boolean {
  return FEATURE_FLAGS[flag];
}

export function getEnabledFeatures(): Array<keyof typeof FEATURE_FLAGS> {
  return Object.keys(FEATURE_FLAGS).filter(
    (flag) => FEATURE_FLAGS[flag as keyof typeof FEATURE_FLAGS]
  ) as Array<keyof typeof FEATURE_FLAGS>;
}

export function getFeaturesByModule(
  module: ModuleName
): Array<keyof typeof FEATURE_FLAGS> {
  const moduleFeatureMap: Record<
    ModuleName,
    Array<keyof typeof FEATURE_FLAGS>
  > = {
    auth: ["authentication", "roleBasedAccess"],
    userManagement: ["userManagement", "advancedUserManagement"],
    fileUpload: ["fileUpload"],
    stripePayments: ["payments"],
    inventory: ["inventory"],
    ecommerce: ["ecommerce"],
    ai: ["aiIntegration"],
    analytics: ["analytics"],
  };

  return moduleFeatureMap[module] || [];
}

// 🧪 FEATURE FLAG GROUPS - Para UI
export const FEATURE_GROUPS = {
  core: ["authentication", "roleBasedAccess", "userManagement", "dashboard"],
  modules: ["fileUpload", "payments", "inventory", "ecommerce"],
  experimental: ["betaFeatures", "debugMode", "newDashboard"],
  ui: ["darkMode", "animations", "notifications"],
  admin: ["advancedUserManagement", "systemLogs", "dataExport"],
} as const;

// 📊 TIPOS
export type FeatureFlag = keyof typeof FEATURE_FLAGS;
export type FeatureGroup = keyof typeof FEATURE_GROUPS;
