import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createServiceClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/analyze?error=no_code`);
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/analyze?error=auth_failed`);
  }

  // 사용자 레코드 upsert (최초 로그인 시 생성)
  const serviceClient = createServiceClient();
  await serviceClient.from("users").upsert(
    {
      id: data.user.id,
      email: data.user.email!,
      plan_tier: "free",
      credits_remaining: 1,
    },
    { onConflict: "id", ignoreDuplicates: true }
  );

  const next = req.cookies.get("auth_next")?.value || "/analyze";
  const res = NextResponse.redirect(`${origin}${next}`);
  res.cookies.delete("auth_next");
  return res;
}
