import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getCurrentProfile } from "@/lib/auth/session";
import { logout } from "@/lib/auth/actions";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { CartIndicator } from "@/components/cart-indicator";

export async function Navbar() {
  const t = await getTranslations("nav");
  const tc = await getTranslations("common");
  const locale = await getLocale();
  const profile = await getCurrentProfile();

  return (
    <header className="border-b border-persian-100 bg-white dark:border-persian-950 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-3">
        <Link
          href="/"
          className="text-lg font-semibold text-persian-700 dark:text-persian-300"
        >
          {tc("appName")}
        </Link>

        <nav className="flex flex-wrap items-center gap-4 text-sm">
          <Link href="/supermarkets">{t("supermarkets")}</Link>
          <Link href="/restaurants">{t("restaurants")}</Link>
          <Link href="/bakeries">{t("bakeries")}</Link>
          <Link href="/cafes">{t("cafes")}</Link>
          <Link href="/catering">{t("catering")}</Link>
          {profile?.role === "admin" && (
            <Link href="/admin">{t("adminDashboard")}</Link>
          )}
          {profile?.role === "vendor_owner" && (
            <Link href="/vendor">{t("vendorDashboard")}</Link>
          )}
          {profile?.role === "customer" && (
            <Link href="/orders">{t("myOrders")}</Link>
          )}
        </nav>

        <div className="ms-auto flex items-center gap-4 text-sm">
          <Link href="/refer" className="text-saffron-700 dark:text-saffron-400">
            {t("referFriend")}
          </Link>

          <Link href="/cart" className="flex items-center">
            {t("cart")}
            <CartIndicator />
          </Link>

          {profile ? (
            <form action={logout}>
              <input type="hidden" name="locale" value={locale} />
              <button
                type="submit"
                className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                {t("logout")}
              </button>
            </form>
          ) : (
            <>
              <Link href="/login">{t("login")}</Link>
              <Link
                href="/signup"
                className="rounded-md bg-saffron-500 px-3 py-1.5 font-medium text-zinc-900 hover:bg-saffron-400"
              >
                {t("signup")}
              </Link>
            </>
          )}

          <LocaleSwitcher />
        </div>
      </div>
    </header>
  );
}
