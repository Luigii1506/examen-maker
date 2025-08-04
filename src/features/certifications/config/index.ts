// Configuration for the certification system

export const CERTIFICATION_CONFIG = {
  // Validity configurations
  DEFAULT_VALIDITY_MONTHS: 24,
  EXPIRATION_ALERT_DAYS: 30,

  // Numbering configurations
  SERIAL_NUMBER_PREFIX: "CERT-AML",
  VERIFICATION_CODE_LENGTH: 12,

  // Available statuses
  STATUSES: [
    { value: "active", label: "Active", color: "green" },
    { value: "expired", label: "Expired", color: "red" },
    { value: "suspended", label: "Suspended", color: "yellow" },
  ] as const,

  // Available certification types
  CERTIFICATION_TYPES: [
    {
      id: "aml-basic",
      name: "AML Compliance Officer - Basic",
      description: "Basic certification in Anti-Money Laundering",
      validityMonths: 24,
      color: "#22c55e",
    },
    {
      id: "aml-intermediate",
      name: "AML Compliance Officer - Intermediate",
      description: "Intermediate certification in Anti-Money Laundering",
      validityMonths: 24,
      color: "#3b82f6",
    },
    {
      id: "aml-advanced",
      name: "AML Compliance Officer - Advanced",
      description: "Advanced certification in Anti-Money Laundering",
      validityMonths: 36,
      color: "#8b5cf6",
    },
  ] as const,

  // Certificate design templates
  DESIGN_TEMPLATES: [
    {
      id: "classic",
      name: "Classic",
      description: "Traditional and formal design",
    },
    {
      id: "modern",
      name: "Modern",
      description: "Contemporary and minimalist design",
    },
    {
      id: "corporate",
      name: "Corporate",
      description: "Professional business design",
    },
  ] as const,
} as const;
