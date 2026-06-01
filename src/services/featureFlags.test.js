import { describe, expect, it } from "vitest";
import { canUse, FEATURES } from "./featureFlags";

describe("feature flags", () => {
  it("habilita assets en starter por default", () => {
    expect(canUse(FEATURES.ASSET_EXPORT, { planCode: "starter" })).toBe(true);
  });

  it("solo agency habilita billing", () => {
    expect(canUse(FEATURES.BILLING, { planCode: "starter" })).toBe(false);
    expect(canUse(FEATURES.BILLING, { planCode: "agency" })).toBe(true);
  });
});
