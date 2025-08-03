// 🧩 SIMPLE BUTTON COMPONENT
// ===========================
// Componente básico para demostrar testing

import React from "react";

interface SimpleButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
}

export const SimpleButton: React.FC<SimpleButtonProps> = ({
  children,
  onClick,
  disabled = false,
  variant = "primary",
}) => {
  const baseClasses = "px-4 py-2 rounded font-medium transition-colors";
  const variantClasses = {
    primary: "bg-blue-500 text-white hover:bg-blue-600",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
  };

  const disabledClasses = "opacity-50 cursor-not-allowed";

  const className = `
    ${baseClasses} 
    ${variantClasses[variant]} 
    ${disabled ? disabledClasses : ""}
  `.trim();

  return (
    <button
      data-testid="simple-button"
      className={className}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
