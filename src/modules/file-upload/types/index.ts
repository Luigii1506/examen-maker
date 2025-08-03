// 📝 FILE UPLOAD TYPES
// ===================
// Tipos TypeScript para el módulo de subida de archivos

export interface UploadFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  provider: UploadProvider;
  url: string;
  key?: string;
  bucket?: string;
  userId: string;
  metadata?: Record<string, unknown>;
  isPublic: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface FileCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  maxSize?: number;
  allowedTypes: string[];
  createdAt: string;
  updatedAt: string;
}

export type UploadProvider = "local" | "s3" | "cloudinary";

export interface UploadConfig {
  provider: UploadProvider;
  maxFileSize: number; // bytes
  allowedTypes: string[];
  multiple: boolean;
}

export interface S3Config {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucket: string;
  endpoint?: string;
  forcePathStyle?: boolean;
}

export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  folder?: string;
}

export interface UploadProgress {
  fileId: string;
  progress: number; // 0-100
  status: "pending" | "uploading" | "completed" | "error";
  error?: string;
}

export interface UploadResult {
  success: boolean;
  file?: UploadFile;
  error?: string;
}

export interface FileWithPreview extends File {
  preview?: string;
  id?: string;
  uploadProgress?: number;
  error?: string;
}

export interface DropzoneOptions {
  accept?: Record<string, string[]>;
  maxFiles?: number;
  maxSize?: number;
  multiple?: boolean;
  disabled?: boolean;
  onDrop?: (acceptedFiles: File[], rejectedFiles: File[]) => void;
  onDropAccepted?: (files: File[]) => void;
  onDropRejected?: (files: File[]) => void;
}

export interface FilePreviewProps {
  file: UploadFile | FileWithPreview;
  onRemove?: (file: UploadFile | FileWithPreview) => void;
  showProgress?: boolean;
  size?: "sm" | "md" | "lg";
}

export interface FileManagerProps {
  files: UploadFile[];
  loading?: boolean;
  onRefresh?: () => void;
  onDelete?: (file: UploadFile) => void;
  onDownload?: (file: UploadFile) => void;
  onView?: (file: UploadFile) => void;
  categories?: FileCategory[];
  selectedCategory?: string;
  onCategoryChange?: (categoryId: string) => void;
}

export interface FileUploaderProps {
  config?: Partial<UploadConfig>;
  onUploadComplete?: (files: UploadFile[]) => void;
  onUploadProgress?: (progress: UploadProgress[]) => void;
  onUploadError?: (error: string) => void;
  className?: string;
  children?: React.ReactNode;
}

// Hook return types
export interface UseFileUploadReturn {
  uploadFiles: (
    files: File[],
    options?: {
      provider?: UploadProvider;
      makePublic?: boolean;
    }
  ) => Promise<UploadResult[]>;
  uploading: boolean;
  progress: UploadProgress[];
  error: string | null;
  clearError: () => void;
  resetProgress: () => void;
}

export interface UseFileManagerReturn {
  files: UploadFile[];
  loading: boolean;
  error: string | null;
  categories: FileCategory[];
  selectedCategory: string | null;
  setSelectedCategory: (categoryId: string | null) => void;
  refreshFiles: () => Promise<void>;
  deleteFile: (fileId: string) => Promise<void>;
  downloadFile: (file: UploadFile) => void;
  searchFiles: (query: string) => void;
}

export interface UseS3UploadReturn {
  uploadToS3: (
    file: File,
    options?: { onProgress?: (progress: number) => void }
  ) => Promise<string>;
  getSignedUrl: (key: string, expiresIn?: number) => Promise<string>;
  deleteFromS3: (key: string) => Promise<void>;
}

// API types
export interface CreateUploadRequest {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  provider: UploadProvider;
  url: string;
  key?: string;
  bucket?: string;
  metadata?: Record<string, unknown>;
  isPublic?: boolean;
  tags?: string[];
}

export interface UpdateUploadRequest {
  filename?: string;
  metadata?: Record<string, unknown>;
  isPublic?: boolean;
  tags?: string[];
}

export interface UploadFiltersRequest {
  provider?: UploadProvider;
  mimeType?: string;
  isPublic?: boolean;
  tags?: string[];
  search?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
}

export interface UploadFilesResponse {
  files: UploadFile[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
