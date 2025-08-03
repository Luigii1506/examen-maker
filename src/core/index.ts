// 🏗️ CORE INDEX
// =============
// Exportaciones centralizadas de todos los módulos del core del sistema

// 🎛️ Administration (incluye dashboard, users, feature-flags)
export * from "./admin";

// 🔧 Configuration (feature flags, environment, modules)
export * from "./config";

// 🧩 Components (UI base reutilizables)
export * from "./components";

// 🔐 Auth Core (solo exports públicos)
// export * from "./auth";  // Descomenta cuando tengas exports públicos

// 🗃️ Database (solo si necesitas exports públicos)
// export * from "./database";  // Por ejemplo, para tipos de Prisma
