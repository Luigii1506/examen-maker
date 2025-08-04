// Utilities for the exam system

export const calculatePercentage = (
  earnedScore: number,
  totalScore: number
): number => {
  if (totalScore === 0) return 0;
  return Math.round((earnedScore / totalScore) * 100);
};

export const determinePass = (
  percentage: number,
  minimumScore: number
): boolean => {
  return percentage >= minimumScore;
};

export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

export const validateAnswer = (answer: string | string[]): boolean => {
  if (Array.isArray(answer)) {
    return answer.length > 0 && answer.every((a) => a.trim().length > 0);
  }
  return typeof answer === "string" && answer.trim().length > 0;
};
