// 🎯 FEATURE FLAG CARD COMPONENT (CORE)
// =====================================
// Card individual para mostrar feature flags con estilo moderno

"use client";

import React, { useState } from "react";
import {
  Shield,
  Lock,
  AlertTriangle,
  Clock,
  User,
  ChevronDown,
  ChevronRight,
  Package,
  Palette,
  Zap,
  Cpu,
  HardDrive,
  Bell,
  Eye,
  UserCog,
  FileText,
  BarChart3,
  Upload,
  CreditCard,
  ShoppingCart,
  Bot,
  Settings,
  Moon,
} from "lucide-react";
import type { FeatureFlagCardData } from "../types";
import type { FeatureFlag } from "@/core/config/feature-flags";

interface FeatureFlagCardProps {
  flag: FeatureFlagCardData;
  onToggle: (flagId: FeatureFlag) => void;
  dependencies?: FeatureFlagCardData[];
  hasChanges?: boolean;
  isLoading?: boolean;
}

const FeatureFlagCard: React.FC<FeatureFlagCardProps> = ({
  flag,
  onToggle,
  dependencies = [],
  hasChanges = false,
  isLoading = false,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: React.ComponentType<{ size?: number }> } = {
      Shield,
      Lock,
      User,
      Package,
      Palette,
      Zap,
      Cpu,
      HardDrive,
      Bell,
      Eye,
      UserCog,
      FileText,
      BarChart3,
      Upload,
      CreditCard,
      ShoppingCart,
      Bot,
      Settings,
      Moon,
    };
    const IconComponent = iconMap[iconName] || Shield;
    return <IconComponent size={20} />;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "core":
        return {
          bg: "bg-blue-50",
          text: "text-blue-700",
          border: "border-blue-200",
          icon: "text-blue-600",
          toggle: "bg-blue-600",
        };
      case "modules":
        return {
          bg: "bg-green-50",
          text: "text-green-700",
          border: "border-green-200",
          icon: "text-green-600",
          toggle: "bg-green-600",
        };
      case "experimental":
        return {
          bg: "bg-yellow-50",
          text: "text-yellow-700",
          border: "border-yellow-200",
          icon: "text-yellow-600",
          toggle: "bg-yellow-600",
        };
      case "ui":
        return {
          bg: "bg-purple-50",
          text: "text-purple-700",
          border: "border-purple-200",
          icon: "text-purple-600",
          toggle: "bg-purple-600",
        };
      case "admin":
        return {
          bg: "bg-red-50",
          text: "text-red-700",
          border: "border-red-200",
          icon: "text-red-600",
          toggle: "bg-red-600",
        };
      default:
        return {
          bg: "bg-slate-50",
          text: "text-slate-700",
          border: "border-slate-200",
          icon: "text-slate-600",
          toggle: "bg-slate-600",
        };
    }
  };

  const colors = getCategoryColor(flag.category);
  const hasBlockingDependencies = dependencies.some((dep) => !dep.enabled);

  const handleToggle = () => {
    if (isLoading) return;
    if (hasBlockingDependencies && !flag.enabled) {
      return; // Don't allow enabling if dependencies are not met
    }
    onToggle(flag.id);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCategoryDisplayName = (category: string) => {
    const names = {
      core: "Core",
      modules: "Módulo",
      experimental: "Experimental",
      ui: "Interfaz",
      admin: "Admin",
    };
    return names[category as keyof typeof names] || category;
  };

  return (
    <div
      className={`group bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
        hasChanges
          ? "border-blue-300 shadow-lg"
          : "border-slate-200 hover:border-slate-300 hover:shadow-lg"
      }`}
    >
      {/* Main Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors.bg} ${colors.border} border`}
            >
              <div className={colors.icon}>{getIconComponent(flag.icon)}</div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-slate-900 text-lg truncate">
                  {flag.name}
                </h3>
                {flag.isPremium && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full border border-amber-200">
                    <Lock size={10} />
                    Premium
                  </span>
                )}
                {hasChanges && (
                  <span className="inline-flex px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full border border-blue-200">
                    Modificado
                  </span>
                )}
              </div>
              <p className="text-slate-600 text-sm line-clamp-2">
                {flag.description}
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <div className="flex items-center gap-3 ml-4">
            {hasBlockingDependencies && !flag.enabled && (
              <div className="flex items-center gap-1 text-amber-600">
                <AlertTriangle size={16} />
                <span className="text-xs font-medium">Dependencias</span>
              </div>
            )}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={flag.enabled}
                onChange={handleToggle}
                disabled={
                  isLoading || (hasBlockingDependencies && !flag.enabled)
                }
                className="sr-only peer"
              />
              <div
                className={`w-12 h-6 rounded-full transition-all duration-300 ${
                  flag.enabled
                    ? colors.toggle
                    : hasBlockingDependencies && !flag.enabled
                    ? "bg-slate-200 cursor-not-allowed"
                    : "bg-slate-200 hover:bg-slate-300"
                } peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/20 ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 bg-white rounded-full h-5 w-5 transition-transform duration-300 shadow-sm ${
                    flag.enabled ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </div>
            </label>
          </div>
        </div>

        {/* Category Badge */}
        <div className="flex items-center justify-between">
          <span
            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${colors.bg} ${colors.text} ${colors.border}`}
          >
            {getCategoryDisplayName(flag.category)}
          </span>

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-700 text-sm transition-colors"
          >
            {showDetails ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
            <span>Detalles</span>
          </button>
        </div>

        {/* Dependencies Warning */}
        {hasBlockingDependencies && !flag.enabled && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-start gap-2">
              <AlertTriangle
                size={16}
                className="text-amber-600 flex-shrink-0 mt-0.5"
              />
              <div>
                <p className="text-sm font-medium text-amber-800">
                  Dependencias requeridas
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  Habilita primero:{" "}
                  {dependencies
                    .filter((dep) => !dep.enabled)
                    .map((dep) => dep.name)
                    .join(", ")}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Expandable Details */}
      {showDetails && (
        <div className="px-6 pb-6 pt-0 border-t border-slate-100">
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Última modificación:</span>
              <div className="flex items-center gap-1 text-slate-700">
                <Clock size={12} />
                <span>{formatDate(flag.lastModified)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Modificado por:</span>
              <div className="flex items-center gap-1 text-slate-700">
                <User size={12} />
                <span>{flag.modifiedBy}</span>
              </div>
            </div>
            {flag.dependencies && flag.dependencies.length > 0 && (
              <div>
                <span className="text-slate-500">Dependencias:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {flag.dependencies.map((depId) => {
                    const dep = dependencies.find((d) => d.id === depId);
                    return dep ? (
                      <span
                        key={depId}
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs ${
                          dep.enabled
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {dep.name}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeatureFlagCard;
