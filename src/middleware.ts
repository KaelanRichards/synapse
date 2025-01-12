import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Database } from "@/types/supabase";

// Routes that don't require authentication
const publicRoutes = [
  "/",
  "/signin",
  "/signup",
  "/reset-password",
  "/verify",
  "/api/auth",
  "/api/public",
];

// Routes that require authentication
const protectedRoutes = [
  "/notes/new",
  "/notes/edit",
  "/settings",
  "/connections/manage",
];

export async function middleware(req: NextRequest) {
  try {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient<Database>({ req, res });

    // Try to get session, but don't error if it fails
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    // Debug logging
    console.log("Current path:", req.nextUrl.pathname);
    console.log("Session exists:", !!session);
    console.log("Session user:", session?.user?.id);

    const isPublicRoute = publicRoutes.some((route) => {
      const matches = req.nextUrl.pathname.startsWith(route);
      console.log(`Checking public route ${route}:`, matches);
      return matches;
    });

    const isProtectedRoute = protectedRoutes.some((route) => {
      const matches = req.nextUrl.pathname.startsWith(route);
      console.log(`Checking protected route ${route}:`, matches);
      return matches;
    });

    // If there's a session error, try to recover it from cookies
    if (error || !session) {
      const cookies = req.cookies;
      const hasAuthCookie =
        cookies.has("app-session") ||
        cookies.has("sb-access-token") ||
        cookies.has("sb-refresh-token");
      console.log("Has auth cookie:", hasAuthCookie);

      if (hasAuthCookie && isProtectedRoute) {
        // Let the request through if we have auth cookies, the session might recover
        return res;
      }
    }

    // Only redirect if we're on a protected route and there's no session
    if (!session && isProtectedRoute) {
      console.log("Redirecting to signin from protected route");
      const redirectUrl = new URL("/signin", req.url);
      redirectUrl.searchParams.set("redirectTo", req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Redirect away from auth pages if already logged in
    if (
      session &&
      (req.nextUrl.pathname === "/signin" || req.nextUrl.pathname === "/signup")
    ) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Update response headers if we have a session
    if (session?.user?.id) {
      res.headers.set("x-user-id", session.user.id);
    }

    return res;
  } catch (error) {
    // On error, still allow the request to proceed
    console.error("Middleware error:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
