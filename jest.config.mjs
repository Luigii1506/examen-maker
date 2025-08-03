// 🧪 JEST CONFIGURATION FOR NEXT.JS 15
// =====================================
// Configuración de Jest optimizada para testing completo

/** @type {import('jest').Config} */
const config = {
  // 🌍 Test Environment
  testEnvironment: "jsdom",

  // 📁 Setup Files
  setupFilesAfterEnv: ["<rootDir>/__tests__/setup/jest.setup.js"],

  // 🎯 Test Match Patterns
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}",
    "<rootDir>/__tests__/**/*.test.{js,jsx,ts,tsx}",
    "<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}",
  ],

  // 🚫 Ignore Patterns
  testPathIgnorePatterns: [
    "<rootDir>/.next/",
    "<rootDir>/node_modules/",
    "<rootDir>/e2e/",
  ],

  // 🔧 Module Name Mapping (path aliases)
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@/__tests__/(.*)$": "<rootDir>/__tests__/$1",
  },

  // 📊 Coverage Configuration
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.stories.{js,jsx,ts,tsx}",
    "!src/**/__tests__/**",
    "!src/**/node_modules/**",
  ],

  // 📂 Coverage Directory
  coverageDirectory: "<rootDir>/coverage",

  // 🎨 Coverage Reporters
  coverageReporters: ["text", "lcov", "html"],

  // ⚡ Transform
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": ["babel-jest", { presets: ["next/babel"] }],
  },

  // 🔧 Module File Extensions
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],

  // 🎭 Test Environment Options
  testEnvironmentOptions: {
    url: "http://localhost:3000",
  },

  // ⏱️ Test Timeout
  testTimeout: 10000,

  // 🔄 Max Workers (parallel execution)
  maxWorkers: "50%",
};

export default config;
