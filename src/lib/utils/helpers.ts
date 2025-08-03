// 🛠️ HELPER FUNCTIONS
// ===================
// Funciones puras para demostrar unit testing

/**
 * Formatea un precio con símbolo de moneda
 */
export function formatPrice(price: number): string {
  if (price < 0) {
    throw new Error("Price cannot be negative");
  }
  return `$${price.toFixed(2)}`;
}

/**
 * Valida si un email es válido
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Calcula descuento
 */
export function calculateDiscount(
  price: number,
  discountPercent: number
): number {
  if (price < 0 || discountPercent < 0 || discountPercent > 100) {
    throw new Error("Invalid input parameters");
  }
  return price * (discountPercent / 100);
}

/**
 * Trunca texto a cierta longitud
 */
export function truncateText(text: string, maxLength: number): string {
  if (maxLength <= 0) {
    return "";
  }
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + "...";
}
