/**
 * 📋 CONFIGURACIÓN CENTRALIZADA
 *
 * Punto único de acceso a toda la configuración del sistema.
 * Exporta módulos, feature flags, entorno y utilidades.
 */

// 🧩 Configuración de módulos
export {
  MODULE_CONFIG,
  isModuleEnabled,
  getEnabledModules,
  checkDependencies,
  type ModuleName,
  type ModuleConfig,
} from "./modules";

// 🎛️ Feature flags
export {
  FEATURE_FLAGS,
  useFeatureFlag,
  isFeatureEnabled,
  getEnabledFeatures,
  getFeaturesByModule,
  FEATURE_GROUPS,
  type FeatureFlag,
  type FeatureGroup,
} from "./feature-flags";

// 🌍 Variables de entorno
export {
  ENV,
  getEnv,
  validateEnvironment,
  getDatabaseConfig,
  getAuthConfig,
  getUploadConfig,
  getFeatureFlags,
  getDeploymentConfig,
  EMAIL_CONFIG,
  ANALYTICS_CONFIG,
  DEBUG_CONFIG,
  STRIPE_CONFIG,
  ECOMMERCE_CONFIG,
} from "./environment";

// 🚀 CONFIGURACIÓN SIMPLIFICADA
export const CONFIG_INFO = {
  name: "NextJS Enterprise Boilerplate",
  version: "1.0.0",
  description: "Enterprise-grade Next.js boilerplate with modular architecture",
} as const;
