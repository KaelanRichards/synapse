import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Database } from "@/types/supabase";

const PUBLIC_ROUTES = ["/signin", "/signup", "/reset-password", "/public"];

export async function middleware(req: NextRequest) {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    console.error("Required environment variables are missing");
    return NextResponse.error();
  }

  const res = NextResponse.next();
  const supabase = createMiddlewareClient<Database>({ req, res });

  try {
    // Refresh session if exists
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    // Check if the current route is public
    const isPublicRoute = PUBLIC_ROUTES.some((route) =>
      req.nextUrl.pathname.startsWith(route)
    );

    // Handle authentication redirects
    if (!session && !isPublicRoute) {
      // Store the original URL to redirect back after auth
      const redirectUrl = new URL("/signin", req.url);
      if (req.nextUrl.pathname !== "/") {
        redirectUrl.searchParams.set("redirectTo", req.nextUrl.pathname);
      }
      return NextResponse.redirect(redirectUrl);
    }

    // Redirect authenticated users away from auth pages
    if (session && isPublicRoute && req.nextUrl.pathname !== "/public") {
      const redirectTo = req.nextUrl.searchParams.get("redirectTo") || "/";
      return NextResponse.redirect(new URL(redirectTo, req.url));
    }

    // Update response headers for auth
    return res;
  } catch (error) {
    console.error("Auth middleware error:", error);
    // Don't redirect on error, just continue
    return res;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes that need to be public
     */
    "/((?!_next/static|_next/image|favicon.ico|public/|api/public/).*)",
  ],
};
