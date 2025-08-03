// 🧪 TESTS DE UTILIDADES DE TESTING
// =================================
// Tests para verificar que las utilidades de testing funcionan correctamente

import {
  createMockUser,
  createMockFeatureFlags,
} from "../testing/mock-helpers";
import { testUsers, testFeatureFlags } from "../testing/test-data";

describe("Testing Utilities", () => {
  describe("Mock Helpers", () => {
    it("should create mock user with defaults", () => {
      const user = createMockUser();

      expect(user).toEqual({
        id: "test-user-id",
        name: "Test User",
        email: "test@example.com",
        role: "user",
      });
    });

    it("should create mock user with overrides", () => {
      const user = createMockUser({
        name: "Custom User",
        role: "admin",
      });

      expect(user.name).toBe("Custom User");
      expect(user.role).toBe("admin");
      expect(user.id).toBe("test-user-id"); // Should keep default
    });

    it("should create mock feature flags", () => {
      const flags = createMockFeatureFlags({
        FILE_UPLOAD: true,
        SOCIAL_LOGIN: true,
      });

      expect(flags.FILE_UPLOAD).toBe(true);
      expect(flags.SOCIAL_LOGIN).toBe(true);
      expect(flags.ADMIN_FEATURES).toBe(false); // Default
    });
  });

  describe("Test Data", () => {
    it("should provide test users", () => {
      expect(testUsers.admin).toBeDefined();
      expect(testUsers.user).toBeDefined();
      expect(testUsers.superAdmin).toBeDefined();

      expect(testUsers.admin.role).toBe("admin");
      expect(testUsers.user.role).toBe("user");
    });

    it("should provide test feature flags", () => {
      expect(testFeatureFlags.allEnabled).toBeDefined();
      expect(testFeatureFlags.allDisabled).toBeDefined();
      expect(testFeatureFlags.basicEnabled).toBeDefined();

      expect(testFeatureFlags.allEnabled.FILE_UPLOAD).toBe(true);
      expect(testFeatureFlags.allDisabled.FILE_UPLOAD).toBe(false);
    });
  });

  describe("Utility Functions", () => {
    it("should validate test data structure", () => {
      const user = testUsers.admin;

      expect(typeof user.id).toBe("string");
      expect(typeof user.name).toBe("string");
      expect(typeof user.email).toBe("string");
      expect(typeof user.role).toBe("string");
    });

    it("should provide feature flag helpers", () => {
      const flags = createMockFeatureFlags();

      expect(typeof flags).toBe("object");
      expect(Object.keys(flags).length).toBeGreaterThan(0);
    });
  });
});
