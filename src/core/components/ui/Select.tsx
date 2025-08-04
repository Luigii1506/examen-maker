// 📝 CORE SELECT COMPONENT
// ======================
// Componente base reutilizable para selects

"use client";

import React from "react";
import { cn } from "@/shared/utils";
import { ChevronDown } from "lucide-react";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  variant?: "default" | "filled" | "underlined";
  selectSize?: "sm" | "md" | "lg";
  error?: boolean;
  placeholder?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      variant = "default",
      selectSize = "md",
      error = false,
      disabled,
      children,
      placeholder,
      ...props
    },
    ref
  ) => {
    const baseClasses = cn(
      "w-full rounded-xl transition-all duration-200 appearance-none",
      "border font-medium text-gray-900 bg-white",
      "focus:outline-none focus:ring-3 focus:ring-blue-500/20",
      "cursor-pointer",
      disabled ? "opacity-60 cursor-not-allowed bg-gray-50" : ""
    );

    const variants = {
      default: [
        "border-gray-300",
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
      sm: "h-9 px-3 pr-8 text-sm",
      md: "h-11 px-4 pr-10 text-sm",
      lg: "h-12 px-4 pr-10 text-base",
    };

    return (
      <div className="relative">
        <select
          className={cn(
            baseClasses,
            variants[variant],
            sizes[selectSize],
            className
          )}
          ref={ref}
          disabled={disabled}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {children}
        </select>

        {/* Custom dropdown arrow */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </div>
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;
