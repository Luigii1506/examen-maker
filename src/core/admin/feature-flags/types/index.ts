// 🎛️ FEATURE FLAGS ADMIN TYPES
// ============================
// Tipos para la interfaz de administración de feature flags

import { FeatureFlag, FeatureGroup } from "@/core/config/feature-flags";

export interface FeatureFlagState {
  [key: string]: boolean;
}

export interface NotificationState {
  type: "success" | "error" | "info";
  message: string;
}

export interface FeatureFlagStats {
  totalFlags: number;
  enabledFlags: number;
  coreFlags: number;
  moduleFlags: number;
  experimentalFlags: number;
  uiFlags: number;
  adminFlags: number;
}

export interface FeatureFlagCardData {
  id: FeatureFlag;
  name: string;
  description: string;
  category: FeatureGroup;
  enabled: boolean;
  icon: string;
  isPremium?: boolean;
  dependencies?: FeatureFlag[];
  lastModified: string;
  modifiedBy: string;
}

export interface FeatureFlagCategory {
  id: FeatureGroup;
  name: string;
  description: string;
  icon: string;
  color: string;
  flags: FeatureFlagCardData[];
}
