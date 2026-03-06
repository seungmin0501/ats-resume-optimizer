import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: [
    // next-intl: 내부 경로 제외하고 모든 경로에 적용
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
