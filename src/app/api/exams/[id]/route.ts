import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/core/database/prisma";
import { auth } from "@/core/auth/auth";
import { ExamStatus, QuestionStatus } from "@prisma/client";

// ===========================================
// GET - Get Exam by ID with Questions for Users
// ===========================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const examId = params.id;

    if (!examId) {
      return NextResponse.json(
        { error: "Exam ID is required" },
        { status: 400 }
      );
    }

    // Get exam with questions
    const exam = await prisma.exam.findUnique({
      where: {
        id: examId,
        status: ExamStatus.ACTIVE, // Only active exams for users
      },
      include: {
        questions: {
          where: { status: QuestionStatus.ACTIVE },
          orderBy: { order: "asc" },
          include: {
            options: {
              orderBy: { order: "asc" },
              select: {
                id: true,
                text: true,
                order: true,
                // Don't include isCorrect for security
              },
            },
          },
          select: {
            id: true,
            text: true,
            type: true,
            cognitiveType: true,
            category: true,
            difficulty: true,
            points: true,
            order: true,
            scenario: true,
            options: true,
            // Don't include correctAnswer, explanation for security
          },
        },
      },
    });

    if (!exam) {
      return NextResponse.json(
        { error: "Exam not found or not available" },
        { status: 404 }
      );
    }

    // Check if user has available attempts
    const userAttempts = await prisma.examAttempt.findMany({
      where: {
        examId: examId,
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

    const completedAttempts = userAttempts.filter(
      (attempt) => attempt.status === "COMPLETED"
    ).length;
    const inProgressAttempt = userAttempts.find(
      (attempt) => attempt.status === "IN_PROGRESS"
    );
    const hasAvailableAttempts = completedAttempts < 3; // Max 3 attempts
    const hasPassingScore = userAttempts.some((attempt) => attempt.passed);

    // If user has no available attempts and hasn't passed, deny access
    if (!hasAvailableAttempts && !hasPassingScore && !inProgressAttempt) {
      return NextResponse.json(
        { error: "No available attempts remaining" },
        { status: 403 }
      );
    }

    // Prepare exam data for user
    const examData = {
      id: exam.id,
      title: exam.title,
      description: exam.description,
      duration: exam.duration,
      category: exam.category,
      difficulty: exam.difficulty,
      totalQuestions: exam.totalQuestions,
      passingScore: exam.passingScore,
      questions: exam.questions,
      userAttempts: {
        total: userAttempts.length,
        completed: completedAttempts,
        available: hasAvailableAttempts,
        hasPassed: hasPassingScore,
        inProgress: inProgressAttempt || null,
      },
    };

    return NextResponse.json({ exam: examData });
  } catch (error) {
    console.error("Error fetching exam:", error);
    return NextResponse.json(
      { error: "Failed to fetch exam" },
      { status: 500 }
    );
  }
}
