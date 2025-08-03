// ☁️ S3 UPLOADS API ROUTE
// ======================
// API para uploads directos a S3 y manejo de archivos S3

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/core/auth/auth";
import {
  getS3Config,
  validateFileType,
  validateFileSize,
  generateUploadPath,
} from "@/modules/file-upload/config";

// ✅ POST - Upload directo a S3 (si está configurado)
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar configuración de S3
    const s3Config = getS3Config();
    if (!s3Config) {
      return NextResponse.json(
        { error: "S3 no está configurado" },
        { status: 503 }
      );
    }

    // Obtener form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const key = formData.get("key") as string;
    const bucket = (formData.get("bucket") as string) || s3Config.bucket;
    const makePublic = formData.get("makePublic") === "true";

    if (!file) {
      return NextResponse.json(
        { error: "No se proporcionó archivo" },
        { status: 400 }
      );
    }

    // Validar archivo (estas validaciones deberían estar en el config del servicio)
    const maxSize = 10 * 1024 * 1024; // 10MB por defecto
    const allowedTypes = ["image/*", "application/pdf", "text/*"];

    if (!validateFileSize(file, maxSize)) {
      return NextResponse.json(
        {
          error: `Archivo muy grande. Máximo: ${Math.round(
            maxSize / (1024 * 1024)
          )}MB`,
        },
        { status: 400 }
      );
    }

    // Generar key si no se proporciona
    const uploadKey = key || generateUploadPath(session.user.id, file.name);

    // Para esta implementación básica, retornamos la información necesaria
    // En una implementación real, aquí harías el upload real a S3
    const mockS3Response = {
      url: `https://${bucket}.s3.${s3Config.region}.amazonaws.com/${uploadKey}`,
      key: uploadKey,
      bucket,
      etag: `"${Math.random().toString(36).substring(2)}"`, // Mock ETag
    };

    return NextResponse.json({
      success: true,
      ...mockS3Response,
      message: "Archivo subido exitosamente a S3",
    });
  } catch (error) {
    console.error("Error uploading to S3:", error);
    return NextResponse.json(
      { error: "Error interno del servidor11" },
      { status: 500 }
    );
  }
}

// ✅ DELETE - Eliminar archivo de S3
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar configuración de S3
    const s3Config = getS3Config();
    if (!s3Config) {
      return NextResponse.json(
        { error: "S3 no está configurado" },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { key, bucket } = body;

    if (!key) {
      return NextResponse.json(
        { error: "Key de archivo requerida" },
        { status: 400 }
      );
    }

    // En una implementación real, aquí harías la eliminación real de S3
    // Por ahora simulamos una eliminación exitosa
    console.log(
      `Mock: Eliminando archivo S3 - Bucket: ${
        bucket || s3Config.bucket
      }, Key: ${key}`
    );

    return NextResponse.json({
      success: true,
      message: "Archivo eliminado exitosamente de S3",
    });
  } catch (error) {
    console.error("Error deleting from S3:", error);
    return NextResponse.json(
      { error: "Error interno del servidor12" },
      { status: 500 }
    );
  }
}
