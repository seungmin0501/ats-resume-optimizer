import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();

  const locale = req.headers.get("referer")?.match(/\/(ko|ja|es)\//)?.[1] || "en";
  return NextResponse.redirect(new URL(`/${locale}`, req.url));
}
