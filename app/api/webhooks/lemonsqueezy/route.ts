import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature, getPlanMap } from "@/lib/lemonsqueezy";
import { createServiceClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-signature") || "";

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "INVALID_SIGNATURE" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  const eventName: string = payload.meta?.event_name;
  const customData = payload.meta?.custom_data;
  const attributes = payload.data?.attributes;

  const serviceClient = createServiceClient();

  try {
    if (eventName === "order_created") {
      const userId = customData?.user_id as string | undefined;
      if (!userId) {
        return NextResponse.json({ received: true });
      }

      const variantId = String(attributes?.first_order_item?.variant_id || "");
      const planMap = getPlanMap();
      const planConfig = planMap[variantId];

      if (!planConfig) {
        console.warn("[webhook] unknown variant_id:", variantId);
        return NextResponse.json({ received: true });
      }

      const update: Record<string, unknown> = {
        plan_tier: planConfig.tier,
        ls_customer_id: String(attributes?.customer_id || ""),
        ls_order_id: String(payload.data?.id || ""),
      };

      if (planConfig.tier === "unlimited" && planConfig.days) {
        const expires = new Date();
        expires.setDate(expires.getDate() + planConfig.days);
        update.unlimited_expires_at = expires.toISOString();
        update.credits_remaining = 999;
      } else {
        // credits 누적 (기존 크레딧에 추가)
        const { data: existingUser } = await serviceClient
          .from("users")
          .select("credits_remaining")
          .eq("id", userId)
          .single();

        const current = (existingUser?.credits_remaining as number) ?? 0;
        update.credits_remaining = current + planConfig.credits;
      }

      await serviceClient.from("users").update(update).eq("id", userId);
    }
  } catch (err) {
    console.error("[webhook] error:", err);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
