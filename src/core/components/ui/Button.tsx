// 🎯 CORE BUTTON COMPONENT
// ========================
// Componente base reutilizable para botones con variantes y estados

"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/shared/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseClasses = [
      "inline-flex items-center justify-center font-medium rounded-lg",
      "transition-colors duration-200",
      "focus:outline-none focus:ring-2 focus:ring-offset-2",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      fullWidth && "w-full",
    ];

    const variants = {
      primary: [
        "bg-blue-600 text-white",
        "hover:bg-blue-700",
        "focus:ring-blue-500",
        "disabled:bg-blue-300",
      ],
      secondary: [
        "bg-gray-600 text-white",
        "hover:bg-gray-700",
        "focus:ring-gray-500",
        "disabled:bg-gray-300",
      ],
      outline: [
        "border border-gray-300 bg-white text-gray-700",
        "hover:bg-gray-50",
        "focus:ring-gray-500",
        "disabled:bg-gray-100",
      ],
      ghost: ["text-gray-700", "hover:bg-gray-100", "focus:ring-gray-500"],
      destructive: [
        "bg-red-600 text-white",
        "hover:bg-red-700",
        "focus:ring-red-500",
        "disabled:bg-red-300",
      ],
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm gap-1.5",
      md: "px-4 py-2 text-base gap-2",
      lg: "px-6 py-3 text-lg gap-2.5",
    };

    return (
      <button
        ref={ref}
        className={cn(baseClasses, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {!isLoading && leftIcon && leftIcon}
        {children}
        {!isLoading && rightIcon && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
