// 🎯 CUSTOM MATCHERS
// ==================
// Matchers personalizados para mejorar la legibilidad de los tests

// 🔍 Helpers para verificaciones comunes

/**
 * Verifica si un elemento tiene un atributo data-testid específico
 */
export const toHaveTestId = (received: Element, expected: string) => {
  const testId = received.getAttribute("data-testid");
  const pass = testId === expected;

  if (pass) {
    return {
      message: () => `Expected element not to have data-testid "${expected}"`,
      pass: true,
    };
  } else {
    return {
      message: () =>
        `Expected element to have data-testid "${expected}", but got "${testId}"`,
      pass: false,
    };
  }
};

/**
 * Verifica si un elemento tiene una clase CSS específica
 */
export const toHaveClass = (received: Element, expected: string) => {
  const pass = received.classList.contains(expected);

  if (pass) {
    return {
      message: () => `Expected element not to have class "${expected}"`,
      pass: true,
    };
  } else {
    return {
      message: () =>
        `Expected element to have class "${expected}", but classes are: ${Array.from(
          received.classList
        ).join(", ")}`,
      pass: false,
    };
  }
};

/**
 * Verifica si un elemento está loading (tiene spinner, skeleton, etc.)
 */
export const toBeLoading = (received: Element) => {
  const hasLoadingAttribute = received.hasAttribute("data-loading");
  const hasLoadingClass = received.classList.contains("loading");
  const hasSpinner = received.querySelector(
    '[data-testid*="spinner"], [data-testid*="loading"]'
  );
  const hasSkeleton = received.querySelector('[data-testid*="skeleton"]');

  const pass =
    hasLoadingAttribute || hasLoadingClass || !!hasSpinner || !!hasSkeleton;

  if (pass) {
    return {
      message: () => "Expected element not to be loading",
      pass: true,
    };
  } else {
    return {
      message: () =>
        "Expected element to be loading (have loading attribute, class, spinner, or skeleton)",
      pass: false,
    };
  }
};

/**
 * Verifica si un formulario tiene errores de validación
 */
export const toHaveFormErrors = (received: Element) => {
  const errorElements = received.querySelectorAll(
    '[data-testid*="error"], .error, [role="alert"]'
  );
  const pass = errorElements.length > 0;

  if (pass) {
    return {
      message: () => "Expected form not to have validation errors",
      pass: true,
    };
  } else {
    return {
      message: () => "Expected form to have validation errors",
      pass: false,
    };
  }
};

/**
 * Verifica si un objeto tiene todas las propiedades requeridas
 */
export const toHaveRequiredProperties = (
  received: Record<string, unknown>,
  properties: string[]
) => {
  const missingProperties = properties.filter((prop) => !(prop in received));
  const pass = missingProperties.length === 0;

  if (pass) {
    return {
      message: () =>
        `Expected object not to have all required properties: [${properties.join(
          ", "
        )}]`,
      pass: true,
    };
  } else {
    return {
      message: () =>
        `Expected object to have required properties: [${properties.join(
          ", "
        )}], but missing: [${missingProperties.join(", ")}]`,
      pass: false,
    };
  }
};

/**
 * Verifica si un feature flag está habilitado
 */
export const toHaveFeatureFlagEnabled = (
  received: Record<string, boolean>,
  flagName: string
) => {
  const pass = Boolean(received[flagName]);

  if (pass) {
    return {
      message: () => `Expected feature flag "${flagName}" not to be enabled`,
      pass: true,
    };
  } else {
    return {
      message: () =>
        `Expected feature flag "${flagName}" to be enabled, but it's disabled`,
      pass: false,
    };
  }
};
