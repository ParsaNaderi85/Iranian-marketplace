import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { searchMarketplaceForAssistant } from "@/lib/data/assistant";
import { routing, type Locale } from "@/i18n/routing";
import { checkRateLimit, getRequestIp } from "@/lib/rate-limit";

const ASSISTANT_RATE_LIMIT = 15;
const ASSISTANT_RATE_WINDOW_MS = 60_000;

const requestSchema = z.object({
  message: z.string().min(1).max(1000),
  locale: z.enum(routing.locales),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(2000),
      }),
    )
    .max(12)
    .optional(),
});

const client = new Anthropic();

const VENDOR_TYPES = [
  "supermarket",
  "restaurant",
  "bakery",
  "cafe",
  "catering",
] as const;

export async function POST(request: Request) {
  const ip = getRequestIp(request);
  const rateLimit = checkRateLimit(
    `assistant:${ip}`,
    ASSISTANT_RATE_LIMIT,
    ASSISTANT_RATE_WINDOW_MS,
  );
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
  const { message, locale, history = [] } = parsed.data;

  const context = await searchMarketplaceForAssistant(message, locale as Locale);

  const contextBlock =
    context.vendors.length === 0 && context.products.length === 0
      ? "No matching vendors or products were found in the marketplace for this query."
      : [
          context.vendors.length > 0
            ? `Matching vendors:\n${context.vendors
                .map((v) => `- ${v.name} (${v.type}${v.address ? `, ${v.address}` : ""}) [vendor_id: ${v.id}]`)
                .join("\n")}`
            : null,
          context.products.length > 0
            ? `Matching products:\n${context.products
                .map(
                  (p) =>
                    `- ${p.name} — ${p.priceAed} AED, sold by ${p.vendorName} [vendor_id: ${p.vendorId}]`,
                )
                .join("\n")}`
            : null,
        ]
          .filter(Boolean)
          .join("\n\n");

  const systemPrompt = `You are the shopping assistant for Iranian Marketplace, a website connecting Iranian supermarkets, restaurants, bakeries, cafes, and catering businesses in Dubai (${VENDOR_TYPES.join(", ")}) with the Iranian community there.

Help customers find vendors and products, and answer questions about how ordering works: customers browse a vendor's storefront, add items to a single-vendor cart, and check out with either an online card payment or cash/card on delivery. Delivery is handled by each vendor. There is a referral program giving 20% off. Reviews are shown on each vendor's page.

Only recommend specific vendors or products that appear in the "Marketplace search results" block below — never invent a business or item that isn't listed there. If nothing relevant was found, say so honestly and suggest the customer browse the relevant category from the homepage instead of guessing.

Respond in the customer's language (locale: ${locale}). Keep answers short — 2 to 4 sentences, friendly and direct.

Marketplace search results for the customer's latest message:
${contextBlock}`;

  try {
    const response = await client.messages.create({
      model: "claude-opus-5",
      max_tokens: 512,
      output_config: { effort: "low" },
      system: systemPrompt,
      messages: [
        ...history.map((m) => ({ role: m.role, content: m.content })),
        { role: "user" as const, content: message },
      ],
    });

    if (response.stop_reason === "refusal") {
      return NextResponse.json({
        reply:
          "Sorry, I can't help with that request. Try asking about a vendor, a product, or how ordering works.",
      });
    }

    const textBlock = response.content.find((b) => b.type === "text");
    return NextResponse.json({
      reply: textBlock?.type === "text" ? textBlock.text : "",
    });
  } catch {
    return NextResponse.json({ error: "assistant_unavailable" }, { status: 502 });
  }
}
