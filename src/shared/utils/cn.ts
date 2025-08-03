// 🎨 CLASS NAMES UTILITY
// =====================
// Utility para combinar y condicionar clases CSS

type ClassValue =
  | string
  | number
  | boolean
  | undefined
  | null
  | { [key: string]: boolean }
  | ClassValue[];

/**
 * Combina clases CSS con soporte para condicionales
 * @param inputs - Array de valores de clases
 * @returns String de clases combinadas
 */
export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = [];

  for (const input of inputs) {
    if (!input) continue;

    if (typeof input === "string" || typeof input === "number") {
      classes.push(String(input));
    } else if (Array.isArray(input)) {
      const nestedClasses = cn(...input);
      if (nestedClasses) classes.push(nestedClasses);
    } else if (typeof input === "object") {
      for (const [key, value] of Object.entries(input)) {
        if (value) classes.push(key);
      }
    }
  }

  return classes.join(" ");
}
