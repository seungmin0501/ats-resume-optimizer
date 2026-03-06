"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";

type NavbarProps = {
  user?: {
    email: string;
    plan: "free" | "pro";
    creditsUsed: number;
  } | null;
};

export default function Navbar({ user }: NavbarProps) {
  const t = useTranslations("nav");
  const locale = useLocale();

  const creditsRemaining = user
    ? Math.max(0, 3 - user.creditsUsed)
    : null;

  return (
    <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            href={`/${locale}`}
            className="font-bold text-lg text-blue-600 hover:text-blue-700"
          >
            {t("logo")}
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                {user.plan === "free" && creditsRemaining !== null && (
                  <span className="text-sm text-gray-500">
                    {t("credits_remaining", { count: creditsRemaining })}
                  </span>
                )}
                {user.plan === "pro" && (
                  <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    Pro
                  </span>
                )}
                <Link
                  href={`/${locale}/dashboard`}
                  className="text-sm text-gray-700 hover:text-gray-900"
                >
                  {t("dashboard")}
                </Link>
                <form action={`/api/auth/signout`} method="POST">
                  <button
                    type="submit"
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    {t("logout")}
                  </button>
                </form>
              </>
            ) : (
              <Link
                href={`/${locale}/analyze`}
                className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
              >
                {t("login")}
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
