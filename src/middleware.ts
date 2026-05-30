import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Use the edge-safe base config (no database code) for route protection.
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  // Run on every path except Next internals, the auth API, and static assets.
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons|robots.txt|.*\\.(?:png|jpg|jpeg|svg|ico|webp)$).*)",
  ],
};
