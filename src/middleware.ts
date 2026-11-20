import { NextResponse, type NextRequest } from "next/server";
import {
  CLUB_COOKIE,
  DEFAULT_CLUB_SLUG,
  normalizeClubSlug,
  resolveClubSlug,
  stripClubPrefix,
} from "@/lib/club/tenant";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function withClubCookie(response: NextResponse, slug: string) {
  response.cookies.set(CLUB_COOKIE, slug, {
    path: "/",
    maxAge: COOKIE_MAX_AGE,
    sameSite: "lax",
  });
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const fromQuery = normalizeClubSlug(searchParams.get("club"));
  const fromCookie = normalizeClubSlug(request.cookies.get(CLUB_COOKIE)?.value);
  const { clubSlug: fromPath, restPath } = stripClubPrefix(pathname);

  // /c/:slug[/...] → set tenant cookie and land on the clean app path
  if (fromPath) {
    const url = request.nextUrl.clone();
    url.pathname = restPath;
    const response = NextResponse.redirect(url);
    return withClubCookie(response, fromPath);
  }

  // ?club=slug → set cookie and drop the query param (clean URL)
  if (fromQuery) {
    const url = request.nextUrl.clone();
    url.searchParams.delete("club");
    const response = NextResponse.redirect(url);
    return withClubCookie(response, fromQuery);
  }

  // Ensure a tenant cookie exists for API client / server reads
  if (!fromCookie) {
    const response = NextResponse.next();
    return withClubCookie(response, resolveClubSlug(DEFAULT_CLUB_SLUG));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Run on app pages and API proxy paths; skip static assets.
     * basePath is applied by Next outside this matcher.
     */
    "/((?!_next/static|_next/image|favicon.ico|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
