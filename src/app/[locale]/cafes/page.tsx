import { VendorListing } from "@/components/vendor-listing";

export default async function CafesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; area?: string }>;
}) {
  return <VendorListing type="cafe" searchParams={await searchParams} />;
}
