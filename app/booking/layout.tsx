import type React from "react"
export default function BookingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">{children}</div>
}
