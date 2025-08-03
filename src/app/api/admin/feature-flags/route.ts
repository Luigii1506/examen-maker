// 🎛️ API FEATURE FLAGS ADMIN
// ========================
// Endpoint para administrar feature flags dinámicamente

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/core/auth/auth";
import type { FeatureFlag } from "@/core/config/feature-flags";

// 📊 GET - Obtener todas las feature flags
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Solo admins pueden ver feature flags (verificar rol)
    if (session.user.role !== "admin" && session.user.role !== "super_admin") {
      return NextResponse.json(
        { error: "Permisos insuficientes" },
        { status: 403 }
      );
    }

    // Obtener overrides del storage o base de datos
    // Por ahora retornamos las feature flags por defecto
    const { FEATURE_FLAGS } = await import("@/core/config/feature-flags");

    return NextResponse.json({
      success: true,
      flags: FEATURE_FLAGS,
      overrides: {}, // TODO: Obtener desde BD
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error getting feature flags:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// 🔧 PUT - Actualizar feature flags
export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Solo admins pueden modificar feature flags (verificar rol)
    if (session.user.role !== "admin" && session.user.role !== "super_admin") {
      return NextResponse.json(
        { error: "Permisos insuficientes" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { flagName, enabled } = body;

    // Validar entrada
    if (!flagName || typeof enabled !== "boolean") {
      return NextResponse.json(
        { error: "flagName y enabled son requeridos" },
        { status: 400 }
      );
    }

    // Validar que la flag existe
    const { FEATURE_FLAGS } = await import("@/core/config/feature-flags");
    if (!(flagName in FEATURE_FLAGS)) {
      return NextResponse.json(
        { error: `Feature flag '${flagName}' no existe` },
        { status: 400 }
      );
    }

    // TODO: Guardar en base de datos
    // Por ahora solo retornamos confirmación
    console.log(
      `Feature flag '${flagName}' ${
        enabled ? "habilitada" : "deshabilitada"
      } por ${session.user.email}`
    );

    return NextResponse.json({
      success: true,
      flagName,
      enabled,
      updatedBy: session.user.email,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating feature flag:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// 🔄 POST - Actualizar múltiples feature flags
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Solo admins pueden modificar feature flags (verificar rol)
    if (session.user.role !== "admin" && session.user.role !== "super_admin") {
      return NextResponse.json(
        { error: "Permisos insuficientes" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { flags } = body;

    // Validar entrada
    if (!flags || typeof flags !== "object") {
      return NextResponse.json(
        { error: "flags object es requerido" },
        { status: 400 }
      );
    }

    // Validar que todas las flags existen
    const { FEATURE_FLAGS } = await import("@/core/config/feature-flags");
    const invalidFlags = Object.keys(flags).filter(
      (flagName) => !(flagName in FEATURE_FLAGS)
    );

    if (invalidFlags.length > 0) {
      return NextResponse.json(
        { error: `Feature flags no válidas: ${invalidFlags.join(", ")}` },
        { status: 400 }
      );
    }

    // TODO: Guardar en base de datos
    // Por ahora solo retornamos confirmación
    console.log(`Feature flags actualizadas por ${session.user.email}:`, flags);

    return NextResponse.json({
      success: true,
      updatedFlags: flags,
      updatedBy: session.user.email,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating feature flags:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// 🔄 DELETE - Resetear feature flags a valores por defecto
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Solo admins pueden resetear feature flags (verificar rol)
    if (session.user.role !== "admin" && session.user.role !== "super_admin") {
      return NextResponse.json(
        { error: "Permisos insuficientes" },
        { status: 403 }
      );
    }

    // TODO: Limpiar overrides de la base de datos
    console.log(`Feature flags reseteadas por ${session.user.email}`);

    return NextResponse.json({
      success: true,
      message: "Feature flags reseteadas a valores por defecto",
      resetBy: session.user.email,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error resetting feature flags:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
