"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Modal,
  Input,
  Select,
  TextArea,
  FormField,
  Badge,
  Card,
} from "@/core/components";
import {
  Save,
  X,
  Plus,
  Trash2,
  AlertCircle,
  FileText,
  HelpCircle,
  Shuffle,
  ArrowRight,
} from "lucide-react";
import {
  QuestionType,
  CognitiveType,
  QuestionDifficulty,
  QuestionStatus,
  CreateQuestionInput,
  UpdateQuestionInput,
  Question,
  QUESTION_CATEGORIES,
  QUESTION_TYPE_LABELS,
  COGNITIVE_TYPE_LABELS,
  DIFFICULTY_LABELS,
  STATUS_LABELS,
} from "../types";
import { cn } from "@/shared/utils";

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
  status: QuestionStatus;
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
    status: QuestionStatus.ACTIVE,
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
        status: question.status,
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
        // Include status only for updates (when editing existing questions)
        ...(question && { status: formData.status }),
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
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Plus className="h-4 w-4 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Answer Options
                </h3>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
                disabled={formData.options.length >= 6}
                className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
            </div>

            <FormField
              error={errors.options}
              hint="Select exactly one correct answer. You can add up to 6 options."
            >
              <div className="space-y-4">
                {formData.options.map((option, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-center space-x-4 p-4 rounded-xl border-2 transition-all duration-200",
                      option.isCorrect
                        ? "border-green-200 bg-green-50"
                        : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                    )}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={option.isCorrect}
                        onChange={(e) =>
                          updateOption(index, "isCorrect", e.target.checked)
                        }
                        className="h-5 w-5 text-green-600 border-gray-300 focus:ring-green-500"
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        value={option.text}
                        onChange={(e) =>
                          updateOption(index, "text", e.target.value)
                        }
                        placeholder={`Option ${index + 1}`}
                        variant="filled"
                        className="border-0 bg-white"
                      />
                    </div>
                    {formData.options.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </FormField>
          </div>
        );

      case QuestionType.TRUE_FALSE:
        return (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Correct Answer
              </h3>
            </div>

            <FormField
              error={errors.correctAnswer}
              hint="Select the correct answer for this true/false question"
            >
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={cn(
                    "flex items-center justify-center p-6 rounded-xl border-2 cursor-pointer transition-all duration-200",
                    formData.correctAnswer === true
                      ? "border-green-400 bg-green-50 text-green-800"
                      : "border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700"
                  )}
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, correctAnswer: true }))
                  }
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="true-option"
                      name="trueFalseAnswer"
                      checked={formData.correctAnswer === true}
                      onChange={() =>
                        setFormData((prev) => ({
                          ...prev,
                          correctAnswer: true,
                        }))
                      }
                      className="h-5 w-5 text-green-600 border-gray-300 focus:ring-green-500"
                    />
                    <label
                      htmlFor="true-option"
                      className="text-lg font-semibold cursor-pointer"
                    >
                      True
                    </label>
                  </div>
                </div>

                <div
                  className={cn(
                    "flex items-center justify-center p-6 rounded-xl border-2 cursor-pointer transition-all duration-200",
                    formData.correctAnswer === false
                      ? "border-red-400 bg-red-50 text-red-800"
                      : "border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700"
                  )}
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, correctAnswer: false }))
                  }
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="false-option"
                      name="trueFalseAnswer"
                      checked={formData.correctAnswer === false}
                      onChange={() =>
                        setFormData((prev) => ({
                          ...prev,
                          correctAnswer: false,
                        }))
                      }
                      className="h-5 w-5 text-red-600 border-gray-300 focus:ring-red-500"
                    />
                    <label
                      htmlFor="false-option"
                      className="text-lg font-semibold cursor-pointer"
                    >
                      False
                    </label>
                  </div>
                </div>
              </div>
            </FormField>
          </div>
        );

      case QuestionType.MATCHING:
        return (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Shuffle className="h-4 w-4 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Matching Items
              </h3>
            </div>

            <FormField
              error={errors.matching}
              hint="Create items for both columns and define their correct matches. You can add up to 8 items per column."
            >
              <div className="space-y-8">
                {/* Items Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-xs font-bold text-blue-600">
                            A
                          </span>
                        </div>
                        <h4 className="text-base font-semibold text-gray-700">
                          Left Column
                        </h4>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addMatchingItem("left")}
                        disabled={formData.leftColumn.length >= 8}
                        className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Item
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {formData.leftColumn.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100"
                        >
                          <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold text-blue-700">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <Input
                              value={item}
                              onChange={(e) =>
                                updateMatchingItem(
                                  "left",
                                  index,
                                  e.target.value
                                )
                              }
                              placeholder={`Left item ${index + 1}`}
                              variant="filled"
                              className="border-0 bg-white"
                            />
                          </div>
                          {formData.leftColumn.length > 2 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeMatchingItem("left", index)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                          <span className="text-xs font-bold text-green-600">
                            B
                          </span>
                        </div>
                        <h4 className="text-base font-semibold text-gray-700">
                          Right Column
                        </h4>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addMatchingItem("right")}
                        disabled={formData.rightColumn.length >= 8}
                        className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Item
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {formData.rightColumn.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3 p-3 bg-green-50/50 rounded-xl border border-green-100"
                        >
                          <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center text-xs font-bold text-green-700">
                            {String.fromCharCode(65 + index)}
                          </div>
                          <div className="flex-1">
                            <Input
                              value={item}
                              onChange={(e) =>
                                updateMatchingItem(
                                  "right",
                                  index,
                                  e.target.value
                                )
                              }
                              placeholder={`Right item ${index + 1}`}
                              variant="filled"
                              className="border-0 bg-white"
                            />
                          </div>
                          {formData.rightColumn.length > 2 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeMatchingItem("right", index)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Correct Matches Section */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                      <ArrowRight className="h-3 w-3 text-purple-600" />
                    </div>
                    <h4 className="text-base font-semibold text-gray-700">
                      Correct Matches
                    </h4>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">
                    Define which left item correctly matches with which right
                    item.
                  </p>

                  <div className="space-y-4">
                    {formData.leftColumn
                      .filter((item) => item.trim())
                      .map((leftItem, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-4 p-4 bg-purple-50/50 rounded-xl border border-purple-100"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold text-blue-700 flex-shrink-0">
                              {index + 1}
                            </div>
                            <div className="px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm font-medium text-gray-700 truncate">
                              {leftItem || `Left item ${index + 1}`}
                            </div>
                          </div>

                          <ArrowRight className="h-4 w-4 text-purple-400 flex-shrink-0" />

                          <div className="flex-1">
                            <Select
                              value={formData.correctMatches[leftItem] || ""}
                              onChange={(e) =>
                                updateCorrectMatch(leftItem, e.target.value)
                              }
                              placeholder="Select matching item..."
                              variant="filled"
                              className="bg-white"
                            >
                              <option value="">Select matching item...</option>
                              {formData.rightColumn
                                .filter((item) => item.trim())
                                .map((rightItem, rightIndex) => (
                                  <option key={rightIndex} value={rightItem}>
                                    {String.fromCharCode(65 + rightIndex)}:{" "}
                                    {rightItem}
                                  </option>
                                ))}
                            </Select>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </FormField>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      title={question ? "Edit Question" : "Create New Question"}
      description={
        question
          ? "Update the question details below"
          : "Fill out the form to create a new question"
      }
      size="xl"
      className="bg-gradient-to-br from-white to-gray-50/50"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="h-4 w-4 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Basic Information
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <FormField
                label="Question Type"
                required
                hint="Select the format of your question"
              >
                <Select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      type: e.target.value as QuestionType,
                    }))
                  }
                >
                  {Object.values(QuestionType).map((type) => (
                    <option key={type} value={type}>
                      {QUESTION_TYPE_LABELS[type]}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField
                label="Cognitive Level"
                required
                hint="Select the thinking level required"
              >
                <Select
                  value={formData.cognitiveType}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      cognitiveType: e.target.value as CognitiveType,
                    }))
                  }
                >
                  {Object.values(CognitiveType).map((type) => (
                    <option key={type} value={type}>
                      {COGNITIVE_TYPE_LABELS[type]}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField
                label="Category"
                required
                hint="Choose the subject category"
              >
                <Select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                >
                  {QUESTION_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Select>
              </FormField>
            </div>

            <div className="space-y-6">
              <FormField
                label="Difficulty"
                required
                hint="Set the question difficulty level"
              >
                <Select
                  value={formData.difficulty}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      difficulty: e.target.value as QuestionDifficulty,
                    }))
                  }
                >
                  {Object.values(QuestionDifficulty).map((difficulty) => (
                    <option key={difficulty} value={difficulty}>
                      {DIFFICULTY_LABELS[difficulty]}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField
                label="Points"
                required
                error={errors.points}
                hint="Points determine the weight of this question (1-10)"
              >
                <Input
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
                  error={!!errors.points}
                />
              </FormField>

              {/* Status field - only show for editing existing questions */}
              {question && (
                <FormField
                  label="Status"
                  required
                  hint="Set the question's availability status"
                >
                  <Select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        status: e.target.value as QuestionStatus,
                      }))
                    }
                  >
                    {Object.values(QuestionStatus).map((status) => (
                      <option key={status} value={status}>
                        {STATUS_LABELS[status]}
                      </option>
                    ))}
                  </Select>
                </FormField>
              )}
            </div>
          </div>
        </div>

        {/* Question Content */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <FileText className="h-4 w-4 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Question Content
            </h3>
          </div>

          <div className="space-y-6">
            <FormField
              label="Question Text"
              required
              error={errors.text}
              hint="Write a clear and concise question (minimum 10 characters)"
            >
              <TextArea
                value={formData.text}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, text: e.target.value }))
                }
                placeholder="Enter the question text..."
                rows={4}
                error={!!errors.text}
              />
            </FormField>

            <FormField
              label="Scenario"
              hint="Optional context or background information for the question"
            >
              <TextArea
                value={formData.scenario}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, scenario: e.target.value }))
                }
                placeholder="Enter a scenario or context for the question..."
                rows={3}
              />
            </FormField>
          </div>
        </div>

        {/* Question Type Specific Fields */}
        {renderQuestionTypeSpecificFields()}

        {/* Explanation */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <HelpCircle className="h-4 w-4 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Explanation</h3>
          </div>

          <FormField
            label="Answer Explanation"
            hint="Optional explanation to help students understand the correct answer"
          >
            <TextArea
              value={formData.explanation}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  explanation: e.target.value,
                }))
              }
              placeholder="Explain why this is the correct answer..."
              rows={3}
            />
          </FormField>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200 bg-gray-50 rounded-xl p-6 mt-8">
          <div className="text-sm text-gray-500">
            <HelpCircle className="h-4 w-4 inline mr-1" />
            All required fields must be completed
          </div>
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 shadow-lg"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading
                ? "Saving..."
                : question
                ? "Update Question"
                : "Create Question"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
