import { Link } from "@/i18n/navigation";
import { CategoryIcon } from "@/components/category-icon";
import { VENDOR_TYPE_SLUGS, type VendorType } from "@/lib/types";
import { VENDOR_TYPE_COLORS } from "@/lib/vendor-colors";

export function CategoryTile({ type, label }: { type: VendorType; label: string }) {
  const colors = VENDOR_TYPE_COLORS[type];

  return (
    <Link
      href={`/${VENDOR_TYPE_SLUGS[type]}`}
      className="group flex flex-col items-center gap-3 rounded-xl border border-zinc-200 bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
    >
      <span
        className={`flex h-14 w-14 items-center justify-center rounded-full transition group-hover:scale-110 ${colors.iconBg} ${colors.iconText}`}
      >
        <CategoryIcon type={type} className="h-7 w-7" />
      </span>
      <span className="font-medium text-zinc-900 dark:text-zinc-50">
        {label}
      </span>
    </Link>
  );
}
