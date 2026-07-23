import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // 1. Secret key must be encoded as a Uint8Array for `jose`
  const secret = new TextEncoder().encode(
    process.env.JWT_SECRET || "your-fallback-secret-key"
  );

  let isValidToken = false;

  if (token) {
    try {
      // 2. Edge-compatible JWT verification
      await jwtVerify(token, secret);
      isValidToken = true;
    } catch (error) {
      // Token is expired, invalid, or malformed
      isValidToken = false;
    }
  }

  // 3. Protect protected routes (e.g., /dashboard)
  if (pathname.startsWith("/dashboard")) {
    if (!isValidToken) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      // Optional: Clear invalid cookie on bounce back
      response.cookies.delete("token");
      return response;
    }
  }

  // 4. Prevent logged-in users from visiting auth pages (/login)
  if (pathname === "/login" || pathname === "/register") {
    if (isValidToken) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};