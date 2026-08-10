import type { VendorType } from "@/lib/types";

// Each vendor type gets a distinct color from the Persian-inspired palette,
// evoking the mix of hues in Persian tilework and miniature painting
// (turquoise, gold, pomegranate red, jade green, violet).
export const VENDOR_TYPE_COLORS: Record<
  VendorType,
  { badge: string; iconBg: string; iconText: string; headerBg: string }
> = {
  supermarket: {
    badge: "bg-persian-500 text-white",
    iconBg: "bg-persian-100 dark:bg-persian-950",
    iconText: "text-persian-700 dark:text-persian-300",
    headerBg: "bg-gradient-to-r from-persian-700 to-persian-600",
  },
  restaurant: {
    badge: "bg-saffron-500 text-zinc-900",
    iconBg: "bg-saffron-100 dark:bg-saffron-950",
    iconText: "text-saffron-700 dark:text-saffron-300",
    headerBg: "bg-gradient-to-r from-saffron-700 to-saffron-600",
  },
  bakery: {
    badge: "bg-anar-500 text-white",
    iconBg: "bg-anar-100 dark:bg-anar-950",
    iconText: "text-anar-700 dark:text-anar-300",
    headerBg: "bg-gradient-to-r from-anar-700 to-anar-600",
  },
  cafe: {
    badge: "bg-firoozeh-500 text-white",
    iconBg: "bg-firoozeh-100 dark:bg-firoozeh-950",
    iconText: "text-firoozeh-700 dark:text-firoozeh-300",
    headerBg: "bg-gradient-to-r from-firoozeh-700 to-firoozeh-600",
  },
  catering: {
    badge: "bg-banafsh-500 text-white",
    iconBg: "bg-banafsh-100 dark:bg-banafsh-950",
    iconText: "text-banafsh-700 dark:text-banafsh-300",
    headerBg: "bg-gradient-to-r from-banafsh-700 to-banafsh-600",
  },
};
