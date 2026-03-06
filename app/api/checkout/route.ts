import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getCheckoutUrl } from "@/lib/lemonsqueezy";

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // 미인증 → analyze 페이지로 (로그인 모달)
    return NextResponse.redirect(new URL("/analyze", req.url));
  }

  const variantId = process.env.LEMONSQUEEZY_PRO_VARIANT_ID;
  if (!variantId) {
    return NextResponse.json({ error: "CHECKOUT_NOT_CONFIGURED" }, { status: 503 });
  }

  try {
    const checkoutUrl = await getCheckoutUrl(variantId, user.id, user.email);
    return NextResponse.redirect(checkoutUrl);
  } catch {
    return NextResponse.json({ error: "CHECKOUT_FAILED" }, { status: 500 });
  }
}
