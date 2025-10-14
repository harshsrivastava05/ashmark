import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toast } from "@/components/ui/toast"
import { SessionProvider } from "next-auth/react"
import { auth } from "@/lib/auth"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ASHMARK - Premium T-Shirts",
  description: "Discover premium quality t-shirts with unique designs. Shop the latest trends at ASHMARK.",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider session={session}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            {children}
            <Toast />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
