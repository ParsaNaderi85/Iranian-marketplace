import { VendorListing } from "@/components/vendor-listing";

export default async function SupermarketsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; area?: string }>;
}) {
  return <VendorListing type="supermarket" searchParams={await searchParams} />;
}
