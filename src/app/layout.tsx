import type { Metadata } from "next"
import "./globals.css"
import { Navbar } from "@/components/Navbar"
import { Providers } from "@/components/Providers"

export const metadata: Metadata = {
  title: "BolPuneri - पुणेरी पाट्या, उखाणे आणि मीम्स",
  description: "Generate and share Puneri Patya, Ukhane, and memes. AI-powered Marathi content platform.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mr">
      <body>
        <Providers>
          <Navbar />
          <main className="max-w-4xl mx-auto px-4 py-6">{children}</main>
        </Providers>
      </body>
    </html>
  )
}
