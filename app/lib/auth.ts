import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prismaClient } from "./db";

export const authOptions: AuthOptions = {
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
          where: {
            email: user.email,
          },
        });

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
        return false;
      }

      return true;
    },
    async session({ session, token }) {
      // Change parameter from user to token
      if (session?.user) {
        // Fetch the user from database to get the ID
        const dbUser = await prismaClient.user.findUnique({
          where: {
            email: session.user.email as string,
          },
        });

        if (dbUser) {
          session.user.id = dbUser.id;
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      // Add JWT callback
      if (user) {
        const dbUser = await prismaClient.user.findUnique({
          where: {
            email: user.email as string,
          },
        });
        if (dbUser) {
          token.id = dbUser.id;
        }
      }
      return token;
    },
  },
};
