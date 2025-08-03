/**
 * 🧩 CONFIGURACIÓN DE MÓDULOS ACTIVABLES
 *
 * Centro de control para activar/desactivar funcionalidades
 * según el proyecto y las necesidades del cliente.
 */

export const MODULE_CONFIG = {
  // 🔥 CORE MODULES - Siempre activos
  auth: {
    enabled: true,
    features: ["roles", "permissions", "sessions"],
  },

  userManagement: {
    enabled: true,
    features: ["crud", "roles", "banning", "bulk-actions"],
  },

  // 📁 OPTIONAL MODULES - Configurables
  fileUpload: {
    enabled: process.env.MODULE_FILE_UPLOAD === "true",
    providers: ["local", "aws-s3", "cloudinary"],
    maxFileSize: "10MB",
    allowedTypes: ["image/*", "application/pdf", "text/*"],
  },

  stripePayments: {
    enabled: process.env.MODULE_STRIPE === "true",
    publicKey: process.env.STRIPE_PUBLIC_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    features: ["subscriptions", "one-time", "marketplace"],
  },

  inventory: {
    enabled: process.env.MODULE_INVENTORY === "true",
    features: ["stock-tracking", "categories", "suppliers", "reports"],
  },

  ecommerce: {
    enabled: process.env.MODULE_ECOMMERCE === "true",
    dependencies: ["inventory", "stripePayments"],
    features: ["cart", "wishlist", "reviews", "recommendations"],
  },

  // 🧪 EXPERIMENTAL MODULES
  ai: {
    enabled: process.env.MODULE_AI === "true",
    features: ["chat", "recommendations", "analytics"],
  },

  analytics: {
    enabled: process.env.MODULE_ANALYTICS === "true",
    features: ["tracking", "reports", "real-time"],
  },
} as const;

// 🔧 UTILIDADES
export function isModuleEnabled(module: keyof typeof MODULE_CONFIG): boolean {
  return MODULE_CONFIG[module].enabled;
}

export function getEnabledModules(): string[] {
  return Object.keys(MODULE_CONFIG).filter(
    (module) => MODULE_CONFIG[module as keyof typeof MODULE_CONFIG].enabled
  );
}

export function checkDependencies(module: keyof typeof MODULE_CONFIG): boolean {
  const moduleConfig = MODULE_CONFIG[module];

  if (!("dependencies" in moduleConfig) || !moduleConfig.dependencies) {
    return true;
  }

  return moduleConfig.dependencies.every(
    (dep) => MODULE_CONFIG[dep as keyof typeof MODULE_CONFIG].enabled
  );
}

// 📊 EXPORT TIPOS
export type ModuleName = keyof typeof MODULE_CONFIG;
export type ModuleConfig = typeof MODULE_CONFIG;
