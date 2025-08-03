# 🔧 Troubleshooting - Testing

> **Soluciones a problemas comunes de testing**

## 🚨 Errores Más Frecuentes

### **1. ❌ "Cannot find module '@/shared/testing'"**

**Error:**

```
Module not found: Error: Can't resolve '@/shared/testing'
```

**✅ Solución:**

```typescript
// Verificar que el archivo existe
ls src/shared/testing/index.ts

// Si no existe, crearlo:
// src/shared/testing/index.ts
export * from './render-helpers';
export * from './mock-helpers';
export * from './test-data';
```

### **2. ❌ "Property 'toBeInTheDocument' does not exist"**

**Error:**

```
Property 'toBeInTheDocument' does not exist on type 'JestMatchers<HTMLElement>'
```

**✅ Solución:**

```typescript
// Usar matchers básicos en lugar de jest-dom
// ❌ Problemático:
expect(element).toBeInTheDocument();

// ✅ Funciona:
expect(element).toBeTruthy();
expect(element.textContent).toBe("Expected text");
expect(element.className).toContain("expected-class");
```

### **3. ❌ "ReferenceError: jest is not defined"**

**Error:**

```
ReferenceError: jest is not defined
```

**✅ Solución:**

```typescript
// En el archivo de test, agregar:
import { jest } from "@jest/globals";

// O usar alternativas:
const mockFunction = vi.fn(); // Si usas Vitest
const mockFunction = () => {}; // Mock manual
```

### **4. ❌ "Cannot read properties of null (reading 'click')"**

**Error:**

```
TypeError: Cannot read properties of null (reading 'click')
```

**✅ Solución:**

```typescript
// ❌ Elemento no encontrado:
const button = getByTestId("missing-button");
button.click(); // Error

// ✅ Verificar que existe:
const button = getByTestId("existing-button");
expect(button).toBeTruthy();
button.click();

// ✅ O usar query para verificar:
const button = queryByTestId("maybe-missing-button");
if (button) {
  button.click();
}
```

### **5. ❌ "act() warning in tests"**

**Error:**

```
Warning: An update to ComponentName inside a test was not wrapped in act(...)
```

**✅ Solución:**

```typescript
import { act } from "@testing-library/react";

// ❌ Problemático:
test("updates state", () => {
  const { getByTestId } = render(<Component />);
  getByTestId("button").click(); // Causa warning
});

// ✅ Correcto:
test("updates state", async () => {
  const { getByTestId } = render(<Component />);

  await act(async () => {
    getByTestId("button").click();
  });
});

// ✅ O usar user-event (maneja act automáticamente):
test("updates state", async () => {
  const { getByTestId, user } = renderWithProviders(<Component />);
  await user.click(getByTestId("button"));
});
```

### **6. ❌ "Test timeout" en tests asíncronos**

**Error:**

```
Exceeded timeout of 5000 ms for a test
```

**✅ Solución:**

```typescript
// ❌ Sin esperar promesas:
test("loads data", () => {
  render(<AsyncComponent />);
  expect(getByText("Loaded data")).toBeTruthy(); // Falla - no ha cargado
});

// ✅ Esperar con waitFor:
test("loads data", async () => {
  const { getByText } = render(<AsyncComponent />);

  await waitFor(() => {
    expect(getByText("Loaded data")).toBeTruthy();
  });
});

// ✅ O usar setTimeout simple:
test("loads data", async () => {
  render(<AsyncComponent />);

  await new Promise((resolve) => setTimeout(resolve, 100));

  expect(getByText("Loaded data")).toBeTruthy();
});
```

### **7. ❌ "Multiple instances of React"**

**Error:**

```
Error: Invalid hook call. Hooks can only be called inside the body of a function component
```

**✅ Solución:**

```bash
# Verificar versiones de React
npm ls react

# Si hay conflictos, reinstalar:
npm install react@latest react-dom@latest --save-exact
```

### **8. ❌ "ModuleNameMapper not working"**

**Error:**

```
Cannot resolve module '@/components/Button'
```

**✅ Solución:**

```javascript
// En jest.config.mjs, verificar moduleNameMapper:
export default {
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  // ...
};
```

### **9. ❌ "Playwright browser not found"**

**Error:**

```
Error: browserType.launch: Executable doesn't exist
```

**✅ Solución:**

```bash
# Instalar browsers
npx playwright install

# O específico:
npx playwright install chromium
```

### **10. ❌ "Test files not found"**

**Error:**

```
No tests found, exiting with code 1
```

**✅ Solución:**

```javascript
// Verificar patrones en jest.config.mjs:
export default {
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}",
    "<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}",
  ],
};

// Y que los archivos sigan el patrón:
// ✅ Correcto:
// - src/components/__tests__/Button.test.tsx
// - src/utils/helpers.test.ts
//
// ❌ No será encontrado:
// - src/components/Button.test.js (sin tsx)
// - src/tests/Button.test.tsx (directorio incorrecto)
```

## 🔧 Comandos de Diagnóstico

### **🩺 Verificar Configuración**

```bash
# Verificar que Jest encuentra los tests
npm test -- --listTests

# Ver configuración de Jest
npm test -- --showConfig

# Verificar cobertura
npm run test:coverage -- --verbose

# Debug de un test específico
npm test -- --testNamePattern="specific test name" --verbose
```

### **🔍 Debug Tests**

```bash
# Ejecutar un solo archivo
npm test -- Button.test.tsx

# Ejecutar con más información
npm test -- --verbose --no-coverage

# Ver qué archivos se están probando
npm test -- --listTests | grep Button
```

### **🎭 Debug Playwright**

```bash
# Ejecutar E2E con browser visible
npm run test:e2e:headed

# Debug mode paso a paso
npm run test:e2e:debug

# Ejecutar solo un test
npm run test:e2e -- --grep "login"

# Generar reporte
npm run test:e2e -- --reporter=html
```

## 🛠️ Herramientas de Debug

### **📱 React Developer Tools**

```typescript
// En tests, usar debug para ver el DOM:
import { screen } from "@testing-library/react";

test("debug example", () => {
  render(<MyComponent />);

  // Ver todo el DOM
  screen.debug();

  // Ver elemento específico
  const button = screen.getByTestId("my-button");
  screen.debug(button);
});
```

### **🔬 VS Code Extensions**

- **Jest** - Ejecutar tests desde el editor
- **Jest Runner** - Correr tests específicos
- **Playwright Test for VS Code** - Debug E2E tests

### **🌐 Browser DevTools**

```typescript
// En E2E tests, pausar para inspeccionar:
test("debug in browser", async ({ page }) => {
  await page.goto("/login");

  // Pausar test para inspeccionar manualmente
  await page.pause();

  // Continuar...
  await page.fill('[data-testid="email"]', "test@example.com");
});
```

## 📋 Checklist de Diagnóstico

Cuando algo no funciona, revisar en orden:

### **✅ 1. Archivos y Estructura**

- [ ] ¿El archivo de test existe?
- [ ] ¿Sigue la nomenclatura correcta? (`.test.tsx`, `.spec.ts`)
- [ ] ¿Está en la ubicación correcta? (`__tests__/` o junto al archivo)
- [ ] ¿Los imports son correctos?

### **✅ 2. Configuración de Jest**

- [ ] ¿Jest encuentra el archivo? (`npm test -- --listTests`)
- [ ] ¿El moduleNameMapper funciona? (test imports con `@/`)
- [ ] ¿El setup de Jest se ejecuta? (`__tests__/setup/jest.setup.js`)

### **✅ 3. Test Individual**

- [ ] ¿El test está bien escrito? (describe, test, expect)
- [ ] ¿Los elementos tienen `data-testid`?
- [ ] ¿Se esperan operaciones asíncronas?
- [ ] ¿Los mocks están configurados?

### **✅ 4. Playwright (E2E)**

- [ ] ¿Los browsers están instalados?
- [ ] ¿La aplicación está corriendo en localhost:3000?
- [ ] ¿Los selectores son correctos?
- [ ] ¿Hay timeouts suficientes?

## 🚀 Performance Tips

### **⚡ Hacer Tests Más Rápidos**

```javascript
// En jest.config.mjs:
export default {
  // Ejecutar tests en paralelo
  maxWorkers: "50%",

  // Cachear resultados
  cache: true,

  // Solo transformar lo necesario
  transformIgnorePatterns: ["/node_modules/(?!(module-to-transform)/)"],

  // Usar módulos ES cuando sea posible
  extensionsToTreatAsEsm: [".ts", ".tsx"],
};
```

### **🎯 Solo Ejecutar Tests Relevantes**

```bash
# Solo tests que han cambiado
npm test -- --onlyChanged

# Solo tests relacionados con archivos cambiados
npm test -- --changedSince=main

# Ejecutar en modo watch (solo para archivos cambiados)
npm run test:watch
```

### **📊 Optimizar Coverage**

```bash
# Coverage solo de archivos cambiados
npm run test:coverage -- --onlyChanged

# Coverage de directorio específico
npm run test:coverage -- --testPathPattern=components

# Coverage sin archivos de test
npm run test:coverage -- --collectCoverageFrom="src/**/*.{ts,tsx}" --collectCoverageFrom="!src/**/*.test.{ts,tsx}"
```

## 📞 Obtener Ayuda

### **🔗 Recursos Útiles**

- **[Jest Docs](https://jestjs.io/docs/getting-started)** - Documentación oficial
- **[React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)** - Guías y ejemplos
- **[Playwright Docs](https://playwright.dev/)** - Testing E2E
- **[Common Testing Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)** - Mejores prácticas

### **💬 Comunidades**

- **Stack Overflow** - `[jest]`, `[react-testing-library]`, `[playwright]`
- **Discord Testing Library** - Comunidad oficial
- **GitHub Discussions** - En repos oficiales

### **🐛 Reportar Bugs**

Si encuentras un bug en nuestro sistema de testing:

1. **Reproducir** el error con un caso mínimo
2. **Incluir** mensaje de error completo
3. **Especificar** versiones (Node, npm, jest, etc.)
4. **Crear issue** con template de bug report

---

**💡 Tip:** Cuando tengas dudas, siempre empieza con el test más simple posible y ve agregando complejidad gradualmente. ¡La mayoría de problemas se resuelven con tests pequeños y enfocados!
