// 🗂️ FILE UPLOAD CONFIGURATION
// ============================
// Configuración centralizada para el módulo de file upload

import { getUploadConfig } from "@/core/config/environment";
import type {
  UploadConfig,
  UploadProvider,
  S3Config,
  CloudinaryConfig,
} from "../types";

// 📦 CONFIGURACIÓN POR DEFECTO USANDO VARIABLES DE ENTORNO
export function getDefaultUploadConfig(): UploadConfig {
  const config = getUploadConfig();
  return {
    provider: config.provider,
    maxFileSize: config.maxFileSize,
    allowedTypes: config.allowedTypes,
    multiple: true,
  };
}

// 🗂️ CATEGORIAS DE ARCHIVOS PREDEFINIDAS
export const FILE_CATEGORIES = {
  IMAGES: {
    name: "Imágenes",
    icon: "🖼️",
    allowedTypes: [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ] as string[],
    maxSize: 5 * 1024 * 1024, // 5MB
  },
  DOCUMENTS: {
    name: "Documentos",
    icon: "📄",
    allowedTypes: ["application/pdf", "text/plain", "text/csv"] as string[],
    maxSize: 20 * 1024 * 1024, // 20MB
  },
  VIDEOS: {
    name: "Videos",
    icon: "🎥",
    allowedTypes: ["video/mp4", "video/webm", "video/ogg"] as string[],
    maxSize: 100 * 1024 * 1024, // 100MB
  },
  AUDIO: {
    name: "Audio",
    icon: "🎵",
    allowedTypes: ["audio/mpeg", "audio/wav", "audio/ogg"] as string[],
    maxSize: 50 * 1024 * 1024, // 50MB
  },
};

// 🔧 CONFIGURACIÓN DINÁMICA
export function getFileUploadConfig(): UploadConfig {
  return { ...getDefaultUploadConfig() };
}

export function getS3Config(): S3Config | null {
  const { s3 } = getUploadConfig();

  if (!s3.accessKeyId || !s3.secretAccessKey || !s3.bucket) {
    return null;
  }

  return {
    accessKeyId: s3.accessKeyId,
    secretAccessKey: s3.secretAccessKey,
    region: s3.region,
    bucket: s3.bucket,
    endpoint: s3.endpoint || undefined,
    forcePathStyle: s3.forcePathStyle,
  };
}

export function getCloudinaryConfig(): CloudinaryConfig | null {
  const { cloudinary } = getUploadConfig();

  if (!cloudinary.cloudName || !cloudinary.apiKey || !cloudinary.apiSecret) {
    return null;
  }

  return {
    cloudName: cloudinary.cloudName,
    apiKey: cloudinary.apiKey,
    apiSecret: cloudinary.apiSecret,
    folder: cloudinary.folder,
  };
}

// 🎯 UTILIDADES DE VALIDACIÓN
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  // Verificar coincidencia exacta primero
  if (allowedTypes.includes(file.type)) {
    return true;
  }

  // Verificar wildcards (ej: image/* para image/png, image/jpeg, etc.)
  return allowedTypes.some((allowedType) => {
    if (allowedType.endsWith("/*")) {
      const baseType = allowedType.slice(0, -2); // Remover /*
      return file.type.startsWith(baseType + "/");
    }
    return false;
  });
}

export function validateFileSize(file: File, maxSize: number): boolean {
  return file.size <= maxSize;
}

export function getFileCategory(
  mimeType: string
): keyof typeof FILE_CATEGORIES | null {
  if (FILE_CATEGORIES.IMAGES.allowedTypes.includes(mimeType)) {
    return "IMAGES";
  }
  if (FILE_CATEGORIES.DOCUMENTS.allowedTypes.includes(mimeType)) {
    return "DOCUMENTS";
  }
  if (FILE_CATEGORIES.VIDEOS.allowedTypes.includes(mimeType)) {
    return "VIDEOS";
  }
  if (FILE_CATEGORIES.AUDIO.allowedTypes.includes(mimeType)) {
    return "AUDIO";
  }
  return null;
}

// 📏 FORMATEO DE TAMAÑOS
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// 🎨 ICONOS POR TIPO DE ARCHIVO
export function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "🖼️";
  if (mimeType.startsWith("video/")) return "🎥";
  if (mimeType.startsWith("audio/")) return "🎵";
  if (mimeType === "application/pdf") return "📄";
  if (mimeType.includes("text/")) return "📝";
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel"))
    return "📊";
  if (mimeType.includes("zip") || mimeType.includes("rar")) return "📦";
  return "📎";
}

// 🔗 GENERACIÓN DE URLs
export function generateUploadPath(userId: string, filename: string): string {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 15);
  const extension = filename.split(".").pop();
  return `uploads/${userId}/${timestamp}-${randomId}.${extension}`;
}

// 🛡️ VALIDACIÓN DE CONFIGURACIÓN
export function validateUploadConfig(config: Partial<UploadConfig>): string[] {
  const errors: string[] = [];

  if (config.maxFileSize && config.maxFileSize <= 0) {
    errors.push("El tamaño máximo de archivo debe ser mayor a 0");
  }

  if (config.allowedTypes && config.allowedTypes.length === 0) {
    errors.push("Debe especificar al menos un tipo de archivo permitido");
  }

  return errors;
}
