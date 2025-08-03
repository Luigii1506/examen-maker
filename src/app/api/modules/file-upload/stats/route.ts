// 🔌 UPLOADS STATS API ROUTE
// ==========================
// API para estadísticas de archivos del usuario

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/core/database/prisma";
import { auth } from "@/core/auth/auth";

// ✅ GET - Obtener estadísticas de archivos del usuario
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId") || session.user.id;

    // Verificar que el usuario puede acceder a estas estadísticas
    if (
      userId !== session.user.id &&
      session.user.role !== "admin" &&
      session.user.role !== "super_admin"
    ) {
      return NextResponse.json(
        { error: "No autorizado para ver estas estadísticas" },
        { status: 403 }
      );
    }

    // Obtener estadísticas básicas
    const [totalFiles, totalSizeResult] = await Promise.all([
      // Total de archivos
      prisma.upload.count({
        where: {
          userId,
          deletedAt: null,
        },
      }),

      // Tamaño total
      prisma.upload.aggregate({
        where: {
          userId,
          deletedAt: null,
        },
        _sum: {
          size: true,
        },
      }),
    ]);

    const totalSize = totalSizeResult._sum.size || 0;

    // Estadísticas por proveedor
    const providerStats = await prisma.upload.groupBy({
      by: ["provider"],
      where: {
        userId,
        deletedAt: null,
      },
      _count: {
        provider: true,
      },
      _sum: {
        size: true,
      },
    });

    // Estadísticas por tipo de archivo
    const typeStats = await prisma.upload.groupBy({
      by: ["mimeType"],
      where: {
        userId,
        deletedAt: null,
      },
      _count: {
        mimeType: true,
      },
      _sum: {
        size: true,
      },
      orderBy: {
        _count: {
          mimeType: "desc",
        },
      },
      take: 10, // Top 10 tipos de archivo
    });

    // Estadísticas por fecha (últimos 30 días)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyStats = await prisma.$queryRaw<
      Array<{ date: string; count: bigint; size: bigint }>
    >`
      SELECT 
        DATE("createdAt") as date,
        COUNT(*) as count,
        SUM(size) as size
      FROM uploads 
      WHERE "deletedAt" IS NULL 
        AND "userId" = ${session.user.id}
        AND "createdAt" >= ${thirtyDaysAgo}
      GROUP BY DATE("createdAt")
      ORDER BY date DESC
    `;

    // Procesar estadísticas por proveedor
    const byProvider = providerStats.reduce((acc, stat) => {
      acc[stat.provider] = Number(stat._count.provider);
      return acc;
    }, {} as Record<string, number>);

    // Procesar estadísticas por tipo
    const byType = typeStats.reduce((acc, stat) => {
      acc[stat.mimeType] = Number(stat._count.mimeType);
      return acc;
    }, {} as Record<string, number>);

    // Procesar estadísticas diarias
    const dailyUploads = dailyStats.map((stat) => ({
      date: stat.date,
      count: Number(stat.count),
      size: Number(stat.size),
    }));

    // Calcular tendencias
    const weeklyGrowth = dailyUploads
      .slice(0, 7)
      .reduce((sum, day) => sum + day.count, 0);
    const previousWeekGrowth = dailyUploads
      .slice(7, 14)
      .reduce((sum, day) => sum + day.count, 0);
    const growthRate =
      previousWeekGrowth > 0
        ? ((weeklyGrowth - previousWeekGrowth) / previousWeekGrowth) * 100
        : 0;

    // Estadísticas adicionales
    const averageFileSize =
      totalFiles > 0 ? Math.round(totalSize / totalFiles) : 0;

    // Archivos públicos vs privados
    const publicFiles = await prisma.upload.count({
      where: {
        userId,
        deletedAt: null,
        isPublic: true,
      },
    });

    const privateFiles = totalFiles - publicFiles;

    const stats = {
      // Métricas principales
      totalFiles,
      totalSize,
      averageFileSize,

      // Distribuciones
      byProvider,
      byType,

      // Estadísticas de privacidad
      publicFiles,
      privateFiles,

      // Tendencias
      dailyUploads,
      weeklyGrowth,
      growthRate: Math.round(growthRate * 100) / 100, // Redondear a 2 decimales

      // Metadatos
      topFileTypes: typeStats.slice(0, 5).map((stat) => ({
        mimeType: stat.mimeType,
        count: Number(stat._count.mimeType),
        size: Number(stat._sum.size || 0),
      })),

      // Fechas
      generatedAt: new Date().toISOString(),
      userId,
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Error fetching upload stats:", error);
    return NextResponse.json(
      { error: "Error interno del servidor15" },
      { status: 500 }
    );
  }
}
