/**
 * Script para convertir un usuario en administrador
 * Ejecuta: npx tsx src/scripts/make-admin.ts
 */

import { prisma } from "@/core/database/prisma";

async function makeAdmin() {
  try {
    console.log("🔍 Buscando usuarios en la base de datos...");

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    if (users.length === 0) {
      console.log(
        "❌ No hay usuarios en la base de datos. Primero registra un usuario."
      );
      return;
    }

    console.log("👥 Usuarios encontrados:");
    users.forEach((user, index) => {
      console.log(
        `${index + 1}. ${user.name} (${user.email}) - Rol: ${
          user.role || "user"
        }`
      );
    });

    // Opción 1: Hacer admin al primer usuario
    const firstUser = users[0];

    if (firstUser.role === "admin") {
      console.log(`✅ ${firstUser.name} ya es administrador.`);
    } else {
      await prisma.user.update({
        where: { id: firstUser.id },
        data: { role: "admin" },
      });

      console.log(
        `🎉 ${firstUser.name} (${firstUser.email}) ha sido convertido en administrador.`
      );
    }

    // Mostrar todos los administradores
    const admins = await prisma.user.findMany({
      where: { role: "admin" },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    console.log("\n👑 Administradores actuales:");
    admins.forEach((admin) => {
      console.log(`- ${admin.name} (${admin.email})`);
    });
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

makeAdmin();
