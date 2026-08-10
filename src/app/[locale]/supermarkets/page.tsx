import { VendorListing, generateVendorListingMetadata } from "@/components/vendor-listing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return generateVendorListingMetadata("supermarket", locale);
}

export default async function SupermarketsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; area?: string }>;
}) {
  return <VendorListing type="supermarket" searchParams={await searchParams} />;
}
