import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { ThemeProvider } from "next-themes"
import "./globals.css"
import { LocaleProvider } from "@/components/providers/locale-provider"
import { AuthProvider } from "@/components/providers/auth-provider"
import { WhatsAppProvider } from "@/components/providers/whatsapp-provider"
import { OrganizationProvider } from "@/lib/organization-context"
import { Toaster } from "@/components/ui/sonner"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Carmen SDR - Dashboard Premium",
  description: "Plataforma de gestão de tráfego pago multi-tenant",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <LocaleProvider>
            <AuthProvider>
              <OrganizationProvider>
                <WhatsAppProvider>
                  {children}
                  <Toaster />
                </WhatsAppProvider>
              </OrganizationProvider>
            </AuthProvider>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}