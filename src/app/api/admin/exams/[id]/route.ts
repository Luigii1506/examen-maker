import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/core/database/prisma";
import { ExamDifficulty, ExamStatus, QuestionStatus } from "@prisma/client";
import {
  EXAM_VALIDATION,
  EXAM_CATEGORIES,
} from "@/features/admin-exams/types/exam";

// ===========================================
// VALIDATION SCHEMAS
// ===========================================

const updateExamSchema = z.object({
  title: z
    .string()
    .min(EXAM_VALIDATION.TITLE.MIN_LENGTH, "Title is too short")
    .max(EXAM_VALIDATION.TITLE.MAX_LENGTH, "Title is too long")
    .optional(),
  description: z
    .string()
    .max(EXAM_VALIDATION.DESCRIPTION.MAX_LENGTH, "Description is too long")
    .optional(),
  duration: z
    .number()
    .min(
      EXAM_VALIDATION.DURATION.MIN_MINUTES,
      "Duration must be at least 15 minutes"
    )
    .max(EXAM_VALIDATION.DURATION.MAX_MINUTES, "Duration cannot exceed 8 hours")
    .optional(),
  category: z
    .string()
    .refine((val) => EXAM_CATEGORIES.includes(val as never), {
      message: "Invalid category",
    })
    .optional(),
  difficulty: z.nativeEnum(ExamDifficulty).optional(),
  passingScore: z
    .number()
    .min(
      EXAM_VALIDATION.PASSING_SCORE.MIN,
      "Passing score must be at least 50%"
    )
    .max(EXAM_VALIDATION.PASSING_SCORE.MAX, "Passing score cannot exceed 100%")
    .optional(),
  status: z.nativeEnum(ExamStatus).optional(),
  questionIds: z.array(z.string()).optional(),
});

// ===========================================
// GET - Get Exam by ID
// ===========================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const examId = params.id;

    if (!examId) {
      return NextResponse.json(
        { error: "Exam ID is required" },
        { status: 400 }
      );
    }

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: {
          where: { status: QuestionStatus.ACTIVE },
          orderBy: { order: "asc" },
          include: {
            options: {
              orderBy: { order: "asc" },
            },
          },
        },
        attempts: {
          select: {
            id: true,
            userId: true,
            status: true,
            startedAt: true,
            finishedAt: true,
            totalScore: true,
            earnedScore: true,
            percentage: true,
            passed: true,
          },
          where: {
            status: "COMPLETED",
          },
          orderBy: { finishedAt: "desc" },
        },
        _count: {
          select: {
            questions: {
              where: { status: QuestionStatus.ACTIVE },
            },
            attempts: {
              where: { status: "COMPLETED" },
            },
          },
        },
      },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    // Calculate statistics
    const attempts = exam.attempts.length;
    const passedAttempts = exam.attempts.filter((a) => a.passed).length;
    const passRate =
      attempts > 0 ? Math.round((passedAttempts / attempts) * 100) : 0;
    const averageScore =
      attempts > 0
        ? Math.round(
            (exam.attempts.reduce((sum, a) => sum + a.percentage, 0) /
              attempts) *
              10
          ) / 10
        : 0;
    const lastAttempt =
      exam.attempts.length > 0 ? exam.attempts[0]?.finishedAt : null;

    const examWithStats = {
      ...exam,
      attempts: attempts,
      passRate,
      averageScore,
      lastAttempt,
      totalQuestions: exam._count.questions,
    };

    return NextResponse.json(examWithStats);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch exam" },
      { status: 500 }
    );
  }
}

// ===========================================
// PUT - Update Exam
// ===========================================

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const examId = params.id;
    const body = await request.json();

    console.log("Received data:", body);

    if (!examId) {
      return NextResponse.json(
        { error: "Exam ID is required" },
        { status: 400 }
      );
    }

    const validatedData = updateExamSchema.parse(body);
    console.log("Validated data:", validatedData);

    // Check if exam exists
    const existingExam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: {
          where: { status: QuestionStatus.ACTIVE },
        },
        attempts: {
          where: { status: "COMPLETED" },
        },
      },
    });

    if (!existingExam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    // Check if exam has attempts and prevent certain changes
    if (existingExam.attempts.length > 0) {
      // If exam has attempts, prevent changing fundamental properties
      if (validatedData.questionIds && validatedData.questionIds.length > 0) {
        return NextResponse.json(
          {
            error: "Cannot modify questions of an exam that has been attempted",
          },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {};

    if (validatedData.title !== undefined)
      updateData.title = validatedData.title;
    if (validatedData.description !== undefined)
      updateData.description = validatedData.description;
    if (validatedData.duration !== undefined)
      updateData.duration = validatedData.duration;
    if (validatedData.category !== undefined)
      updateData.category = validatedData.category;
    if (validatedData.difficulty !== undefined)
      updateData.difficulty = validatedData.difficulty;
    if (validatedData.passingScore !== undefined)
      updateData.passingScore = validatedData.passingScore;
    if (validatedData.status !== undefined)
      updateData.status = validatedData.status;

    // Handle question assignment if provided and allowed
    let questionCount = existingExam.questions.length;
    if (validatedData.questionIds && validatedData.questionIds.length > 0) {
      // Verify all question IDs exist and are active
      const questions = await prisma.question.findMany({
        where: {
          id: { in: validatedData.questionIds },
          status: QuestionStatus.ACTIVE,
        },
      });

      if (questions.length !== validatedData.questionIds.length) {
        return NextResponse.json(
          { error: "Some questions were not found or are inactive" },
          { status: 400 }
        );
      }

      questionCount = questions.length;

      // Validate minimum questions requirement
      if (questionCount < EXAM_VALIDATION.QUESTIONS.MIN_COUNT) {
        return NextResponse.json(
          {
            error: `Exam must have at least ${EXAM_VALIDATION.QUESTIONS.MIN_COUNT} questions`,
          },
          { status: 400 }
        );
      }
    }

    updateData.totalQuestions = questionCount;

    // Update exam with transaction
    const updatedExam = await prisma.$transaction(async (tx) => {
      // Update the exam
      const exam = await tx.exam.update({
        where: { id: examId },
        data: updateData,
      });

      // Handle question reassignment if provided
      if (validatedData.questionIds && validatedData.questionIds.length > 0) {
        // Remove exam association from current questions
        await tx.question.updateMany({
          where: { examId: examId },
          data: { examId: null, order: null },
        });

        // Assign new questions to exam
        await tx.question.updateMany({
          where: {
            id: { in: validatedData.questionIds },
          },
          data: {
            examId: examId,
          },
        });

        // Update question orders
        for (let i = 0; i < validatedData.questionIds.length; i++) {
          await tx.question.update({
            where: { id: validatedData.questionIds[i] },
            data: { order: i + 1 },
          });
        }
      }

      return exam;
    });

    // Fetch complete updated exam
    const completeExam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: {
          where: { status: QuestionStatus.ACTIVE },
          orderBy: { order: "asc" },
        },
        _count: {
          select: {
            questions: {
              where: { status: QuestionStatus.ACTIVE },
            },
          },
        },
      },
    });

    return NextResponse.json(completeExam);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to update exam" },
      { status: 500 }
    );
  }
}

// ===========================================
// DELETE - Delete Exam
// ===========================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const examId = params.id;

    if (!examId) {
      return NextResponse.json(
        { error: "Exam ID is required" },
        { status: 400 }
      );
    }

    // Check if exam exists and has attempts
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        attempts: true,
        questions: true,
      },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    // If exam has attempts, perform soft delete (archive)
    if (exam.attempts.length > 0) {
      const archivedExam = await prisma.exam.update({
        where: { id: examId },
        data: { status: ExamStatus.ARCHIVED },
      });

      return NextResponse.json({
        message: "Exam archived successfully (has existing attempts)",
        exam: archivedExam,
      });
    }

    // If no attempts, perform hard delete with transaction
    await prisma.$transaction(async (tx) => {
      // Remove exam association from questions (don't delete questions)
      await tx.question.updateMany({
        where: { examId: examId },
        data: { examId: null, order: null },
      });

      // Delete the exam
      await tx.exam.delete({
        where: { id: examId },
      });
    });

    return NextResponse.json({
      message: "Exam deleted successfully",
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to delete exam" },
      { status: 500 }
    );
  }
}
