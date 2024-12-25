import { prismaClient } from "@/app/lib/db";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async signIn(params) {
      if (!params.user.email) {
        return false;
      }
      console.log(params);
      try {
        // First check if user exists
        const existingUser = await prismaClient.user.findUnique({
          where: {
            email: params.user.email,
          },
        });

        // Only create user if they don't exist
        if (!existingUser) {
          await prismaClient.user.create({
            data: {
              email: params.user.email,
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
  },
});

export { handler as GET, handler as POST };
