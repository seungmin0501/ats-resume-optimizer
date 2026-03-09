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
        const { data: existingUser } = await serviceClient
          .from("users")
          .select("credits_remaining, plan_tier")
          .eq("id", userId)
          .single();

        // Unlimited에서 하위 플랜으로 변경 시 누적하지 않고 새 크레딧으로 설정
        const wasUnlimited = existingUser?.plan_tier === "unlimited";
        const current = wasUnlimited ? 0 : ((existingUser?.credits_remaining as number) ?? 0);
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
