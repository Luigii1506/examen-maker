// Utilities for the certification system

export const generateSerialNumber = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `CERT-${timestamp}-${random}`.toUpperCase();
};

export const generateVerificationCode = (certificationId: string): string => {
  // Simulate verification code generation
  const hash = btoa(certificationId + Date.now().toString()).substring(0, 12);
  return hash.toUpperCase();
};

export const validateValidity = (expiresAt?: Date): boolean => {
  if (!expiresAt) return true; // Certification without expiration
  return new Date() < expiresAt;
};

export const calculateRemainingTime = (expiresAt?: Date): number | null => {
  if (!expiresAt) return null;
  const now = new Date();
  const difference = expiresAt.getTime() - now.getTime();
  return Math.max(0, Math.ceil(difference / (1000 * 60 * 60 * 24))); // days
};

export const formatExpirationDate = (expiresAt?: Date): string => {
  if (!expiresAt) return "No expiration";
  return expiresAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
