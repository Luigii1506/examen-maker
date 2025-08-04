"use client";

import { ExamTaking } from "@/features/exams";
import { useSearchParams } from "next/navigation";

export default function ExamPage() {
  const searchParams = useSearchParams();
  const examId = searchParams.get("id");

  if (!examId) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>No exam ID provided</p>
      </div>
    );
  }

  return <ExamTaking examId={examId} />;
}
