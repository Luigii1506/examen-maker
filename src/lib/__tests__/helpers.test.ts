// 🧪 UNIT TESTS - FUNCIONES PURAS
// ===============================
// Tests para funciones que NO dependen de React o el DOM

import {
  formatPrice,
  isValidEmail,
  calculateDiscount,
  truncateText,
} from "../utils/helpers";

// 📖 UNIT TESTS son perfectos para:
// ✅ Funciones puras (entrada → salida)
// ✅ Lógica de negocio
// ✅ Cálculos matemáticos
// ✅ Validaciones
// ✅ Transformaciones de datos

describe("Helper Functions", () => {
  // 🎯 TESTING: formatPrice()
  describe("formatPrice", () => {
    test("should format positive numbers correctly", () => {
      expect(formatPrice(10)).toBe("$10.00");
      expect(formatPrice(9.99)).toBe("$9.99");
      expect(formatPrice(0)).toBe("$0.00");
      expect(formatPrice(1000.5)).toBe("$1000.50");
    });

    test("should throw error for negative numbers", () => {
      // Para probar que una función lanza error:
      expect(() => formatPrice(-1)).toThrow("Price cannot be negative");
      expect(() => formatPrice(-100)).toThrow();
    });

    test("should handle decimal precision", () => {
      expect(formatPrice(9.999)).toBe("$10.00"); // Redondeo
      expect(formatPrice(9.994)).toBe("$9.99");
    });
  });

  // 🎯 TESTING: isValidEmail()
  describe("isValidEmail", () => {
    test("should validate correct emails", () => {
      const validEmails = [
        "user@example.com",
        "test.email@domain.co.uk",
        "user+label@example.org",
        "name123@test-domain.com",
      ];

      validEmails.forEach((email) => {
        expect(isValidEmail(email)).toBe(true);
      });
    });

    test("should reject invalid emails", () => {
      const invalidEmails = [
        "not-an-email",
        "@domain.com",
        "user@",
        "user..double.dot@example.com",
        "user@domain",
        "",
      ];

      invalidEmails.forEach((email) => {
        expect(isValidEmail(email)).toBe(false);
      });
    });
  });

  // 🎯 TESTING: calculateDiscount()
  describe("calculateDiscount", () => {
    test("should calculate discounts correctly", () => {
      expect(calculateDiscount(100, 10)).toBe(10); // 10% de $100 = $10
      expect(calculateDiscount(50, 20)).toBe(10); // 20% de $50 = $10
      expect(calculateDiscount(200, 0)).toBe(0); // 0% = sin descuento
      expect(calculateDiscount(100, 100)).toBe(100); // 100% = precio completo
    });

    test("should handle edge cases", () => {
      expect(calculateDiscount(0, 50)).toBe(0); // $0 con descuento = $0
    });

    test("should throw error for invalid inputs", () => {
      // Precios negativos
      expect(() => calculateDiscount(-100, 10)).toThrow(
        "Invalid input parameters"
      );

      // Descuentos negativos
      expect(() => calculateDiscount(100, -10)).toThrow(
        "Invalid input parameters"
      );

      // Descuentos mayores a 100%
      expect(() => calculateDiscount(100, 150)).toThrow(
        "Invalid input parameters"
      );
    });
  });

  // 🎯 TESTING: truncateText()
  describe("truncateText", () => {
    test("should truncate long text", () => {
      const longText = "Este es un texto muy largo que necesita ser truncado";

      expect(truncateText(longText, 10)).toBe("Este es un...");
      expect(truncateText(longText, 20)).toBe("Este es un texto muy...");
    });

    test("should not truncate short text", () => {
      const shortText = "Texto corto";

      expect(truncateText(shortText, 20)).toBe("Texto corto");
      expect(truncateText(shortText, 11)).toBe("Texto corto"); // Exactamente igual
    });

    test("should handle edge cases", () => {
      expect(truncateText("", 10)).toBe(""); // Texto vacío
      expect(truncateText("Test", 0)).toBe(""); // Longitud 0
      expect(truncateText("Test", -5)).toBe(""); // Longitud negativa
    });
  });
});

// 📚 PATRONES COMUNES EN UNIT TESTS:
//
// 🎯 AAA Pattern (Arrange, Act, Assert):
// test('should do something', () => {
//   // Arrange: Preparar datos
//   const input = 'test data';
//
//   // Act: Ejecutar función
//   const result = myFunction(input);
//
//   // Assert: Verificar resultado
//   expect(result).toBe('expected output');
// });
//
// 🔄 Test Multiple Cases:
// const testCases = [
//   { input: 'a', expected: 'A' },
//   { input: 'b', expected: 'B' },
// ];
//
// testCases.forEach(({ input, expected }) => {
//   expect(myFunction(input)).toBe(expected);
// });
//
// 🚨 Test Errors:
// expect(() => myFunction('bad input')).toThrow('Expected error message');
//
// 🎯 Test Edge Cases:
// - Valores límite (0, -1, máximos)
// - Strings vacíos
// - Arrays vacíos
// - null/undefined
