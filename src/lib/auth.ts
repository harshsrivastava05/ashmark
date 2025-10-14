import { NextAuthConfig } from "next-auth"
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db"

export const config = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    session({ session, user }) {
      if (session?.user) {
        session.user.id = user.id
        session.user.role = user.role
      }
      return session
    },
    jwt({ user, token }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
  },
  pages: {
    signIn: '/login',
    signUp: '/signup',
  },
  session: { strategy: "database" },
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(config)
