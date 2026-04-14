
import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { detectLocale } from "./util/locale-util";

export default async function middleware(request: NextRequest) {
  const supportedLocales = ["zh","en","es","fr","de","ja","ko"];
  const { pathname, searchParams } = request.nextUrl;
  const searchLang= searchParams.get("lang");
  const lang = searchLang && detectLocale(searchLang);

  const currentLangInPath = supportedLocales.find((locale) =>
    pathname.startsWith(`/${locale}`)
  );

  const newSearchParams = new URLSearchParams(searchParams);
  newSearchParams.delete("lang");

  // Case 1: Only lang exists, no supportedLocales path prefix
  if (lang && !currentLangInPath) {
    const newUrl = new URL(request.url);
    newUrl.pathname = `/${lang}${pathname}`;
    newUrl.search = newSearchParams.toString();
    return NextResponse.redirect(newUrl);
  }

  // Case 2: Only supportedLocales path prefix exists, no lang
  if (!lang && currentLangInPath) {
    const handleI18nRouting = createMiddleware({
      locales: supportedLocales,
      defaultLocale: "en",
    });
    return handleI18nRouting(request);
  }

  // Case 3: Both lang and supportedLocales path prefix exist
  if (lang && currentLangInPath) {
    if (lang === currentLangInPath) {
      // Both are the same, use handleI18nRouting
      const handleI18nRouting = createMiddleware({
        locales: supportedLocales,
        defaultLocale: "en",
      });
      return handleI18nRouting(request);
    }

    // Both are different, redirect to /lang
    const newUrl = new URL(request.url);
    newUrl.pathname = `/${lang}${pathname.substring(
      currentLangInPath.length + 1
    )}`;
    newUrl.search = newSearchParams.toString();
    return NextResponse.redirect(newUrl);
  }

  // Default case
  const handleI18nRouting = createMiddleware({
    locales: supportedLocales,
    defaultLocale: "en",
  });
  return handleI18nRouting(request);
}

export const config = {
  matcher: ["/", "/(zh|en|es|fr|de|ja|ko)/:path*"],
};
