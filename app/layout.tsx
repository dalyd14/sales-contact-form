import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { Navigation } from "@/components/navigation"

export const metadata: Metadata = {
  title: "Vercel Sales Portal",
  description: "Connect with Vercel sales team to accelerate your development workflow",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body className="min-h-screen flex flex-col"  style={{ backgroundColor: "black" }} >
        <Navigation />
        <main className="flex-1" style={{ backgroundColor: "black" }}>{children}</main>
        {/* <Footer /> */}
      </body>
    </html>
  )
}
