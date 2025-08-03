/**
 * 🔧 SCRIPT PARA ACTUALIZAR ROL DE USUARIO EXISTENTE
 *
 * Ejecutar con: npx tsx src/scripts/update-user-role.ts
 */

import { PrismaClient } from "@prisma/client";

async function updateUserRole() {
  const prisma = new PrismaClient();

  try {
    console.log("🔍 Buscando usuario admin@admin.com...");

    // Buscar el usuario
    const user = await prisma.user.findUnique({
      where: { email: "admin@admin.com" },
    });

    if (!user) {
      console.error("❌ Usuario no encontrado");
      return;
    }

    console.log("✅ Usuario encontrado:");
    console.log("   📧 Email:", user.email);
    console.log("   👤 Nombre:", user.name);
    console.log("   🆔 ID:", user.id);
    console.log("   👑 Rol actual:", user.role || "null");

    // Actualizar rol
    console.log("🔄 Actualizando rol a super_admin...");

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { role: "super_admin" },
    });

    console.log("🎉 ¡Rol actualizado exitosamente!");
    console.log("   📧 Email:", updatedUser.email);
    console.log("   👑 Nuevo rol:", updatedUser.role);

    console.log("\n🚀 ¡Tu Super Admin está listo!");
    console.log("�� Email: admin@admin.com");
    console.log("🔑 Contraseña: Admin123!");
    console.log("👑 Rol: super_admin");

    console.log("\n🎯 Próximos pasos:");
    console.log("   1. Ve a http://localhost:3000/login");
    console.log("   2. Inicia sesión con admin@admin.com");
    console.log("   3. Ve a /dashboard para acceder al panel admin");
  } catch (error) {
    console.error("💥 Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUserRole()
  .then(() => {
    console.log("\n🏁 Script completado");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
