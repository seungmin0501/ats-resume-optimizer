import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "ko", "ja", "es", "zh-CN"],
  defaultLocale: "en",
});
