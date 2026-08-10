import { VendorListing, generateVendorListingMetadata } from "@/components/vendor-listing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return generateVendorListingMetadata("catering", locale);
}

export default async function CateringPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; area?: string }>;
}) {
  return <VendorListing type="catering" searchParams={await searchParams} />;
}
