// 🎨 FILE UPLOAD COMPONENTS
// ========================
// Export de todos los componentes UI del módulo

import type { UploadFile } from "../types";

export { default as FileUploader } from "./FileUploader";
export { default as FileManager } from "./FileManager";
export { default as FileStats } from "./FileStats";
export { default as ImageGallery } from "./ImageGallery";
export { default as FilesView } from "./FilesView";

// Re-exports de tipos de props para conveniencia
export type { FileUploaderProps, UploadFile } from "../types";

// Tipos adicionales para componentes
export interface FileComponentsProps {
  className?: string;
  onFileSelect?: (file: UploadFile) => void;
  onFileUpload?: () => void;
  onFileDelete?: (file: UploadFile) => void;
  onFileDownload?: (file: UploadFile) => void;
}
