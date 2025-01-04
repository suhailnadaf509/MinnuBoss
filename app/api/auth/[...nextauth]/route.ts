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
        const existingUser = await prismaClient.user.findUnique({
          where: { email: user.email },
        });

        if (!existingUser) {
          const newUser = await prismaClient.user.create({
            data: { email: user.email, provider: "Google" },
          });
          user.id = newUser.id; // Ensure the new user has an ID
        } else {
          user.id = existingUser.id; // Use the existing user's ID
        }
      } catch (error) {
        console.error("Error during sign in:", error);
        return false;
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user && user.id) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
