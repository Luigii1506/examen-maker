// 🔌 UPLOADS CATEGORIES API ROUTE
// ===============================
// API para categorías de archivos

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/core/database/prisma";
import { auth } from "@/core/auth/auth";
import { FILE_CATEGORIES } from "@/modules/file-upload/config";

// ✅ GET - Obtener categorías de archivos
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener categorías desde la base de datos
    const dbCategories = await prisma.fileCategory.findMany({
      orderBy: { name: "asc" },
    });

    // Combinar con categorías predefinidas
    const predefinedCategories = Object.entries(FILE_CATEGORIES).map(
      ([key, category]) => ({
        id: key.toLowerCase(),
        name: category.name,
        description: `Categoría para ${category.name.toLowerCase()}`,
        icon: category.icon,
        maxSize: category.maxSize,
        allowedTypes: category.allowedTypes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    );

    // Convertir categorías de BD al formato esperado
    const formattedDbCategories = dbCategories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      description: cat.description || undefined,
      icon: cat.icon || undefined,
      maxSize: cat.maxSize || undefined,
      allowedTypes: cat.allowedTypes,
      createdAt: cat.createdAt.toISOString(),
      updatedAt: cat.updatedAt.toISOString(),
    }));

    // Combinar todas las categorías (BD tiene prioridad)
    const allCategories = [
      ...formattedDbCategories,
      ...predefinedCategories.filter(
        (pred) =>
          !formattedDbCategories.some(
            (db) => db.name.toLowerCase() === pred.name.toLowerCase()
          )
      ),
    ];

    return NextResponse.json({
      categories: allCategories,
      total: allCategories.length,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Error interno del servidor7" },
      { status: 500 }
    );
  }
}

// ✅ POST - Crear nueva categoría (solo admins)
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar permisos de admin
    if (session.user.role !== "admin" && session.user.role !== "super_admin") {
      return NextResponse.json(
        { error: "Permisos insuficientes" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, icon, maxSize, allowedTypes } = body;

    // Validaciones
    if (!name || !allowedTypes || !Array.isArray(allowedTypes)) {
      return NextResponse.json(
        { error: "Nombre y tipos de archivo son requeridos" },
        { status: 400 }
      );
    }

    // Verificar que no existe una categoría con el mismo nombre
    const existingCategory = await prisma.fileCategory.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
      },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: "Ya existe una categoría con ese nombre" },
        { status: 409 }
      );
    }

    // Crear categoría
    const category = await prisma.fileCategory.create({
      data: {
        name,
        description,
        icon,
        maxSize,
        allowedTypes,
      },
    });

    const responseCategory = {
      id: category.id,
      name: category.name,
      description: category.description || undefined,
      icon: category.icon || undefined,
      maxSize: category.maxSize || undefined,
      allowedTypes: category.allowedTypes,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      category: responseCategory,
    });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Error interno del servidor8" },
      { status: 500 }
    );
  }
}

// ✅ PUT - Actualizar categoría (solo admins)
export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar permisos de admin
    if (session.user.role !== "admin" && session.user.role !== "super_admin") {
      return NextResponse.json(
        { error: "Permisos insuficientes" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, name, description, icon, maxSize, allowedTypes } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID de categoría requerido" },
        { status: 400 }
      );
    }

    // Verificar que la categoría existe
    const existingCategory = await prisma.fileCategory.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Categoría no encontrada" },
        { status: 404 }
      );
    }

    // Actualizar categoría
    const updatedCategory = await prisma.fileCategory.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(icon !== undefined && { icon }),
        ...(maxSize !== undefined && { maxSize }),
        ...(allowedTypes && { allowedTypes }),
        updatedAt: new Date(),
      },
    });

    const responseCategory = {
      id: updatedCategory.id,
      name: updatedCategory.name,
      description: updatedCategory.description || undefined,
      icon: updatedCategory.icon || undefined,
      maxSize: updatedCategory.maxSize || undefined,
      allowedTypes: updatedCategory.allowedTypes,
      createdAt: updatedCategory.createdAt.toISOString(),
      updatedAt: updatedCategory.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      category: responseCategory,
    });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Error interno del servidor9" },
      { status: 500 }
    );
  }
}

// ✅ DELETE - Eliminar categoría (solo admins)
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar permisos de admin
    if (session.user.role !== "admin" && session.user.role !== "super_admin") {
      return NextResponse.json(
        { error: "Permisos insuficientes" },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID de categoría requerido" },
        { status: 400 }
      );
    }

    // Verificar que la categoría existe
    const existingCategory = await prisma.fileCategory.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Categoría no encontrada" },
        { status: 404 }
      );
    }

    // Eliminar categoría
    await prisma.fileCategory.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Categoría eliminada exitosamente",
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Error interno del servidor10" },
      { status: 500 }
    );
  }
}
