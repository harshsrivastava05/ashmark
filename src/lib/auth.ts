import { NextAuthConfig } from "next-auth"
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db"

export const config = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        try {
          const user = await prisma.user.findUnique({ where: { email: credentials.email as string } })
          if (!user || !user.password) return null
          const valid = await bcrypt.compare(credentials.password as string, user.password)
          if (!valid) return null
          return { id: user.id, name: user.name, email: user.email, role: user.role }
        } catch (error) {
          console.error('Database error during auth:', error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          // Check if user exists and preserve their role
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          })
          
          if (existingUser) {
            // Update user info but preserve role
            await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                name: user.name,
                image: user.image,
                emailVerified: new Date(),
              }
            })
          }
          return true
        } catch (error) {
          console.error('Error in signIn callback:', error)
          return true
        }
      }
      return true
    },
    async session({ session, user }) {
      if (session?.user && user) {
        session.user.id = user.id
        session.user.role = user.role
      }
      return session
    },
    async jwt({ user, token }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
  },
  pages: {
    signIn: '/login',
  },
  session: { strategy: "database" },
} as NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(config)
