import { MetadataRoute } from "next";

const BASE_URL = "https://ats-resume-optimizer-ten.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/en/dashboard", "/ko/dashboard", "/ja/dashboard", "/es/dashboard", "/zh-CN/dashboard"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
