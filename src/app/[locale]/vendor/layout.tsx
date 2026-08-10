import { redirect } from "@/i18n/navigation";
import { getCurrentProfile } from "@/lib/auth/session";

export default async function VendorLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== "vendor_owner") {
    redirect({ href: "/login", locale });
  }

  return <div className="mx-auto max-w-5xl px-4 py-10">{children}</div>;
}
