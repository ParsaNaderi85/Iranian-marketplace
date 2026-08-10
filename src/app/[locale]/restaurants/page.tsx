import { VendorListing, generateVendorListingMetadata } from "@/components/vendor-listing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return generateVendorListingMetadata("restaurant", locale);
}

export default async function RestaurantsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; area?: string }>;
}) {
  return <VendorListing type="restaurant" searchParams={await searchParams} />;
}
