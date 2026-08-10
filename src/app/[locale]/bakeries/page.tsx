import { VendorListing, generateVendorListingMetadata } from "@/components/vendor-listing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return generateVendorListingMetadata("bakery", locale);
}

export default async function BakeriesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; area?: string }>;
}) {
  return <VendorListing type="bakery" searchParams={await searchParams} />;
}
