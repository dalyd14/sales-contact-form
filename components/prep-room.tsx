"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button, Box, CardContent, CardHeader, Card, Typography, Divider } from "@mui/material"
import { Calendar, Clock, User, CheckCircle, ExternalLink, PenLine } from "lucide-react"
import { Chat, AutoAwesome, AutoFixHigh, Article, HistoryEdu } from "@mui/icons-material"
import type { MeetingWithDetails } from "@/lib/db"
import ChatComponent from "./chat"
import { Dialog, DialogContent } from "@mui/material"

import resources from "@/lib/resources.json"

const getResourceIcon = (type: string) => {
  switch (type) {
    case "blog":
      return <HistoryEdu sx={{fontSize: "2.5rem"}}/>
    case "documentation":
      return <Article sx={{fontSize: "2.5rem"}}/>
    case "prompt":
      return <AutoFixHigh sx={{fontSize: "2.5rem"}}/>
    default:
      return <Article sx={{fontSize: "2.5rem"}}/>
  }
}

export function PrepRoom() {
  const searchParams = useSearchParams()
  const meetingId = searchParams.get("meetingId")
  const [meeting, setMeeting] = useState<MeetingWithDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showChat, setShowChat] = useState(false)

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
        <CardHeader
        avatar={<Calendar className="h-5 w-5" />}
        title={<Typography variant="h6" component="h2" sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 1
        }}>Meeting Details for <span className="font-bold">{meeting.prospect_email}</span></Typography>}
        />
        <Divider sx={{
          margin: "0 1rem"
        }}/>
        <CardContent>
          <Box sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%'
          }}>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h4>
                    {meetingDate.toLocaleDateString()} at{" "}
                    {meetingDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </h4>
                  <p className="text-sm text-muted-foreground">{isUpcoming ? "Upcoming" : "Past"} meeting</p>
                </div>
              </div>            
              <div>
                <h4>Your Interest</h4>
                <Badge variant="secondary" className="capitalize">
                  {meeting.product_interest.replaceAll("_", " ")}
                </Badge>
              </div>
          </Box>
          <Box sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%'
          }}>
            <div className="space-y-4">

              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h4>{meeting.sales_rep_name}</h4>
                  <p className="text-sm text-muted-foreground">{meeting.sales_rep_email}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                  <h4>Status</h4>
                  <Badge variant={meeting.status === "scheduled" ? "default" : "secondary"} className="capitalize">
                  {meeting.status}
                  </Badge>
              </div>
          </div>

          </Box>
        </CardContent>
      </Card>

      {/* Chat with Vercel AI Assistant Button */}
      <div className="flex justify-center">
        <Button
        variant="contained" 
        color="primary" 
        sx={{
          height: "75px",
          backgroundColor: "black",
          color: "white",
          fontSize: "1.1rem"
        }}
        startIcon={<AutoAwesome />}
        onClick={() => setShowChat(true)}>
          Help Us Prepare for the Meeting
        </Button>
      </div>

      <Divider sx={{
        my: 2
      }}/>

      {/* Chat Modal */}
      <Dialog PaperProps={{
        sx: {
          borderRadius: "10px"
        }
      }} fullWidth={true} maxWidth="lg" open={showChat} onClose={() => setShowChat(false)}>
        <DialogContent sx={{ padding: 0, borderRadius: "10px" }}>
          <ChatComponent meetingId={meetingId} />
        </DialogContent>
      </Dialog>

      {/* Preparation Resources */}
      <div>
        {meeting && meeting.ai_resources && meeting.ai_resources.length > 0 && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">We think you might like these...</h2>
          </div>
        )}

        <Box sx={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 2
        }}>
          {(meeting && meeting.ai_resources && meeting.ai_resources.length > 0) ? meeting.ai_resources.map((resource: string) => {
            const resourceData = resources.find((r: any) => r.id === resource)
            return(
            <Card key={resource} sx={{
              width: '32%',
              borderRadius: '10px',
              boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.1)',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem',
              display: 'flex'
            }}>
              <CardHeader
              sx={{
                pb:1,
                pt: 0,
                px:0
              }}
              avatar={getResourceIcon(resourceData?.type || "")}
              title={<Typography variant="h6" component="h3" sx={{
                fontSize: "1.1rem"
              }}>{resourceData?.name || ""}</Typography>}
              />
              <CardContent sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                p:0
              }}>
                <Typography variant="body1" component="p" sx={{
                  fontSize: "0.9rem"
                }}>{resourceData?.description || ""}</Typography>
                <Button variant="contained" color="primary" sx={{ mt: 2 }} endIcon={<ExternalLink/>}>
                  <a href={resourceData?.url || ""} target="_blank" rel="noopener noreferrer">
                    <span>{(() => {
                      switch (resourceData?.type) {
                        case "blog":
                          return "Read Blog"
                        case "documentation":
                          return "Check Docs"
                        case "prompt":
                          return "Try v0"
                        default:
                          return "Explore"
                      }
                    })()}</span>
                  </a>
                </Button>
              </CardContent>
            </Card>
            )
          }) : (
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              mt: 5
            }}>
              <PenLine className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <Typography variant="body2" component="p" className="text-sm text-muted-foreground text-center">
                We're working on something special for you!
              </Typography>
              <Typography variant="body2" component="p" className="text-sm text-muted-foreground text-center">
                Check back soon to discover new resources tailored just for you.
              </Typography>
            </Box>
          )}
        </Box>
      </div>
    </div>
  )
}
