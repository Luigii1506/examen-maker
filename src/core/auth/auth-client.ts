import { createAuthClient } from "better-auth/client";
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",

  // 🔌 CLIENT PLUGINS
  plugins: [
    // 🛡️ Admin Client Plugin - Basic configuration
    adminClient(),
  ],
});
