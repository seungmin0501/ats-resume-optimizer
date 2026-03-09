import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getCheckoutUrl } from "@/lib/lemonsqueezy";

const PLAN_VARIANT: Record<string, string | undefined> = {
  basic: process.env.LEMONSQUEEZY_BASIC_VARIANT_ID,
  pro: process.env.LEMONSQUEEZY_PRO_VARIANT_ID,
  unlimited: process.env.LEMONSQUEEZY_UNLIMITED_VARIANT_ID,
};

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/analyze", req.url));
  }

  const plan = req.nextUrl.searchParams.get("plan") ?? "";
  const variantId = PLAN_VARIANT[plan];

  if (!variantId) {
    return NextResponse.json({ error: "CHECKOUT_NOT_CONFIGURED" }, { status: 503 });
  }

  try {
    const checkoutUrl = await getCheckoutUrl(variantId, user.id, user.email);
    return NextResponse.redirect(checkoutUrl);
  } catch (err) {
    console.error("[checkout] error:", err);
    return NextResponse.json({ error: "CHECKOUT_FAILED" }, { status: 500 });
  }
}
