import { NextRequest, NextResponse } from "next/server";
import { scrapeJobPosting } from "@/lib/scraper";
import { checkRateLimit } from "@/lib/ratelimit";

export async function POST(req: NextRequest) {
  try {
    const rl = await checkRateLimit(req);
    if (!rl.success) {
      return NextResponse.json({ success: false, error: "RATE_LIMITED" }, { status: 429 });
    }

    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { success: false, error: "INVALID_REQUEST" },
        { status: 400 }
      );
    }

    const text = await scrapeJobPosting(url);

    return NextResponse.json({ success: true, text });
  } catch (err) {
    const message = err instanceof Error ? err.message : "SCRAPE_FAILED";
    return NextResponse.json(
      { success: false, error: message },
      { status: 422 }
    );
  }
}
