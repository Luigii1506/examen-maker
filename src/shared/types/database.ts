// 🗃️ DATABASE TYPES
// =================
// Extensiones y tipos específicos de Prisma

import type { BaseEntity } from "./global";

// 📊 Prisma Extensions
export type PrismaEntity = BaseEntity; // Alias for now, can be extended later

// 🔍 Database Query Types
export interface QueryOptions {
  include?: Record<string, boolean>;
  select?: Record<string, boolean>;
  where?: Record<string, unknown>;
  orderBy?: Record<string, "asc" | "desc">;
  take?: number;
  skip?: number;
}

// 📝 Audit Trail Types (para tracking de cambios)
export interface AuditLog extends BaseEntity {
  entityType: string;
  entityId: string;
  action: "CREATE" | "UPDATE" | "DELETE";
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
}

// 🔒 Soft Delete Pattern
export interface SoftDeletable {
  deletedAt?: string | null;
  isDeleted: boolean;
}

// 📋 Metadata Pattern (para campos adicionales flexibles)
export interface WithMetadata {
  metadata?: Record<string, unknown>;
}
