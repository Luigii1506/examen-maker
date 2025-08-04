// 📝 CORE FORM FIELD COMPONENT
// ======================
// Componente base reutilizable para campos de formulario

"use client";

import React from "react";
import { cn } from "@/shared/utils";
import { AlertCircle } from "lucide-react";

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  (
    { className, label, error, required = false, hint, children, ...props },
    ref
  ) => {
    return (
      <div ref={ref} className={cn("space-y-2", className)} {...props}>
        {/* Label */}
        {label && (
          <label className="block text-sm font-semibold text-gray-700">
            {label}
            {required && (
              <span className="text-red-500 ml-1" aria-label="required">
                *
              </span>
            )}
          </label>
        )}

        {/* Input/Content */}
        <div className="relative">{children}</div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center space-x-1 text-sm text-red-600">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Hint */}
        {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
      </div>
    );
  }
);

FormField.displayName = "FormField";

export default FormField;
