import { test, expect } from "@playwright/test";

test.describe("Security headers", () => {
  test("response includes X-Frame-Options: DENY", async ({ request }) => {
    const res = await request.get("/");
    expect(res.headers()["x-frame-options"]).toBe("DENY");
  });

  test("response includes X-Content-Type-Options: nosniff", async ({ request }) => {
    const res = await request.get("/");
    expect(res.headers()["x-content-type-options"]).toBe("nosniff");
  });

  test("CSP header is present", async ({ request }) => {
    const res = await request.get("/");
    expect(res.headers()["content-security-policy"]).toBeTruthy();
  });
});

test.describe("API security", () => {
  test("analyze API rejects unauthenticated requests", async ({ request }) => {
    const res = await request.post("/api/analyze", {
      multipart: {
        job_description: "test",
        resume: {
          name: "test.pdf",
          mimeType: "application/pdf",
          buffer: Buffer.from("%PDF-1.4 test"),
        },
      },
    });
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("UNAUTHORIZED");
  });

  test("scrape API rejects invalid URLs", async ({ request }) => {
    const res = await request.post("/api/scrape", {
      data: { url: "http://localhost/internal" },
    });
    // SSRF protection should block internal URLs
    expect(res.status()).toBeGreaterThanOrEqual(400);
  });

  test("download API rejects unauthenticated requests", async ({ request }) => {
    const res = await request.post("/api/download", {
      data: { analysis_id: "fake-id" },
    });
    expect(res.status()).toBe(401);
  });
});
