export const POINTS_PER_AED = 1;
export const REDEMPTION_COST = 500;
export const REDEMPTION_DISCOUNT_PERCENT = 15;

export function calculateLoyaltyPointsEarned(totalAed: number): number {
  return Math.floor(totalAed * POINTS_PER_AED);
}
