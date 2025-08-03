/**
 * 👑 SCRIPT PARA CREAR SUPER ADMIN
 *
 * Ejecutar con: npx tsx src/scripts/create-super-admin.ts
 */

import { auth } from "@/core/auth/auth";
import { prisma } from "@/core/database/prisma";

async function createSuperAdmin() {
  try {
    console.log("🚀 Creando Super Administrador...");

    // ⚠️ CAMBIAR ESTOS DATOS
    const adminData = {
      email: "admin@admin.com",
      password: "Admin123!",
      name: "Super Administrador",
    };

    console.log(`📧 Email que se creará: ${adminData.email}`);

    // Método 1: Usar createUser (API de admin) con rol desde el inicio
    console.log("👤 Creando usuario con rol de super admin...");
    try {
      const user = await auth.api.createUser({
        body: {
          email: adminData.email,
          password: adminData.password,
          name: adminData.name,
          role: "admin", // Better Auth API only supports "admin" | "user"
        },
      });

      console.log("🎉 ¡Super Admin creado exitosamente!");
      console.log("📧 Email:", adminData.email);
      console.log("🔑 Contraseña:", adminData.password);
      console.log("👑 Rol: super_admin");
      console.log("🆔 ID:", user.user?.id);
    } catch (createError) {
      console.log(createError);
      console.log("⚠️  createUser falló, intentando método alternativo...");
      console.log("Error:", createError);

      // Método 2: Crear usuario normal y actualizar directamente en BD
      console.log("📝 Creando usuario normal...");
      const user = await auth.api.signUpEmail({
        body: adminData,
      });

      if (!user.user) {
        console.error("❌ Error: No se pudo crear el usuario");
        return;
      }

      console.log("✅ Usuario creado:", user.user.email);
      console.log("🆔 User ID:", user.user.id);

      // Método 3: Actualizar rol directamente en la base de datos
      console.log("🔧 Actualizando rol directamente en la base de datos...");

      // Importar prisma para actualizar directamente
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();

      try {
        const updatedUser = await prisma.user.update({
          where: { id: user.user.id },
          data: { role: "super_admin" },
        });

        console.log("✅ Rol actualizado en base de datos");
        console.log("🎉 ¡Super Admin creado exitosamente!");
        console.log("📧 Email:", adminData.email);
        console.log("🔑 Contraseña:", adminData.password);
        console.log("👑 Rol:", updatedUser.role);

        await prisma.$disconnect();
      } catch (dbError) {
        console.error("❌ Error actualizando en BD:", dbError);
        await prisma.$disconnect();
        return;
      }
    }

    console.log("\n🚀 Próximos pasos:");
    console.log("   1. Ve a http://localhost:3000/login");
    console.log("   2. Inicia sesión con las credenciales de arriba");
    console.log("   3. Ve a /dashboard para acceder al panel admin");
  } catch (error) {
    console.error("💥 Error general:", error);
    console.log("\n🔧 Posibles soluciones:");
    console.log("   - Asegúrate de que la base de datos esté corriendo");
    console.log("   - Ejecuta: npx @better-auth/cli migrate");
    console.log("   - Verifica las variables de entorno");
    console.log("   - Instala: npm install @prisma/client");
  }
}

createSuperAdmin()
  .then(() => {
    console.log("\n🏁 Script completado");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Error fatal:", error);
    process.exit(1);
  });
