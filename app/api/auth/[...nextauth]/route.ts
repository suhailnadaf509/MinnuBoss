import { prismaClient } from "@/app/lib/db";

import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    provider: string;
  }
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET ?? "secret",
  callbacks: {
    async signIn({ user }) {
      if (!user.email) {
        return false;
      }

      try {
        // First check if user exists
        const existingUser = await prismaClient.user.findUnique({
          where: {
            email: user.email,
          },
        });

        // Only create user if they don't exist
        if (!existingUser) {
          await prismaClient.user.create({
            data: {
              email: user.email,
              provider: "Google",
            },
          });
        }
      } catch (error) {
        console.error("Error during sign in:", error);
        return false; // Return false on error to prevent sign in
      }

      return true;
    },
    async session({ session, user }) {
      if (session?.user) {
        session.user.id = user.id; // Attach `id` to session.user
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
