import { describe, it, expect } from "vitest";
import {
  calculateSubtotal,
  calculateCommission,
  calculateDiscountedSubtotal,
  calculateOrderTotal,
  calculateVendorPayout,
} from "./pricing";

describe("calculateSubtotal", () => {
  it("sums price * quantity across line items", () => {
    const subtotal = calculateSubtotal([
      { price_snapshot_aed: 10, quantity: 2 },
      { price_snapshot_aed: 5.5, quantity: 3 },
    ]);
    expect(subtotal).toBe(36.5);
  });

  it("returns 0 for no items", () => {
    expect(calculateSubtotal([])).toBe(0);
  });

  it("rounds away floating point drift", () => {
    const subtotal = calculateSubtotal([
      { price_snapshot_aed: 0.1, quantity: 1 },
      { price_snapshot_aed: 0.2, quantity: 1 },
    ]);
    expect(subtotal).toBe(0.3);
  });
});

describe("calculateCommission", () => {
  it("computes a percentage of the subtotal", () => {
    expect(calculateCommission(100, 15)).toBe(15);
  });

  it("rounds to the nearest cent", () => {
    expect(calculateCommission(33.33, 10)).toBe(3.33);
  });

  it("is zero when the commission rate is zero", () => {
    expect(calculateCommission(500, 0)).toBe(0);
  });

  it("handles a 100% commission rate", () => {
    expect(calculateCommission(80, 100)).toBe(80);
  });
});

describe("calculateDiscountedSubtotal", () => {
  it("returns the original subtotal when there is no discount", () => {
    expect(calculateDiscountedSubtotal(100, null)).toBe(100);
  });

  it("applies a percentage discount", () => {
    expect(calculateDiscountedSubtotal(100, 20)).toBe(80);
  });

  it("rounds the discounted amount to the nearest cent", () => {
    expect(calculateDiscountedSubtotal(49.99, 15)).toBe(42.49);
  });

  it("treats a 0% discount the same as no discount", () => {
    expect(calculateDiscountedSubtotal(75, 0)).toBe(75);
  });

  it("supports a 100% discount", () => {
    expect(calculateDiscountedSubtotal(75, 100)).toBe(0);
  });
});

describe("calculateOrderTotal", () => {
  it("adds delivery fee to the discounted subtotal", () => {
    expect(calculateOrderTotal(80, 10)).toBe(90);
  });

  it("supports a zero delivery fee", () => {
    expect(calculateOrderTotal(42.5, 0)).toBe(42.5);
  });

  it("rounds the combined total", () => {
    expect(calculateOrderTotal(10.005, 5.005)).toBe(15.01);
  });
});

describe("calculateVendorPayout", () => {
  it("subtracts commission from subtotal", () => {
    expect(calculateVendorPayout(100, 15)).toBe(85);
  });

  it("is never computed as negative in normal cases (commission <= subtotal)", () => {
    expect(calculateVendorPayout(50, 50)).toBe(0);
  });

  it("guards against float drift", () => {
    expect(calculateVendorPayout(19.99, 2.999)).toBeCloseTo(16.99, 2);
  });
});

describe("end-to-end checkout math", () => {
  it("matches a full order with a coupon and delivery fee", () => {
    const items = [
      { price_snapshot_aed: 25, quantity: 2 },
      { price_snapshot_aed: 12.5, quantity: 1 },
    ];
    const subtotal = calculateSubtotal(items);
    expect(subtotal).toBe(62.5);

    const commission = calculateCommission(subtotal, 12);
    expect(commission).toBe(7.5);

    const discounted = calculateDiscountedSubtotal(subtotal, 10);
    expect(discounted).toBe(56.25);

    const total = calculateOrderTotal(discounted, 15);
    expect(total).toBe(71.25);

    const payout = calculateVendorPayout(subtotal, commission);
    expect(payout).toBe(55);
  });
});
