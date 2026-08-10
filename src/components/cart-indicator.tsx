"use client";

import { useCart } from "@/lib/cart/cart-context";

export function CartIndicator() {
  const { itemCount } = useCart();
  if (itemCount === 0) return null;
  return (
    <span className="ms-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-persian-600 px-1 text-xs font-medium text-white">
      {itemCount}
    </span>
  );
}
