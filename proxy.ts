import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { isAppHost } from "@/lib/domains/hostname";
import { siteConfig } from "@/lib/site";

type CookieToSet = { name: string; value: string; options: CookieOptions };

/**
 * Next.js 16 proxy (formerly middleware).
 * 1. Subdomains: amara.<PORTFOLIO_ROOT_DOMAIN> serves /p/amara.
 *    Custom domains: amara.com serves /d/amara.com.
 * 2. Auth: refreshes the Supabase session on app routes and keeps
 *    signed-out visitors out of /dashboard and /editor.
 */
const APP_PREFIXES = ["/dashboard", "/editor", "/login", "/builder", "/api/portfolios", "/auth"];
const RESERVED = new Set(["www", "app", "api", "admin"]);

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // 1. Portfolio subdomains
  const root = process.env.PORTFOLIO_ROOT_DOMAIN;
  const host = (request.headers.get("host") ?? "").split(":")[0]!.toLowerCase();
  if (root && host.endsWith(`.${root}`)) {
    const sub = host.slice(0, -(root.length + 1));
    if (sub && !sub.includes(".") && !RESERVED.has(sub)) {
      const url = request.nextUrl.clone();
      url.pathname = path === "/" ? `/p/${sub}` : `/p/${sub}${path}`;
      return NextResponse.rewrite(url);
    }
  }

  // 1b. Custom domains. Anything that isn't one of Forma's own hosts.
  if (!isAppHost(host, siteConfig.url, root)) {
    const url = request.nextUrl.clone();
    url.pathname = path === "/" ? `/d/${host}` : `/d/${host}${path}`;
    return NextResponse.rewrite(url);
  }

  if (!APP_PREFIXES.some((p) => path.startsWith(p))) return NextResponse.next();

  // 2. Session refresh and route protection
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list: CookieToSet[]) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data } = await supabase.auth.getUser();
  if (!data.user && (path.startsWith("/dashboard") || path.startsWith("/editor"))) {
    const login = request.nextUrl.clone();
    login.pathname = "/login";
    login.search = `?next=${encodeURIComponent(path)}`;
    return NextResponse.redirect(login);
  }
  return response;
}

export const config = {
  // Everything except static files and images.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|opengraph-image|.*\\.(?:png|jpg|jpeg|svg|webp|avif|ico|txt|xml)$).*)"],
};
