// 🎨 FEATURE FLAGS CATEGORIES CONFIGURATION
// =========================================
// Configuración de categorías para organizar feature flags

import type { FeatureGroup } from "@/core/config/feature-flags";

export interface CategoryConfig {
  title: string;
  description: string;
  icon: string;
  color: string;
}

export const CATEGORY_CONFIG: Record<FeatureGroup, CategoryConfig> = {
  core: {
    title: "Funcionalidades Core",
    description: "Características fundamentales del sistema",
    icon: "Shield",
    color: "blue",
  },
  modules: {
    title: "Módulos",
    description: "Funcionalidades adicionales y extensiones",
    icon: "Package",
    color: "green",
  },
  experimental: {
    title: "Experimental",
    description: "Funcionalidades en desarrollo",
    icon: "Zap",
    color: "yellow",
  },
  ui: {
    title: "Interfaz",
    description: "Mejoras de experiencia de usuario",
    icon: "Palette",
    color: "purple",
  },
  admin: {
    title: "Administración",
    description: "Herramientas de administración",
    icon: "Cpu",
    color: "red",
  },
};

// 🔍 Helper function para obtener configuración de categoría
export function getCategoryConfig(category: FeatureGroup): CategoryConfig {
  return CATEGORY_CONFIG[category];
}

// 📊 Helper function para obtener todas las categorías
export function getAllCategories(): FeatureGroup[] {
  return Object.keys(CATEGORY_CONFIG) as FeatureGroup[];
}

// 🎨 Helper function para obtener colores de categoría
export function getCategoryColors(category: FeatureGroup) {
  const baseColor = CATEGORY_CONFIG[category].color;

  const colorMap: Record<string, { bg: string; border: string; text: string }> =
    {
      blue: {
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-700",
      },
      green: {
        bg: "bg-green-50",
        border: "border-green-200",
        text: "text-green-700",
      },
      yellow: {
        bg: "bg-yellow-50",
        border: "border-yellow-200",
        text: "text-yellow-700",
      },
      purple: {
        bg: "bg-purple-50",
        border: "border-purple-200",
        text: "text-purple-700",
      },
      red: {
        bg: "bg-red-50",
        border: "border-red-200",
        text: "text-red-700",
      },
    };

  return colorMap[baseColor] || colorMap.blue;
}
