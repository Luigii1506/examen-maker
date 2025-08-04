import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/core/database/prisma";
import {
  QuestionType,
  CognitiveType,
  QuestionDifficulty,
  QuestionStatus,
} from "@prisma/client";
import { QUESTION_CATEGORIES } from "@/features/admin-exams/types/question";

// ===========================================
// VALIDATION SCHEMAS
// ===========================================

const questionFiltersSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  type: z.nativeEnum(QuestionType).optional(),
  difficulty: z.nativeEnum(QuestionDifficulty).optional(),
  cognitiveType: z.nativeEnum(CognitiveType).optional(),
  status: z.nativeEnum(QuestionStatus).optional(),
  excludeExamId: z.string().optional(), // Exclude questions already in this exam
  unassignedOnly: z.coerce.boolean().default(false), // Only questions not assigned to any exam
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

// ===========================================
// GET - List Available Questions for Exam Assignment
// ===========================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    console.log("Received params:", params);

    const filters = questionFiltersSchema.parse(params);

    // Build where clause
    const where: Record<string, unknown> = {
      status: filters.status || QuestionStatus.ACTIVE,
    };

    if (filters.search) {
      where.OR = [
        { text: { contains: filters.search, mode: "insensitive" } },
        { category: { contains: filters.search, mode: "insensitive" } },
        { scenario: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.difficulty) {
      where.difficulty = filters.difficulty;
    }

    if (filters.cognitiveType) {
      where.cognitiveType = filters.cognitiveType;
    }

    // Filter questions not assigned to any exam OR not assigned to specific exam
    if (filters.unassignedOnly) {
      where.examId = null;
    } else if (filters.excludeExamId) {
      where.OR = [{ examId: null }, { examId: { not: filters.excludeExamId } }];
    }

    // Get total count for pagination
    const total = await prisma.question.count({ where });
    const totalPages = Math.ceil(total / filters.limit);
    const offset = (filters.page - 1) * filters.limit;

    // Fetch questions with options
    const questions = await prisma.question.findMany({
      where,
      include: {
        options: {
          orderBy: { order: "asc" },
        },
        exam: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
      orderBy: [{ updatedAt: "desc" }],
      take: filters.limit,
      skip: offset,
    });

    // Calculate statistics
    const allQuestions = await prisma.question.findMany({
      where: { status: QuestionStatus.ACTIVE },
      select: {
        type: true,
        difficulty: true,
        cognitiveType: true,
      },
    });

    const stats = {
      total: allQuestions.length,
      byType: {
        [QuestionType.MULTIPLE_CHOICE]: allQuestions.filter(
          (q) => q.type === QuestionType.MULTIPLE_CHOICE
        ).length,
        [QuestionType.TRUE_FALSE]: allQuestions.filter(
          (q) => q.type === QuestionType.TRUE_FALSE
        ).length,
        [QuestionType.MATCHING]: allQuestions.filter(
          (q) => q.type === QuestionType.MATCHING
        ).length,
      },
      byDifficulty: {
        [QuestionDifficulty.BASIC]: allQuestions.filter(
          (q) => q.difficulty === QuestionDifficulty.BASIC
        ).length,
        [QuestionDifficulty.INTERMEDIATE]: allQuestions.filter(
          (q) => q.difficulty === QuestionDifficulty.INTERMEDIATE
        ).length,
        [QuestionDifficulty.ADVANCED]: allQuestions.filter(
          (q) => q.difficulty === QuestionDifficulty.ADVANCED
        ).length,
      },
      byCognitiveType: {
        [CognitiveType.REMEMBER]: allQuestions.filter(
          (q) => q.cognitiveType === CognitiveType.REMEMBER
        ).length,
        [CognitiveType.UNDERSTAND]: allQuestions.filter(
          (q) => q.cognitiveType === CognitiveType.UNDERSTAND
        ).length,
        [CognitiveType.APPLY]: allQuestions.filter(
          (q) => q.cognitiveType === CognitiveType.APPLY
        ).length,
        [CognitiveType.ANALYZE]: allQuestions.filter(
          (q) => q.cognitiveType === CognitiveType.ANALYZE
        ).length,
        [CognitiveType.EVALUATE]: allQuestions.filter(
          (q) => q.cognitiveType === CognitiveType.EVALUATE
        ).length,
        [CognitiveType.CREATE]: allQuestions.filter(
          (q) => q.cognitiveType === CognitiveType.CREATE
        ).length,
      },
    };

    const response = {
      questions,
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
      { error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}
