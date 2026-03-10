import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createClient } from "@supabase/supabase-js";

export async function DELETE() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1. 분석 기록 삭제 (FK 제약 때문에 먼저)
  const { error: analysesError } = await adminClient
    .from("analyses")
    .delete()
    .eq("user_id", user.id);

  if (analysesError) {
    console.error("[delete-account] analyses delete failed:", analysesError);
    return NextResponse.json({ error: "Failed to delete analyses" }, { status: 500 });
  }

  // 2. users 테이블에서 삭제
  const { error: userError } = await adminClient
    .from("users")
    .delete()
    .eq("id", user.id);

  if (userError) {
    console.error("[delete-account] user delete failed:", userError);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }

  // 3. Supabase Auth에서 삭제
  const { error: authError } = await adminClient.auth.admin.deleteUser(user.id);

  if (authError) {
    console.error("[delete-account] auth delete failed:", authError);
    return NextResponse.json({ error: "Failed to delete auth user" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
