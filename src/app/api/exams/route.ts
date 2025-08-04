import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/core/database/prisma";
import { auth } from "@/core/auth/auth";
import { QuestionStatus } from "@prisma/client";

// ===========================================
// GET - List Available Exams for Users
// ===========================================

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get assigned exams (SCHEDULED and SELF_PACED)
    const examAssignments = await prisma.examAssignment.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        exam: {
          select: {
            id: true,
            title: true,
            description: true,
            duration: true,
            category: true,
            difficulty: true,
            totalQuestions: true,
            passingScore: true,
            status: true,
            examType: true,
            examStartedAt: true,
            examEndsAt: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: {
                questions: {
                  where: { status: QuestionStatus.ACTIVE },
                },
              },
            },
          },
        },
      },
      orderBy: { assignedAt: "desc" },
    });

    // Get public exams (available to all users)
    const publicExams = await prisma.exam.findMany({
      where: {
        examType: "PUBLIC",
        status: "ACTIVE",
      },
      select: {
        id: true,
        title: true,
        description: true,
        duration: true,
        category: true,
        difficulty: true,
        totalQuestions: true,
        passingScore: true,
        status: true,
        examType: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            questions: {
              where: { status: QuestionStatus.ACTIVE },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Process assigned exams
    const assignedExamsWithData = await Promise.all(
      examAssignments.map(async (assignment) => {
        const exam = assignment.exam;

        const userAttempts = await prisma.examAttempt.findMany({
          where: {
            examId: exam.id,
            userId: session.user.id,
          },
          select: {
            id: true,
            status: true,
            startedAt: true,
            finishedAt: true,
            percentage: true,
            passed: true,
          },
          orderBy: { startedAt: "desc" },
        });

        const lastAttempt = userAttempts[0];
        const completedAttempts = userAttempts.filter(
          (attempt) => attempt.status === "COMPLETED"
        ).length;
        const hasAvailableAttempts = completedAttempts < 3; // Max 3 attempts
        const hasPassingScore = userAttempts.some((attempt) => attempt.passed);

        // Determine availability based on exam type
        let isAvailable = false;
        let timeRemaining = null;

        switch (exam.examType) {
          case "SCHEDULED":
            // Only available when admin starts it
            isAvailable = exam.status === "STARTED" && hasAvailableAttempts;
            if (exam.status === "STARTED" && exam.examEndsAt) {
              const now = new Date();
              const endTime = new Date(exam.examEndsAt);
              timeRemaining = Math.max(0, endTime.getTime() - now.getTime());
            }
            break;
          case "SELF_PACED":
            // Available when assigned and active
            isAvailable = exam.status === "ACTIVE" && hasAvailableAttempts;
            break;
        }

        return {
          ...exam,
          totalQuestions: exam._count.questions,
          assignmentStatus: assignment.status,
          assignedAt: assignment.assignedAt,
          timeRemaining, // milliseconds remaining (SCHEDULED only)
          isAssigned: true,
          userAttempts: {
            total: userAttempts.length,
            completed: completedAttempts,
            available: isAvailable,
            lastAttempt: lastAttempt || null,
            hasPassed: hasPassingScore,
          },
        };
      })
    );

    // Process public exams
    const publicExamsWithData = await Promise.all(
      publicExams.map(async (exam) => {
        const userAttempts = await prisma.examAttempt.findMany({
          where: {
            examId: exam.id,
            userId: session.user.id,
          },
          select: {
            id: true,
            status: true,
            startedAt: true,
            finishedAt: true,
            percentage: true,
            passed: true,
          },
          orderBy: { startedAt: "desc" },
        });

        const lastAttempt = userAttempts[0];
        const completedAttempts = userAttempts.filter(
          (attempt) => attempt.status === "COMPLETED"
        ).length;
        const hasAvailableAttempts = completedAttempts < 3; // Max 3 attempts
        const hasPassingScore = userAttempts.some((attempt) => attempt.passed);

        return {
          ...exam,
          totalQuestions: exam._count.questions,
          isAssigned: false,
          userAttempts: {
            total: userAttempts.length,
            completed: completedAttempts,
            available: hasAvailableAttempts, // Always available for public exams
            lastAttempt: lastAttempt || null,
            hasPassed: hasPassingScore,
          },
        };
      })
    );

    // Combine all exams
    const allExams = [...assignedExamsWithData, ...publicExamsWithData];

    return NextResponse.json({
      exams: allExams,
      total: allExams.length,
      breakdown: {
        assigned: assignedExamsWithData.length,
        public: publicExamsWithData.length,
      },
    });
  } catch (error) {
    console.error("Error fetching exams:", error);
    return NextResponse.json(
      { error: "Failed to fetch exams" },
      { status: 500 }
    );
  }
}
