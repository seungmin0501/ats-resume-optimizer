import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/lemonsqueezy";
import { createServiceClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-signature") || "";

  // 서명 검증
  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "INVALID_SIGNATURE" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  const eventName: string = payload.meta?.event_name;
  const customData = payload.meta?.custom_data;
  const attributes = payload.data?.attributes;

  const serviceClient = createServiceClient();

  try {
    switch (eventName) {
      case "subscription_created":
      case "subscription_resumed":
      case "subscription_unpaused": {
        const userId = customData?.user_id as string | undefined;
        if (!userId) break;

        await serviceClient
          .from("users")
          .update({
            plan: "pro",
            ls_customer_id: String(attributes?.customer_id || ""),
            ls_subscription_id: String(payload.data?.id || ""),
          })
          .eq("id", userId);
        break;
      }

      case "subscription_cancelled":
      case "subscription_expired": {
        const subscriptionId = String(payload.data?.id || "");
        if (!subscriptionId) break;

        await serviceClient
          .from("users")
          .update({ plan: "free" })
          .eq("ls_subscription_id", subscriptionId);
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error("[webhook] error:", err);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
