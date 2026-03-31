import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

const protectedRoutes = [
  "/dashboard",
  "/products",
  "/orders",
  "/restock-queue",
];
const authRoutes = ["/auth/login", "/auth/signup"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth-token")?.value;

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // If accessing auth routes with valid token, redirect to dashboard
  if (isAuthRoute && token) {
    try {
      const decoded = await verifyToken(token);
      if (decoded) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    } catch (error) {
      // Token is invalid, continue to auth page
    }
  }

  // If accessing protected routes without token, redirect to login
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // If token exists, verify it
  if (token) {
    try {
      const decoded = await verifyToken(token);
      if (!decoded && isProtectedRoute) {
        return NextResponse.redirect(new URL("/auth/login", request.url));
      }
    } catch (error) {
      if (isProtectedRoute) {
        return NextResponse.redirect(new URL("/auth/login", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
