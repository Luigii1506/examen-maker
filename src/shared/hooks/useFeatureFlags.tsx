// 🎛️ FEATURE FLAGS HOOK & CONTEXT
// ================================
// Hook React real para controlar feature flags dinámicamente

"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { FEATURE_FLAGS, type FeatureFlag } from "@/core/config/feature-flags";

// 📊 Tipos para el estado dinámico
type FeatureFlagOverrides = Partial<Record<FeatureFlag, boolean>>;

interface FeatureFlagsContextType {
  // Verificar si una feature está habilitada
  isEnabled: (flag: FeatureFlag) => boolean;

  // Alternar una feature (solo admin)
  toggle: (flag: FeatureFlag) => void;

  // Habilitar/deshabilitar múltiples features
  setBatch: (flags: FeatureFlagOverrides) => void;

  // Obtener todas las flags y su estado
  getAllFlags: () => Record<FeatureFlag, boolean>;

  // Resetear overrides
  reset: () => void;

  // Estado de carga
  isLoading: boolean;
}

// 🧠 Contexto
const FeatureFlagsContext = createContext<FeatureFlagsContextType | null>(null);

// 🎯 Hook principal
export function useFeatureFlags(): FeatureFlagsContextType {
  const context = useContext(FeatureFlagsContext);
  if (!context) {
    throw new Error(
      "useFeatureFlags debe usarse dentro de FeatureFlagsProvider"
    );
  }
  return context;
}

// 🔧 Hook simplificado para una sola flag
export function useFeatureFlag(flag: FeatureFlag): boolean {
  const { isEnabled } = useFeatureFlags();
  return isEnabled(flag);
}

// 📦 Provider Component
interface FeatureFlagsProviderProps {
  children: ReactNode;
}

export function FeatureFlagsProvider({ children }: FeatureFlagsProviderProps) {
  const [overrides, setOverrides] = useState<FeatureFlagOverrides>({});
  const [isLoading, setIsLoading] = useState(true);

  // 💾 Cargar overrides del localStorage al inicio
  useEffect(() => {
    try {
      const saved = localStorage.getItem("feature-flags-overrides");
      if (saved) {
        const parsed = JSON.parse(saved);
        setOverrides(parsed);
      }
    } catch (error) {
      console.warn("Error cargando feature flags:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 💾 Guardar cambios en localStorage
  const saveOverrides = (newOverrides: FeatureFlagOverrides) => {
    try {
      localStorage.setItem(
        "feature-flags-overrides",
        JSON.stringify(newOverrides)
      );
      setOverrides(newOverrides);
    } catch (error) {
      console.error("Error guardando feature flags:", error);
    }
  };

  // 🔍 Verificar si una feature está habilitada
  const isEnabled = (flag: FeatureFlag): boolean => {
    // Si hay un override, usarlo
    if (flag in overrides) {
      return overrides[flag] as boolean;
    }

    // Sino, usar el valor por defecto
    return FEATURE_FLAGS[flag];
  };

  // 🔄 Alternar una feature
  const toggle = (flag: FeatureFlag) => {
    const newOverrides = {
      ...overrides,
      [flag]: !isEnabled(flag),
    };
    saveOverrides(newOverrides);
  };

  // 📊 Establecer múltiples flags
  const setBatch = (flags: FeatureFlagOverrides) => {
    const newOverrides = {
      ...overrides,
      ...flags,
    };
    saveOverrides(newOverrides);
  };

  // 📋 Obtener todas las flags
  const getAllFlags = (): Record<FeatureFlag, boolean> => {
    const allFlags = {} as Record<FeatureFlag, boolean>;

    Object.keys(FEATURE_FLAGS).forEach((flag) => {
      allFlags[flag as FeatureFlag] = isEnabled(flag as FeatureFlag);
    });

    return allFlags;
  };

  // 🔄 Resetear overrides
  const reset = () => {
    localStorage.removeItem("feature-flags-overrides");
    setOverrides({});
  };

  const value: FeatureFlagsContextType = {
    isEnabled,
    toggle,
    setBatch,
    getAllFlags,
    reset,
    isLoading,
  };

  return (
    <FeatureFlagsContext.Provider value={value}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

// 🛡️ HOC para proteger componentes con feature flags
export function withFeatureFlag<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredFlag: FeatureFlag,
  fallback?: React.ComponentType<P> | React.ReactNode
) {
  return function FeatureFlagWrapper(props: P) {
    const isEnabled = useFeatureFlag(requiredFlag);

    if (!isEnabled) {
      if (fallback) {
        if (React.isValidElement(fallback)) {
          return fallback as React.ReactElement;
        }
        const FallbackComponent = fallback as React.ComponentType<P>;
        return <FallbackComponent {...props} />;
      }
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}

// 🧩 Componente para renderizado condicional
interface FeatureGateProps {
  flag: FeatureFlag;
  children: ReactNode;
  fallback?: ReactNode;
}

export function FeatureGate({
  flag,
  children,
  fallback = null,
}: FeatureGateProps) {
  const isEnabled = useFeatureFlag(flag);

  return isEnabled ? <>{children}</> : <>{fallback}</>;
}
