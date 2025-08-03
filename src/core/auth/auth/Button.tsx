import React from "react";

interface ButtonProps {
  type?: "button" | "submit" | "reset";
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  type = "button",
  loading = false,
  disabled = false,
  children,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
}) => {
  const baseClasses = `
    inline-flex items-center justify-center
    font-medium rounded-xl
    transition-all duration-200
    focus:outline-none
    relative overflow-hidden
  `;

  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3 text-base",
    lg: "px-6 py-4 text-lg",
  };

  const isDisabled = disabled || loading;

  const getVariantClasses = () => {
    if (isDisabled) {
      // Estilos específicos para disabled - sin sombras ni efectos
      switch (variant) {
        case "primary":
          return `
            bg-blue-300 text-white cursor-not-allowed
          `;
        case "secondary":
          return `
            bg-gray-300 text-white cursor-not-allowed
          `;
        case "outline":
          return `
            bg-gray-100 text-gray-400 border-2 border-gray-200 cursor-not-allowed
          `;
        default:
          return `
            bg-blue-300 text-white cursor-not-allowed
          `;
      }
    }

    // Estilos normales para botones habilitados
    const variantClasses = {
      primary: `
        bg-blue-600 text-white
        hover:bg-blue-700 active:bg-blue-800
        focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        shadow-lg shadow-blue-500/25
        hover:shadow-xl hover:shadow-blue-500/30
      `,
      secondary: `
        bg-gray-600 text-white
        hover:bg-gray-700 active:bg-gray-800
        focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
        shadow-lg shadow-gray-500/25
      `,
      outline: `
        bg-white text-gray-700 border-2 border-gray-300
        hover:bg-gray-50 hover:border-gray-400
        focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
      `,
    };

    return variantClasses[variant];
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${getVariantClasses()}
        ${className}
        w-full
      `}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
        </div>
      )}

      <span className={loading ? "opacity-0" : "opacity-100"}>{children}</span>
    </button>
  );
};

export default Button;
