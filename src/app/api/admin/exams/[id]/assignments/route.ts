import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/core/database/prisma";
import { auth } from "@/core/auth/auth";
import { AssignmentStatus } from "@prisma/client";

// ===========================================
// VALIDATION SCHEMAS
// ===========================================

const assignUsersSchema = z.object({
  userIds: z.array(z.string()).min(1, "At least one user must be selected"),
});

// ===========================================
// GET - Get Exam Assignments
// ===========================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const examId = params.id;

    if (!examId) {
      return NextResponse.json(
        { error: "Exam ID is required" },
        { status: 400 }
      );
    }

    // Get exam with assignments
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        assignments: {
          include: {
            // Note: We need to add User relation to ExamAssignment model
          },
          orderBy: { assignedAt: "desc" },
        },
      },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    // Get user data for assignments
    const userIds = exam.assignments.map((assignment) => assignment.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
      },
    });

    // Combine assignment data with user data
    const assignmentsWithUsers = exam.assignments.map((assignment) => {
      const user = users.find((u) => u.id === assignment.userId);
      return {
        ...assignment,
        user,
      };
    });

    return NextResponse.json({
      exam: {
        id: exam.id,
        title: exam.title,
        status: exam.status,
        examStartedAt: exam.examStartedAt,
        examEndsAt: exam.examEndsAt,
      },
      assignments: assignmentsWithUsers,
      totalAssigned: assignmentsWithUsers.length,
    });
  } catch (error) {
    console.error("Error fetching exam assignments:", error);
    return NextResponse.json(
      { error: "Failed to fetch exam assignments" },
      { status: 500 }
    );
  }
}

// ===========================================
// POST - Assign Users to Exam
// ===========================================

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const examId = params.id;

    if (!examId) {
      return NextResponse.json(
        { error: "Exam ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { userIds } = assignUsersSchema.parse(body);

    // Verify exam exists and is in a state that allows assignment
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    // Only SCHEDULED and SELF_PACED exams can have assignments
    if (exam.examType === "PUBLIC") {
      return NextResponse.json(
        { error: "Cannot assign users to public exams" },
        { status: 400 }
      );
    }

    // Check exam status based on type
    if (
      exam.examType === "SCHEDULED" &&
      (exam.status === "STARTED" || exam.status === "COMPLETED")
    ) {
      return NextResponse.json(
        {
          error:
            "Cannot assign users to a scheduled exam that has already started or completed",
        },
        { status: 400 }
      );
    }

    // Verify all users exist and are not admins
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds },
        role: { notIn: ["admin", "super_admin"] },
      },
    });

    if (users.length !== userIds.length) {
      return NextResponse.json(
        { error: "Some users not found or are administrators" },
        { status: 400 }
      );
    }

    // Create assignments (using upsert to avoid duplicates)
    const assignments = await Promise.all(
      userIds.map((userId) =>
        prisma.examAssignment.upsert({
          where: {
            examId_userId: {
              examId,
              userId,
            },
          },
          update: {
            status: AssignmentStatus.ASSIGNED,
            assignedBy: session.user.id,
          },
          create: {
            examId,
            userId,
            status: AssignmentStatus.ASSIGNED,
            assignedBy: session.user.id,
          },
        })
      )
    );

    // Update exam status to ASSIGNED if it was DRAFT
    if (exam.status === "DRAFT") {
      await prisma.exam.update({
        where: { id: examId },
        data: { status: "ASSIGNED" },
      });
    }

    return NextResponse.json({
      message: "Users assigned successfully",
      assignedCount: assignments.length,
      assignments,
    });
  } catch (error) {
    console.error("Error assigning users to exam:", error);
    return NextResponse.json(
      { error: "Failed to assign users to exam" },
      { status: 500 }
    );
  }
}

// ===========================================
// DELETE - Remove User Assignment
// ===========================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const examId = params.id;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!examId || !userId) {
      return NextResponse.json(
        { error: "Exam ID and User ID are required" },
        { status: 400 }
      );
    }

    // Verify exam is not started
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    if (exam.status === "STARTED" || exam.status === "COMPLETED") {
      return NextResponse.json(
        {
          error:
            "Cannot remove assignments from an exam that has started or completed",
        },
        { status: 400 }
      );
    }

    // Remove assignment
    await prisma.examAssignment.delete({
      where: {
        examId_userId: {
          examId,
          userId,
        },
      },
    });

    return NextResponse.json({
      message: "User assignment removed successfully",
    });
  } catch (error) {
    console.error("Error removing user assignment:", error);
    return NextResponse.json(
      { error: "Failed to remove user assignment" },
      { status: 500 }
    );
  }
}
