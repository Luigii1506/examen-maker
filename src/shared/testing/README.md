# 🧪 Testing System - Documentación

> **Sistema completo de testing para Next.js 15**

## 🎯 Propósito

Este directorio contiene todas las **utilidades de testing** compartidas que facilitan la escritura de tests consistentes y mantenibles en toda la aplicación.

## 📁 Estructura

```
testing/
├── 🎭 render-helpers.tsx     # Helpers para renderizar componentes
├── 🎪 mock-helpers.ts        # Utilidades para mocking
├── 🗂️ test-data.ts           # Datos de prueba reutilizables
├── 🎯 matchers.ts            # Matchers personalizados
├── 📤 index.ts               # Exportaciones públicas
└── 📖 README.md              # Esta documentación
```

## 🚀 Cómo Usar

### **🎭 Render Helpers**

```typescript
import {
  renderWithProviders,
  renderWithUser,
  renderAsGuest,
} from "@/shared/testing";

// Renderizar con todos los providers
function MyComponentTest() {
  const { getByTestId, user } = renderWithProviders(<MyComponent />);

  // user contiene userEvent.setup() para interacciones
  await user.click(getByTestId("button"));
}

// Renderizar con usuario mock
function UserComponentTest() {
  const { getByTestId } = renderWithUser(<UserProfile />);

  expect(getByTestId("user-name")).toBeTruthy();
}

// Renderizar sin usuario (guest)
function GuestComponentTest() {
  const { getByTestId } = renderAsGuest(<PublicComponent />);

  expect(getByTestId("login-prompt")).toBeTruthy();
}
```

### **🎪 Mock Helpers**

```typescript
import {
  createMockUser,
  createMockFeatureFlags,
  createMockFile,
} from "@/shared/testing";

// Crear usuario mock
const user = createMockUser({
  name: "Custom Name",
  role: "admin",
});

// Crear feature flags mock
const flags = createMockFeatureFlags({
  FILE_UPLOAD: true,
  SOCIAL_LOGIN: false,
});

// Crear archivo mock
const file = createMockFile({
  filename: "custom-file.jpg",
  size: 2048000,
});
```

### **🗂️ Test Data**

```typescript
import {
  testUsers,
  testFeatureFlags,
  testFiles,
  testApiResponses,
} from "@/shared/testing";

// Usuarios predefinidos
const adminUser = testUsers.admin;
const regularUser = testUsers.user;

// Feature flags predefinidos
const allEnabled = testFeatureFlags.allEnabled;
const allDisabled = testFeatureFlags.allDisabled;

// Respuestas de API mock
const successResponse = testApiResponses.success.users;
const errorResponse = testApiResponses.error.unauthorized;
```

### **🎯 Custom Matchers**

```typescript
import {
  toHaveTestId,
  toHaveClass,
  toBeLoading,
  toHaveFormErrors,
  toHaveRequiredProperties,
  toHaveFeatureFlagEnabled,
} from "@/shared/testing";

// Usar matchers personalizados
expect(element).toHaveTestId("my-component");
expect(element).toHaveClass("active");
expect(loadingElement).toBeLoading();
expect(form).toHaveFormErrors();
expect(user).toHaveRequiredProperties(["id", "name", "email"]);
expect(flags).toHaveFeatureFlagEnabled("FILE_UPLOAD");
```

## 📋 Ejemplos de Tests

### **🧩 Test de Componente Simple**

```typescript
import { renderWithProviders } from "@/shared/testing";
import { MyButton } from "./MyButton";

describe("MyButton", () => {
  it("should render correctly", () => {
    const { getByTestId } = renderWithProviders(
      <MyButton data-testid="my-button">Click me</MyButton>
    );

    expect(getByTestId("my-button")).toBeTruthy();
  });

  it("should handle clicks", async () => {
    const mockOnClick = jest.fn();
    const { getByTestId, user } = renderWithProviders(
      <MyButton data-testid="my-button" onClick={mockOnClick}>
        Click me
      </MyButton>
    );

    await user.click(getByTestId("my-button"));
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
});
```

### **🔐 Test con Autenticación**

```typescript
import { renderWithUser, renderAsGuest, testUsers } from "@/shared/testing";
import { ProtectedComponent } from "./ProtectedComponent";

describe("ProtectedComponent", () => {
  it("should show content for authenticated user", () => {
    const { getByTestId } = renderWithUser(<ProtectedComponent />, {
      mockUser: testUsers.admin,
    });

    expect(getByTestId("protected-content")).toBeTruthy();
  });

  it("should show login prompt for guest", () => {
    const { getByTestId } = renderAsGuest(<ProtectedComponent />);

    expect(getByTestId("login-prompt")).toBeTruthy();
  });
});
```

### **🎛️ Test con Feature Flags**

```typescript
import { renderWithFeatureFlags, testFeatureFlags } from "@/shared/testing";
import { ConditionalFeature } from "./ConditionalFeature";

describe("ConditionalFeature", () => {
  it("should show feature when enabled", () => {
    const { getByTestId } = renderWithFeatureFlags(<ConditionalFeature />, {
      FILE_UPLOAD: true,
    });

    expect(getByTestId("file-upload-section")).toBeTruthy();
  });

  it("should hide feature when disabled", () => {
    const { queryByTestId } = renderWithFeatureFlags(
      <ConditionalFeature />,
      testFeatureFlags.allDisabled
    );

    expect(queryByTestId("file-upload-section")).toBeNull();
  });
});
```

## 📱 Testing Responsive

```typescript
import {
  setMobileViewport,
  setDesktopViewport,
  testViewports,
} from "@/shared/testing";

describe("ResponsiveComponent", () => {
  it("should adapt to mobile viewport", () => {
    setMobileViewport();

    const { getByTestId } = renderWithProviders(<ResponsiveComponent />);

    expect(getByTestId("mobile-menu")).toBeTruthy();
  });

  it("should adapt to desktop viewport", () => {
    setDesktopViewport();

    const { getByTestId } = renderWithProviders(<ResponsiveComponent />);

    expect(getByTestId("desktop-menu")).toBeTruthy();
  });
});
```

## 🔄 Cleanup y Setup

```typescript
import { clearAllMocks, restoreMocks } from "@/shared/testing";

describe("MyComponent", () => {
  beforeEach(() => {
    // Setup antes de cada test
    clearAllMocks();
  });

  afterEach(() => {
    // Cleanup después de cada test
    restoreMocks();
  });

  it("should work correctly", () => {
    // Tu test aquí
  });
});
```

## 🎯 Mejores Prácticas

### **📝 Nomenclatura de Tests**

```typescript
// ✅ Bueno - Descriptivo y claro
it("should display error message when login fails");
it("should disable submit button when form is invalid");
it("should show loading spinner during file upload");

// ❌ Malo - Vago y sin contexto
it("should work");
it("should render");
it("should handle click");
```

### **🎭 Uso de data-testid**

```typescript
// ✅ Bueno - Descriptivo y único
<button data-testid="submit-login-form">Login</button>
<div data-testid="user-profile-card">Profile</div>
<span data-testid="error-message-email">Error</span>

// ❌ Malo - Genérico y ambiguo
<button data-testid="button">Login</button>
<div data-testid="card">Profile</div>
<span data-testid="error">Error</span>
```

### **🧪 Estructura de Tests**

```typescript
describe("ComponentName", () => {
  describe("cuando está cargando", () => {
    it("should show loading spinner");
    it("should disable form inputs");
  });

  describe("cuando hay error", () => {
    it("should display error message");
    it("should enable retry button");
  });

  describe("cuando es exitoso", () => {
    it("should show success state");
    it("should enable form submission");
  });
});
```

### **⚡ Performance**

- **Usa `renderWithProviders`** para la mayoría de tests
- **Usa `withoutProviders`** solo cuando sea necesario
- **Mockea servicios pesados** (APIs, file uploads)
- **Agrupa tests relacionados** en describes

### **🔍 Debugging**

```typescript
import { screen } from "@testing-library/react";

// Para debuggear elementos en el DOM
screen.debug(); // Muestra todo el DOM
screen.debug(screen.getByTestId("my-element")); // Muestra elemento específico

// Para ver queries disponibles
console.log(screen.getByRole("button", { name: /submit/i }));
```

## 🔗 Recursos Relacionados

- **[Jest Documentation](https://jestjs.io/docs/getting-started)**
- **[React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)**
- **[User Event](https://testing-library.com/docs/user-event/intro/)**
- **[Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)**

---

**💡 Tip:** Mantén tus tests **simples**, **legibles** y **enfocados** en el comportamiento del usuario, no en detalles de implementación.
