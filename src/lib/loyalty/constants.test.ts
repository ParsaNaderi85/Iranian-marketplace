import { describe, it, expect } from "vitest";
import {
  calculateLoyaltyPointsEarned,
  POINTS_PER_AED,
  REDEMPTION_COST,
  REDEMPTION_DISCOUNT_PERCENT,
} from "./constants";

describe("calculateLoyaltyPointsEarned", () => {
  it("awards points equal to the AED total at the current rate", () => {
    expect(calculateLoyaltyPointsEarned(120)).toBe(120 * POINTS_PER_AED);
  });

  it("floors fractional AED amounts down to whole points", () => {
    expect(calculateLoyaltyPointsEarned(19.99)).toBe(19);
  });

  it("returns 0 for a zero-value order", () => {
    expect(calculateLoyaltyPointsEarned(0)).toBe(0);
  });

  it("never returns a negative point count for a non-negative total", () => {
    expect(calculateLoyaltyPointsEarned(0.5)).toBeGreaterThanOrEqual(0);
  });
});

describe("redemption configuration sanity", () => {
  it("redemption cost is a positive whole number of points", () => {
    expect(REDEMPTION_COST).toBeGreaterThan(0);
    expect(Number.isInteger(REDEMPTION_COST)).toBe(true);
  });

  it("redemption discount is a valid percentage", () => {
    expect(REDEMPTION_DISCOUNT_PERCENT).toBeGreaterThan(0);
    expect(REDEMPTION_DISCOUNT_PERCENT).toBeLessThanOrEqual(100);
  });
});
