// 🔌 UPLOADS API ROUTE
// ===================
// API principal para CRUD de archivos

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/core/database/prisma";
import { auth } from "@/core/auth/auth";
import { uploadService } from "@/modules/file-upload/services";
import {
  validateFileType,
  validateFileSize,
} from "@/modules/file-upload/config";
import type {
  UploadFiltersRequest,
  CreateUploadRequest,
  UploadFilesResponse,
  UploadProvider,
} from "@/modules/file-upload/types";

// ✅ GET - Obtener archivos del usuario con filtros
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const filters: UploadFiltersRequest = {
      page,
      limit,
      search: searchParams.get("search") || undefined,
      provider: (searchParams.get("provider") as UploadProvider) || undefined,
      mimeType: searchParams.get("mimeType") || undefined,
      isPublic: searchParams.get("isPublic") === "true" ? true : undefined,
      categoryId: searchParams.get("categoryId") || undefined,
    };

    // Construir filtros para Prisma
    const where = {
      userId: session.user.id,
      deletedAt: null,
      ...(filters.search && {
        OR: [
          {
            originalName: {
              contains: filters.search,
              mode: "insensitive" as const,
            },
          },
          {
            filename: {
              contains: filters.search,
              mode: "insensitive" as const,
            },
          },
          {
            mimeType: {
              contains: filters.search,
              mode: "insensitive" as const,
            },
          },
        ],
      }),
      ...(filters.provider && { provider: filters.provider }),
      ...(filters.mimeType && { mimeType: { contains: filters.mimeType } }),
      ...(filters.isPublic !== undefined && { isPublic: filters.isPublic }),
    };

    // Obtener total para paginación
    const total = await prisma.upload.count({ where });

    // Obtener archivos paginados
    const files = await prisma.upload.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    const response: UploadFilesResponse = {
      files: files.map((file) => ({
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
        deletedAt: file.deletedAt?.toISOString(),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching uploads:", error);
    return NextResponse.json(
      { error: "Error interno del servidor1" },
      { status: 500 }
    );
  }
}

// ✅ POST - Subir archivo y crear registro
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const provider = (formData.get("provider") as string) || "local";
    const makePublic = formData.get("makePublic") === "true";
    const tags = formData.get("tags")
      ? JSON.parse(formData.get("tags") as string)
      : [];

    if (!file) {
      return NextResponse.json(
        { error: "No se proporcionó archivo" },
        { status: 400 }
      );
    }

    // Validar archivo
    const config = uploadService.getConfig();

    if (!validateFileType(file, config.allowedTypes)) {
      return NextResponse.json(
        { error: `Tipo de archivo no permitido: ${file.type}` },
        { status: 400 }
      );
    }

    if (!validateFileSize(file, config.maxFileSize)) {
      return NextResponse.json(
        {
          error: `Archivo muy grande. Máximo: ${Math.round(
            config.maxFileSize / (1024 * 1024)
          )}MB`,
        },
        { status: 400 }
      );
    }

    // Subir archivo
    console.log("🔧 [DEBUG] Iniciando upload con provider:", provider);
    const uploadResult = await uploadService.uploadFile(file, session.user.id, {
      provider: provider as UploadProvider,
      makePublic,
    });

    console.log("🔧 [DEBUG] Upload result:", {
      success: uploadResult.success,
      hasFile: !!uploadResult.file,
      error: uploadResult.error,
    });

    if (!uploadResult.success || !uploadResult.file) {
      console.error("❌ [ERROR] Upload falló:", uploadResult.error);
      return NextResponse.json(
        { error: uploadResult.error || "Error subiendo archivo" },
        { status: 500 }
      );
    }

    console.log(
      "✅ [DEBUG] Upload exitoso, creando registro en DB para:",
      uploadResult.file.filename
    );

    // Crear registro en base de datos
    const uploadRecord = await prisma.upload.create({
      data: {
        filename: uploadResult.file.filename,
        originalName: uploadResult.file.originalName,
        mimeType: uploadResult.file.mimeType,
        size: uploadResult.file.size,
        provider: uploadResult.file.provider,
        url: uploadResult.file.url,
        key: uploadResult.file.key,
        bucket: uploadResult.file.bucket,
        userId: session.user.id,
        metadata: uploadResult.file.metadata
          ? JSON.parse(JSON.stringify(uploadResult.file.metadata))
          : null,
        isPublic: uploadResult.file.isPublic,
        tags,
      },
    });

    const responseFile = {
      id: uploadRecord.id,
      filename: uploadRecord.filename,
      originalName: uploadRecord.originalName,
      mimeType: uploadRecord.mimeType,
      size: uploadRecord.size,
      provider: uploadRecord.provider as UploadProvider,
      url: uploadRecord.url,
      key: uploadRecord.key || undefined,
      bucket: uploadRecord.bucket || undefined,
      userId: uploadRecord.userId,
      metadata: (uploadRecord.metadata as Record<string, unknown>) || {},
      isPublic: uploadRecord.isPublic,
      tags: uploadRecord.tags,
      createdAt: uploadRecord.createdAt.toISOString(),
      updatedAt: uploadRecord.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      file: responseFile,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Error interno del servidor2" },
      { status: 500 }
    );
  }
}

// ✅ Filtros via POST (para filtros complejos)
export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const page = body.page || 1;
    const limit = body.limit || 20;

    const filters: UploadFiltersRequest = {
      page,
      limit,
      ...body,
    };

    // Construir filtros para Prisma
    const where = {
      userId: session.user.id,
      deletedAt: null,
      ...(filters.search && {
        OR: [
          {
            originalName: {
              contains: filters.search,
              mode: "insensitive" as const,
            },
          },
          {
            filename: {
              contains: filters.search,
              mode: "insensitive" as const,
            },
          },
          {
            mimeType: {
              contains: filters.search,
              mode: "insensitive" as const,
            },
          },
        ],
      }),
      ...(filters.provider && { provider: filters.provider }),
      ...(filters.mimeType && { mimeType: { contains: filters.mimeType } }),
      ...(filters.isPublic !== undefined && { isPublic: filters.isPublic }),
      ...(filters.tags &&
        filters.tags.length > 0 && {
          tags: { hasSome: filters.tags },
        }),
    };

    // Obtener total para paginación
    const total = await prisma.upload.count({ where });

    // Obtener archivos paginados
    const files = await prisma.upload.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    const response: UploadFilesResponse = {
      files: files.map((file) => ({
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
        deletedAt: file.deletedAt?.toISOString(),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error filtering uploads:", error);
    return NextResponse.json(
      { error: "Error interno del servidor3" },
      { status: 500 }
    );
  }
}
