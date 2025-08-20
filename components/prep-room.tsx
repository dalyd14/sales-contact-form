"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button, Box, CardContent, CardHeader, Card, Typography, Divider, FormControlLabel, Checkbox } from "@mui/material"
import { Clock, User, CheckCircle, ExternalLink, PenLine, FileQuestionMark } from "lucide-react"
import { Chat, AutoAwesome, AutoFixHigh, Article, HistoryEdu, CalendarMonth, School } from "@mui/icons-material"
import type { MeetingWithDetails } from "@/lib/db"
import ChatComponent from "./chat"
import { Dialog, DialogContent } from "@mui/material"
import { getCookie } from "@/lib/utils"

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
        const user_id = getCookie("prospectId")
        await fetch(`/api/events`, {
          method: "POST",
          body: JSON.stringify({
            user_id: user_id,
            event_type: "page",
            event_name: "prep_room"
          })
        })
        setIsLoading(false)
      }
    }

    loadMeeting()
  }, [meetingId])

  const handleResourceClicked = (resource: string, url: string) => {
    openNewTab(url)
    fetch(`/api/events`, {
      method: "POST",
      body: JSON.stringify({
        user_id: meeting?.prospect_id,
        event_type: "track",
        event_name: "resource_viewed"
      })
    })
    // Check if resource has already been completed
    if (!meeting?.resources_completed.includes(resource)) {
      fetch(`/api/events`, {
        method: "POST",
        body: JSON.stringify({
          user_id: meeting?.prospect_id,
          event_type: "track",
          event_name: "resource_completed"
        })
      })
    }
    setResourceChecked(resource)
    fetch(`/api/prospects/complete_resource`, {
      method: "POST",
      body: JSON.stringify({
        prospectId: meeting?.prospect_id,
        resourceId: resource
      })
    })

  }

  const setResourceChecked = (resource: string) => {
    if (meeting) {
      const updatedResources = [...meeting.resources_completed, resource]
      setMeeting({ ...meeting, resources_completed: updatedResources })
    }
  }

  const openNewTab = (url: string) => {
    window.open(url, '_blank')
  }

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
      <Card sx={{
        backgroundColor: "transparent",
        color: "white",
        mb:0
      }}>
        <Box sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'flex-start',
          alignItems: 'center',
          width: '100%'
        }}>
          <CalendarMonth style={{
            fontSize: "2.5rem",
            marginRight: 10
          }}/>
          <h2 className="text-2xl font-bold text-foreground">Meeting Details for {meeting.prospect_email}</h2>
        </Box>
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
                <FileQuestionMark className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h4>Responses</h4>
                  <p className="text-sm text-muted-foreground">{meeting.product_interest}{meeting.prospect_message && ` - ${meeting.prospect_message}`}</p>
                </div>
              </div>
            </div>
          </Box>
        </CardContent>
      </Card>

      <Divider sx={{
        borderColor: "#a1a1a1",
        my: 4
      }}/>

      {/* Chat with Vercel AI Assistant Button */}
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        width: '100%',
        mb: 2
      }}>
        <Box sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'flex-start',
          alignItems: 'center',
          width: '100%',
          mb: 2
        }}>
          <Chat style={{
            fontSize: "2.5rem",
            marginRight: 10
          }}/>
          <h2 className="text-2xl font-bold text-foreground mb-2">Chat with Vercel AI Assistant</h2>
        </Box>
        <Box sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          mb: 2
        }}>
          <Box sx={{width:'50%'}}>
            <Typography variant="body1" component="p" sx={{
              fontSize: "0.9rem"
            }}>
              Help us to better prepare for the meeting by chatting with our AI chatbot. This will help add more context for our Sales Rep. Your responses will be used to prepare for the meeting.
            </Typography>


          </Box>
          <Button
          variant="contained" 
          color="primary" 
          sx={{
            height: "75px",
            backgroundColor: "black",
            color: "white",
            fontSize: "1.1rem",
            border: "1px solid #a1a1a1"
          }}
          startIcon={<AutoAwesome />}
          onClick={() => {
            setShowChat(true);
            fetch(`/api/events`, {
              method: "POST",
              body: JSON.stringify({
                user_id: meeting?.prospect_id,
                event_type: "track",
                event_name: "chat_opened"
              })
            });
          }}>
            Help Us Prepare for the Meeting
          </Button>          
        </Box>

      </Box>


      <Divider sx={{
        borderColor: "#a1a1a1",
        my: 4
      }}/>

      {/* Chat Modal */}
      <Dialog PaperProps={{
        sx: {
          borderRadius: "10px"
        }
      }} fullWidth={true} maxWidth="lg" open={showChat} onClose={() => setShowChat(false)}>
        <DialogContent sx={{ padding: 0, borderRadius: "10px", border: "1px solid #a1a1a1" }}>
          <ChatComponent meetingId={meetingId} readOnly={false} />
        </DialogContent>
      </Dialog>

      {/* Preparation Resources */}
      <div>
        {meeting && meeting.ai_resources && meeting.ai_resources.length > 0 && (
          <Box sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            width: '100%',
            mb: 2
          }}>
            <School style={{
              fontSize: "2.5rem",
              marginRight: 10
            }}/>
            <h2 className="text-2xl font-bold text-foreground mb-2">We think you might like these...</h2>
          </Box>
        )}

        <Box sx={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 2
        }}>
          {(meeting && meeting.ai_resources && meeting.ai_resources.length > 0) ? meeting.ai_resources.map((resource: string) => {
            const resourceData = resources.find((r: any) => r.id === resource)
            const resourceChecked = meeting.resources_completed.includes(resource)
            return(
            <Card key={resource} sx={{
              width: '32%',
              borderRadius: '10px',
              boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.1)',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              alignItems: 'center',
              padding: '1rem',
              display: 'flex',
              border: "1px solid #a1a1a1",
              backgroundColor: "black",
              color: "white"  
            }}>
              <CardHeader
              sx={{
                pb:1,
                pt: 0,
                px:0,
                width:'100%'
              }}
              avatar={getResourceIcon(resourceData?.type || "")}
              title={<Typography variant="h6" component="h3" sx={{
                fontSize: "1.1rem"
              }}>{resourceData?.name || ""}</Typography>}
              />
              <CardContent sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: '100%',
                p:'0 !important'
              }}>
                <Typography variant="body1" component="p" sx={{
                  fontSize: "0.9rem"
                }}>{resourceData?.description || ""}</Typography>

                <Button
                  variant="contained"
                  onClick={() => handleResourceClicked(resource, resourceData?.url || "")}
                  endIcon={<ExternalLink />}
                  sx={{
                    cursor: "pointer",
                    background: "#111",
                    color: "#fff",
                    border: "1px solid #fff",
                    boxShadow: "none",
                    '&:hover': {
                      background: "#222",
                      color: "#fff",
                      border: "1px solid #fff",
                      boxShadow: "none"
                    },
                    borderRadius: "8px",
                    mt: 2,
                    transition: "background 0.2s"
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={resourceChecked}
                        sx={{
                          color: "#fff",
                          '&.Mui-checked': {
                            color: "#fff",
                          },
                        }}
                      />
                    }
                    sx={{
                      color: "white",
                    }}
                    label={
                      (() => {
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
                      })()
                    }
                  />
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
                {`We're working on something special for you!`}
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
