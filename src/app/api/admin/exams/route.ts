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

const createExamSchema = z.object({
  title: z
    .string()
    .min(EXAM_VALIDATION.TITLE.MIN_LENGTH, "Title is too short")
    .max(EXAM_VALIDATION.TITLE.MAX_LENGTH, "Title is too long"),
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
    .max(
      EXAM_VALIDATION.DURATION.MAX_MINUTES,
      "Duration cannot exceed 8 hours"
    ),
  category: z.string().refine((val) => EXAM_CATEGORIES.includes(val as never), {
    message: "Invalid category",
  }),
  difficulty: z.nativeEnum(ExamDifficulty),
  passingScore: z
    .number()
    .min(
      EXAM_VALIDATION.PASSING_SCORE.MIN,
      "Passing score must be at least 50%"
    )
    .max(EXAM_VALIDATION.PASSING_SCORE.MAX, "Passing score cannot exceed 100%"),
  questionIds: z.array(z.string()).optional(),
});

const examFiltersSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  difficulty: z.nativeEnum(ExamDifficulty).optional(),
  status: z.nativeEnum(ExamStatus).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

// ===========================================
// GET - List Exams with Filters & Stats
// ===========================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    console.log("Received params:", params);

    const filters = examFiltersSchema.parse(params);

    // Build where clause
    const where: Record<string, unknown> = {};

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
        { category: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.difficulty) {
      where.difficulty = filters.difficulty;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    // Get total count for pagination
    const total = await prisma.exam.count({ where });
    const totalPages = Math.ceil(total / filters.limit);
    const offset = (filters.page - 1) * filters.limit;

    // Fetch exams with relationships and statistics
    const exams = await prisma.exam.findMany({
      where,
      include: {
        questions: {
          where: { status: QuestionStatus.ACTIVE },
          select: { id: true, points: true },
        },
        attempts: {
          select: {
            id: true,
            passed: true,
            percentage: true,
            finishedAt: true,
          },
          where: {
            status: "COMPLETED",
          },
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
      orderBy: [{ updatedAt: "desc" }],
      take: filters.limit,
      skip: offset,
    });

    // Calculate statistics for each exam
    const examsWithStats = exams.map((exam) => {
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
        exam.attempts.length > 0
          ? exam.attempts.reduce(
              (latest, attempt) =>
                !latest || (attempt.finishedAt && attempt.finishedAt > latest)
                  ? attempt.finishedAt
                  : latest,
              null as Date | null
            )
          : null;

      return {
        id: exam.id,
        title: exam.title,
        description: exam.description,
        duration: exam.duration,
        category: exam.category,
        difficulty: exam.difficulty,
        totalQuestions: exam._count.questions,
        passingScore: exam.passingScore,
        status: exam.status,
        createdAt: exam.createdAt,
        updatedAt: exam.updatedAt,
        createdBy: exam.createdBy,

        // Statistics
        attempts,
        passRate,
        averageScore,
        lastAttempt,
      };
    });

    // Calculate overall statistics
    const allExams = await prisma.exam.findMany({
      include: {
        attempts: {
          where: { status: "COMPLETED" },
          select: { passed: true },
        },
      },
    });

    const totalAttempts = allExams.reduce(
      (sum, exam) => sum + exam.attempts.length,
      0
    );
    const passedAttempts = allExams.reduce(
      (sum, exam) => sum + exam.attempts.filter((a) => a.passed).length,
      0
    );
    const averagePassRate =
      totalAttempts > 0
        ? Math.round((passedAttempts / totalAttempts) * 100)
        : 0;

    const stats = {
      total: allExams.length,
      active: allExams.filter((e) => e.status === ExamStatus.ACTIVE).length,
      draft: allExams.filter((e) => e.status === ExamStatus.DRAFT).length,
      archived: allExams.filter((e) => e.status === ExamStatus.ARCHIVED).length,
      totalAttempts,
      averagePassRate,
    };

    const response = {
      exams: examsWithStats,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages,
      },
      stats,
    };

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch exams" },
      { status: 500 }
    );
  }
}

// ===========================================
// POST - Create New Exam
// ===========================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Received data:", body);

    const validatedData = createExamSchema.parse(body);
    console.log("Validated data:", validatedData);

    // Check if we have questions to assign
    let questionCount = 0;
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

    // Create exam with transaction to ensure data consistency
    const exam = await prisma.$transaction(async (tx) => {
      // Create the exam
      const newExam = await tx.exam.create({
        data: {
          title: validatedData.title,
          description: validatedData.description,
          duration: validatedData.duration,
          category: validatedData.category,
          difficulty: validatedData.difficulty,
          totalQuestions: questionCount,
          passingScore: validatedData.passingScore,
          status: ExamStatus.DRAFT, // New exams start as draft
          createdBy: "system", // TODO: Get from authenticated user
        },
      });

      // Assign questions to exam if provided
      if (validatedData.questionIds && validatedData.questionIds.length > 0) {
        await tx.question.updateMany({
          where: {
            id: { in: validatedData.questionIds },
          },
          data: {
            examId: newExam.id,
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

      return newExam;
    });

    // Fetch the complete exam with questions
    const completeExam = await prisma.exam.findUnique({
      where: { id: exam.id },
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

    return NextResponse.json(completeExam, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to create exam" },
      { status: 500 }
    );
  }
}
