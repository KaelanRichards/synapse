import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Database } from "@/types/supabase";

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
    // Refresh session and get current session data
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    // If there's an error or no session on protected routes, redirect to sign in
    const isAuthPage =
      req.nextUrl.pathname.startsWith("/signin") ||
      req.nextUrl.pathname.startsWith("/signup") ||
      req.nextUrl.pathname.startsWith("/reset-password");

    if (
      !session &&
      !isAuthPage &&
      !req.nextUrl.pathname.startsWith("/public")
    ) {
      const redirectUrl = new URL("/signin", req.url);
      redirectUrl.searchParams.set("redirectTo", req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // If user is signed in and tries to access auth pages, redirect to home
    if (session && isAuthPage) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return res;
  } catch (error) {
    console.error("Auth middleware error:", error);
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
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
