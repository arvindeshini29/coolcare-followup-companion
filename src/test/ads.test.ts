import { describe, expect, it } from "vitest";
import { ADMOB_TEST_BANNER_ID, adsEnabled, bannerAdUnitId, isAdAllowedOnPath } from "@/lib/ads";

describe("ad placement policy", () => {
  it("allows ads on the dashboard only", () => {
    expect(isAdAllowedOnPath("/dashboard")).toBe(true);
    expect(isAdAllowedOnPath("/dashboard/")).toBe(true);
  });
  it("never allows ads on sign-in, forms or lead actions", () => {
    for (const p of [
      "/auth",
      "/reset-password",
      "/leads/new",
      "/leads/abc",
      "/leads",
      "/follow-ups",
      "/templates",
      "/settings",
      "/",
    ]) {
      expect(isAdAllowedOnPath(p)).toBe(false);
    }
  });
  it("is off by default and uses Google's test unit", () => {
    expect(adsEnabled()).toBe(false);
    expect(bannerAdUnitId()).toBe(ADMOB_TEST_BANNER_ID);
  });
});
