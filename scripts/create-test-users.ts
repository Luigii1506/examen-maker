/**
 * 👥 SCRIPT PARA CREAR USUARIOS DE PRUEBA
 *
 * Este script crea usuarios con diferentes roles para probar
 * el sistema de permisos completo.
 *
 * Ejecutar con: npx tsx src/scripts/create-test-users.ts
 */

import { auth } from "@/core/auth/auth";
import { ROLE_INFO } from "@/core/auth/config/permissions";

interface TestUser {
  email: string;
  name: string;
  password: string;
  role: string;
  description: string;
}

async function createTestUsers() {
  console.log("🚀 Creando usuarios de prueba para el sistema de permisos...\n");

  // Definir usuarios de prueba para cada rol
  const testUsers: TestUser[] = [
    {
      email: "admin@test.com",
      name: "Admin Test",
      password: "Admin123!",
      role: "admin",
      description: "Administrador con acceso completo (excepto super admin)",
    },
    {
      email: "editor@test.com",
      name: "Editor Test",
      password: "Editor123!",
      role: "editor",
      description: "Editor de contenido con permisos de creación y publicación",
    },
    {
      email: "moderator@test.com",
      name: "Moderator Test",
      password: "Moderator123!",
      role: "moderator",
      description: "Moderador para gestión de comunidad",
    },
    {
      email: "user@test.com",
      name: "User Test",
      password: "User123!",
      role: "user",
      description: "Usuario estándar con permisos básicos",
    },
    {
      email: "guest@test.com",
      name: "Guest Test",
      password: "Guest123!",
      role: "guest",
      description: "Usuario invitado con acceso mínimo",
    },
  ];

  let successCount = 0;
  let errorCount = 0;

  console.log("📋 Usuarios que se van a crear:\n");

  testUsers.forEach((user, index) => {
    const roleInfo = ROLE_INFO[user.role as keyof typeof ROLE_INFO];
    console.log(`${index + 1}. ${roleInfo.icon} ${user.name}`);
    console.log(`   📧 Email: ${user.email}`);
    console.log(`   👑 Rol: ${roleInfo.name}`);
    console.log(`   📝 Descripción: ${user.description}`);
    console.log(`   🔑 Contraseña: ${user.password}\n`);
  });

  console.log("⚠️  IMPORTANTE: Guarda estas credenciales para hacer pruebas\n");
  console.log("━".repeat(60));

  for (const userData of testUsers) {
    try {
      console.log(
        `\n👤 Creando usuario: ${userData.name} (${userData.role})...`
      );

      // Map roles for Better Auth API compatibility
      const betterAuthRole =
        userData.role === "super_admin"
          ? "admin"
          : (userData.role as "admin" | "user");

      // Intentar crear usuario
      try {
        const user = await auth.api.createUser({
          body: {
            email: userData.email,
            password: userData.password,
            name: userData.name,
            role: betterAuthRole,
          },
        });

        console.log(`✅ Usuario creado exitosamente`);
        console.log(`   🆔 ID: ${user.user?.id}`);
        console.log(`   📧 Email: ${userData.email}`);
        console.log(`   👑 Rol: ${userData.role}`);

        successCount++;
      } catch (createError) {
        // Si el usuario ya existe, intentar actualizar su rol
        const errorMessage =
          createError instanceof Error
            ? createError.message
            : String(createError);
        if (
          errorMessage?.includes("already exists") ||
          errorMessage?.includes("User already exists")
        ) {
          console.log(`⚠️  Usuario ya existe, actualizando rol...`);

          try {
            // Primero obtener el usuario por email para obtener su ID
            const users = await auth.api.listUsers({
              query: {
                limit: 100,
                searchValue: userData.email,
                searchField: "email",
              },
            });

            const existingUser = users.users?.find(
              (u) => u.email === userData.email
            );

            if (existingUser) {
              // Actualizar rol directamente en la base de datos
              const { PrismaClient } = await import("@prisma/client");
              const prisma = new PrismaClient();

              await prisma.user.update({
                where: { id: existingUser.id },
                data: { role: userData.role },
              });

              await prisma.$disconnect();

              console.log(`✅ Rol actualizado a ${userData.role}`);
              console.log(`   🆔 ID: ${existingUser.id}`);
              console.log(`   📧 Email: ${userData.email}`);

              successCount++;
            } else {
              throw new Error("Usuario no encontrado después de buscar");
            }
          } catch (updateError) {
            console.error(`❌ Error actualizando usuario: ${updateError}`);
            errorCount++;
          }
        } else {
          console.error(`❌ Error creando usuario: ${createError}`);
          errorCount++;
        }
      }
    } catch (error) {
      console.error(`💥 Error general con ${userData.email}:`, error);
      errorCount++;
    }
  }

  console.log("\n" + "━".repeat(60));
  console.log("📊 RESUMEN DE CREACIÓN:");
  console.log(`✅ Usuarios creados/actualizados: ${successCount}`);
  console.log(`❌ Errores: ${errorCount}`);
  console.log(`📈 Total procesados: ${testUsers.length}`);

  if (successCount > 0) {
    console.log("\n🎉 ¡Usuarios de prueba listos!");
    console.log("\n🔗 Próximos pasos:");
    console.log("   1. Ve a http://localhost:3000/login");
    console.log(
      "   2. Prueba iniciar sesión con cualquiera de los usuarios de arriba"
    );
    console.log("   3. Ve a /dashboard para probar los permisos");
    console.log(
      "   4. Como super-admin, ve a la sección 'Permisos' para gestionar usuarios"
    );

    console.log("\n🧪 PRUEBAS RECOMENDADAS:");
    console.log(
      "   • Inicia sesión como 'admin@test.com' - Debería ver gestión de usuarios"
    );
    console.log(
      "   • Inicia sesión como 'editor@test.com' - Solo debería ver contenido"
    );
    console.log("   • Inicia sesión como 'user@test.com' - Acceso básico");
    console.log(
      "   • Como super-admin, cambia roles desde el panel de permisos"
    );

    console.log("\n🔐 RECORDATORIO DE CREDENCIALES:");
    testUsers.forEach((user) => {
      console.log(`   ${user.email} : ${user.password} (${user.role})`);
    });
  }

  if (errorCount > 0) {
    console.log("\n🔧 En caso de errores:");
    console.log("   - Asegúrate de que la base de datos esté corriendo");
    console.log("   - Ejecuta: npx @better-auth/cli migrate");
    console.log("   - Verifica las variables de entorno");
    console.log(
      "   - Si los usuarios ya existen, el script los actualiza automáticamente"
    );
  }

  console.log("\n📚 MÁS INFORMACIÓN:");
  console.log("   - Revisa PERMISSIONS_GUIDE.md para entender el sistema");
  console.log("   - Los roles y permisos están en src/lib/auth/permissions.ts");
  console.log(
    "   - Usa los hooks en src/hooks/usePermissions.ts en tus componentes"
  );
}

// Ejecutar el script
createTestUsers()
  .then(() => {
    console.log("\n🏁 Script de usuarios de prueba completado");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Error fatal en el script:", error);
    console.log("\n🔧 Posibles soluciones:");
    console.log("   - Verifica que el servidor esté corriendo");
    console.log("   - Ejecuta primero el script create-super-admin.ts");
    console.log("   - Asegúrate de que las migraciones estén aplicadas");
    process.exit(1);
  });
