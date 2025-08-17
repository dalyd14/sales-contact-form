"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, User, CheckCircle, ExternalLink, FileText, Video, BookOpen, Zap } from "lucide-react"
import type { MeetingWithDetails } from "@/lib/db"

interface PrepRoomResource {
  id: string
  title: string
  description: string
  type: "video" | "article" | "guide" | "demo"
  url: string
  duration?: string
}

const prepResources: PrepRoomResource[] = [
  {
    id: "1",
    title: "Vercel Platform Overview",
    description: "Learn about Vercel's deployment platform and core features",
    type: "video",
    url: "https://vercel.com/docs",
    duration: "5 min",
  },
  {
    id: "2",
    title: "Getting Started with v0",
    description: "Discover how v0 can accelerate your development workflow",
    type: "demo",
    url: "https://v0.dev",
    duration: "3 min",
  },
  {
    id: "3",
    title: "Enterprise Success Stories",
    description: "See how companies scale with Vercel",
    type: "article",
    url: "https://vercel.com/customers",
    duration: "7 min",
  },
  {
    id: "4",
    title: "Deployment Best Practices",
    description: "Optimize your deployment workflow",
    type: "guide",
    url: "https://vercel.com/docs/deployments",
    duration: "10 min",
  },
]

const getResourceIcon = (type: string) => {
  switch (type) {
    case "video":
      return <Video className="h-4 w-4" />
    case "article":
      return <FileText className="h-4 w-4" />
    case "guide":
      return <BookOpen className="h-4 w-4" />
    case "demo":
      return <Zap className="h-4 w-4" />
    default:
      return <FileText className="h-4 w-4" />
  }
}

export function PrepRoom() {
  const searchParams = useSearchParams()
  const meetingId = searchParams.get("meetingId")
  const [meeting, setMeeting] = useState<MeetingWithDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadMeeting = async () => {
      if (!meetingId) return

      try {
        const response = await fetch(`/api/meetings/${meetingId}`)
        if (response.ok) {
          const meetingData = await response.json()
          setMeeting(meetingData)
        }
      } catch (error) {
        console.error("Error loading meeting:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadMeeting()
  }, [meetingId])

  if (!meetingId) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Invalid meeting link. Please book a meeting first.</p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your meeting details...</p>
        </div>
      </div>
    )
  }

  if (!meeting) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Meeting not found.</p>
        </CardContent>
      </Card>
    )
  }

  const meetingDate = new Date(meeting.meeting_date)
  const isUpcoming = meetingDate > new Date()

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <CheckCircle className="h-8 w-8 text-green-500" />
          <h1 className="text-4xl font-bold text-foreground">Meeting Confirmed!</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Your meeting has been scheduled. Use this time to prepare and explore resources.
        </p>
      </div>

      {/* Meeting Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Meeting Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-semibold">
                    {meetingDate.toLocaleDateString()} at{" "}
                    {meetingDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  <p className="text-sm text-muted-foreground">{isUpcoming ? "Upcoming" : "Past"} meeting</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-semibold">{meeting.sales_rep_name}</p>
                  <p className="text-sm text-muted-foreground">{meeting.sales_rep_email}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="font-semibold mb-2">Your Interest</p>
                <Badge variant="secondary" className="capitalize">
                  {meeting.product_interest.replace("_", " & ")}
                </Badge>
              </div>
              <div>
                <p className="font-semibold mb-2">Status</p>
                <Badge variant={meeting.status === "scheduled" ? "default" : "secondary"} className="capitalize">
                  {meeting.status}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preparation Resources */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">Prepare for Your Meeting</h2>
          <p className="text-muted-foreground">
            Explore these resources to get the most out of your conversation with our sales team.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {prepResources.map((resource) => (
            <Card key={resource.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getResourceIcon(resource.type)}
                    <CardTitle className="text-lg">{resource.title}</CardTitle>
                  </div>
                  {resource.duration && (
                    <Badge variant="outline" className="text-xs">
                      {resource.duration}
                    </Badge>
                  )}
                </div>
                <CardDescription>{resource.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button variant="outline" size="sm" className="w-full bg-transparent" asChild>
                  <a href={resource.url} target="_blank" rel="noopener noreferrer">
                    <span>Explore</span>
                    <ExternalLink className="ml-2 h-3 w-3" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Separator />

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>What to Expect</CardTitle>
          <CardDescription>Here's what will happen during your meeting</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                1
              </div>
              <div>
                <p className="font-semibold">Discovery & Requirements</p>
                <p className="text-sm text-muted-foreground">We'll discuss your current setup, challenges, and goals</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                2
              </div>
              <div>
                <p className="font-semibold">Product Demo</p>
                <p className="text-sm text-muted-foreground">See how Vercel can solve your specific use cases</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                3
              </div>
              <div>
                <p className="font-semibold">Next Steps</p>
                <p className="text-sm text-muted-foreground">We'll outline a plan to get you started with Vercel</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Questions before your meeting?</p>
            <p className="text-sm">
              Reach out to your sales expert:{" "}
              <a href={`mailto:${meeting.sales_rep_email}`} className="text-primary hover:underline font-semibold">
                {meeting.sales_rep_email}
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
