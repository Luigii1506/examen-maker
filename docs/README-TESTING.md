# 🧪 Sistema de Testing Completo - Next.js 15

> **Testing enterprise-grade para tu boilerplate Next.js**

## 🎯 Resumen

Este boilerplate incluye un **sistema de testing completo** y **production-ready** que facilita el desarrollo con confianza. Incluye **unit tests**, **integration tests** y **E2E tests** con las mejores herramientas del ecosistema.

## 🛠️ Stack de Testing

### **🧪 Unit & Integration Tests**

- **Jest** - Test runner moderno y rápido
- **React Testing Library** - Testing de componentes centrado en el usuario
- **@testing-library/user-event** - Simulación realista de eventos
- **@testing-library/jest-dom** - Matchers adicionales para DOM

### **🎭 E2E Tests**

- **Playwright** - Testing End-to-End moderno y confiable
- **Multi-browser** - Chrome, Firefox, Safari, Mobile
- **Visual testing** - Screenshots y comparaciones
- **Video recording** - Grabación automática en fallos

### **🎪 Mocking & Utilities**

- **MSW** - Mock Service Worker para APIs
- **Custom helpers** - Utilidades específicas para el dominio
- **Test data** - Datos de prueba reutilizables
- **Custom matchers** - Matchers específicos para la aplicación

## 📁 Estructura del Testing

```
📂 Testing Architecture
├── 🧪 jest.config.mjs         # Configuración de Jest
├── 🎭 playwright.config.ts    # Configuración de Playwright
├── 📁 __tests__/              # Tests globales y setup
│   ├── setup/                 # Configuración global de Jest
│   ├── mocks/                 # Mocks globales
│   ├── fixtures/              # Datos de prueba globales
│   └── utils/                 # Utilidades de testing globales
├── 📁 e2e/                    # Tests End-to-End
│   ├── tests/                 # Tests E2E por feature
│   ├── page-objects/          # Page Object Model
│   ├── fixtures/              # Datos para E2E
│   └── utils/                 # Utilidades E2E
├── 📁 src/shared/testing/     # Utilidades compartidas
│   ├── render-helpers.tsx     # Helpers para renderizar
│   ├── mock-helpers.ts        # Utilidades de mocking
│   ├── test-data.ts           # Datos de prueba
│   ├── matchers.ts            # Matchers personalizados
│   └── README.md              # Documentación detallada
└── 📁 src/**/\__tests__/       # Tests por dominio
    ├── core/\__tests__/        # Tests del core
    ├── modules/\__tests__/     # Tests de módulos
    └── shared/\__tests__/      # Tests de shared
```

## 🚀 Comandos de Testing

### **🧪 Unit & Integration Tests**

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch
npm run test:watch

# Ejecutar tests con coverage
npm run test:coverage

# Ejecutar solo unit tests
npm run test:unit

# Ejecutar solo integration tests
npm run test:integration
```

### **🎭 E2E Tests**

```bash
# Ejecutar todos los E2E tests
npm run test:e2e

# Ejecutar E2E tests con UI visual
npm run test:e2e:ui

# Ejecutar E2E tests en modo headed (ver browser)
npm run test:e2e:headed

# Debug E2E tests paso a paso
npm run test:e2e:debug

# Ejecutar TODOS los tests (unit + E2E)
npm run test:all
```

## 📋 Ejemplos Rápidos

### **🧩 Test de Componente**

```typescript
import { renderWithProviders, testUsers } from "@/shared/testing";
import { UserProfile } from "./UserProfile";

describe("UserProfile", () => {
  it("should display user information", () => {
    const { getByTestId } = renderWithProviders(
      <UserProfile user={testUsers.admin} />
    );

    expect(getByTestId("user-name")).toBeTruthy();
    expect(getByTestId("user-email")).toBeTruthy();
  });

  it("should handle edit button click", async () => {
    const { getByTestId, user } = renderWithProviders(
      <UserProfile user={testUsers.admin} />
    );

    await user.click(getByTestId("edit-button"));
    expect(getByTestId("edit-form")).toBeTruthy();
  });
});
```

### **🔐 Test con Autenticación**

```typescript
import { renderWithUser, renderAsGuest } from "@/shared/testing";
import { ProtectedPage } from "./ProtectedPage";

describe("ProtectedPage", () => {
  it("should show content for authenticated user", () => {
    const { getByTestId } = renderWithUser(<ProtectedPage />);
    expect(getByTestId("protected-content")).toBeTruthy();
  });

  it("should redirect guest to login", () => {
    const { getByTestId } = renderAsGuest(<ProtectedPage />);
    expect(getByTestId("login-redirect")).toBeTruthy();
  });
});
```

### **🎛️ Test con Feature Flags**

```typescript
import { renderWithFeatureFlags } from "@/shared/testing";
import { ConditionalFeature } from "./ConditionalFeature";

describe("ConditionalFeature", () => {
  it("should show feature when enabled", () => {
    const { getByTestId } = renderWithFeatureFlags(<ConditionalFeature />, {
      FILE_UPLOAD: true,
    });

    expect(getByTestId("file-upload")).toBeTruthy();
  });
});
```

### **🌐 E2E Test Example**

```typescript
import { test, expect } from "@playwright/test";

test("user can login and access dashboard", async ({ page }) => {
  await page.goto("/login");

  await page.fill('[data-testid="email-input"]', "user@example.com");
  await page.fill('[data-testid="password-input"]', "password123");
  await page.click('[data-testid="login-button"]');

  await expect(page).toHaveURL("/dashboard");
  await expect(page.getByTestId("welcome-message")).toBeVisible();
});
```

## 🎯 Filosofía de Testing

### **🏗️ Arquitectura Modular**

Los tests siguen la **misma estructura modular** que la aplicación:

- **Core tests** - Para funcionalidades fundamentales
- **Module tests** - Para módulos específicos
- **Shared tests** - Para utilidades compartidas
- **E2E tests** - Para flujos de usuario completos

### **👤 User-Centric Testing**

- **Enfoque en comportamiento** del usuario, no implementación
- **Uso de data-testid** para elementos testeable
- **Simulación realista** de interacciones
- **Testing de accesibilidad** integrado

### **🔄 Test-Driven Development**

- **Write tests first** para nuevas features
- **Red-Green-Refactor** cycle
- **High test coverage** (objetivo: 80%+)
- **Fast feedback** loops

## 📊 Coverage y Reporting

### **📈 Coverage Reports**

```bash
# Generar reporte de coverage
npm run test:coverage

# Ver reporte HTML
open coverage/lcov-report/index.html
```

### **📋 Coverage Goals**

- **Líneas de código**: 80%+
- **Funciones**: 85%+
- **Branches**: 75%+
- **Statements**: 80%+

### **🎭 E2E Reports**

```bash
# Ver resultados de E2E tests
open e2e-results/html/index.html

# Ver videos de tests fallidos
ls e2e-results/artifacts/
```

## 🛠️ Configuración y Setup

### **🔧 Jest Configuration**

- **Next.js integration** optimizada
- **TypeScript** support completo
- **Path aliases** configurados (@/ imports)
- **Coverage thresholds** establecidos
- **Custom matchers** incluidos

### **🎭 Playwright Configuration**

- **Multi-browser** testing
- **Mobile and tablet** testing
- **Screenshot** y video recording
- **Parallel execution** optimizada
- **CI/CD** ready

### **🎪 Mock Configuration**

- **API mocking** con MSW
- **Component mocking** automático
- **Service mocking** por dominio
- **Test data** factories

## 🚨 Debugging Tests

### **🧪 Unit Tests Debugging**

```typescript
import { screen } from "@testing-library/react";

// Debug DOM completo
screen.debug();

// Debug elemento específico
screen.debug(screen.getByTestId("my-element"));

// Ver queries disponibles
screen.logTestingPlaygroundURL();
```

### **🎭 E2E Tests Debugging**

```bash
# Ejecutar en modo debug
npm run test:e2e:debug

# Ejecutar con browser visible
npm run test:e2e:headed

# Usar Playwright UI para debug interactivo
npm run test:e2e:ui
```

## 📚 Recursos y Documentación

### **🔗 Enlaces Útiles**

- **[Jest Documentation](https://jestjs.io/docs/getting-started)**
- **[React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)**
- **[Playwright Documentation](https://playwright.dev/docs/intro)**
- **[Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)**

### **📖 Documentación Interna**

- **[Shared Testing Utils](./src/shared/testing/README.md)** - Utilidades compartidas
- **[Core Testing](./src/core/__tests__/)** - Tests del core
- **[Module Testing](./src/modules/)** - Tests de módulos

## 🎉 Getting Started

### **1. 🏃‍♂️ Ejecutar Tests Existentes**

```bash
# Verificar que todo funciona
npm test

# Ver coverage actual
npm run test:coverage
```

### **2. ✍️ Escribir Tu Primer Test**

```typescript
// src/components/__tests__/MyComponent.test.tsx
import { renderWithProviders } from "@/shared/testing";
import { MyComponent } from "../MyComponent";

describe("MyComponent", () => {
  it("should render correctly", () => {
    const { getByTestId } = renderWithProviders(<MyComponent />);
    expect(getByTestId("my-component")).toBeTruthy();
  });
});
```

### **3. 🎭 Ejecutar E2E Tests**

```bash
npm run test:e2e
```

---

**🚀 ¡Tu boilerplate está listo para development con máxima confianza!** Cada feature que agregues tendrá testing robusto desde el día uno.

**💡 Tip:** Usa `npm run test:watch` durante development para feedback instantáneo mientras codificas.
