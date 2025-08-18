"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Users } from "lucide-react"
import { getCookie } from "@/lib/utils"

export function Navigation() {
  const pathname = usePathname()
  const [navigationItems, setNavigationItems] = useState([
    {
      name: "Admin Dashboard",
      href: "/admin",
      icon: Users,
      description: "Sales team dashboard",
    },
  ])

  useEffect(() => {
    const loadMeeting = async () => {
      let navItem = {
        name: "Request Demo",
        href: "/",
        icon: Home,
        description: "Start here to get in touch",
      }
      const prospectId = getCookie("prospectId")
      if (prospectId) {
        const meeting = await fetch(`/api/meetings?prospectId=${prospectId}`)
        if (meeting.ok) {
          const meetingData = await meeting.json()
          navItem.name = "Meeting Prep Room"
          navItem.href = `/prep-room?meetingId=${meetingData[0].id}`
        }
      }
      setNavigationItems([navItem, ...navigationItems])
    }
    loadMeeting()
  }, [])



  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8 w-full">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">V</span>
              </div>
              <span className="font-bold text-lg">Vercel</span>
            </Link>

            <div className={`hidden md:flex items-center ${navigationItems.length === 1 ? "justify-end" : "justify-between"} w-full gap-6`}>
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
