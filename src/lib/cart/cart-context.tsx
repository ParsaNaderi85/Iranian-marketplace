"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Cart, CartItem } from "@/lib/types";

const STORAGE_KEY = "iranian-souq-cart";

type CartContextValue = {
  cart: Cart | null;
  itemCount: number;
  subtotal: number;
  addItem: (
    vendorId: string,
    vendorName: string,
    item: CartItem,
  ) => "added" | "cleared_and_added";
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // One-time restore from localStorage on mount. This intentionally runs
    // after the initial (server-matching) render to avoid a hydration
    // mismatch, since localStorage is only available client-side.
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCart(JSON.parse(raw));
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (cart) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [cart, hydrated]);

  function addItem(
    vendorId: string,
    vendorName: string,
    item: CartItem,
  ): "added" | "cleared_and_added" {
    let result: "added" | "cleared_and_added" = "added";

    setCart((current) => {
      if (current && current.vendorId !== vendorId) {
        result = "cleared_and_added";
        return { vendorId, vendorName, items: [item] };
      }

      if (!current) {
        return { vendorId, vendorName, items: [item] };
      }

      const existing = current.items.find(
        (i) => i.productId === item.productId,
      );
      const items = existing
        ? current.items.map((i) =>
            i.productId === item.productId
              ? { ...i, quantity: i.quantity + item.quantity }
              : i,
          )
        : [...current.items, item];

      return { ...current, items };
    });

    return result;
  }

  function updateQuantity(productId: string, quantity: number) {
    setCart((current) => {
      if (!current) return current;
      if (quantity <= 0) {
        const items = current.items.filter((i) => i.productId !== productId);
        return items.length > 0 ? { ...current, items } : null;
      }
      return {
        ...current,
        items: current.items.map((i) =>
          i.productId === productId ? { ...i, quantity } : i,
        ),
      };
    });
  }

  function removeItem(productId: string) {
    updateQuantity(productId, 0);
  }

  function clearCart() {
    setCart(null);
  }

  const itemCount =
    cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const subtotal =
    cart?.items.reduce(
      (sum, item) => sum + item.quantity * item.priceAed,
      0,
    ) ?? 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        subtotal,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
