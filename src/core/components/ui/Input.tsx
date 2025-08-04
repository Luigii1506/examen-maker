// 📝 CORE INPUT COMPONENT
// ======================
// Componente base reutilizable para inputs

"use client";

import React from "react";
import { cn } from "@/shared/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "default" | "filled" | "underlined";
  inputSize?: "sm" | "md" | "lg";
  error?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      variant = "default",
      inputSize = "md",
      error = false,
      leftIcon,
      rightIcon,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseClasses = cn(
      "w-full rounded-xl transition-all duration-200",
      "border font-medium placeholder:text-gray-400",
      "focus:outline-none focus:ring-3 focus:ring-blue-500/20",
      disabled ? "opacity-60 cursor-not-allowed bg-gray-50" : "",
      leftIcon ? "pl-10" : "",
      rightIcon ? "pr-10" : ""
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
      sm: "h-9 px-3 text-sm",
      md: "h-11 px-4 text-sm",
      lg: "h-12 px-4 text-base",
    };

    return (
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}

        <input
          type={type}
          className={cn(
            baseClasses,
            variants[variant],
            sizes[inputSize],
            className
          )}
          ref={ref}
          disabled={disabled}
          {...props}
        />

        {rightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
