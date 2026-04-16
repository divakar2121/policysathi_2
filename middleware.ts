import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  //Routes that need auth
  const protectedRoutes = ["/chat", "/policies", "/claims", "/analyze", "/verify"];
  const { pathname } = request.nextUrl;

  // Check if accessing protected route
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtected) {
    // Check for auth token in cookies or localStorage via header
    const authCookie = request.cookies.get("policysathi_auth");
    
    // For now, just redirect to login if no cookie (can be enhanced)
    // Note: This is basic protection - real auth would use JWT/sessions
    if (!authCookie && pathname !== "/login") {
      // Allow access for now (demo mode) - can enable strict check
      // return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/chat/:path*", "/policies/:path*", "/claims/:path*", "/analyze/:path*", "/verify/:path*"],
};