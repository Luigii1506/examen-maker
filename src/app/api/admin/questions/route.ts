import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/core/database/prisma";
import { z } from "zod";

// Validation schemas
const createQuestionSchema = z.object({
  text: z.string().min(10, "Question text must be at least 10 characters"),
  type: z.enum(["MULTIPLE_CHOICE", "TRUE_FALSE", "MATCHING"]),
  cognitiveType: z.enum([
    "REMEMBER",
    "UNDERSTAND",
    "APPLY",
    "ANALYZE",
    "EVALUATE",
    "CREATE",
  ]),
  category: z.string().min(1, "Category is required"),
  difficulty: z.enum(["BASIC", "INTERMEDIATE", "ADVANCED"]),
  points: z
    .number()
    .min(1, "Points must be at least 1")
    .max(10, "Points cannot exceed 10"),
  scenario: z.string().optional(),
  explanation: z.string().optional(),
  correctAnswer: z.any(), // Will be validated based on question type
  options: z
    .array(
      z.object({
        text: z.string().min(1, "Option text is required"),
        isCorrect: z.boolean(),
        order: z.number(),
      })
    )
    .optional(),
  // For matching questions
  leftColumn: z.array(z.string()).optional(),
  rightColumn: z.array(z.string()).optional(),
  correctMatches: z.record(z.string(), z.string()).optional(),
  examId: z.string().optional(),
});

const updateQuestionSchema = createQuestionSchema.partial();

// GET /api/admin/questions - Get all questions with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const difficulty = searchParams.get("difficulty") || "";
    const type = searchParams.get("type") || "";
    const status = searchParams.get("status") || "ACTIVE";

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {
      status: status || "ACTIVE",
    };

    if (search) {
      where.OR = [
        { text: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (type) {
      where.type = type;
    }

    // Get questions with pagination
    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        include: {
          options: {
            orderBy: { order: "asc" },
          },
          exam: {
            select: { id: true, title: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.question.count({ where }),
    ]);

    // Get statistics
    const stats = await prisma.question.aggregate({
      where: { status: "ACTIVE" },
      _count: { id: true },
      _avg: { points: true },
    });

    const categoryCount = await prisma.question.groupBy({
      by: ["category"],
      where: { status: "ACTIVE" },
      _count: { id: true },
    });

    return NextResponse.json({
      questions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        total: stats._count.id || 0,
        averagePoints: Math.round(stats._avg.points || 0),
        categories: categoryCount.length,
      },
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}

// POST /api/admin/questions - Create new question
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Received data:", body);

    const validatedData = createQuestionSchema.parse(body);
    console.log("Validated data:", validatedData);

    // Validate correctAnswer based on question type
    let correctAnswer: string | boolean | Record<string, unknown>;
    let options: Array<{
      text: string;
      isCorrect: boolean;
      order: number;
    }> = [];

    switch (validatedData.type) {
      case "MULTIPLE_CHOICE":
        if (!validatedData.options || validatedData.options.length < 2) {
          return NextResponse.json(
            { error: "Multiple choice questions need at least 2 options" },
            { status: 400 }
          );
        }
        const correctOptions = validatedData.options.filter(
          (opt) => opt.isCorrect
        );
        if (correctOptions.length !== 1) {
          return NextResponse.json(
            {
              error: "Multiple choice questions need exactly 1 correct option",
            },
            { status: 400 }
          );
        }
        correctAnswer = correctOptions[0].text;
        options = validatedData.options;
        break;

      case "TRUE_FALSE":
        if (
          !["true", "false"].includes(
            String(validatedData.correctAnswer).toLowerCase()
          )
        ) {
          return NextResponse.json(
            {
              error:
                "True/False questions need 'true' or 'false' as correct answer",
            },
            { status: 400 }
          );
        }
        correctAnswer =
          String(validatedData.correctAnswer).toLowerCase() === "true";
        options = [
          { text: "True", isCorrect: correctAnswer === true, order: 1 },
          { text: "False", isCorrect: correctAnswer === false, order: 2 },
        ];
        break;

      case "MATCHING":
        // For matching questions, validate left/right columns and correctMatches
        if (
          !validatedData.leftColumn ||
          !validatedData.rightColumn ||
          !validatedData.correctMatches
        ) {
          return NextResponse.json(
            {
              error:
                "Matching questions need leftColumn, rightColumn, and correctMatches",
            },
            { status: 400 }
          );
        }
        if (
          validatedData.leftColumn.length < 2 ||
          validatedData.rightColumn.length < 2
        ) {
          return NextResponse.json(
            {
              error: "Matching questions need at least 2 items in each column",
            },
            { status: 400 }
          );
        }
        if (
          validatedData.leftColumn.length !== validatedData.rightColumn.length
        ) {
          return NextResponse.json(
            {
              error:
                "Left and right columns must have the same number of items",
            },
            { status: 400 }
          );
        }
        correctAnswer = validatedData.correctMatches;
        options = [];
        break;

      default:
        correctAnswer = validatedData.correctAnswer;
    }

    // Create question in transaction
    const question = await prisma.$transaction(async (tx) => {
      // Create the question
      const newQuestion = await tx.question.create({
        data: {
          text: validatedData.text,
          type: validatedData.type,
          cognitiveType: validatedData.cognitiveType,
          category: validatedData.category,
          difficulty: validatedData.difficulty,
          points: validatedData.points,
          scenario: validatedData.scenario,
          explanation: validatedData.explanation,
          correctAnswer: correctAnswer,
          leftColumn: validatedData.leftColumn || undefined,
          rightColumn: validatedData.rightColumn || undefined,
          correctMatches: validatedData.correctMatches || undefined,
          examId: validatedData.examId || null,
        },
      });

      // Create options if any
      if (options.length > 0) {
        await tx.questionOption.createMany({
          data: options.map((option, index) => ({
            questionId: newQuestion.id,
            text: option.text,
            isCorrect: option.isCorrect,
            order: option.order || index + 1,
          })),
        });
      }

      // Return question with options
      return await tx.question.findUnique({
        where: { id: newQuestion.id },
        include: {
          options: {
            orderBy: { order: "asc" },
          },
        },
      });
    });

    return NextResponse.json({ question }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error creating question:", error);
    return NextResponse.json(
      { error: "Failed to create question" },
      { status: 500 }
    );
  }
}
