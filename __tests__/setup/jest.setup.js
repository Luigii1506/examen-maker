// 🧪 JEST GLOBAL SETUP
// ===================
// Configuración global para todos los tests

import "@testing-library/jest-dom";

// 🎭 Mock implementations globales
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// 🌐 Mock de ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// 📍 Mock de IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  unobserve: jest.fn(),
}));

// 🗂️ Mock de File APIs
Object.defineProperty(window, "File", {
  writable: true,
  value: jest.fn().mockImplementation((fileBits, fileName, options) => {
    return {
      name: fileName,
      size: fileBits.length,
      type: options?.type || "text/plain",
      lastModified: Date.now(),
    };
  }),
});

Object.defineProperty(window, "FileReader", {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    readAsDataURL: jest.fn(),
    readAsText: jest.fn(),
    onload: null,
    onerror: null,
    result: null,
  })),
});

// 🌍 Variables de entorno para testing
process.env.NODE_ENV = "test";
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";

// 🚫 Suprimir warnings específicos en tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Warning: ReactDOM.render is deprecated")
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// 🧹 Cleanup después de cada test
afterEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
});

// ⏱️ Setup de fake timers por defecto
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});
