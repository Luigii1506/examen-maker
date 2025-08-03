// 🔌 INDIVIDUAL UPLOAD API ROUTE
// ===============================
// API para operaciones en archivos individuales (GET, PUT, DELETE)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/core/database/prisma";
import { auth } from "@/core/auth/auth";
import { uploadService } from "@/modules/file-upload/services";
import type {
  UpdateUploadRequest,
  UploadProvider,
} from "@/modules/file-upload/types";

// ✅ GET - Obtener archivo específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const file = await prisma.upload.findFirst({
      where: {
        id,
        userId: session.user.id,
        deletedAt: null,
      },
    });

    if (!file) {
      return NextResponse.json(
        { error: "Archivo no encontrado" },
        { status: 404 }
      );
    }

    const responseFile = {
      id: file.id,
      filename: file.filename,
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
      provider: file.provider as UploadProvider,
      url: file.url,
      key: file.key || undefined,
      bucket: file.bucket || undefined,
      userId: file.userId,
      metadata: (file.metadata as Record<string, unknown>) || {},
      isPublic: file.isPublic,
      tags: file.tags,
      createdAt: file.createdAt.toISOString(),
      updatedAt: file.updatedAt.toISOString(),
    };

    return NextResponse.json(responseFile);
  } catch (error) {
    console.error("Error fetching upload:", error);
    return NextResponse.json(
      { error: "Error interno del servidor4" },
      { status: 500 }
    );
  }
}

// ✅ PUT - Actualizar metadatos del archivo
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body: UpdateUploadRequest = await request.json();

    // Verificar que el archivo existe y pertenece al usuario
    const existingFile = await prisma.upload.findFirst({
      where: {
        id,
        userId: session.user.id,
        deletedAt: null,
      },
    });

    if (!existingFile) {
      return NextResponse.json(
        { error: "Archivo no encontrado" },
        { status: 404 }
      );
    }

    // Actualizar archivo
    const updatedFile = await prisma.upload.update({
      where: { id },
      data: {
        ...(body.filename && { filename: body.filename }),
        ...(body.metadata && {
          metadata: JSON.parse(JSON.stringify(body.metadata)),
        }),
        ...(body.isPublic !== undefined && { isPublic: body.isPublic }),
        ...(body.tags && { tags: body.tags }),
        updatedAt: new Date(),
      },
    });

    const responseFile = {
      id: updatedFile.id,
      filename: updatedFile.filename,
      originalName: updatedFile.originalName,
      mimeType: updatedFile.mimeType,
      size: updatedFile.size,
      provider: updatedFile.provider as UploadProvider,
      url: updatedFile.url,
      key: updatedFile.key || undefined,
      bucket: updatedFile.bucket || undefined,
      userId: updatedFile.userId,
      metadata: (updatedFile.metadata as Record<string, unknown>) || {},
      isPublic: updatedFile.isPublic,
      tags: updatedFile.tags,
      createdAt: updatedFile.createdAt.toISOString(),
      updatedAt: updatedFile.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      file: responseFile,
    });
  } catch (error) {
    console.error("Error updating upload:", error);
    return NextResponse.json(
      { error: "Error interno del servidor5" },
      { status: 500 }
    );
  }
}

// ✅ DELETE - Eliminar archivo
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar que el archivo existe y pertenece al usuario
    const existingFile = await prisma.upload.findFirst({
      where: {
        id,
        userId: session.user.id,
        deletedAt: null,
      },
    });

    if (!existingFile) {
      return NextResponse.json(
        { error: "Archivo no encontrado" },
        { status: 404 }
      );
    }

    // Construir objeto UploadFile para el servicio
    const uploadFile = {
      id: existingFile.id,
      filename: existingFile.filename,
      originalName: existingFile.originalName,
      mimeType: existingFile.mimeType,
      size: existingFile.size,
      provider: existingFile.provider as UploadProvider,
      url: existingFile.url,
      key: existingFile.key || undefined,
      bucket: existingFile.bucket || undefined,
      userId: existingFile.userId,
      metadata: (existingFile.metadata as Record<string, unknown>) || {},
      isPublic: existingFile.isPublic,
      tags: existingFile.tags,
      createdAt: existingFile.createdAt.toISOString(),
      updatedAt: existingFile.updatedAt.toISOString(),
    };

    // Intentar eliminar del storage
    try {
      await uploadService.deleteFile(uploadFile);
    } catch (storageError) {
      console.warn(
        "Error deleting from storage, continuing with DB deletion:",
        storageError
      );
    }

    // Soft delete en la base de datos
    await prisma.upload.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Archivo eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error deleting upload:", error);
    return NextResponse.json(
      { error: "Error interno del servidor6" },
      { status: 500 }
    );
  }
}
