import { NextResponse, type NextRequest } from "next/server";
import { CLUB_COOKIE, DEFAULT_CLUB_SLUG, isPlatformClubSlug, stripClubPrefix } from "@/lib/club/tenant";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function withClubCookie(response: NextResponse, slug: string) {
  const safe = isPlatformClubSlug(slug) ? DEFAULT_CLUB_SLUG : slug;
  response.cookies.set(CLUB_COOKIE, safe, {
    path: "/",
    maxAge: COOKIE_MAX_AGE,
    sameSite: "lax",
  });
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Single-tenant install: /c/:slug and ?club= are accepted for old links but
  // never switch tenants. A stale cookie is overwritten with the default club.
  const { restPath } = stripClubPrefix(pathname);
  if (restPath !== pathname || searchParams.has("club")) {
    const url = request.nextUrl.clone();
    url.pathname = restPath;
    url.searchParams.delete("club");
    return withClubCookie(NextResponse.redirect(url), DEFAULT_CLUB_SLUG);
  }

  return withClubCookie(NextResponse.next(), DEFAULT_CLUB_SLUG);
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
