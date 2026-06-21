import { describe, it, expect } from "vitest";
import { getAuthErrorMessage, toGoogleAuthProfile } from "./authService";
import { User } from "firebase/auth";

describe("authService helpers", () => {
  describe("toGoogleAuthProfile", () => {
    it("should map typical Firebase User properties correctly", () => {
      const mockUser = {
        uid: "user-123",
        displayName: "John Doe",
        email: "john@example.com",
        photoURL: "https://example.com/avatar.jpg"
      } as unknown as User;

      const profile = toGoogleAuthProfile(mockUser);
      expect(profile).toEqual({
        uid: "user-123",
        displayName: "John Doe",
        email: "john@example.com",
        photoURL: "https://example.com/avatar.jpg"
      });
    });

    it("should fallback to default displayName if empty or null", () => {
      const mockUserEmptyName = {
        uid: "user-456",
        displayName: null,
        email: "guest@example.com",
        photoURL: null
      } as unknown as User;

      const profile = toGoogleAuthProfile(mockUserEmptyName);
      expect(profile.displayName).toBe("Eco Guardian");
      expect(profile.photoURL).toBeNull();
    });
  });

  describe("getAuthErrorMessage", () => {
    it("should return the specific error message for popup-closed-by-user", () => {
      const error = { code: "auth/popup-closed-by-user" };
      expect(getAuthErrorMessage(error)).toBe("Google sign-in was closed before it finished.");
    });

    it("should return the specific error message for network-request-failed", () => {
      const error = { code: "auth/network-request-failed" };
      expect(getAuthErrorMessage(error)).toBe("Network error while contacting Firebase. Check your connection and try again.");
    });

    it("should return the specific error message for unauthorized-domain", () => {
      const originalWindow = global.window;
      global.window = { location: { hostname: "localhost" } } as any;

      const error = { code: "auth/unauthorized-domain" };
      const msg = getAuthErrorMessage(error);
      expect(msg).toContain("This domain (localhost)");
      expect(msg).toContain("is not authorized in Firebase Authentication settings");

      global.window = originalWindow;
    });

    it("should fallback to generic error message if code is unknown", () => {
      const error = { code: "auth/unknown-error-code" };
      expect(getAuthErrorMessage(error)).toBe("Google sign-in failed (auth/unknown-error-code). Please try again.");
    });

    it("should return generic failure message if error has no code", () => {
      expect(getAuthErrorMessage({})).toBe("Google sign-in failed. Please try again.");
      expect(getAuthErrorMessage(new Error("Generic error"))).toBe("Google sign-in failed. Please try again.");
    });
  });
});
