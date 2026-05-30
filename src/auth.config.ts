import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

// ----------------------------------------------------------------------------
// Base auth config. This is intentionally free of any Node-only / database
// code so it can run in the Edge middleware. The full config (with the DB
// upsert in the jwt callback) lives in `auth.ts`.
// ----------------------------------------------------------------------------

const PUBLIC_PATHS = ["/login"];

export const authConfig: NextAuthConfig = {
  // Trust the deployment host (Vercel) and the spec's env var names.
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    // Runs in middleware on every matched request.
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isPublic = PUBLIC_PATHS.some((p) =>
        nextUrl.pathname.startsWith(p)
      );

      if (isPublic) {
        // Already signed in? Skip the login page, go to the dashboard.
        if (isLoggedIn) {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }

      // Protected route: returning false sends the user to the signIn page.
      return isLoggedIn;
    },
  },
};
