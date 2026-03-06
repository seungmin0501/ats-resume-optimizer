import * as cheerio from "cheerio";

// SSRF 방지: 내부 IP 차단
function isInternalUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname;
    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0" ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.") ||
      hostname.startsWith("172.16.") ||
      hostname.endsWith(".local")
    );
  } catch {
    return true;
  }
}

export async function scrapeJobPosting(url: string): Promise<string> {
  // URL 유효성 검증
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    throw new Error("INVALID_URL");
  }

  if (isInternalUrl(url)) {
    throw new Error("INTERNAL_URL_BLOCKED");
  }

  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error("SCRAPE_FAILED");
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // 불필요한 요소 제거
  $("script, style, nav, header, footer, aside, [aria-hidden='true']").remove();

  // 주요 콘텐츠 영역 우선 탐색
  const selectors = [
    "[data-testid='jobDescriptionText']", // Indeed
    ".job-description",
    ".description__text", // LinkedIn
    "[class*='job-description']",
    "[class*='jobDescription']",
    "article",
    "main",
  ];

  for (const selector of selectors) {
    const text = $(selector).text().trim();
    if (text.length > 200) {
      return text.replace(/\s+/g, " ").trim();
    }
  }

  // 폴백: body 전체 텍스트
  const bodyText = $("body").text().replace(/\s+/g, " ").trim();
  if (bodyText.length < 100) {
    throw new Error("SCRAPE_FAILED");
  }

  return bodyText;
}
