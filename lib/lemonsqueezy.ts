import crypto from "crypto";
import type { PlanTier } from "./supabase";

type PlanConfig = {
  credits: number;
  tier: PlanTier;
  days?: number;
};

export function getPlanMap(): Record<string, PlanConfig> {
  return {
    [process.env.LEMONSQUEEZY_BASIC_VARIANT_ID!]: { credits: 3, tier: "basic" },
    [process.env.LEMONSQUEEZY_PRO_VARIANT_ID!]: { credits: 10, tier: "pro" },
    [process.env.LEMONSQUEEZY_UNLIMITED_VARIANT_ID!]: { credits: 999, tier: "unlimited", days: 90 },
  };
}

export function verifyWebhookSignature(
  payload: string,
  signature: string
): boolean {
  try {
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!;
    const hmac = crypto.createHmac("sha256", secret);
    const digest = hmac.update(payload).digest("hex");
    return crypto.timingSafeEqual(
      Buffer.from(digest, "hex"),
      Buffer.from(signature, "hex")
    );
  } catch {
    return false;
  }
}

export async function getCheckoutUrl(
  variantId: string,
  userId: string,
  email?: string
): Promise<string> {
  const storeId = process.env.LEMONSQUEEZY_STORE_ID!;

  const body = {
    data: {
      type: "checkouts",
      attributes: {
        checkout_data: {
          email: email || "",
          custom: { user_id: userId },
        },
      },
      relationships: {
        store: {
          data: { type: "stores", id: storeId },
        },
        variant: {
          data: { type: "variants", id: variantId },
        },
      },
    },
  };

  const response = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
      "Content-Type": "application/vnd.api+json",
      Accept: "application/vnd.api+json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    console.error("[checkout] LemonSqueezy error:", response.status, JSON.stringify(errBody));
    throw new Error("Failed to create checkout");
  }

  const data = await response.json();
  return data.data.attributes.url;
}
