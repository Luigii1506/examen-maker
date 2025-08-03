import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputFieldProps {
  type: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  type,
  placeholder,
  value,
  onChange,
  icon,
  error,
  required = false,
  disabled = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className="space-y-1">
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div
              className={`transition-colors duration-200 ${
                isFocused
                  ? "text-blue-500"
                  : error
                  ? "text-red-400"
                  : "text-gray-400"
              }`}
            >
              {icon}
            </div>
          </div>
        )}

        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          required={required}
          disabled={disabled}
          className={`
            w-full px-4 py-3 
            ${icon ? "pl-12" : "pl-4"} 
            ${isPassword ? "pr-12" : "pr-4"}
            border-2 rounded-xl 
            bg-white
            transition-all duration-200
            focus:outline-none focus:ring-0
            placeholder:text-gray-400
            disabled:bg-gray-50 disabled:cursor-not-allowed
            ${
              error
                ? "border-red-300 focus:border-red-500"
                : isFocused
                ? "border-blue-500 shadow-lg shadow-blue-500/20"
                : "border-gray-200 hover:border-gray-300"
            }
          `}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            tabIndex={-1}
          >
            <div
              className={`transition-colors duration-200 ${
                isFocused
                  ? "text-blue-500"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </div>
          </button>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1 animate-in slide-in-from-left-1 duration-200">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export default InputField;
