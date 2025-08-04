"use client";

import { useState } from "react";
import { Button, Card, Badge } from "@/core/components";
import {
  Save,
  RefreshCw,
  Bell,
  Shield,
  Database,
  Mail,
  Key,
  Globe,
  Clock,
  Users,
  FileText,
  AlertTriangle,
  CheckCircle,
  Settings,
} from "lucide-react";

// Mock system settings - later this will come from database/API
const mockSystemSettings = {
  general: {
    systemName: "AML Certification System",
    systemVersion: "2.1.4",
    maintenanceMode: false,
    allowRegistration: true,
    defaultLanguage: "en",
    timezone: "America/Mexico_City",
  },
  exam: {
    maxAttempts: 3,
    timeWarningMinutes: 10,
    autoSubmitOnTimeout: true,
    allowReviewMarked: true,
    showResultsImmediately: false,
    passingScore: 70,
  },
  certificate: {
    validityMonths: 24,
    autoRenewalDays: 30,
    requireManualApproval: false,
    templateFormat: "PDF",
    includeQRCode: true,
    digitalSignature: true,
  },
  notifications: {
    emailEnabled: true,
    smsEnabled: false,
    examReminders: true,
    certificateExpiry: true,
    systemUpdates: true,
    adminAlerts: true,
  },
  security: {
    sessionTimeout: 30,
    passwordComplexity: "medium",
    twoFactorRequired: false,
    ipWhitelist: "",
    auditLogging: true,
    encryptionLevel: "AES-256",
  },
};

export default function SystemSettingsView() {
  const [settings, setSettings] = useState(mockSystemSettings);
  const [activeTab, setActiveTab] = useState("general");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const updateSetting = (
    category: string,
    key: string,
    value: string | number | boolean
  ) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value,
      },
    }));
    setHasUnsavedChanges(true);
  };

  const saveSettings = () => {
    console.log("Saving settings...", settings);
    setHasUnsavedChanges(false);
    // Implement save logic here
  };

  const resetToDefaults = () => {
    setSettings(mockSystemSettings);
    setHasUnsavedChanges(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
          <p className="text-gray-600">
            Configure system-wide settings and preferences
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={resetToDefaults}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={saveSettings}
            disabled={!hasUnsavedChanges}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Unsaved Changes Alert */}
      {hasUnsavedChanges && (
        <Card className="border-yellow-200 bg-yellow-50 p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-yellow-800">
                You have unsaved changes
              </p>
              <p className="text-sm text-yellow-700">
                Remember to save your changes before leaving this page.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">System Status</p>
              <p className="text-lg font-bold text-green-600">Online</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Version</p>
              <p className="text-lg font-bold text-gray-900">
                {settings.general.systemVersion}
              </p>
            </div>
            <Settings className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Maintenance</p>
              <p
                className={`text-lg font-bold ${
                  settings.general.maintenanceMode
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {settings.general.maintenanceMode ? "Active" : "Inactive"}
              </p>
            </div>
            <AlertTriangle
              className={`h-8 w-8 ${
                settings.general.maintenanceMode
                  ? "text-red-600"
                  : "text-gray-400"
              }`}
            />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Security</p>
              <p className="text-lg font-bold text-gray-900">
                {settings.security.encryptionLevel}
              </p>
            </div>
            <Shield className="h-8 w-8 text-purple-600" />
          </div>
        </Card>
      </div>

      {/* Settings Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: "general", name: "General", icon: Settings },
            { id: "exam", name: "Exams", icon: FileText },
            { id: "certificate", name: "Certificates", icon: Shield },
            { id: "notifications", name: "Notifications", icon: Bell },
            { id: "security", name: "Security", icon: Key },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* General Settings */}
      {activeTab === "general" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              System Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  System Name
                </label>
                <input
                  type="text"
                  value={settings.general.systemName}
                  onChange={(e) =>
                    updateSetting("general", "systemName", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Language
                </label>
                <select
                  value={settings.general.defaultLanguage}
                  onChange={(e) =>
                    updateSetting("general", "defaultLanguage", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Timezone
                </label>
                <select
                  value={settings.general.timezone}
                  onChange={(e) =>
                    updateSetting("general", "timezone", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="America/Mexico_City">
                    Mexico City (GMT-6)
                  </option>
                  <option value="America/New_York">New York (GMT-5)</option>
                  <option value="UTC">UTC (GMT+0)</option>
                </select>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              System Options
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Maintenance Mode
                  </p>
                  <p className="text-xs text-gray-500">
                    Temporarily disable system access
                  </p>
                </div>
                <button
                  onClick={() =>
                    updateSetting(
                      "general",
                      "maintenanceMode",
                      !settings.general.maintenanceMode
                    )
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.general.maintenanceMode
                      ? "bg-red-600"
                      : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.general.maintenanceMode
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Allow Registration
                  </p>
                  <p className="text-xs text-gray-500">
                    Enable new user registration
                  </p>
                </div>
                <button
                  onClick={() =>
                    updateSetting(
                      "general",
                      "allowRegistration",
                      !settings.general.allowRegistration
                    )
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.general.allowRegistration
                      ? "bg-blue-600"
                      : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.general.allowRegistration
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Exam Settings */}
      {activeTab === "exam" && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Exam Configuration
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Attempts
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={settings.exam.maxAttempts}
                  onChange={(e) =>
                    updateSetting(
                      "exam",
                      "maxAttempts",
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time Warning (minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={settings.exam.timeWarningMinutes}
                  onChange={(e) =>
                    updateSetting(
                      "exam",
                      "timeWarningMinutes",
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Passing Score (%)
                </label>
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={settings.exam.passingScore}
                  onChange={(e) =>
                    updateSetting(
                      "exam",
                      "passingScore",
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Auto-submit on timeout
                  </p>
                  <p className="text-xs text-gray-500">
                    Automatically submit when time expires
                  </p>
                </div>
                <button
                  onClick={() =>
                    updateSetting(
                      "exam",
                      "autoSubmitOnTimeout",
                      !settings.exam.autoSubmitOnTimeout
                    )
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.exam.autoSubmitOnTimeout
                      ? "bg-blue-600"
                      : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.exam.autoSubmitOnTimeout
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Allow review marked questions
                  </p>
                  <p className="text-xs text-gray-500">
                    Let candidates review flagged questions
                  </p>
                </div>
                <button
                  onClick={() =>
                    updateSetting(
                      "exam",
                      "allowReviewMarked",
                      !settings.exam.allowReviewMarked
                    )
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.exam.allowReviewMarked
                      ? "bg-blue-600"
                      : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.exam.allowReviewMarked
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Show results immediately
                  </p>
                  <p className="text-xs text-gray-500">
                    Display scores after exam completion
                  </p>
                </div>
                <button
                  onClick={() =>
                    updateSetting(
                      "exam",
                      "showResultsImmediately",
                      !settings.exam.showResultsImmediately
                    )
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.exam.showResultsImmediately
                      ? "bg-blue-600"
                      : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.exam.showResultsImmediately
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Other tabs would be implemented similarly */}
      {activeTab !== "general" && activeTab !== "exam" && (
        <Card className="p-12 text-center">
          <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Settings
          </h3>
          <p className="text-gray-600">
            Configuration options for {activeTab} will be implemented here.
          </p>
        </Card>
      )}
    </div>
  );
}
