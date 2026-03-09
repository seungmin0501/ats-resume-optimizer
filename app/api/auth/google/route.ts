import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { origin, searchParams } = new URL(req.url);
  const next = searchParams.get("next") || "/analyze";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/api/auth/callback`,
    },
  });

  if (error || !data.url) {
    console.error("[auth/google] OAuth error:", error);
    return NextResponse.redirect(`${origin}/analyze?error=oauth`);
  }

  const res = NextResponse.redirect(data.url);
  res.cookies.set("auth_next", next, { httpOnly: true, maxAge: 300, path: "/" });
  return res;
}
