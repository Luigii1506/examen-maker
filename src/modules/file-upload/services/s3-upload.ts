// ☁️ S3 UPLOAD SERVICE
// ===================
// Servicio para manejar uploads a Amazon S3

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { generateUploadPath, getS3Config } from "../config";
import type { UploadResult, UploadFile, S3Config } from "../types";

export class S3UploadService {
  private config: S3Config;
  private s3Client?: S3Client;
  private isServer: boolean;

  constructor(config?: S3Config) {
    this.isServer = typeof window === "undefined";
    this.config = config ||
      getS3Config() || {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
        region: "us-east-1",
        bucket: "clistenesbucket",
      };

    // Inicializar cliente S3 solo en el servidor
    if (this.isServer) {
      this.s3Client = new S3Client({
        region: this.config.region,
        credentials: {
          accessKeyId: this.config.accessKeyId,
          secretAccessKey: this.config.secretAccessKey,
        },
      });
    }
  }

  /**
   * Sube un archivo a S3
   */
  async uploadFile(
    file: File,
    userId: string,
    options?: {
      customKey?: string;
      makePublic?: boolean;
      onProgress?: (progress: number) => void;
    }
  ): Promise<UploadFile> {
    if (!this.isConfigured()) {
      throw new Error("S3 no está configurado correctamente");
    }

    // Si estamos en el servidor, usar AWS SDK directamente
    if (this.isServer) {
      return this.uploadToS3Direct(file, userId, options);
    }

    // Si estamos en el cliente, usar fetch a la API route
    return this.uploadToS3ViaAPI(file, userId, options);
  }

  /**
   * Upload directo usando AWS SDK (servidor)
   */
  private async uploadToS3Direct(
    file: File,
    userId: string,
    options?: {
      customKey?: string;
      makePublic?: boolean;
      onProgress?: (progress: number) => void;
    }
  ): Promise<UploadFile> {
    const key = options?.customKey || generateUploadPath(userId, file.name);

    try {
      // Convertir File a Buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const command = new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
        Body: buffer,
        ContentType: file.type,
        // ACL removido - se maneja por políticas del bucket
        Metadata: {
          originalName: file.name,
          uploadedBy: userId,
          uploadedAt: new Date().toISOString(),
        },
      });

      await this.s3Client!.send(command);

      // Construir URL del archivo
      const url = `https://${this.config.bucket}.s3.${this.config.region}.amazonaws.com/${key}`;

      return {
        id: `s3_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        filename: key.split("/").pop() || file.name,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        provider: "s3",
        url,
        key,
        bucket: this.config.bucket,
        userId,
        metadata: {
          uploadedAt: new Date().toISOString(),
        },
        isPublic: options?.makePublic || false,
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: undefined,
      };
    } catch (error) {
      console.error("Error uploading to S3:", error);
      throw new Error(`Error subiendo a S3: ${error}`);
    }
  }

  /**
   * Upload vía API route (cliente)
   */
  private async uploadToS3ViaAPI(
    file: File,
    userId: string,
    options?: {
      customKey?: string;
      makePublic?: boolean;
      onProgress?: (progress: number) => void;
    }
  ): Promise<UploadFile> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId);
    if (options?.customKey) formData.append("customKey", options.customKey);
    if (options?.makePublic) formData.append("makePublic", "true");

    try {
      // Para progreso avanzado, usar XMLHttpRequest
      if (options?.onProgress) {
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable && options.onProgress) {
              const progress = (event.loaded / event.total) * 100;
              options.onProgress(progress);
            }
          });

          xhr.addEventListener("load", () => {
            if (xhr.status === 200) {
              resolve(JSON.parse(xhr.responseText));
            } else {
              reject(new Error(`Error: ${xhr.status} - ${xhr.statusText}`));
            }
          });

          xhr.addEventListener("error", () => {
            reject(new Error("Error en la conexión"));
          });

          xhr.open("POST", "/api/uploads/s3");
          xhr.send(formData);
        });
      }

      // Upload simple con fetch
      const response = await fetch("/api/uploads/s3", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error en upload: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error uploading to S3:", error);
      throw new Error(`Error subiendo a S3: ${error}`);
    }
  }

  /**
   * Elimina un archivo de S3
   */
  async deleteFile(key: string): Promise<boolean> {
    if (!this.isServer) {
      // En el cliente, la eliminación se maneja a través de la API route
      try {
        const response = await fetch("/api/uploads/s3", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ key, bucket: this.config.bucket }),
        });
        return response.ok;
      } catch (error) {
        console.error("Error deleting from S3:", error);
        return false;
      }
    } else {
      // En el servidor, usar AWS SDK directamente
      try {
        const command = new DeleteObjectCommand({
          Bucket: this.config.bucket,
          Key: key,
        });
        await this.s3Client!.send(command);
        return true;
      } catch (error) {
        console.error("Error deleting from S3:", error);
        return false;
      }
    }
  }

  /**
   * Genera una URL firmada para acceso temporal
   */
  async getSignedUrl(key: string, expiresIn = 3600): Promise<string | null> {
    if (!this.isServer) {
      // En el cliente, la generación de URL firmada se maneja a través de la API route
      try {
        const response = await fetch("/api/uploads/s3/signed-url", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            key,
            bucket: this.config.bucket,
            expiresIn,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to get signed URL");
        }

        const result = await response.json();
        return result.url;
      } catch (error) {
        console.error("Error getting signed URL:", error);
        return null;
      }
    } else {
      // En el servidor, usar AWS SDK directamente
      try {
        const command = new GetObjectCommand({
          Bucket: this.config.bucket,
          Key: key,
        });
        const url = await getSignedUrl(this.s3Client!, command, { expiresIn });
        return url;
      } catch (error) {
        console.error("Error getting signed URL:", error);
        return null;
      }
    }
  }

  /**
   * Verifica si S3 está configurado correctamente
   */
  private isConfigured(): boolean {
    return !!(
      this.config.accessKeyId &&
      this.config.secretAccessKey &&
      this.config.bucket &&
      this.config.region
    );
  }
}
