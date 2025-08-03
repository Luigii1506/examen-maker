// 🧪 INTEGRATION TESTS - COMPONENTE CON HOOKS
// ============================================
// Tests para componentes que usan useState, useEffect, API calls

import React from "react";
import { renderWithProviders } from "@/shared/testing";
import { UserProfile } from "../UserProfile";

// 📖 INTEGRATION TESTS son perfectos para:
// ✅ Componentes con hooks (useState, useEffect)
// ✅ Interacciones entre múltiples elementos
// ✅ Estados asíncronos (loading, error, success)
// ✅ Callbacks y eventos
// ✅ Flujos de usuario completos

describe("UserProfile Integration", () => {
  // 🎯 TEST 1: Estado de loading inicial
  test("should show loading state initially", () => {
    const { getByTestId } = renderWithProviders(<UserProfile userId="123" />);

    // Verificar que muestra el loading
    expect(getByTestId("user-profile-loading")).toBeTruthy();
    expect(getByTestId("loading-spinner")).toBeTruthy();
    expect(getByTestId("loading-spinner").textContent).toBe(
      "Cargando usuario..."
    );
  });

  // 🎯 TEST 2: Mostrar datos después de cargar
  test("should display user data after loading", async () => {
    const { getByTestId, queryByTestId } = renderWithProviders(
      <UserProfile userId="123" />
    );

    // Inicialmente debe mostrar loading
    expect(getByTestId("user-profile-loading")).toBeTruthy();

    // Esperar a que termine el loading (simulated delay de 100ms)
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Re-renderizar para obtener el estado actualizado
    // Nota: En un test real, usarías waitFor() de testing-library
    // pero para simplicidad usamos setTimeout

    // Verificar que ya no muestra loading
    expect(queryByTestId("user-profile-loading")).toBeFalsy();

    // Verificar que muestra los datos del usuario
    expect(getByTestId("user-profile")).toBeTruthy();
    expect(getByTestId("user-name").textContent).toBe("Usuario 123");
    expect(getByTestId("user-email").textContent).toBe("user123@example.com");
    expect(getByTestId("user-avatar")).toBeTruthy();
  });

  // 🎯 TEST 3: Callback onUserLoad se ejecuta
  test("should call onUserLoad when user loads", async () => {
    const mockOnUserLoad = jest.fn();

    renderWithProviders(
      <UserProfile userId="456" onUserLoad={mockOnUserLoad} />
    );

    // Esperar a que cargue el usuario
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Verificar que se llamó el callback con los datos correctos
    expect(mockOnUserLoad).toHaveBeenCalledTimes(1);
    expect(mockOnUserLoad).toHaveBeenCalledWith({
      id: "456",
      name: "Usuario 456",
      email: "user456@example.com",
      avatar: "https://via.placeholder.com/100",
    });
  });

  // 🎯 TEST 4: Flujo completo de edición
  test("should handle complete edit flow", async () => {
    const { getByTestId, queryByTestId } = renderWithProviders(
      <UserProfile userId="789" />
    );

    // Esperar a que cargue
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Verificar estado inicial
    expect(getByTestId("user-name").textContent).toBe("Usuario 789");
    expect(queryByTestId("edit-form")).toBeFalsy();

    // 1. Hacer click en "Editar"
    const editButton = getByTestId("edit-button");
    editButton.click();

    // 2. Verificar que muestra el formulario de edición
    expect(getByTestId("edit-form")).toBeTruthy();
    expect(getByTestId("edit-name-input")).toBeTruthy();
    expect((getByTestId("edit-name-input") as HTMLInputElement).value).toBe(
      "Usuario 789"
    );

    // 3. Cambiar el nombre
    const nameInput = getByTestId("edit-name-input") as HTMLInputElement;
    nameInput.value = "Nuevo Nombre";
    nameInput.dispatchEvent(new Event("change", { bubbles: true }));

    // 4. Guardar cambios
    const saveButton = getByTestId("save-button");
    saveButton.click();

    // 5. Verificar que se guardó y se salió del modo edición
    expect(queryByTestId("edit-form")).toBeFalsy();
    expect(getByTestId("user-name").textContent).toBe("Nuevo Nombre");
  });

  // 🎯 TEST 5: Cancelar edición
  test("should cancel editing without saving changes", async () => {
    const { getByTestId, queryByTestId } = renderWithProviders(
      <UserProfile userId="999" />
    );

    // Esperar a que cargue
    await new Promise((resolve) => setTimeout(resolve, 150));

    const originalName = "Usuario 999";
    expect(getByTestId("user-name").textContent).toBe(originalName);

    // Entrar en modo edición
    getByTestId("edit-button").click();

    // Cambiar el nombre
    const nameInput = getByTestId("edit-name-input") as HTMLInputElement;
    nameInput.value = "Nombre Temporal";
    nameInput.dispatchEvent(new Event("change", { bubbles: true }));

    // Cancelar
    getByTestId("cancel-button").click();

    // Verificar que se canceló y no se guardaron cambios
    expect(queryByTestId("edit-form")).toBeFalsy();
    expect(getByTestId("user-name").textContent).toBe(originalName);
  });

  // 🎯 TEST 6: Validación - no guardar nombre vacío
  test("should not save empty name", async () => {
    const { getByTestId } = renderWithProviders(<UserProfile userId="empty" />);

    await new Promise((resolve) => setTimeout(resolve, 150));

    const originalName = "Usuario empty";
    expect(getByTestId("user-name").textContent).toBe(originalName);

    // Entrar en modo edición
    getByTestId("edit-button").click();

    // Limpiar el nombre
    const nameInput = getByTestId("edit-name-input") as HTMLInputElement;
    nameInput.value = "   "; // Solo espacios
    nameInput.dispatchEvent(new Event("change", { bubbles: true }));

    // Intentar guardar
    getByTestId("save-button").click();

    // Debería seguir en modo edición (no se guardó)
    expect(getByTestId("edit-form")).toBeTruthy();
    // El nombre original debería seguir igual
    // (En este caso el componente no muestra el nombre mientras edita)
  });

  // 🎯 TEST 7: Cambiar userId actualiza los datos
  test("should reload user when userId changes", async () => {
    const { getByTestId, rerender } = renderWithProviders(
      <UserProfile userId="first" />
    );

    // Esperar primer usuario
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(getByTestId("user-name").textContent).toBe("Usuario first");

    // Cambiar userId
    rerender(<UserProfile userId="second" />);

    // Debería mostrar loading nuevamente
    expect(getByTestId("user-profile-loading")).toBeTruthy();

    // Esperar que cargue el nuevo usuario
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(getByTestId("user-name").textContent).toBe("Usuario second");
  });
});

// 📚 PATRONES COMUNES EN INTEGRATION TESTS:
//
// ⏱️ Manejar Estados Asíncronos:
// // Opción 1: setTimeout (simple, para demos)
// await new Promise(resolve => setTimeout(resolve, 100));
//
// // Opción 2: waitFor (recomendado para apps reales)
// import { waitFor } from '@testing-library/react';
// await waitFor(() => {
//   expect(getByTestId('loaded-content')).toBeTruthy();
// });
//
// 🎭 Simular Eventos del Usuario:
// const input = getByTestId('input');
// input.value = 'new value';
// input.dispatchEvent(new Event('change', { bubbles: true }));
//
// const button = getByTestId('button');
// button.click();
//
// 🔄 Flujos Multi-Step:
// test('should complete entire user flow', async () => {
//   // Step 1: Initial state
//   // Step 2: User action
//   // Step 3: Verify intermediate state
//   // Step 4: Another user action
//   // Step 5: Verify final state
// });
//
// 📊 Testing State Changes:
// // Before action
// expect(getByTestId('counter')).toHaveTextContent('0');
//
// // Trigger action
// getByTestId('increment').click();
//
// // After action
// expect(getByTestId('counter')).toHaveTextContent('1');
