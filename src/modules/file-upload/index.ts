// 📁 FILE UPLOAD MODULE
// =====================
// Módulo completo de gestión de archivos
// Incluye: Services, Hooks, Types, Config, Utils

// 🛠️ Services
export * from "./services";

// 🪝 Hooks
export * from "./hooks";

// 📝 Types
export * from "./types";

// ⚙️ Configuration
export * from "./config";

// 🔧 Utils
export * from "./utils";

// 🎯 Default exports para facilidad de uso
export { uploadService as default } from "./services";

// 📋 Información del módulo
export const MODULE_INFO = {
  name: "file-upload",
  version: "1.0.0",
  description:
    "Sistema completo de gestión de archivos con soporte para múltiples proveedores",
  features: [
    "Upload local y S3",
    "Drag & drop interface",
    "Progress tracking",
    "File categorization",
    "Image previews",
    "Bulk operations",
    "Search and filters",
    "TypeScript support",
  ],
  dependencies: ["@prisma/client", "react", "lucide-react"],
  optionalDependencies: [
    "@aws-sdk/client-s3", // Para S3
    "cloudinary", // Para Cloudinary
  ],
} as const;
