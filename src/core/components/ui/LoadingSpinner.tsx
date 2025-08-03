// ⏳ CORE LOADING SPINNER COMPONENT
// =================================
// Componente base reutilizable para indicadores de carga

"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/shared/utils";

export interface LoadingSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl";
  text?: string;
  center?: boolean;
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size = "md", text, center = false, ...props }, ref) => {
    const sizes = {
      sm: "w-4 h-4",
      md: "w-6 h-6",
      lg: "w-8 h-8",
      xl: "w-12 h-12",
    };

    const textSizes = {
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
      xl: "text-xl",
    };

    const containerClasses = [
      "flex items-center gap-3",
      center && "justify-center",
      text ? "flex-row" : "justify-center",
    ];

    return (
      <div ref={ref} className={cn(containerClasses, className)} {...props}>
        <Loader2
          className={cn(
            "animate-spin text-blue-600 dark:text-blue-400",
            sizes[size]
          )}
        />
        {text && (
          <span
            className={cn(
              "text-gray-700 dark:text-gray-300 animate-pulse",
              textSizes[size]
            )}
          >
            {text}
          </span>
        )}
      </div>
    );
  }
);

LoadingSpinner.displayName = "LoadingSpinner";

export default LoadingSpinner;
