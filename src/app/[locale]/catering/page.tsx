import { VendorListing } from "@/components/vendor-listing";

export default async function CateringPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; area?: string }>;
}) {
  return <VendorListing type="catering" searchParams={await searchParams} />;
}
