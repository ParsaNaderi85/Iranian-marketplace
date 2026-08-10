import { VendorListing } from "@/components/vendor-listing";

export default async function RestaurantsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; area?: string }>;
}) {
  return <VendorListing type="restaurant" searchParams={await searchParams} />;
}
