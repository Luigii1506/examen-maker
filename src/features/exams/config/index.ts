// Configuration for the exam system

export const EXAM_CONFIG = {
  // Time configurations
  WARNING_TIME: 5, // minutes before exam ends
  AUTO_SAVE_INTERVAL: 30, // seconds for auto-save

  // Score configurations
  MINIMUM_PASSING_SCORE: 70, // minimum percentage to pass

  // UI configurations
  QUESTIONS_PER_PAGE: 1,
  SHOW_IMMEDIATE_RESULT: false,

  // Available categories
  CATEGORIES: [
    "Basic AML",
    "Intermediate AML",
    "Advanced AML",
    "Regulations",
    "Practical Cases",
  ] as const,

  // Difficulty levels
  DIFFICULTIES: [
    { value: "basic", label: "Basic", color: "green" },
    { value: "intermediate", label: "Intermediate", color: "yellow" },
    { value: "advanced", label: "Advanced", color: "red" },
  ] as const,

  // Attempt statuses
  ATTEMPT_STATUSES: [
    { value: "in_progress", label: "In Progress", color: "blue" },
    { value: "completed", label: "Completed", color: "green" },
    { value: "abandoned", label: "Abandoned", color: "gray" },
  ] as const,
} as const;
