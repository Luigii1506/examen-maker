import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/core/database/prisma";
import { auth } from "@/core/auth/auth";

// ===========================================
// POST - Start Exam Globally
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

    // Get exam with assignments
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        assignments: true,
      },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    // Only SCHEDULED exams can be started by admin
    if (exam.examType !== "SCHEDULED") {
      return NextResponse.json(
        {
          error:
            "Only scheduled exams can be started by admin. Self-paced and public exams are managed differently.",
        },
        { status: 400 }
      );
    }

    // Check if exam can be started
    if (exam.status === "STARTED") {
      return NextResponse.json(
        { error: "Exam has already been started" },
        { status: 400 }
      );
    }

    if (exam.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Exam has already been completed" },
        { status: 400 }
      );
    }

    if (!exam.assignments || exam.assignments.length === 0) {
      return NextResponse.json(
        { error: "No users are assigned to this exam" },
        { status: 400 }
      );
    }

    // Calculate exam end time
    const now = new Date();
    const examEndsAt = new Date(now.getTime() + exam.duration * 60 * 1000);

    // Start the exam
    const updatedExam = await prisma.exam.update({
      where: { id: examId },
      data: {
        status: "STARTED",
        examStartedAt: now,
        examEndsAt: examEndsAt,
      },
    });

    // Count assigned users
    const assignedUsersCount = exam.assignments.length;

    return NextResponse.json({
      message: "Exam started successfully",
      exam: {
        id: updatedExam.id,
        title: updatedExam.title,
        status: updatedExam.status,
        examStartedAt: updatedExam.examStartedAt,
        examEndsAt: updatedExam.examEndsAt,
        duration: updatedExam.duration,
      },
      assignedUsersCount,
      startedBy: session.user.id,
      startedAt: now,
    });
  } catch (error) {
    console.error("Error starting exam:", error);
    return NextResponse.json(
      { error: "Failed to start exam" },
      { status: 500 }
    );
  }
}

// ===========================================
// POST - End Exam Manually (if needed)
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

    if (!examId) {
      return NextResponse.json(
        { error: "Exam ID is required" },
        { status: 400 }
      );
    }

    // Get exam
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    // Check if exam is started
    if (exam.status !== "STARTED") {
      return NextResponse.json(
        { error: "Only started exams can be manually ended" },
        { status: 400 }
      );
    }

    // End the exam
    const updatedExam = await prisma.exam.update({
      where: { id: examId },
      data: {
        status: "COMPLETED",
        examEndsAt: new Date(), // End immediately
      },
    });

    return NextResponse.json({
      message: "Exam ended successfully",
      exam: {
        id: updatedExam.id,
        title: updatedExam.title,
        status: updatedExam.status,
        examStartedAt: updatedExam.examStartedAt,
        examEndsAt: updatedExam.examEndsAt,
      },
      endedBy: session.user.id,
      endedAt: new Date(),
    });
  } catch (error) {
    console.error("Error ending exam:", error);
    return NextResponse.json({ error: "Failed to end exam" }, { status: 500 });
  }
}
