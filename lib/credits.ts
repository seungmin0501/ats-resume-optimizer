import type { TypedClient, UserRow } from "./supabase";

/**
 * 크레딧 차감. 성공 시 true, 크레딧 부족 시 'NO_CREDITS', Unlimited 만료 시 'UNLIMITED_EXPIRED' throw.
 */
export async function deductCredit(
  serviceClient: TypedClient,
  user: UserRow
): Promise<true> {
  if (user.plan_tier === "unlimited") {
    if (
      user.unlimited_expires_at &&
      new Date(user.unlimited_expires_at) > new Date()
    ) {
      return true;
    }
    throw new Error("UNLIMITED_EXPIRED");
  }

  if (user.credits_remaining <= 0) {
    throw new Error("NO_CREDITS");
  }

  await serviceClient
    .from("users")
    .update({ credits_remaining: user.credits_remaining - 1 })
    .eq("id", user.id);

  return true;
}
