import { VendorListing } from "@/components/vendor-listing";

export default async function BakeriesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; area?: string }>;
}) {
  return <VendorListing type="bakery" searchParams={await searchParams} />;
}
