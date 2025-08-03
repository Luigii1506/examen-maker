// 📁 LOCAL UPLOAD SERVICE
// ======================
// Servicio para manejar uploads en el sistema de archivos local

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { generateUploadPath } from "../config";
import type { UploadResult, UploadFile } from "../types";

const UPLOAD_DIR = join(process.cwd(), "public", "uploads");

export class LocalUploadService {
  /**
   * Sube un archivo al sistema de archivos local
   */
  async uploadFile(
    file: File,
    userId: string,
    options?: {
      customPath?: string;
      makePublic?: boolean;
    }
  ): Promise<UploadResult> {
    try {
      // Generar path único
      const uploadPath =
        options?.customPath || generateUploadPath(userId, file.name);
      const fullPath = join(UPLOAD_DIR, uploadPath);
      const dirPath = join(fullPath, "..");

      // Crear directorio si no existe
      await mkdir(dirPath, { recursive: true });

      // Convertir File a Buffer
      const buffer = Buffer.from(await file.arrayBuffer());

      // Escribir archivo
      await writeFile(fullPath, buffer);

      // Crear URL pública
      const publicUrl = `/uploads/${uploadPath}`;

      // Crear registro de archivo
      const uploadFile: UploadFile = {
        id: "", // Se asignará en la base de datos
        filename: uploadPath.split("/").pop() || file.name,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        provider: "local",
        url: publicUrl,
        userId,
        metadata: {
          path: uploadPath,
          fullPath,
        },
        isPublic: options?.makePublic ?? true,
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return {
        success: true,
        file: uploadFile,
      };
    } catch (error) {
      console.error("Error uploading file locally:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  /**
   * Elimina un archivo del sistema local
   */
  async deleteFile(path: string): Promise<boolean> {
    try {
      const { unlink } = await import("fs/promises");
      const fullPath = join(UPLOAD_DIR, path);
      await unlink(fullPath);
      return true;
    } catch (error) {
      console.error("Error deleting local file:", error);
      return false;
    }
  }

  /**
   * Verifica si un archivo existe
   */
  async fileExists(path: string): Promise<boolean> {
    try {
      const { access } = await import("fs/promises");
      const fullPath = join(UPLOAD_DIR, path);
      await access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Obtiene información de un archivo
   */
  async getFileInfo(path: string) {
    try {
      const { stat } = await import("fs/promises");
      const fullPath = join(UPLOAD_DIR, path);
      const stats = await stat(fullPath);

      return {
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory(),
      };
    } catch (error) {
      console.error("Error getting file info:", error);
      return null;
    }
  }
}
