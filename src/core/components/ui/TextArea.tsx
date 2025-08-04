// 📝 CORE TEXTAREA COMPONENT
// ======================
// Componente base reutilizable para textareas

"use client";

import React from "react";
import { cn } from "@/shared/utils";

export interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: "default" | "filled" | "underlined";
  textareaSize?: "sm" | "md" | "lg";
  error?: boolean;
  resize?: "none" | "vertical" | "horizontal" | "both";
}

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      className,
      variant = "default",
      textareaSize = "md",
      error = false,
      resize = "vertical",
      disabled,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const baseClasses = cn(
      "w-full rounded-xl transition-all duration-200",
      "border font-medium placeholder:text-gray-400",
      "focus:outline-none focus:ring-3 focus:ring-blue-500/20",
      disabled ? "opacity-60 cursor-not-allowed bg-gray-50" : ""
    );

    const variants = {
      default: [
        "bg-white border-gray-300",
        "hover:border-gray-400",
        error ? "border-red-400 focus:border-red-500" : "focus:border-blue-500",
      ],
      filled: [
        "bg-gray-50 border-gray-200",
        "hover:bg-gray-100 hover:border-gray-300",
        error
          ? "border-red-400 focus:border-red-500"
          : "focus:border-blue-500 focus:bg-white",
      ],
      underlined: [
        "bg-transparent border-0 border-b-2 border-gray-300 rounded-none",
        "hover:border-gray-400",
        error ? "border-red-400 focus:border-red-500" : "focus:border-blue-500",
      ],
    };

    const sizes = {
      sm: "px-3 py-2 text-sm min-h-[80px]",
      md: "px-4 py-3 text-sm min-h-[100px]",
      lg: "px-4 py-3 text-base min-h-[120px]",
    };

    const resizeClasses = {
      none: "resize-none",
      vertical: "resize-y",
      horizontal: "resize-x",
      both: "resize",
    };

    return (
      <textarea
        className={cn(
          baseClasses,
          variants[variant],
          sizes[textareaSize],
          resizeClasses[resize],
          className
        )}
        ref={ref}
        disabled={disabled}
        rows={rows}
        {...props}
      />
    );
  }
);

TextArea.displayName = "TextArea";

export default TextArea;
