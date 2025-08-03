// 🎛️ FEATURE FLAGS ADMIN COMPONENT (CORE)
// ==========================================
// Interfaz de administración central para controlar feature flags del sistema
// Ubicado en core porque controla todos los módulos independientemente

"use client";

import React, { useState, useEffect } from "react";
import {
  Save,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Info,
  RefreshCw,
  Flag,
  Search,
  Filter,
  Shield,
  Package,
  Palette,
  BarChart3,
  Zap,
  Cpu,
} from "lucide-react";
import { useFeatureFlags } from "@/shared/hooks/useFeatureFlags";
import {
  FEATURE_FLAGS,
  FEATURE_GROUPS,
  type FeatureFlag,
  type FeatureGroup,
} from "@/core/config/feature-flags";
import FeatureFlagCard from "./FeatureFlagCard";
import type {
  FeatureFlagState,
  NotificationState,
  FeatureFlagStats,
  FeatureFlagCardData,
  FeatureFlagCategory,
} from "../types";

// 📦 Importar metadata desde archivos de configuración
import {
  FEATURE_FLAG_METADATA,
  getFeatureFlagMetadata,
} from "../config/metadata";
import {
  CATEGORY_CONFIG,
  getCategoryConfig,
  getAllCategories,
} from "../config/categories";

export default function FeatureFlagsAdmin() {
  const { getAllFlags, setBatch, reset } = useFeatureFlags();
  const [flags, setFlags] = useState<FeatureFlagState>({});
  const [originalFlags, setOriginalFlags] = useState<FeatureFlagState>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<NotificationState | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // 📊 Cargar flags iniciales
  useEffect(() => {
    const currentFlags = getAllFlags();
    setFlags(currentFlags);
    setOriginalFlags(currentFlags);
  }, [getAllFlags]);

  // 📊 Detectar cambios
  useEffect(() => {
    const hasAnyChanges = Object.keys(flags).some(
      (key) => flags[key] !== originalFlags[key]
    );
    setHasChanges(hasAnyChanges);
  }, [flags, originalFlags]);

  // 🔔 Mostrar notificación
  const showNotification = (
    type: "success" | "error" | "info",
    message: string
  ) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // 🔄 Toggle individual
  const handleToggle = (flagName: FeatureFlag) => {
    setFlags((prev) => ({
      ...prev,
      [flagName]: !prev[flagName],
    }));
  };

  // 💾 Guardar cambios
  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Identificar cambios
      const changes: { [key: string]: boolean } = {};
      Object.keys(flags).forEach((key) => {
        if (flags[key] !== originalFlags[key]) {
          changes[key] = flags[key];
        }
      });

      if (Object.keys(changes).length === 0) {
        showNotification("info", "No hay cambios para guardar");
        return;
      }

      // Aplicar cambios al contexto local
      setBatch(changes);

      // TODO: Enviar a la API
      // await fetch('/api/admin/feature-flags', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ flags: changes })
      // });

      setOriginalFlags(flags);
      setHasChanges(false);
      showNotification(
        "success",
        `${Object.keys(changes).length} feature flag(s) actualizadas`
      );
    } catch (error) {
      showNotification("error", "Error al guardar feature flags");
      console.error("Error saving feature flags:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔄 Resetear cambios
  const handleReset = () => {
    setFlags(originalFlags);
    setHasChanges(false);
    showNotification("info", "Cambios descartados");
  };

  // 🔄 Resetear a defaults
  const handleResetToDefaults = async () => {
    if (
      !confirm(
        "¿Estás seguro de resetear todas las feature flags a sus valores por defecto?"
      )
    ) {
      return;
    }

    setIsLoading(true);
    try {
      // Resetear contexto local
      reset();

      // TODO: Enviar a la API
      // await fetch('/api/admin/feature-flags', { method: 'DELETE' });

      const defaultFlags = getAllFlags();
      setFlags(defaultFlags);
      setOriginalFlags(defaultFlags);
      setHasChanges(false);
      showNotification(
        "success",
        "Feature flags reseteadas a valores por defecto"
      );
    } catch (error) {
      showNotification("error", "Error al resetear feature flags");
      console.error("Error resetting feature flags:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔄 Transformar datos para la nueva UI
  const transformToCardData = (): FeatureFlagCardData[] => {
    return Object.keys(FEATURE_FLAGS).map((flagKey) => {
      const flag = flagKey as FeatureFlag;
      const metadata = FEATURE_FLAG_METADATA[flag];
      const category =
        (Object.entries(FEATURE_GROUPS).find(([groupKey, flagNames]) =>
          (flagNames as readonly string[]).includes(flag)
        )?.[0] as FeatureGroup) || "core";

      return {
        id: flag,
        name: metadata.name,
        description: metadata.description,
        category,
        enabled: flags[flag] ?? false,
        icon: metadata.icon,
        isPremium: metadata.isPremium,
        dependencies: metadata.dependencies,
        lastModified: new Date().toISOString(),
        modifiedBy: "Admin",
      };
    });
  };

  // 📊 Calcular estadísticas
  const calculateStats = (
    flagData: FeatureFlagCardData[]
  ): FeatureFlagStats => {
    return {
      totalFlags: flagData.length,
      enabledFlags: flagData.filter((f) => f.enabled).length,
      coreFlags: flagData.filter((f) => f.category === "core").length,
      moduleFlags: flagData.filter((f) => f.category === "modules").length,
      experimentalFlags: flagData.filter((f) => f.category === "experimental")
        .length,
      uiFlags: flagData.filter((f) => f.category === "ui").length,
      adminFlags: flagData.filter((f) => f.category === "admin").length,
    };
  };

  // 🔍 Filtrar flags
  const flagData = transformToCardData();
  const filteredFlags = flagData.filter((flag) => {
    const matchesSearch =
      flag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flag.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || flag.category === filterCategory;
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "enabled" && flag.enabled) ||
      (filterStatus === "disabled" && !flag.enabled);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // 🏷️ Agrupar por categorías
  const categories: FeatureFlagCategory[] = Object.entries(CATEGORY_CONFIG)
    .map(([categoryKey, config]) => {
      const category = categoryKey as FeatureGroup;
      const categoryFlags = filteredFlags.filter(
        (flag) => flag.category === category
      );

      return {
        id: category,
        name: config.title,
        description: config.description,
        icon: config.icon,
        color: config.color,
        flags: categoryFlags,
      };
    })
    .filter((category) => category.flags.length > 0);

  const stats = calculateStats(flagData);

  // 🎨 Helper para colores de categorías
  const getCategoryIcon = (iconName: string) => {
    const iconMap: { [key: string]: React.ComponentType<{ size?: number }> } = {
      Shield,
      Package,
      Palette,
      Zap,
      Cpu,
    };
    const IconComponent = iconMap[iconName] || Shield;
    return <IconComponent size={20} />;
  };

  const getCategoryColors = (color: string) => {
    switch (color) {
      case "blue":
        return {
          bg: "bg-blue-50",
          text: "text-blue-700",
          border: "border-blue-200",
          icon: "text-blue-600",
        };
      case "green":
        return {
          bg: "bg-green-50",
          text: "text-green-700",
          border: "border-green-200",
          icon: "text-green-600",
        };
      case "yellow":
        return {
          bg: "bg-yellow-50",
          text: "text-yellow-700",
          border: "border-yellow-200",
          icon: "text-yellow-600",
        };
      case "purple":
        return {
          bg: "bg-purple-50",
          text: "text-purple-700",
          border: "border-purple-200",
          icon: "text-purple-600",
        };
      case "red":
        return {
          bg: "bg-red-50",
          text: "text-red-700",
          border: "border-red-200",
          icon: "text-red-600",
        };
      default:
        return {
          bg: "bg-slate-50",
          text: "text-slate-700",
          border: "border-slate-200",
          icon: "text-slate-600",
        };
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            🎛️ Feature Flags Administration
          </h1>
          <p className="text-slate-600 mt-1">
            Controla las funcionalidades y módulos de tu aplicación
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleReset}
                disabled={isLoading}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <RotateCcw size={16} />
                Descartar
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                Guardar Cambios
              </button>
            </div>
          )}
          <button
            onClick={handleResetToDefaults}
            disabled={isLoading}
            className="px-4 py-2 text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <RotateCcw size={16} />
            Reset Completo
          </button>
        </div>
      </div>

      {/* Notificación */}
      {notification && (
        <div
          className={`p-4 rounded-lg flex items-center space-x-3 ${
            notification.type === "success"
              ? "bg-green-50 border border-green-200"
              : notification.type === "error"
              ? "bg-red-50 border border-red-200"
              : "bg-blue-50 border border-blue-200"
          }`}
        >
          {notification.type === "success" && (
            <CheckCircle className="w-5 h-5 text-green-600" />
          )}
          {notification.type === "error" && (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          {notification.type === "info" && (
            <Info className="w-5 h-5 text-blue-600" />
          )}
          <span
            className={`text-sm font-medium ${
              notification.type === "success"
                ? "text-green-800"
                : notification.type === "error"
                ? "text-red-800"
                : "text-blue-800"
            }`}
          >
            {notification.message}
          </span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
              <Flag className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">
                {stats.totalFlags}
              </div>
              <div className="text-sm text-slate-500">Total</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-600">
                {stats.enabledFlags}
              </div>
              <div className="text-sm text-slate-500">Activas</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {stats.coreFlags}
              </div>
              <div className="text-sm text-slate-500">Core</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {stats.moduleFlags}
              </div>
              <div className="text-sm text-slate-500">Módulos</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Palette className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {stats.uiFlags}
              </div>
              <div className="text-sm text-slate-500">Interfaz</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar feature flags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
            />
          </div>

          <div className="flex gap-3">
            <div className="relative">
              <Filter
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                size={18}
              />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="pl-10 pr-8 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer text-gray-900"
              >
                <option value="all">Todas las categorías</option>
                <option value="core">Core</option>
                <option value="modules">Módulos</option>
                <option value="experimental">Experimental</option>
                <option value="ui">Interfaz</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer text-gray-900"
            >
              <option value="all">Todos los estados</option>
              <option value="enabled">Activas</option>
              <option value="disabled">Inactivas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-8">
        {categories.map((category) => {
          const colors = getCategoryColors(category.color);

          return (
            <div key={category.id} className="space-y-6">
              {/* Category Header */}
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors.bg} ${colors.border} border`}
                >
                  <div className={colors.icon}>
                    {getCategoryIcon(category.icon)}
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {category.name}
                  </h2>
                  <p className="text-slate-600 text-sm">
                    {category.description}
                  </p>
                </div>
                <div className="ml-auto">
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${colors.bg} ${colors.text} ${colors.border} border`}
                  >
                    {category.flags.length} flag
                    {category.flags.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {/* Category Flags */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {category.flags.map((flag) => (
                  <FeatureFlagCard
                    key={flag.id}
                    flag={flag}
                    onToggle={handleToggle}
                    dependencies={flagData.filter((f) =>
                      flag.dependencies?.includes(f.id)
                    )}
                    hasChanges={flags[flag.id] !== originalFlags[flag.id]}
                    isLoading={isLoading}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredFlags.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Flag className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No se encontraron feature flags
          </h3>
          <p className="text-slate-500 mb-6">
            Intenta ajustar los filtros de búsqueda.
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setFilterCategory("all");
              setFilterStatus("all");
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Limpiar filtros
          </button>
        </div>
      )}

      {/* System Status */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">
                Estado del Sistema
              </h3>
              <p className="text-sm text-slate-600">
                {stats.enabledFlags} de {stats.totalFlags} funcionalidades
                activas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-emerald-700">
              Sistema operativo
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
