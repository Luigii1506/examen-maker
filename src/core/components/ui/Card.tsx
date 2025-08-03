// 🃏 CORE CARD COMPONENT
// ======================
// Componente base reutilizable para tarjetas/contenedores

"use client";

import React from "react";
import { cn } from "@/shared/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outlined" | "filled";
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = "default",
      padding = "md",
      hover = false,
      children,
      ...props
    },
    ref
  ) => {
    const baseClasses = [
      "rounded-xl",
      "transition-all duration-200",
      hover && "cursor-pointer",
    ];

    const variants = {
      default: [
        "bg-white dark:bg-gray-800",
        "border border-gray-200 dark:border-gray-700",
        hover &&
          "hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600",
      ],
      elevated: [
        "bg-white dark:bg-gray-800",
        "shadow-lg",
        hover && "hover:shadow-xl",
      ],
      outlined: [
        "bg-transparent",
        "border-2 border-gray-300 dark:border-gray-600",
        hover && "hover:border-gray-400 dark:hover:border-gray-500",
      ],
      filled: [
        "bg-gray-50 dark:bg-gray-900",
        hover && "hover:bg-gray-100 dark:hover:bg-gray-800",
      ],
    };

    const paddings = {
      none: "",
      sm: "p-3",
      md: "p-6",
      lg: "p-8",
    };

    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          variants[variant],
          paddings[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export default Card;
