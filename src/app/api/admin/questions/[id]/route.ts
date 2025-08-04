import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/core/database/prisma";
import { z } from "zod";

// Validation schema for updates
const updateQuestionSchema = z.object({
  text: z.string().min(10).optional(),
  type: z.enum(["MULTIPLE_CHOICE", "TRUE_FALSE", "MATCHING"]).optional(),
  cognitiveType: z
    .enum(["REMEMBER", "UNDERSTAND", "APPLY", "ANALYZE", "EVALUATE", "CREATE"])
    .optional(),
  category: z.string().min(1).optional(),
  difficulty: z.enum(["BASIC", "INTERMEDIATE", "ADVANCED"]).optional(),
  points: z.number().min(1).max(10).optional(),
  scenario: z.string().optional(),
  explanation: z.string().optional(),
  correctAnswer: z.any().optional(),
  options: z
    .array(
      z.object({
        id: z.string().optional(),
        text: z.string().min(1),
        isCorrect: z.boolean(),
        order: z.number(),
      })
    )
    .optional(),
  // For matching questions
  leftColumn: z.array(z.string()).optional(),
  rightColumn: z.array(z.string()).optional(),
  correctMatches: z.record(z.string(), z.string()).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED", "UNDER_REVIEW"]).optional(),
  examId: z.string().optional(),
});

interface RouteParams {
  params: { id: string };
}

// GET /api/admin/questions/[id] - Get single question
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const question = await prisma.question.findUnique({
      where: { id: params.id },
      include: {
        options: {
          orderBy: { order: "asc" },
        },
        exam: {
          select: { id: true, title: true },
        },
      },
    });

    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ question });
  } catch (error) {
    console.error("Error fetching question:", error);
    return NextResponse.json(
      { error: "Failed to fetch question" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/questions/[id] - Update question
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json();
    const validatedData = updateQuestionSchema.parse(body);

    // Check if question exists
    const existingQuestion = await prisma.question.findUnique({
      where: { id: params.id },
      include: { options: true },
    });

    if (!existingQuestion) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    // Prepare data for update
    let correctAnswer: string | boolean | Record<string, unknown> | undefined;
    let optionsToUpdate:
      | Array<{
          id?: string;
          text: string;
          isCorrect: boolean;
          order: number;
        }>
      | undefined;

    // Validate correctAnswer and options based on question type if type is being updated
    if (
      validatedData.type ||
      validatedData.options ||
      validatedData.correctAnswer !== undefined
    ) {
      const questionType = validatedData.type || existingQuestion.type;

      switch (questionType) {
        case "MULTIPLE_CHOICE":
          if (validatedData.options) {
            if (validatedData.options.length < 2) {
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
                  error:
                    "Multiple choice questions need exactly 1 correct option",
                },
                { status: 400 }
              );
            }
            correctAnswer = correctOptions[0].text;
            optionsToUpdate = validatedData.options;
          }
          break;

        case "TRUE_FALSE":
          if (validatedData.correctAnswer !== undefined) {
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
            optionsToUpdate = [
              { text: "True", isCorrect: correctAnswer === true, order: 1 },
              { text: "False", isCorrect: correctAnswer === false, order: 2 },
            ];
          }
          break;

        case "MATCHING":
          // For matching questions, validate left/right columns and correctMatches if provided
          if (
            validatedData.leftColumn ||
            validatedData.rightColumn ||
            validatedData.correctMatches
          ) {
            if (validatedData.leftColumn && validatedData.rightColumn) {
              if (
                validatedData.leftColumn.length < 2 ||
                validatedData.rightColumn.length < 2
              ) {
                return NextResponse.json(
                  {
                    error:
                      "Matching questions need at least 2 items in each column",
                  },
                  { status: 400 }
                );
              }
              if (
                validatedData.leftColumn.length !==
                validatedData.rightColumn.length
              ) {
                return NextResponse.json(
                  {
                    error:
                      "Left and right columns must have the same number of items",
                  },
                  { status: 400 }
                );
              }
            }
            if (validatedData.correctMatches) {
              correctAnswer = validatedData.correctMatches;
            }
            optionsToUpdate = [];
          }
          break;

        default:
          correctAnswer = validatedData.correctAnswer;
      }
    }

    // Update question in transaction
    const updatedQuestion = await prisma.$transaction(async (tx) => {
      // Build update data object
      const updateData = {} as Record<string, unknown>;

      if (validatedData.text) updateData.text = validatedData.text;
      if (validatedData.type) updateData.type = validatedData.type;
      if (validatedData.cognitiveType)
        updateData.cognitiveType = validatedData.cognitiveType;
      if (validatedData.category) updateData.category = validatedData.category;
      if (validatedData.difficulty)
        updateData.difficulty = validatedData.difficulty;
      if (validatedData.points) updateData.points = validatedData.points;
      if (validatedData.scenario !== undefined)
        updateData.scenario = validatedData.scenario;
      if (validatedData.explanation !== undefined)
        updateData.explanation = validatedData.explanation;
      if (correctAnswer !== undefined) updateData.correctAnswer = correctAnswer;
      if (validatedData.status) updateData.status = validatedData.status;
      if (validatedData.examId !== undefined)
        updateData.examId = validatedData.examId;
      // For matching questions
      if (validatedData.leftColumn !== undefined)
        updateData.leftColumn = validatedData.leftColumn;
      if (validatedData.rightColumn !== undefined)
        updateData.rightColumn = validatedData.rightColumn;
      if (validatedData.correctMatches !== undefined)
        updateData.correctMatches = validatedData.correctMatches;

      // Update the question
      const question = await tx.question.update({
        where: { id: params.id },
        data: updateData,
      });

      // Update options if provided
      if (optionsToUpdate) {
        // Delete existing options
        await tx.questionOption.deleteMany({
          where: { questionId: params.id },
        });

        // Create new options
        if (optionsToUpdate.length > 0) {
          await tx.questionOption.createMany({
            data: optionsToUpdate.map((option, index) => ({
              questionId: params.id,
              text: option.text,
              isCorrect: option.isCorrect,
              order: option.order || index + 1,
            })),
          });
        }
      }

      // Return updated question with options
      return await tx.question.findUnique({
        where: { id: params.id },
        include: {
          options: {
            orderBy: { order: "asc" },
          },
          exam: {
            select: { id: true, title: true },
          },
        },
      });
    });

    return NextResponse.json({ question: updatedQuestion });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error updating question:", error);
    return NextResponse.json(
      { error: "Failed to update question" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/questions/[id] - Delete question
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Check if question exists
    const existingQuestion = await prisma.question.findUnique({
      where: { id: params.id },
      include: {
        attempts: true,
      },
    });

    if (!existingQuestion) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    // Check if question has been used in attempts (soft delete)
    if (existingQuestion.attempts.length > 0) {
      // Soft delete - just change status
      const updatedQuestion = await prisma.question.update({
        where: { id: params.id },
        data: { status: "ARCHIVED" },
      });

      return NextResponse.json({
        message: "Question archived (has been used in exams)",
        question: updatedQuestion,
      });
    } else {
      // Hard delete if no attempts
      await prisma.$transaction(async (tx) => {
        // Delete options first
        await tx.questionOption.deleteMany({
          where: { questionId: params.id },
        });

        // Delete question
        await tx.question.delete({
          where: { id: params.id },
        });
      });

      return NextResponse.json({
        message: "Question deleted successfully",
      });
    }
  } catch (error) {
    console.error("Error deleting question:", error);
    return NextResponse.json(
      { error: "Failed to delete question" },
      { status: 500 }
    );
  }
}
