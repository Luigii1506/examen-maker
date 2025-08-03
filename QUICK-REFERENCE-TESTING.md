# 🎓 Guía Completa de Testing para Principiantes

> **Todo lo que necesitas saber para implementar testing en tu aplicación Next.js**

## 📚 Tabla de Contenidos

1. [¿Qué es Testing?](#-qué-es-testing)
2. [Tipos de Testing](#-tipos-de-testing)
3. [Herramientas que Usamos](#-herramientas-que-usamos)
4. [Estructura de Archivos](#-estructura-de-archivos)
5. [Tu Primer Test](#-tu-primer-test)
6. [Tests por Tipo](#-tests-por-tipo)
7. [Agregar Tests a Módulos](#-agregar-tests-a-módulos)
8. [Ejemplos Prácticos](#-ejemplos-prácticos)
9. [Troubleshooting](#-troubleshooting)

---

## 🤔 ¿Qué es Testing?

### **📝 Definición Simple**

**Testing** es escribir código que **verifica que tu código funciona correctamente**. Es como tener un **asistente automático** que revisa que todo funcione como esperas.

### **🎯 ¿Por Qué Hacer Testing?**

```javascript
// ❌ Sin tests - No sabes si algo se rompió
function sumar(a, b) {
  return a + b; // ¿Funciona? ¿Qué pasa si envío strings?
}

// ✅ Con tests - Tienes certeza de que funciona
test("should add two numbers correctly", () => {
  expect(sumar(2, 3)).toBe(5); // ✓ Funciona con números
  expect(sumar(-1, 1)).toBe(0); // ✓ Funciona con negativos
  expect(sumar(0, 0)).toBe(0); // ✓ Funciona con ceros
});
```

### **🚀 Beneficios del Testing**

- **🛡️ Confianza** - Sabes que tu código funciona
- **🔄 Refactoring seguro** - Puedes cambiar código sin miedo
- **🐛 Detectar bugs** antes de que lleguen a producción
- **📖 Documentación** - Los tests muestran cómo usar tu código
- **⚡ Desarrollo más rápido** - Menos tiempo debuggeando

---

## 🎯 Tipos de Testing

### **1. 🧪 Unit Tests (Tests Unitarios)**

**Qué son:** Prueban **una función o componente** por separado.

```javascript
// 🎯 Testing de una función
function formatPrice(price) {
  return `$${price.toFixed(2)}`;
}

// Test unitario
test("should format price correctly", () => {
  expect(formatPrice(10)).toBe("$10.00");
  expect(formatPrice(9.99)).toBe("$9.99");
});
```

### **2. 🔗 Integration Tests (Tests de Integración)**

**Qué son:** Prueban que **varios componentes trabajen juntos**.

```javascript
// 🎯 Testing de un componente con hooks y API
function UserProfile({ userId }) {
  const user = useUser(userId); // Hook que llama API

  if (!user) return <div>Loading...</div>;
  return <div>{user.name}</div>;
}

// Test de integración
test("should display user name after loading", async () => {
  render(<UserProfile userId="123" />);
  expect(screen.getByText("Loading...")).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });
});
```

### **3. 🎭 E2E Tests (Tests End-to-End)**

**Qué son:** Prueban **flujos completos de usuario** en el navegador real.

```javascript
// 🎯 Testing de un flujo completo de login
test("user can login and see dashboard", async ({ page }) => {
  // 1. Ir a la página de login
  await page.goto("/login");

  // 2. Llenar el formulario
  await page.fill("#email", "user@example.com");
  await page.fill("#password", "password123");

  // 3. Hacer click en login
  await page.click("#login-button");

  // 4. Verificar que llegó al dashboard
  await expect(page).toHaveURL("/dashboard");
  await expect(page.getByText("Welcome!")).toBeVisible();
});
```

---

## 🛠️ Herramientas que Usamos

### **🧪 Jest** - Test Runner

**Qué hace:** Ejecuta tus tests y te dice si pasan o fallan.

```javascript
// Jest provee estas funciones globales:
describe("Calculator", () => {
  // Agrupa tests relacionados
  test("should add numbers", () => {
    // Define un test individual
    expect(2 + 2).toBe(4); // Verifica el resultado
  });
});
```

### **🎭 React Testing Library** - Testing de Componentes

**Qué hace:** Te ayuda a probar componentes React como lo haría un usuario.

```javascript
import { render, screen } from "@testing-library/react";

// Renderiza un componente y lo pone en un DOM virtual
render(<Button>Click me</Button>);

// Busca elementos como lo haría un usuario
const button = screen.getByText("Click me");
expect(button).toBeInTheDocument();
```

### **🎪 Playwright** - Testing E2E

**Qué hace:** Controla un navegador real y simula acciones de usuario.

```javascript
// Playwright controla Chrome, Firefox, Safari
await page.goto("https://tu-app.com");
await page.click("button");
await page.fill("input", "texto");
```

---

## 📁 Estructura de Archivos

### **🗂️ Dónde Poner Cada Tipo de Test**

```
<code_block_to_apply_changes_from>
```

### **📋 Reglas de Naming**

```
✅ Correcto:
- Button.test.tsx          # Unit test
- UserAuth.integration.test.ts  # Integration test
- login-flow.spec.ts       # E2E test

❌ Incorrecto:
- buttontest.tsx
- test-button.tsx
- Button.js                # Usar .test.tsx/.test.ts
```

---

## 🏃‍♂️ Tu Primer Test

### **Paso 1: Crear un Componente Simple**

```typescript
// 🎯 Testing de un flujo completo de login
test("user can login and see dashboard", async ({ page }) => {
  // 1. Ir a la página de login
  await page.goto("/login");

  // 2. Llenar el formulario
  await page.fill("#email", "user@example.com");
  await page.fill("#password", "password123");

  // 3. Hacer click en login
  await page.click("#login-button");

  // 4. Verificar que llegó al dashboard
  await expect(page).toHaveURL("/dashboard");
  await expect(page.getByText("Welcome!")).toBeVisible();
});
```

## 🔗 Integration Tests - Template

```typescript
// src/components/__tests__/MyComponent.test.tsx
import React from "react";
import { renderWithProviders } from "@/shared/testing";
import { MyComponent } from "../MyComponent";

describe("MyComponent", () => {
  test("should render correctly", () => {
    const { getByTestId } = renderWithProviders(<MyComponent prop="value" />);

    expect(getByTestId("my-component")).toBeTruthy();
  });

  test("should handle user interactions", () => {
    const mockCallback = jest.fn();
    const { getByTestId } = renderWithProviders(
      <MyComponent onClick={mockCallback} />
    );

    getByTestId("button").click();
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  test("should handle async operations", async () => {
    const { getByTestId } = renderWithProviders(<AsyncComponent />);

    expect(getByTestId("loading")).toBeTruthy();

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(getByTestId("loaded-content")).toBeTruthy();
  });
});
```

## 🎭 E2E Tests - Template

```typescript
// e2e/tests/user-flow.spec.ts
import { test, expect } from "@playwright/test";

describe("User Flow", () => {
  test("user can complete main workflow", async ({ page }) => {
    // 1. Navegar
    await page.goto("/login");

    // 2. Interactuar
    await page.fill('[data-testid="email"]', "user@example.com");
    await page.fill('[data-testid="password"]', "password123");
    await page.click('[data-testid="login-button"]');

    // 3. Verificar resultado
    await expect(page).toHaveURL("/dashboard");
    await expect(page.getByTestId("welcome")).toBeVisible();
  });
});
```

## 🔍 Buscar Elementos

### **React Testing Library**

```typescript
// Por data-testid (RECOMENDADO)
getByTestId("my-button");
queryByTestId("maybe-missing"); // Retorna null si no existe

// Por texto visible
getByText("Click me");
getByText(/Click/i); // Regex case-insensitive

// Por rol accesible
getByRole("button");
getByRole("button", { name: "Submit" });

// Por placeholder
getByPlaceholderText("Enter email");

// Por etiqueta
getByLabelText("Email address");
```

### **Playwright**

```typescript
// Por data-testid
page.getByTestId("my-button");
page.locator('[data-testid="my-button"]');

// Por texto
page.getByText("Click me");
page.getByRole("button", { name: "Submit" });

// Por selector CSS
page.locator(".my-class");
page.locator("#my-id");
```

## ✅ Verificaciones (Expect)

### **Jest Básico**

```typescript
// Igualdad
expect(value).toBe(expected); // Igualdad exacta
expect(value).toEqual(expected); // Igualdad profunda
expect(value).not.toBe(unexpected); // No igual

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();

// Números
expect(number).toBeGreaterThan(5);
expect(number).toBeLessThanOrEqual(10);
expect(number).toBeCloseTo(9.999, 2);

// Strings
expect(string).toContain("substring");
expect(string).toMatch(/regex/);
expect(string).toHaveLength(5);

// Arrays
expect(array).toHaveLength(3);
expect(array).toContain("item");
expect(array).toEqual(["a", "b", "c"]);

// Functions
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledTimes(2);
expect(mockFn).toHaveBeenCalledWith("arg1", "arg2");

// Errors
expect(() => dangerousFunction()).toThrow();
expect(() => dangerousFunction()).toThrow("specific error");
```

### **DOM Elements**

```typescript
// Existencia
expect(element).toBeTruthy(); // Elemento existe
expect(element).toBeFalsy(); // Elemento no existe

// Contenido
expect(element.textContent).toBe("Expected text");
expect(element.textContent).toContain("partial");

// Atributos
expect(element.getAttribute("href")).toBe("/link");
expect((element as HTMLInputElement).value).toBe("input value");
expect((element as HTMLButtonElement).disabled).toBe(true);

// CSS Classes
expect(element.className).toContain("active");
expect(element.classList.contains("active")).toBe(true);
```

### **Playwright**

```typescript
// Visibilidad
await expect(page.getByTestId("element")).toBeVisible();
await expect(page.getByTestId("element")).toBeHidden();

// Contenido
await expect(page.getByTestId("element")).toHaveText("Expected");
await expect(page.getByTestId("element")).toContainText("partial");

// Estados
await expect(page.getByTestId("button")).toBeEnabled();
await expect(page.getByTestId("button")).toBeDisabled();
await expect(page.getByTestId("input")).toBeFocused();

// URLs
await expect(page).toHaveURL("/expected-path");
await expect(page).toHaveTitle(/Expected Title/);

// Conteo
await expect(page.getByTestId("item")).toHaveCount(5);
```

## 🎪 Mocks y Testing Utilities

### **Jest Mocks**

```typescript
// Función mock
const mockFn = jest.fn();
const mockFn = jest.fn().mockReturnValue("default");
const mockFn = jest.fn().mockResolvedValue("async result");

// Mock módulo completo
jest.mock("../module", () => ({
  myFunction: jest.fn().mockReturnValue("mocked"),
}));

// Mock específico
jest.spyOn(module, "functionName").mockImplementation(() => "mocked");
```

### **Shared Testing Utilities**

```typescript
import {
  renderWithProviders,
  renderWithUser,
  renderAsGuest,
  createMockUser,
  testUsers,
  testFeatureFlags,
} from "@/shared/testing";

// Renderizar con providers
const { getByTestId } = renderWithProviders(<Component />);

// Renderizar con usuario mock
const { getByTestId } = renderWithUser(<Component />);

// Usar datos de prueba
const user = testUsers.admin;
const flags = testFeatureFlags.allEnabled;
```

## 🎯 Convenciones de Naming

### **Tests**

```typescript
// ✅ Descriptivo y claro
describe("UserProfile Component", () => {
  test("should display user name and email", () => {});
  test("should show edit form when edit button clicked", () => {});
  test("should save changes when form submitted", () => {});
});

// ❌ Vago y confuso
describe("UserProfile", () => {
  test("should work", () => {});
  test("should render", () => {});
});
```

### **Data Test IDs**

```typescript
// ✅ Específico y único
<button data-testid="submit-login-form">Login</button>
<div data-testid="user-profile-card">...</div>
<span data-testid="error-message-email">Invalid email</span>

// ❌ Genérico y ambiguo
<button data-testid="button">Login</button>
<div data-testid="card">...</div>
<span data-testid="error">Invalid email</span>
```

## 🚨 Errores Comunes

| Error                                         | Solución                                           |
| --------------------------------------------- | -------------------------------------------------- |
| `Cannot find module '@/shared/testing'`       | Verificar que `src/shared/testing/index.ts` existe |
| `Property 'toBeInTheDocument' does not exist` | Usar `expect(element).toBeTruthy()`                |
| `Cannot read properties of null`              | Verificar que elemento existe antes de interactuar |
| `Test timeout`                                | Agregar `await` para operaciones asíncronas        |
| `act() warning`                               | Usar `user-event` o envolver en `act()`            |

## 📊 Coverage Goals

```bash
# Objetivos de cobertura
Lines: 80%+         # Líneas de código ejecutadas
Functions: 85%+     # Funciones ejecutadas
Branches: 75%+      # Ramas (if/else) ejecutadas
Statements: 80%+    # Statements ejecutados

# Ver coverage
npm run test:coverage
open coverage/lcov-report/index.html
```

## 🎨 Patrones Útiles

### **AAA Pattern**

```typescript
test("should calculate total price", () => {
  // 🔧 Arrange - Preparar datos
  const items = [{ price: 10 }, { price: 20 }];

  // 🎬 Act - Ejecutar función
  const total = calculateTotal(items);

  // ✅ Assert - Verificar resultado
  expect(total).toBe(30);
});
```

### **Data-Driven Tests**

```typescript
describe("formatPrice", () => {
  const testCases = [
    { input: 10, expected: "$10.00" },
    { input: 9.99, expected: "$9.99" },
    { input: 0, expected: "$0.00" },
  ];

  testCases.forEach(({ input, expected }) => {
    test(`should format ${input} as ${expected}`, () => {
      expect(formatPrice(input)).toBe(expected);
    });
  });
});
```

### **Setup/Teardown**

```typescript
describe("DatabaseService", () => {
  let service;

  beforeEach(() => {
    service = new DatabaseService();
    service.connect();
  });

  afterEach(() => {
    service.disconnect();
    jest.clearAllMocks();
  });

  test("should save data", () => {
    // Test logic
  });
});
```

---

## 🎉 ¡Listo para Testing!

**💡 Recuerda:**

- Empieza con tests simples
- Usa `data-testid` para elementos
- Un test = una verificación específica
- Tests legibles > Tests cleveres
- Coverage alto ≠ Tests buenos

**🎉 Happy Testing!**

📂 Tu Proyecto
├── 📁 src/
│ ├── 📁 core/
│ │ ├── 📁 components/
│ │ │ ├── Button.tsx
│ │ │ └── 📁 **tests**/
│ │ │ └── Button.test.tsx # ✅ Unit test del componente
│ │ ├── 📁 auth/
│ │ │ ├── hooks.ts
│ │ │ └── 📁 **tests**/
│ │ │ └── hooks.test.ts # ✅ Unit test de hooks
│ │ └── 📁 admin/
│ │ └── 📁 **tests**/
│ │ └── AdminLayout.test.tsx # ✅ Integration test
│ ├── 📁 modules/
│ │ └── 📁 file-upload/
│ │ ├── components/
│ │ └── 📁 **tests**/
│ │ └── FileUploader.test.tsx # ✅ Module tests
│ └── 📁 shared/
│ ├── 📁 utils/
│ │ ├── helpers.ts
│ │ └── 📁 **tests**/
│ │ └── helpers.test.ts # ✅ Utility tests
│ └── 📁 testing/ # ✅ Testing utilities
├── 📁 **tests**/ # ✅ Global test setup
└── 📁 e2e/ # ✅ E2E tests
└── 📁 tests/
├── auth.spec.ts # ✅ E2E: Login flow
├── dashboard.spec.ts # ✅ E2E: Dashboard
└── file-upload.spec.ts # ✅ E2E: File upload
