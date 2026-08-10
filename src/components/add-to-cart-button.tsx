"use client";

import { useTranslations } from "next-intl";
import { useCart } from "@/lib/cart/cart-context";

export function AddToCartButton({
  vendorId,
  vendorName,
  productId,
  name,
  priceAed,
}: {
  vendorId: string;
  vendorName: string;
  productId: string;
  name: string;
  priceAed: number;
}) {
  const t = useTranslations("cart");
  const tp = useTranslations("vendorPublic");
  const { cart, addItem } = useCart();

  function handleClick() {
    if (cart && cart.vendorId !== vendorId) {
      const confirmed = window.confirm(t("singleVendorNotice"));
      if (!confirmed) return;
    }
    addItem(vendorId, vendorName, { productId, name, priceAed, quantity: 1 });
  }

  return (
    <button
      onClick={handleClick}
      className="rounded-md bg-persian-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-persian-700"
    >
      {tp("addToCart")}
    </button>
  );
}
