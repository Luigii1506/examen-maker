// 🧪 TU PRIMER TEST - PASO A PASO
// ===============================
// Test completo del SimpleButton con explicaciones

import React from "react";
import { renderWithProviders } from "@/shared/testing";
import { SimpleButton } from "../SimpleButton";

// 📖 CONCEPTOS BÁSICOS:
// - describe(): Agrupa tests relacionados
// - test() o it(): Define un test individual
// - expect(): Verifica que algo sea cierto
// - render(): Crea el componente en memoria para probarlo

describe("SimpleButton", () => {
  // 🎯 TEST 1: Verificar que el componente se renderiza
  test("should render correctly with text", () => {
    // 1. Renderizar el componente
    const { getByTestId } = renderWithProviders(
      <SimpleButton>Click me</SimpleButton>
    );

    // 2. Buscar el elemento por su data-testid
    const button = getByTestId("simple-button");

    // 3. Verificar que existe en el DOM
    expect(button).toBeTruthy();

    // 4. Verificar que tiene el texto correcto
    expect(button.textContent).toBe("Click me");
  });

  // 🎯 TEST 2: Verificar diferentes variantes
  test("should apply correct CSS classes for variants", () => {
    // Renderizar botón primario
    const { getByTestId, rerender } = renderWithProviders(
      <SimpleButton variant="primary">Primary</SimpleButton>
    );

    let button = getByTestId("simple-button");
    expect(button.className).toContain("bg-blue-500");

    // Cambiar a variante secundaria usando rerender
    rerender(<SimpleButton variant="secondary">Secondary</SimpleButton>);

    button = getByTestId("simple-button");
    expect(button.className).toContain("bg-gray-200");
  });

  // 🎯 TEST 3: Verificar interactividad (clicks)
  test("should call onClick when clicked", () => {
    // 1. Crear una función mock para detectar si se ejecutó
    const mockClick = jest.fn(); // jest.fn() crea una función "espía"

    // 2. Renderizar el componente
    const { getByTestId } = renderWithProviders(
      <SimpleButton onClick={mockClick}>Click me</SimpleButton>
    );

    // 3. Buscar el botón
    const button = getByTestId("simple-button");

    // 4. Simular click directamente en el elemento
    button.click();

    // 5. Verificar que la función se ejecutó 1 vez
    expect(mockClick).toHaveBeenCalledTimes(1);
  });

  // 🎯 TEST 4: Verificar estado disabled
  test("should be disabled when disabled prop is true", () => {
    const mockClick = jest.fn();

    const { getByTestId } = renderWithProviders(
      <SimpleButton disabled onClick={mockClick}>
        Disabled Button
      </SimpleButton>
    );

    const button = getByTestId("simple-button");

    // Verificar que tiene el atributo disabled
    expect((button as HTMLButtonElement).disabled).toBe(true);

    // Verificar que tiene las clases de disabled
    expect(button.className).toContain("opacity-50");
    expect(button.className).toContain("cursor-not-allowed");

    // Intentar hacer click y verificar que NO se ejecuta la función
    // (En un botón disabled, el click no debería ejecutar la función)
    button.click();
    expect(mockClick).not.toHaveBeenCalled();
  });

  // 🎯 TEST 5: Test de casos edge (valores por defecto)
  test("should use default props when not provided", () => {
    const { getByTestId } = renderWithProviders(
      <SimpleButton>Default Button</SimpleButton>
    );

    const button = getByTestId("simple-button");

    // Verificar valores por defecto
    expect((button as HTMLButtonElement).disabled).toBe(false); // disabled = false por defecto
    expect(button.className).toContain("bg-blue-500"); // variant = 'primary' por defecto
  });
});

// 📚 GLOSARIO DE FUNCIONES:
//
// 🔍 BUSCAR ELEMENTOS:
// - getByTestId('id') → Busca por data-testid
// - getByText('texto') → Busca por texto visible
// - getByRole('button') → Busca por rol accesible
//
// ✅ VERIFICACIONES (Básicas):
// - expect(element).toBeTruthy() → Existe
// - expect(element.textContent).toBe('texto') → Tiene texto
// - expect(element.className).toContain('clase') → Tiene clase CSS
// - expect(element.disabled).toBe(true) → Está deshabilitado
// - expect(function).toHaveBeenCalled() → Función se ejecutó
//
// 🖱️ INTERACCIONES:
// - user.click(element) → Simular click
// - user.type(input, 'texto') → Escribir en input
// - user.hover(element) → Pasar mouse por encima
