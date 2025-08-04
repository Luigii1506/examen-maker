"use client";

import { useState, useEffect } from "react";
import { Button, Card, Badge } from "@/core/components";
import {
  Save,
  X,
  Plus,
  Trash2,
  AlertCircle,
  FileText,
  HelpCircle,
} from "lucide-react";
import {
  QuestionType,
  CognitiveType,
  QuestionDifficulty,
  CreateQuestionInput,
  UpdateQuestionInput,
  Question,
  QUESTION_CATEGORIES,
  QUESTION_TYPE_LABELS,
  COGNITIVE_TYPE_LABELS,
  DIFFICULTY_LABELS,
} from "../types";

interface QuestionFormProps {
  question?: Question; // For editing
  onSave: (data: CreateQuestionInput | UpdateQuestionInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

interface FormData {
  text: string;
  type: QuestionType;
  cognitiveType: CognitiveType;
  category: string;
  difficulty: QuestionDifficulty;
  points: number;
  scenario: string;
  explanation: string;
  correctAnswer: string | boolean | Record<string, unknown>;
  options: Array<{
    id?: string;
    text: string;
    isCorrect: boolean;
    order: number;
  }>;
  // For matching questions
  leftColumn: string[];
  rightColumn: string[];
  correctMatches: Record<string, string>;
}

export default function QuestionForm({
  question,
  onSave,
  onCancel,
  isLoading = false,
}: QuestionFormProps) {
  const [formData, setFormData] = useState<FormData>({
    text: "",
    type: QuestionType.MULTIPLE_CHOICE,
    cognitiveType: CognitiveType.REMEMBER,
    category: QUESTION_CATEGORIES[0],
    difficulty: QuestionDifficulty.BASIC,
    points: 1,
    scenario: "",
    explanation: "",
    correctAnswer: "",
    options: [
      { text: "", isCorrect: false, order: 1 },
      { text: "", isCorrect: false, order: 2 },
    ],
    // For matching questions
    leftColumn: ["Item 1", "Item 2"],
    rightColumn: ["Match 1", "Match 2"],
    correctMatches: {},
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load existing question data
  useEffect(() => {
    if (question) {
      setFormData({
        text: question.text,
        type: question.type,
        cognitiveType: question.cognitiveType,
        category: question.category,
        difficulty: question.difficulty,
        points: question.points,
        scenario: question.scenario || "",
        explanation: question.explanation || "",
        correctAnswer: question.correctAnswer as string,
        options:
          question.options.length > 0
            ? question.options.map((opt) => ({
                id: opt.id,
                text: opt.text,
                isCorrect: opt.isCorrect,
                order: opt.order,
              }))
            : [
                { text: "", isCorrect: false, order: 1 },
                { text: "", isCorrect: false, order: 2 },
              ],
        // For matching questions
        leftColumn: question.leftColumn || ["", ""],
        rightColumn: question.rightColumn || ["", ""],
        correctMatches: question.correctMatches || {},
      });
    }
  }, [question]);

  // Reset options when question type changes
  useEffect(() => {
    if (formData.type === QuestionType.TRUE_FALSE) {
      setFormData((prev) => ({
        ...prev,
        options: [
          { text: "True", isCorrect: false, order: 1 },
          { text: "False", isCorrect: false, order: 2 },
        ],
        correctAnswer: false,
      }));
    } else if (
      formData.type === QuestionType.MULTIPLE_CHOICE &&
      formData.options.length < 2
    ) {
      setFormData((prev) => ({
        ...prev,
        options: [
          { text: "", isCorrect: false, order: 1 },
          { text: "", isCorrect: false, order: 2 },
        ],
      }));
    } else if (formData.type === QuestionType.MATCHING) {
      setFormData((prev) => ({
        ...prev,
        leftColumn: ["Item 1", "Item 2"],
        rightColumn: ["Match 1", "Match 2"],
        correctMatches: {},
        correctAnswer: {},
      }));
    }
  }, [formData.type]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.text.trim()) {
      newErrors.text = "Question text is required";
    } else if (formData.text.length < 10) {
      newErrors.text = "Question text must be at least 10 characters";
    }

    if (formData.points < 1 || formData.points > 10) {
      newErrors.points = "Points must be between 1 and 10";
    }

    // Validate based on question type
    switch (formData.type) {
      case QuestionType.MULTIPLE_CHOICE:
        if (formData.options.length < 2) {
          newErrors.options =
            "Multiple choice questions need at least 2 options";
        } else {
          const filledOptions = formData.options.filter((opt) =>
            opt.text.trim()
          );
          if (filledOptions.length < 2) {
            newErrors.options = "At least 2 options must have text";
          }

          const correctOptions = formData.options.filter(
            (opt) => opt.isCorrect && opt.text.trim()
          );
          if (correctOptions.length !== 1) {
            newErrors.options = "Exactly 1 option must be marked as correct";
          }
        }
        break;

      case QuestionType.TRUE_FALSE:
        if (typeof formData.correctAnswer !== "boolean") {
          newErrors.correctAnswer =
            "Please select True or False as the correct answer";
        }
        break;

      case QuestionType.MATCHING:
        const filledLeftItems = formData.leftColumn.filter((item) =>
          item.trim()
        );
        const filledRightItems = formData.rightColumn.filter((item) =>
          item.trim()
        );

        if (filledLeftItems.length < 2 || filledRightItems.length < 2) {
          newErrors.matching =
            "Matching questions need at least 2 items in each column";
        } else if (filledLeftItems.length !== filledRightItems.length) {
          newErrors.matching =
            "Left and right columns must have the same number of items";
        } else {
          // Check if all matches are defined
          const matchesCount = Object.keys(formData.correctMatches).length;
          if (matchesCount !== filledLeftItems.length) {
            newErrors.matching =
              "All items must be matched with their correct pairs";
          }
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const submitData: CreateQuestionInput | UpdateQuestionInput = {
        text: formData.text,
        type: formData.type,
        cognitiveType: formData.cognitiveType,
        category: formData.category,
        difficulty: formData.difficulty,
        points: formData.points,
        scenario: formData.scenario || undefined,
        explanation: formData.explanation || undefined,
        correctAnswer:
          formData.type === QuestionType.MATCHING
            ? formData.correctMatches
            : formData.correctAnswer,
        options:
          formData.type === QuestionType.SHORT_ANSWER ||
          formData.type === QuestionType.ESSAY ||
          formData.type === QuestionType.MATCHING
            ? undefined
            : formData.options.filter((opt) => opt.text.trim()),
        // For matching questions
        leftColumn:
          formData.type === QuestionType.MATCHING
            ? formData.leftColumn.filter((item) => item.trim())
            : undefined,
        rightColumn:
          formData.type === QuestionType.MATCHING
            ? formData.rightColumn.filter((item) => item.trim())
            : undefined,
        correctMatches:
          formData.type === QuestionType.MATCHING
            ? formData.correctMatches
            : undefined,
      };

      console.log("Form data before submit:", formData);
      console.log("Submit data:", submitData);

      await onSave(submitData);
    } catch (error) {
      console.error("Error saving question:", error);
    }
  };

  const addOption = () => {
    setFormData((prev) => ({
      ...prev,
      options: [
        ...prev.options,
        { text: "", isCorrect: false, order: prev.options.length + 1 },
      ],
    }));
  };

  const removeOption = (index: number) => {
    if (formData.options.length <= 2) return; // Keep minimum 2 options

    setFormData((prev) => ({
      ...prev,
      options: prev.options
        .filter((_, i) => i !== index)
        .map((opt, i) => ({
          ...opt,
          order: i + 1,
        })),
    }));
  };

  const updateOption = (
    index: number,
    field: "text" | "isCorrect",
    value: string | boolean
  ) => {
    setFormData((prev) => {
      const newOptions = [...prev.options];
      newOptions[index] = { ...newOptions[index], [field]: value };

      // For multiple choice, ensure only one correct answer
      if (
        field === "isCorrect" &&
        value === true &&
        formData.type === QuestionType.MULTIPLE_CHOICE
      ) {
        newOptions.forEach((opt, i) => {
          if (i !== index) opt.isCorrect = false;
        });
      }

      return { ...prev, options: newOptions };
    });
  };

  // Functions for matching questions
  const addMatchingItem = (column: "left" | "right") => {
    setFormData((prev) => ({
      ...prev,
      [column === "left" ? "leftColumn" : "rightColumn"]: [
        ...prev[column === "left" ? "leftColumn" : "rightColumn"],
        "",
      ],
    }));
  };

  const removeMatchingItem = (column: "left" | "right", index: number) => {
    setFormData((prev) => {
      const columnKey = column === "left" ? "leftColumn" : "rightColumn";
      const items = [...prev[columnKey]];

      if (items.length <= 2) return prev; // Keep minimum 2 items

      const removedItem = items[index];
      items.splice(index, 1);

      // If removing from left column, also remove its match
      const newMatches = { ...prev.correctMatches };
      if (column === "left" && removedItem) {
        delete newMatches[removedItem];
      }

      return {
        ...prev,
        [columnKey]: items,
        correctMatches: newMatches,
      };
    });
  };

  const updateMatchingItem = (
    column: "left" | "right",
    index: number,
    value: string
  ) => {
    setFormData((prev) => {
      const columnKey = column === "left" ? "leftColumn" : "rightColumn";
      const items = [...prev[columnKey]];
      const oldValue = items[index];
      items[index] = value;

      // If updating left column, update the correct matches key
      const newMatches = { ...prev.correctMatches };
      if (column === "left" && oldValue && oldValue !== value) {
        const matchValue = newMatches[oldValue];
        delete newMatches[oldValue];
        if (value.trim() && matchValue) {
          newMatches[value] = matchValue;
        }
      }

      return {
        ...prev,
        [columnKey]: items,
        correctMatches: newMatches,
      };
    });
  };

  const updateCorrectMatch = (leftItem: string, rightItem: string) => {
    setFormData((prev) => ({
      ...prev,
      correctMatches: {
        ...prev.correctMatches,
        [leftItem]: rightItem,
      },
    }));
  };

  const renderQuestionTypeSpecificFields = () => {
    switch (formData.type) {
      case QuestionType.MULTIPLE_CHOICE:
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700">
                Options
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
                disabled={formData.options.length >= 6}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Option
              </Button>
            </div>
            {errors.options && (
              <p className="text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.options}
              </p>
            )}

            <div className="space-y-3">
              {formData.options.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg"
                >
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={option.isCorrect}
                    onChange={(e) =>
                      updateOption(index, "isCorrect", e.target.checked)
                    }
                    className="h-4 w-4 text-blue-600"
                  />
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) =>
                      updateOption(index, "text", e.target.value)
                    }
                    placeholder={`Option ${index + 1}`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {formData.options.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case QuestionType.TRUE_FALSE:
        return (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Correct Answer
            </label>
            {errors.correctAnswer && (
              <p className="text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.correctAnswer}
              </p>
            )}

            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="true-option"
                  name="trueFalseAnswer"
                  checked={formData.correctAnswer === true}
                  onChange={() =>
                    setFormData((prev) => ({ ...prev, correctAnswer: true }))
                  }
                  className="h-4 w-4 text-blue-600"
                />
                <label
                  htmlFor="true-option"
                  className="text-sm font-medium text-gray-700"
                >
                  True
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="false-option"
                  name="trueFalseAnswer"
                  checked={formData.correctAnswer === false}
                  onChange={() =>
                    setFormData((prev) => ({ ...prev, correctAnswer: false }))
                  }
                  className="h-4 w-4 text-blue-600"
                />
                <label
                  htmlFor="false-option"
                  className="text-sm font-medium text-gray-700"
                >
                  False
                </label>
              </div>
            </div>
          </div>
        );

      case QuestionType.MATCHING:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Matching Items
              </label>
              {errors.matching && (
                <p className="text-sm text-red-600 flex items-center mb-4">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.matching}
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium text-gray-700">
                      Left Column
                    </h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addMatchingItem("left")}
                      disabled={formData.leftColumn.length >= 8}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Item
                    </Button>
                  </div>

                  {formData.leftColumn.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) =>
                          updateMatchingItem("left", index, e.target.value)
                        }
                        placeholder={`Left item ${index + 1}`}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {formData.leftColumn.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMatchingItem("left", index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Right Column */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium text-gray-700">
                      Right Column
                    </h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addMatchingItem("right")}
                      disabled={formData.rightColumn.length >= 8}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Item
                    </Button>
                  </div>

                  {formData.rightColumn.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) =>
                          updateMatchingItem("right", index, e.target.value)
                        }
                        placeholder={`Right item ${index + 1}`}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {formData.rightColumn.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMatchingItem("right", index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Correct Matches */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">
                Correct Matches
              </h4>
              <p className="text-xs text-gray-500">
                Define which left item matches with which right item.
              </p>

              <div className="space-y-3">
                {formData.leftColumn
                  .filter((item) => item.trim())
                  .map((leftItem, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-1/3 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm">
                        {leftItem || `Left item ${index + 1}`}
                      </div>
                      <span className="text-gray-400">→</span>
                      <select
                        value={formData.correctMatches[leftItem] || ""}
                        onChange={(e) =>
                          updateCorrectMatch(leftItem, e.target.value)
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select matching item...</option>
                        {formData.rightColumn
                          .filter((item) => item.trim())
                          .map((rightItem, rightIndex) => (
                            <option key={rightIndex} value={rightItem}>
                              {rightItem}
                            </option>
                          ))}
                      </select>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        );

      case QuestionType.SHORT_ANSWER:
      case QuestionType.ESSAY:
        return (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Sample Answer / Keywords
            </label>
            <textarea
              value={formData.correctAnswer as string}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  correctAnswer: e.target.value,
                }))
              }
              placeholder="Enter sample answer or keywords for grading reference..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
    >
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center border-b pb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {question ? "Edit Question" : "Create New Question"}
            </h2>
            <Button type="button" variant="ghost" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      type: e.target.value as QuestionType,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Object.values(QuestionType).map((type) => (
                    <option key={type} value={type}>
                      {QUESTION_TYPE_LABELS[type]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cognitive Level
                </label>
                <select
                  value={formData.cognitiveType}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      cognitiveType: e.target.value as CognitiveType,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Object.values(CognitiveType).map((type) => (
                    <option key={type} value={type}>
                      {COGNITIVE_TYPE_LABELS[type]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {QUESTION_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      difficulty: e.target.value as QuestionDifficulty,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Object.values(QuestionDifficulty).map((difficulty) => (
                    <option key={difficulty} value={difficulty}>
                      {DIFFICULTY_LABELS[difficulty]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Points
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.points}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      points: parseInt(e.target.value) || 1,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.points && (
                  <p className="text-sm text-red-600 mt-1">{errors.points}</p>
                )}
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <HelpCircle className="h-4 w-4" />
                <span>
                  Points determine the weight of this question in the exam
                </span>
              </div>
            </div>
          </div>

          {/* Question Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question Text *
            </label>
            <textarea
              value={formData.text}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, text: e.target.value }))
              }
              placeholder="Enter the question text..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
            />
            {errors.text && (
              <p className="text-sm text-red-600 mt-1 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.text}
              </p>
            )}
          </div>

          {/* Scenario (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Scenario (Optional)
            </label>
            <textarea
              value={formData.scenario}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, scenario: e.target.value }))
              }
              placeholder="Enter a scenario or context for the question..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>

          {/* Question Type Specific Fields */}
          {renderQuestionTypeSpecificFields()}

          {/* Explanation (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Explanation (Optional)
            </label>
            <textarea
              value={formData.explanation}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  explanation: e.target.value,
                }))
              }
              placeholder="Explain why this is the correct answer..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading
                ? "Saving..."
                : question
                ? "Update Question"
                : "Create Question"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
