import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { upsertUser } from "@/lib/db";

// ----------------------------------------------------------------------------
// Full NextAuth instance used by the API route handler and server components.
// On first sign-in we upsert the user into Supabase and stash their DB id on
// the JWT so the rest of the app can scope queries to the current user.
// ----------------------------------------------------------------------------

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, account, profile }) {
      // `account` + `profile` are only present on the initial sign-in.
      if (account && profile) {
        const dbUser = await upsertUser({
          googleId: String(profile.sub),
          name: profile.name ?? token.name ?? "Athlete",
          email: profile.email ?? token.email ?? "",
          avatarUrl: (profile.picture as string | undefined) ?? null,
        });
        token.userId = dbUser.id;
        token.picture = dbUser.avatar_url ?? token.picture;
        token.name = dbUser.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (token.userId) session.user.id = token.userId as string;
        if (token.picture) session.user.image = token.picture as string;
        if (token.name) session.user.name = token.name as string;
      }
      return session;
    },
  },
});
