"use client";

import dynamic from "next/dynamic";

const OrderMapInner = dynamic(
  () => import("@/components/order-map-inner").then((m) => m.OrderMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 w-full items-center justify-center rounded-lg bg-zinc-100 text-sm text-zinc-400 dark:bg-zinc-800">
        Loading map…
      </div>
    ),
  },
);

export function OrderMap(props: React.ComponentProps<typeof OrderMapInner>) {
  return <OrderMapInner {...props} />;
}
