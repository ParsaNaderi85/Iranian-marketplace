"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { customerHasDeliveredOrder } from "@/lib/data/reviews";

export type ReviewActionState = { error?: string } | undefined;

const reviewSchema = z.object({
  vendorId: z.string().uuid(),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
  locale: z.string(),
});

export async function submitReview(
  _prevState: ReviewActionState,
  formData: FormData,
): Promise<ReviewActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "unauthorized" };

  const parsed = reviewSchema.safeParse({
    vendorId: formData.get("vendorId"),
    rating: formData.get("rating"),
    comment: formData.get("comment") || undefined,
    locale: formData.get("locale"),
  });
  if (!parsed.success) return { error: "invalid" };

  const { vendorId, rating, comment, locale } = parsed.data;

  const eligible = await customerHasDeliveredOrder(user.id, vendorId);
  if (!eligible) return { error: "mustOrderFirst" };

  const supabase = await createClient();
  const { error } = await supabase.from("reviews").insert({
    vendor_id: vendorId,
    customer_id: user.id,
    rating,
    comment: comment ?? null,
  });
  if (error) return { error: "invalid" };

  revalidatePath(`/${locale}/vendors/${vendorId}`);
  return undefined;
}
