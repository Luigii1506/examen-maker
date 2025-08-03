// 🛠️ UTILITY FUNCTIONS
// ====================
// Funciones reutilizables para todo el sistema

// 🔄 Re-export shared utils
export { cn } from "@/shared/utils";

// ⏰ Time Utils
export function formatDate(date: string | Date, locale = "es-ES"): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date, locale = "es-ES"): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function getRelativeTime(date: string | Date, locale = "es-ES"): string {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const now = new Date();
  const target = new Date(date);
  const diffInSeconds = (target.getTime() - now.getTime()) / 1000;

  if (Math.abs(diffInSeconds) < 60)
    return rtf.format(Math.round(diffInSeconds), "second");
  if (Math.abs(diffInSeconds) < 3600)
    return rtf.format(Math.round(diffInSeconds / 60), "minute");
  if (Math.abs(diffInSeconds) < 86400)
    return rtf.format(Math.round(diffInSeconds / 3600), "hour");
  return rtf.format(Math.round(diffInSeconds / 86400), "day");
}

// 📏 Format Utils
export function formatFileSize(bytes: number): string {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export function formatNumber(num: number, locale = "es-ES"): string {
  return new Intl.NumberFormat(locale).format(num);
}

export function formatCurrency(
  amount: number,
  currency = "EUR",
  locale = "es-ES"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}

// 🔍 Validation Utils
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// 🎯 Array Utils
export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

export function chunk<T>(array: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
    array.slice(i * size, i * size + size)
  );
}

// 🔤 String Utils
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Remove multiple hyphens
    .trim();
}

export function truncate(text: string, length: number, suffix = "..."): string {
  if (text.length <= length) return text;
  return text.slice(0, length - suffix.length) + suffix;
}

// 🎲 Random Utils
export function generateId(length = 8): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
