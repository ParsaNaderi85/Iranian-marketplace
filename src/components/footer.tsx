import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PersianDivider } from "@/components/persian-divider";

export async function Footer() {
  const t = await getTranslations("nav");
  const tc = await getTranslations("common");
  const tl = await getTranslations("legal");

  return (
    <footer className="mt-auto">
      <PersianDivider />
      <div className="bg-persian-950 px-4 py-10 text-persian-100">
        <div className="mx-auto flex max-w-6xl flex-wrap items-start justify-between gap-8">
          <div>
            <p className="text-lg font-semibold text-white">{tc("appName")}</p>
            <p className="mt-1 max-w-xs text-sm text-persian-200/80">
              {tc("tagline")}
            </p>
          </div>

          <div className="flex flex-wrap gap-8 text-sm">
            <div className="flex flex-col gap-2">
              <span className="font-medium text-saffron-300">{t("home")}</span>
              <Link href="/supermarkets" className="text-persian-200/80 hover:text-white">
                {t("supermarkets")}
              </Link>
              <Link href="/restaurants" className="text-persian-200/80 hover:text-white">
                {t("restaurants")}
              </Link>
              <Link href="/bakeries" className="text-persian-200/80 hover:text-white">
                {t("bakeries")}
              </Link>
              <Link href="/cafes" className="text-persian-200/80 hover:text-white">
                {t("cafes")}
              </Link>
              <Link href="/catering" className="text-persian-200/80 hover:text-white">
                {t("catering")}
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-medium text-saffron-300">
                {t("vendorDashboard")}
              </span>
              <Link href="/signup" className="text-persian-200/80 hover:text-white">
                {t("signup")}
              </Link>
              <Link href="/login" className="text-persian-200/80 hover:text-white">
                {t("login")}
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-medium text-saffron-300">{t("about")}</span>
              <Link href="/about" className="text-persian-200/80 hover:text-white">
                {t("about")}
              </Link>
              <Link href="/faq" className="text-persian-200/80 hover:text-white">
                {t("faq")}
              </Link>
              <Link href="/refer" className="text-persian-200/80 hover:text-white">
                {t("referFriend")}
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-medium text-saffron-300">
                {tl("terms.navLabel")}
              </span>
              <Link href="/terms" className="text-persian-200/80 hover:text-white">
                {tl("terms.navLabel")}
              </Link>
              <Link href="/privacy" className="text-persian-200/80 hover:text-white">
                {tl("privacy.navLabel")}
              </Link>
              <Link href="/vendor-agreement" className="text-persian-200/80 hover:text-white">
                {tl("vendorAgreement.navLabel")}
              </Link>
            </div>
          </div>
        </div>
        <p className="mx-auto mt-8 max-w-6xl text-xs text-persian-300/60">
          © {new Date().getFullYear()} {tc("appName")}
        </p>
      </div>
    </footer>
  );
}
