import { VendorListing, generateVendorListingMetadata } from "@/components/vendor-listing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return generateVendorListingMetadata("cafe", locale);
}

export default async function CafesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; area?: string }>;
}) {
  return <VendorListing type="cafe" searchParams={await searchParams} />;
}
