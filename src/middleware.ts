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
  const { clubSlug, restPath } = stripClubPrefix(pathname);

  // Club-scoped tournament URLs are first-class routes: club comes from the path
  // for that page only. Do not strip the prefix and do not treat this as a global
  // "current club" switch for the rest of the site.
  if (clubSlug && restPath.startsWith("/tournaments")) {
    if (isPlatformClubSlug(clubSlug)) {
      const url = request.nextUrl.clone();
      url.pathname = restPath;
      return withClubCookie(NextResponse.redirect(url), DEFAULT_CLUB_SLUG);
    }
    return NextResponse.next();
  }

  // Single-tenant install for other paths: /c/:slug and ?club= are accepted for
  // old links but never switch tenants. A stale cookie is overwritten with the
  // default club.
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
