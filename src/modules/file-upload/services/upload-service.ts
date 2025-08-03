// 🚀 UNIFIED UPLOAD SERVICE
// =========================
// Servicio principal que maneja todos los proveedores de upload

import { LocalUploadService } from "./local-upload";
import { S3UploadService } from "./s3-upload";
import {
  getFileUploadConfig,
  validateFileType,
  validateFileSize,
} from "../config";
import type {
  UploadResult,
  UploadFile,
  UploadConfig,
  UploadProvider,
} from "../types";

export class UploadService {
  private localService: LocalUploadService;
  private s3Service: S3UploadService;
  private config: UploadConfig;

  constructor(config?: Partial<UploadConfig>) {
    this.config = { ...getFileUploadConfig(), ...config };
    this.localService = new LocalUploadService();
    this.s3Service = new S3UploadService();
  }

  /**
   * Sube uno o múltiples archivos
   */
  async uploadFiles(
    files: File[],
    userId: string,
    options?: {
      provider?: UploadProvider;
      makePublic?: boolean;
      onProgress?: (fileId: string, progress: number) => void;
    }
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];
    const provider = options?.provider || this.config.provider;

    for (const file of files) {
      // Validar archivo
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        results.push({
          success: false,
          error: validation.error,
        });
        continue;
      }

      // Upload según el proveedor
      try {
        let uploadedFile: UploadFile;

        switch (provider) {
          case "s3":
            uploadedFile = await this.s3Service.uploadFile(file, userId, {
              makePublic: options?.makePublic,
              onProgress: options?.onProgress
                ? (progress) => options.onProgress!(file.name, progress)
                : undefined,
            });
            break;

          case "local":
          default:
            const localResult = await this.localService.uploadFile(
              file,
              userId,
              {
                makePublic: options?.makePublic,
              }
            );
            if (!localResult.success || !localResult.file) {
              throw new Error(localResult.error || "Error en upload local");
            }
            uploadedFile = localResult.file;
            break;
        }

        results.push({
          success: true,
          file: uploadedFile,
        });
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : "Error desconocido",
        });
      }
    }

    return results;
  }

  /**
   * Sube un archivo individual
   */
  async uploadFile(
    file: File,
    userId: string,
    options?: {
      provider?: UploadProvider;
      makePublic?: boolean;
      onProgress?: (progress: number) => void;
    }
  ): Promise<UploadResult> {
    const results = await this.uploadFiles([file], userId, {
      ...options,
      onProgress: options?.onProgress
        ? (_, progress) => options.onProgress!(progress)
        : undefined,
    });

    return results[0];
  }

  /**
   * Elimina un archivo
   */
  async deleteFile(uploadFile: UploadFile): Promise<boolean> {
    try {
      switch (uploadFile.provider) {
        case "s3":
          if (!uploadFile.key) {
            console.error("S3 file missing key");
            return false;
          }
          return await this.s3Service.deleteFile(uploadFile.key);

        case "local":
          if (!uploadFile.metadata?.path) {
            console.error("Local file missing path");
            return false;
          }
          return await this.localService.deleteFile(
            uploadFile.metadata.path as string
          );

        default:
          console.error(`Unsupported provider: ${uploadFile.provider}`);
          return false;
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      return false;
    }
  }

  /**
   * Obtiene una URL firmada (solo para S3)
   */
  async getSignedUrl(
    uploadFile: UploadFile,
    expiresIn = 3600
  ): Promise<string | null> {
    if (uploadFile.provider !== "s3" || !uploadFile.key) {
      return uploadFile.url; // Para archivos locales o públicos
    }

    return await this.s3Service.getSignedUrl(uploadFile.key, expiresIn);
  }

  /**
   * Valida un archivo antes del upload
   */
  private validateFile(file: File): { isValid: boolean; error?: string } {
    // Validar tipo de archivo
    if (!validateFileType(file, this.config.allowedTypes)) {
      return {
        isValid: false,
        error: `Tipo de archivo no permitido: ${file.type}`,
      };
    }

    // Validar tamaño
    if (!validateFileSize(file, this.config.maxFileSize)) {
      const maxSizeMB = Math.round(this.config.maxFileSize / (1024 * 1024));
      return {
        isValid: false,
        error: `Archivo muy grande. Máximo permitido: ${maxSizeMB}MB`,
      };
    }

    return { isValid: true };
  }

  /**
   * Obtiene la configuración actual
   */
  getConfig(): UploadConfig {
    return { ...this.config };
  }

  /**
   * Actualiza la configuración
   */
  updateConfig(newConfig: Partial<UploadConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Verifica si un proveedor está disponible
   */
  isProviderAvailable(provider: UploadProvider): boolean {
    switch (provider) {
      case "local":
        return true; // Siempre disponible

      case "s3":
        return !!(
          process.env.AWS_ACCESS_KEY_ID &&
          process.env.AWS_SECRET_ACCESS_KEY &&
          process.env.AWS_S3_BUCKET
        );

      case "cloudinary":
        return !!(
          process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY
        );

      default:
        return false;
    }
  }

  /**
   * Obtiene proveedores disponibles
   */
  getAvailableProviders(): UploadProvider[] {
    const providers: UploadProvider[] = [];

    if (this.isProviderAvailable("local")) providers.push("local");
    if (this.isProviderAvailable("s3")) providers.push("s3");
    if (this.isProviderAvailable("cloudinary")) providers.push("cloudinary");

    return providers;
  }
}

// Instancia singleton para uso global
export const uploadService = new UploadService();
