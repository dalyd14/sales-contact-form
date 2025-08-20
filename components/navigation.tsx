"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { AppBar, Box, Container, Toolbar, Typography, Link } from "@mui/material"
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
      compHref: "/admin",
    },
  ])

  useEffect(() => {
    const loadMeeting = async () => {
      const navItem = {
        name: "Request Demo",
        href: "/",
        icon: Home,
        description: "Start here to get in touch",
        compHref: "/",
      }
      const prospectId = getCookie("prospectId")
      if (prospectId) {
        const meeting = await fetch(`/api/meetings?prospectId=${prospectId}`)
        if (meeting.ok) {
          const meetingData = await meeting.json()
          if (meetingData.length > 0) {
            navItem.name = "Meeting Prep Room"
            navItem.href = `/prep-room?meetingId=${meetingData[0].id}`
            navItem.compHref = '/prep-room'            
          }
        }
      }
      setNavigationItems([navItem, ...navigationItems])
    }
    loadMeeting()
  }, [])

  return (
    <AppBar  component="nav" position="sticky" sx={{ backgroundColor: "black", borderBottom: "1px solid #a1a1a1" }}>
      <Container maxWidth="xl" sx={{ backgroundColor: "black" }}>
        <Toolbar disableGutters sx={{ backgroundColor: "black" }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
              <Link href="/" className="flex items-center gap-2"
                sx={{
                  textDecoration: "none",
                  mr: 5
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 0 }}>
                      <svg width="32" height="32" viewBox="0 0 76 65" fill="none" xmlns="http://www.w3.org/2000/svg"><path
                  d="M37.5274 0L75.0548 65H0L37.5274 0Z" fill="#ffffff"/></svg>
                  <Typography variant="h6" sx={{ color: "white", fontSize: "1.9rem", fontFamily: "GeistSans" }}>Vercel</Typography>
                </Box>
              
              </Link>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: (navigationItems.length > 1) ? "space-between" : "flex-end", width: "100%" }}>
              {navigationItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === (item.compHref || item.href)
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      sx={{ 
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        px:2,
                        py:1,
                        my:1,
                        borderRadius: 4,
                        fontSize: 16,
                        fontWeight: 500,
                        textDecoration: "none",
                        backgroundColor: isActive ? "white" : "transparent",
                        color: isActive ? "black" : "#a1a1a1",
                        "&:hover": {
                          backgroundColor: isActive ? "#a1a1a1" : "transparent",
                          color: isActive ? "black" : "white"
                        }
                       }}
                    >
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  )
                })}
              </Box>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  )
}
