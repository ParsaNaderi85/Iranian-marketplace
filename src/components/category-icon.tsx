import type { VendorType } from "@/lib/types";

const paths: Record<VendorType, React.ReactNode> = {
  supermarket: (
    <path d="M3 4h2l1.2 10.6A2 2 0 0 0 8.2 16.4h8.4a2 2 0 0 0 2-1.7L20 8H6M8.5 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
  ),
  restaurant: (
    <path d="M7 3v6a2 2 0 0 1-2 2v10M5 11h4M9 3v8M17 3c-1.5 0-3 1.5-3 4s1.5 4 1.5 4V21M17 3v18" />
  ),
  bakery: (
    <path d="M4 12c0-3 2-6 8-6s8 3 8 6-3 2-8 2-8 1-8-2Zm2 2 1 8h10l1-8" />
  ),
  cafe: (
    <path d="M4 8h13v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4Zm13 1h2a2 2 0 0 1 0 4h-2M6 3c0 1-1 1-1 2s1 1 1 2M10 3c0 1-1 1-1 2s1 1 1 2" />
  ),
  catering: (
    <path d="M12 3a3 3 0 0 1 3 3c0 1-.5 1.7-1 2.3L20 15v6H4v-6l6-6.7C9.5 7.7 9 7 9 6a3 3 0 0 1 3-3Z" />
  ),
};

export function CategoryIcon({ type, className }: { type: VendorType; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[type]}
    </svg>
  );
}
