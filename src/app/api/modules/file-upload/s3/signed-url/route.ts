// 🔑 S3 SIGNED URL API ROUTE
// =========================
// API para generar URLs firmadas para acceso temporal a archivos S3

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/core/auth/auth";
import { prisma } from "@/core/database/prisma";
import { getS3Config } from "@/modules/file-upload/config";

// ✅ POST - Generar URL firmada para archivo S3
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

    const body = await request.json();
    const { key, bucket, expiresIn = 3600, fileId } = body;

    if (!key && !fileId) {
      return NextResponse.json(
        { error: "Key de archivo o ID de archivo requerido" },
        { status: 400 }
      );
    }

    let fileKey = key;
    let fileBucket = bucket || s3Config.bucket;

    // Si se proporciona fileId, obtener información del archivo de la BD
    if (fileId) {
      const file = await prisma.upload.findFirst({
        where: {
          id: fileId,
          userId: session.user.id,
          deletedAt: null,
          provider: "s3",
        },
      });

      if (!file) {
        return NextResponse.json(
          { error: "Archivo no encontrado o no pertenece al usuario" },
          { status: 404 }
        );
      }

      fileKey = file.key;
      fileBucket = file.bucket || s3Config.bucket;

      if (!fileKey) {
        return NextResponse.json(
          { error: "Archivo no tiene key de S3 válida" },
          { status: 400 }
        );
      }
    }

    // Validar expiresIn (máximo 7 días)
    const maxExpiresIn = 7 * 24 * 60 * 60; // 7 días en segundos
    const validExpiresIn = Math.min(expiresIn, maxExpiresIn);

    // En una implementación real, aquí generarías la URL firmada real con AWS SDK
    // Por ahora, creamos una URL mock
    const signedUrl = `https://${fileBucket}.s3.${
      s3Config.region
    }.amazonaws.com/${fileKey}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=MOCKKEY&X-Amz-Date=${new Date()
      .toISOString()
      .replace(
        /[:-]|\.\d{3}/g,
        ""
      )}&X-Amz-Expires=${validExpiresIn}&X-Amz-SignedHeaders=host&X-Amz-Signature=mocksignature${Math.random()
      .toString(36)
      .substring(2)}`;

    // Registrar la generación de URL firmada (opcional, para auditoría)
    if (fileId) {
      try {
        await prisma.upload.update({
          where: { id: fileId },
          data: {
            metadata: {
              ...(((
                await prisma.upload.findUnique({ where: { id: fileId } })
              )?.metadata as Record<string, unknown>) || {}),
              lastSignedUrlGenerated: new Date().toISOString(),
              signedUrlGeneratedBy: session.user.id,
            },
          },
        });
      } catch (metadataError) {
        console.warn("Could not update metadata:", metadataError);
      }
    }

    return NextResponse.json({
      success: true,
      url: signedUrl,
      expiresIn: validExpiresIn,
      expiresAt: new Date(Date.now() + validExpiresIn * 1000).toISOString(),
      key: fileKey,
      bucket: fileBucket,
    });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return NextResponse.json(
      { error: "Error interno del servidor13" },
      { status: 500 }
    );
  }
}

// ✅ GET - Generar URL firmada via query params (alternativo)
export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;
    const key = searchParams.get("key");
    const bucket = searchParams.get("bucket");
    const expiresIn = parseInt(searchParams.get("expiresIn") || "3600");
    const fileId = searchParams.get("fileId");

    if (!key && !fileId) {
      return NextResponse.json(
        { error: "Key de archivo o ID de archivo requerido" },
        { status: 400 }
      );
    }

    let fileKey = key;
    let fileBucket = bucket || s3Config.bucket;

    // Si se proporciona fileId, obtener información del archivo de la BD
    if (fileId) {
      const file = await prisma.upload.findFirst({
        where: {
          id: fileId,
          userId: session.user.id,
          deletedAt: null,
          provider: "s3",
        },
      });

      if (!file) {
        return NextResponse.json(
          { error: "Archivo no encontrado o no pertenece al usuario" },
          { status: 404 }
        );
      }

      fileKey = file.key;
      fileBucket = file.bucket || s3Config.bucket;

      if (!fileKey) {
        return NextResponse.json(
          { error: "Archivo no tiene key de S3 válida" },
          { status: 400 }
        );
      }
    }

    // Validar expiresIn (máximo 7 días)
    const maxExpiresIn = 7 * 24 * 60 * 60; // 7 días en segundos
    const validExpiresIn = Math.min(expiresIn, maxExpiresIn);

    // En una implementación real, aquí generarías la URL firmada real con AWS SDK
    const signedUrl = `https://${fileBucket}.s3.${
      s3Config.region
    }.amazonaws.com/${fileKey}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=MOCKKEY&X-Amz-Date=${new Date()
      .toISOString()
      .replace(
        /[:-]|\.\d{3}/g,
        ""
      )}&X-Amz-Expires=${validExpiresIn}&X-Amz-SignedHeaders=host&X-Amz-Signature=mocksignature${Math.random()
      .toString(36)
      .substring(2)}`;

    return NextResponse.json({
      success: true,
      url: signedUrl,
      expiresIn: validExpiresIn,
      expiresAt: new Date(Date.now() + validExpiresIn * 1000).toISOString(),
      key: fileKey,
      bucket: fileBucket,
    });
  } catch (error) {
    console.error("Error generating signed URL via GET:", error);
    return NextResponse.json(
      { error: "Error interno del servidor14" },
      { status: 500 }
    );
  }
}
