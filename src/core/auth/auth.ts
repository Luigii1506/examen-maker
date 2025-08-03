import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { prisma } from "@/core/database/prisma";
import {
  accessControl,
  PREDEFINED_ROLES,
  superAdminRole,
  adminRole,
  userRole,
} from "@/core/auth/config/permissions";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "sqlite"
  }),

  // 📧 Email and Password Configuration
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },

  // 🔌 PLUGINS CONFIGURATION
  plugins: [
    // ��️ Admin Plugin with Basic Configuration
    admin({
      // ⚙️ Admin Plugin Options
      defaultRole: "user",
      adminRoles: ["super_admin", "admin"], // Roles considered as admin

      // 🚫 Ban Settings
      defaultBanReason: "Violación de términos de servicio",
      defaultBanExpiresIn: 60 * 60 * 24 * 7, // 7 days
      bannedUserMessage:
        "Tu cuenta ha sido suspendida. Contacta al soporte si crees que es un error.",

      // 👤 Impersonation Settings
      impersonationSessionDuration: 60 * 60, // 1 hour
    }),
  ],

  // 🔐 Security Configuration
  //trustedOrigins: ["http://localhost:3000"],

  // 📝 Session Configuration
  // session: {
  //   expiresIn: 60 * 60 * 24 * 7, // 7 days
  //   updateAge: 60 * 60 * 24, // 1 day
  //   cookieCache: {
  //     enabled: true,
  //     maxAge: 5 * 60 * 1000, // 5 minutes
  //   },
  // },

  // 🎨 Advanced Options
  advanced: {
    generateId: false, // Use auto-increment IDs
    crossSubdomainCookies: {
      enabled: false,
    },
  },

  // 🔔 Event Hooks for Auditing
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          console.log(`🎉 Creating new user: ${user.email}`);
          return { data: user };
        },
        after: async (user) => {
          console.log(`✅ User created successfully: ${user.email}`);
        },
      },
      update: {
        before: async (user) => {
          console.log(`📝 Updating user: ${user.email}`);
          return { data: user };
        },
        after: async (user) => {
          console.log(`✅ User updated: ${user.email}`);
        },
      },
    },
    session: {
      create: {
        after: async (session) => {
          console.log(`🔐 New session created for user: ${session.userId}`);
        },
      },
    },
  },
});
