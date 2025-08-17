import type React from "react"
export default function PrepRoomLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">{children}</div>
}
