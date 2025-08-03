// 🎭 E2E TESTS - FLUJO COMPLETO DE USUARIO
// =======================================
// Tests que prueban la aplicación completa en un navegador real

import { test, expect } from "@playwright/test";

// 📖 E2E TESTS son perfectos para:
// ✅ Flujos completos de usuario (login → dashboard → logout)
// ✅ Navegación entre páginas
// ✅ Integración frontend + backend + database
// ✅ Testing cross-browser (Chrome, Firefox, Safari)
// ✅ Testing responsive (desktop, tablet, mobile)

describe("Authentication Flow", () => {
  // 🎯 TEST 1: Usuario puede hacer login exitoso
  test("user can login successfully", async ({ page }) => {
    // 1. Ir a la página de login
    await page.goto("/login");

    // 2. Verificar que está en la página correcta
    await expect(page).toHaveTitle(/Login/);
    await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();

    // 3. Llenar el formulario
    await page.fill('[data-testid="email-input"]', "admin@example.com");
    await page.fill('[data-testid="password-input"]', "password123");

    // 4. Hacer click en el botón de login
    await page.click('[data-testid="login-button"]');

    // 5. Esperar redirección al dashboard
    await expect(page).toHaveURL("/dashboard");

    // 6. Verificar que se muestra el contenido del dashboard
    await expect(page.getByTestId("welcome-message")).toBeVisible();
    await expect(page.getByText("Bienvenido, Admin")).toBeVisible();
  });

  // 🎯 TEST 2: Login falla con credenciales incorrectas
  test("shows error for invalid credentials", async ({ page }) => {
    await page.goto("/login");

    // Credenciales incorrectas
    await page.fill('[data-testid="email-input"]', "wrong@example.com");
    await page.fill('[data-testid="password-input"]', "wrongpassword");

    await page.click('[data-testid="login-button"]');

    // Debe quedarse en login y mostrar error
    await expect(page).toHaveURL("/login");
    await expect(page.getByTestId("error-message")).toBeVisible();
    await expect(page.getByText("Credenciales inválidas")).toBeVisible();
  });

  // 🎯 TEST 3: Validación de formulario
  test("validates form fields", async ({ page }) => {
    await page.goto("/login");

    // Intentar login sin llenar campos
    await page.click('[data-testid="login-button"]');

    // Verificar mensajes de validación
    await expect(page.getByText("El email es requerido")).toBeVisible();
    await expect(page.getByText("La contraseña es requerida")).toBeVisible();

    // Llenar email inválido
    await page.fill('[data-testid="email-input"]', "not-an-email");
    await page.click('[data-testid="login-button"]');

    await expect(page.getByText("Email inválido")).toBeVisible();
  });

  // 🎯 TEST 4: Flujo completo: Login → Dashboard → Logout
  test("complete authentication flow", async ({ page }) => {
    // === FASE 1: LOGIN ===
    await page.goto("/login");
    await page.fill('[data-testid="email-input"]', "user@example.com");
    await page.fill('[data-testid="password-input"]', "password123");
    await page.click('[data-testid="login-button"]');

    // Verificar dashboard
    await expect(page).toHaveURL("/dashboard");
    await expect(page.getByTestId("user-menu")).toBeVisible();

    // === FASE 2: NAVEGACIÓN ===
    // Ir a perfil de usuario
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="profile-link"]');

    await expect(page).toHaveURL("/profile");
    await expect(page.getByTestId("profile-form")).toBeVisible();

    // === FASE 3: LOGOUT ===
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');

    // Debe redirigir a login y no estar autenticado
    await expect(page).toHaveURL("/login");

    // Intentar acceder a dashboard directamente (debe redirigir)
    await page.goto("/dashboard");
    await expect(page).toHaveURL("/login");
  });

  // 🎯 TEST 5: Recordar sesión
  test("remembers user session", async ({ page }) => {
    // Login con "Remember me"
    await page.goto("/login");
    await page.fill('[data-testid="email-input"]', "user@example.com");
    await page.fill('[data-testid="password-input"]', "password123");
    await page.check('[data-testid="remember-me-checkbox"]');
    await page.click('[data-testid="login-button"]');

    await expect(page).toHaveURL("/dashboard");

    // Recargar página - debe seguir autenticado
    await page.reload();
    await expect(page).toHaveURL("/dashboard");
    await expect(page.getByTestId("welcome-message")).toBeVisible();

    // Cerrar y abrir nueva pestaña - debe seguir autenticado
    await page.close();

    // Nota: En un test real, abrirías un nuevo contexto/página
    // para simular cerrar y abrir el navegador
  });
});

describe("Registration Flow", () => {
  // 🎯 TEST 6: Registro de nuevo usuario
  test("user can register successfully", async ({ page }) => {
    await page.goto("/register");

    // Llenar formulario de registro
    await page.fill('[data-testid="name-input"]', "Nuevo Usuario");
    await page.fill('[data-testid="email-input"]', "nuevo@example.com");
    await page.fill('[data-testid="password-input"]', "password123");
    await page.fill('[data-testid="confirm-password-input"]', "password123");

    await page.click('[data-testid="register-button"]');

    // Debe redirigir al dashboard después del registro
    await expect(page).toHaveURL("/dashboard");
    await expect(page.getByText("Bienvenido, Nuevo Usuario")).toBeVisible();
  });

  // 🎯 TEST 7: Validación de contraseñas
  test("validates password confirmation", async ({ page }) => {
    await page.goto("/register");

    await page.fill('[data-testid="name-input"]', "Test User");
    await page.fill('[data-testid="email-input"]', "test@example.com");
    await page.fill('[data-testid="password-input"]', "password123");
    await page.fill('[data-testid="confirm-password-input"]', "different123");

    await page.click('[data-testid="register-button"]');

    // Debe mostrar error de confirmación
    await expect(page.getByText("Las contraseñas no coinciden")).toBeVisible();
    await expect(page).toHaveURL("/register"); // Se queda en registro
  });
});

describe("Protected Routes", () => {
  // 🎯 TEST 8: Páginas protegidas redirigen a login
  test("protected pages redirect to login when not authenticated", async ({
    page,
  }) => {
    const protectedPages = ["/dashboard", "/profile", "/admin", "/settings"];

    for (const url of protectedPages) {
      await page.goto(url);

      // Todas deben redirigir a login
      await expect(page).toHaveURL("/login");

      // Opcional: verificar mensaje de redirección
      await expect(page.getByText("Debes iniciar sesión")).toBeVisible();
    }
  });

  // 🎯 TEST 9: Usuario autenticado puede acceder a páginas protegidas
  test("authenticated user can access protected pages", async ({ page }) => {
    // Primero hacer login
    await page.goto("/login");
    await page.fill('[data-testid="email-input"]', "user@example.com");
    await page.fill('[data-testid="password-input"]', "password123");
    await page.click('[data-testid="login-button"]');

    await expect(page).toHaveURL("/dashboard");

    // Ahora puede acceder a páginas protegidas
    const protectedPages = [
      { url: "/profile", selector: '[data-testid="profile-form"]' },
      { url: "/settings", selector: '[data-testid="settings-panel"]' },
      { url: "/dashboard", selector: '[data-testid="welcome-message"]' },
    ];

    for (const { url, selector } of protectedPages) {
      await page.goto(url);
      await expect(page).toHaveURL(url);
      await expect(page.locator(selector)).toBeVisible();
    }
  });
});

// 📚 PATRONES COMUNES EN E2E TESTS:
//
// 🎯 Page Navigation:
// await page.goto('/path');
// await expect(page).toHaveURL('/expected-path');
// await expect(page).toHaveTitle(/Expected Title/);
//
// 🔍 Element Interaction:
// await page.click('[data-testid="button"]');
// await page.fill('[data-testid="input"]', 'value');
// await page.check('[data-testid="checkbox"]');
// await page.selectOption('[data-testid="select"]', 'option');
//
// ✅ Assertions:
// await expect(page.getByTestId('element')).toBeVisible();
// await expect(page.getByText('text')).toBeHidden();
// await expect(page.getByRole('button')).toBeEnabled();
// await expect(page.getByRole('button')).toBeDisabled();
//
// ⏱️ Waiting:
// await page.waitForSelector('[data-testid="element"]');
// await page.waitForURL('/expected-url');
// await page.waitForLoadState('networkidle');
//
// 📸 Screenshots:
// await page.screenshot({ path: 'screenshot.png' });
// await expect(page).toHaveScreenshot('expected-screenshot.png');
//
// 📱 Mobile Testing:
// // En playwright.config.ts:
// // { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } }
//
// 🌐 Multi-tab Testing:
// const newPage = await context.newPage();
// await newPage.goto('/other-page');
//
// 🗃️ Local Storage / Cookies:
// await page.evaluate(() => localStorage.setItem('key', 'value'));
// await page.context().addCookies([{ name: 'token', value: 'abc123', url: 'http://localhost:3000' }]);
