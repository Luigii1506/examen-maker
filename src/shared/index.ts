// 🤝 SHARED INDEX
// ===============
// Exportaciones centralizadas de todo lo compartido entre módulos

// 🪝 Hooks Compartidos
export { useAuth, useAdminPage, useProtectedPage } from "./hooks/useAuth";
export {
  useFeatureFlags,
  useFeatureFlag,
  FeatureFlagsProvider,
} from "./hooks/useFeatureFlags";
export { usePermissions } from "./hooks/usePermissions";

// 📝 Tipos Compartidos
export * from "./types";

// 🛠️ Utilidades Compartidas
export * from "./utils";
