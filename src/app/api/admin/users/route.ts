import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/core/database/prisma";
import { auth } from "@/core/auth/auth";

// ===========================================
// VALIDATION SCHEMAS
// ===========================================

const getUserFiltersSchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

// ===========================================
// GET - List Non-Admin Users for Assignment
// ===========================================

export async function GET(request: NextRequest) {
  try {
    // Authenticate and verify admin
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const userRole = session.user.role;
    if (userRole !== "admin" && userRole !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    const filters = getUserFiltersSchema.parse(params);

    // Build where clause for non-admin users
    const where: any = {
      AND: [
        {
          role: {
            notIn: ["admin", "super_admin"],
          },
        },
      ],
    };

    if (filters.search) {
      where.AND.push({
        OR: [
          { name: { contains: filters.search, mode: "insensitive" } },
          { email: { contains: filters.search, mode: "insensitive" } },
        ],
      });
    }

    // Get total count for pagination
    const total = await prisma.user.count({ where });
    const totalPages = Math.ceil(total / filters.limit);
    const offset = (filters.page - 1) * filters.limit;

    // Fetch users
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [{ name: "asc" }],
      take: filters.limit,
      skip: offset,
    });

    return NextResponse.json({
      users,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages,
        hasNext: filters.page < totalPages,
        hasPrev: filters.page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
