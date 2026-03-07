import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type PlanTier = "free" | "basic" | "pro" | "unlimited";

export type UserRow = {
  id: string;
  email: string;
  plan_tier: PlanTier;
  credits_remaining: number;
  unlimited_expires_at: string | null;
  ls_customer_id: string | null;
  ls_order_id: string | null;
  created_at: string;
};

export type AnalysisRow = {
  id: string;
  user_id: string;
  job_title: string | null;
  company_name: string | null;
  match_score: number;
  grade: "A" | "B" | "C" | "D";
  missing_keywords: string[];
  section_feedback: {
    summary: string;
    experience: string;
    skills: string;
  };
  format_warnings: string[];
  optimized_resume: string | null;
  cover_letter: string | null;
  interview_prep: {
    questions: Array<{
      question: string;
      model_answer: string;
      keywords: string[];
    }>;
  } | null;
  target_language: string;
  created_at: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TypedClient = SupabaseClient<any, "public", any>;

// 빌드타임에 env vars가 없을 수 있으므로 lazy getter 사용
let _supabase: TypedClient | null = null;

export function getSupabase(): TypedClient {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return _supabase;
}

// 호환성을 위한 export (클라이언트 컴포넌트에서 사용)
export const supabase = {
  get auth() {
    return getSupabase().auth;
  },
};

export function createServiceClient(): TypedClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
