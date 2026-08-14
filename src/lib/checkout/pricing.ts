// Pure money-math helpers used by checkout. Kept dependency-free (no
// Supabase, no "use server") so they can be unit tested directly.

export type PricedItem = {
  price_snapshot_aed: number;
  quantity: number;
};

function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateSubtotal(items: PricedItem[]): number {
  const raw = items.reduce(
    (sum, item) => sum + item.price_snapshot_aed * item.quantity,
    0,
  );
  return roundToCents(raw);
}

export function calculateCommission(
  subtotalAed: number,
  commissionRatePercent: number,
): number {
  return roundToCents(subtotalAed * (commissionRatePercent / 100));
}

export function calculateDiscountedSubtotal(
  subtotalAed: number,
  discountPercent: number | null,
): number {
  if (!discountPercent) return subtotalAed;
  return roundToCents(subtotalAed * (1 - discountPercent / 100));
}

export function calculateOrderTotal(
  discountedSubtotalAed: number,
  deliveryFeeAed: number,
): number {
  return roundToCents(discountedSubtotalAed + deliveryFeeAed);
}

export function calculateVendorPayout(
  subtotalAed: number,
  commissionAmountAed: number,
): number {
  return roundToCents(subtotalAed - commissionAmountAed);
}
