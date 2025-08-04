// 🪟 CORE MODAL COMPONENT
// ======================
// Componente base reutilizable para modales/diálogos

"use client";

import React, { useEffect } from "react";
import { cn } from "@/shared/utils";
import { X } from "lucide-react";
import Button from "./Button";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  className?: string;
}

const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      isOpen,
      onClose,
      title,
      description,
      children,
      size = "lg",
      showCloseButton = true,
      closeOnBackdrop = true,
      className,
      ...props
    },
    ref
  ) => {
    // Close modal on Escape key
    useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape" && isOpen) {
          onClose();
        }
      };

      if (isOpen) {
        document.addEventListener("keydown", handleEscape);
        // Prevent body scroll when modal is open
        const scrollbarWidth =
          window.innerWidth - document.documentElement.clientWidth;

        document.body.setAttribute("data-scroll-locked", "true");
        document.body.style.setProperty(
          "--scrollbar-width",
          `${scrollbarWidth}px`
        );
        document.body.style.overflow = "hidden";
        document.body.style.paddingRight = `${scrollbarWidth}px`;

        return () => {
          document.removeEventListener("keydown", handleEscape);
          document.body.removeAttribute("data-scroll-locked");
          document.body.style.removeProperty("--scrollbar-width");
          document.body.style.removeProperty("overflow");
          document.body.style.removeProperty("padding-right");
        };
      }

      return () => {
        document.removeEventListener("keydown", handleEscape);
      };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizes = {
      sm: "max-w-md",
      md: "max-w-lg",
      lg: "max-w-2xl",
      xl: "max-w-4xl",
      full: "max-w-7xl",
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget && closeOnBackdrop) {
        onClose();
      }
    };

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={handleBackdropClick}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
          aria-hidden="true"
        />

        {/* Modal Container */}
        <div
          ref={ref}
          className={cn(
            // Base styles
            "relative w-full max-h-[90vh] bg-white rounded-2xl shadow-2xl",
            "border border-gray-200/50",
            "transform transition-all duration-300 ease-out",
            "animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2",
            // Optimize for scroll performance
            "will-change-auto",
            // Size variants
            sizes[size],
            className
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? "modal-title" : undefined}
          aria-describedby={description ? "modal-description" : undefined}
          {...props}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
              <div className="flex-1">
                {title && (
                  <h2
                    id="modal-title"
                    className="text-xl font-semibold text-gray-900 leading-tight"
                  >
                    {title}
                  </h2>
                )}
                {description && (
                  <p
                    id="modal-description"
                    className="mt-1 text-sm text-gray-600"
                  >
                    {description}
                  </p>
                )}
              </div>

              {showCloseButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="ml-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2"
                >
                  <X className="h-5 w-5" />
                  <span className="sr-only">Close modal</span>
                </Button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto max-h-[calc(90vh-8rem)] modal-content">
            <div className="px-1">{children}</div>
          </div>
        </div>
      </div>
    );
  }
);

Modal.displayName = "Modal";

export default Modal;
