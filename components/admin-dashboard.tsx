"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  IconButton,
  Box,
  CardHeader,
  CardContent,
  Card,
  Divider,
  Drawer,
  Checkbox,
  FormControlLabel,
  Table,
  TableContainer,
  TableCell,
  TableBody,
  TableRow,
  TableHead,
  Button
} from "@mui/material"
import { Calendar, Clock, User, Mail, Globe, MessageSquare, Clapperboard, Blocks, ExternalLink } from "lucide-react"
import { AutoAwesomeOutlined, BookmarksOutlined, KeyboardTab } from "@mui/icons-material"
import type { SalesRep } from "@/lib/db"
import { getCookie, upsertCookie } from "@/lib/utils"
import { RefreshCcw } from "lucide-react"

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Chat from "@/components/chat"
import { JsonViewer } from '@textea/json-viewer'

import resources from "@/lib/resources.json"

interface MeetingWithDetails {
  id: number
  prospect_id: number
  sales_rep_id: number
  meeting_date: string
  status: string
  notes?: string
  created_at: string
  updated_at: string
  prospect_email: string
  prospect_country: string
  product_interest: string
  prospect_message?: string
  ai_resources?: string[]
  resources_completed?: string[]
  enrichment?: any
  sales_rep_name: string
  sales_rep_email: string
  game_plan?: string
}

interface DashboardStats {
  totalMeetings: number
  upcomingMeetings: number
  completedMeetings: number
  totalProspects: number
}

export function AdminDashboard() {
  const searchParams = useSearchParams()
  const salesRepId = searchParams.get("sales_rep")
  const [meetings, setMeetings] = useState<MeetingWithDetails[]>([])
  const [salesReps, setSalesReps] = useState<SalesRep[]>([])
  const [selectedRep, setSelectedRep] = useState<string>(salesRepId || getCookie("salesRepId") || "all")
  const [stats, setStats] = useState<DashboardStats>({
    totalMeetings: 0,
    upcomingMeetings: 0,
    completedMeetings: 0,
    totalProspects: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingWithDetails | null>(null)

  const [openDialog, setOpenDialog] = useState(false)
  const [openDrawer, setOpenDrawer] = useState(false)
  const [drawerContent, setDrawerContent] = useState<string>("chat")

  const [prospectEvents, setProspectEvents] = useState<any[]>([])

  // state to hold a stable element for the Modal container
  const [drawerContainerEl, setDrawerContainerEl] = useState<HTMLElement | null>(null);
  const drawerContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      upsertCookie("salesRepId", selectedRep)
      try {
        // Load sales reps
        const repsResponse = await fetch("/api/sales-reps")
        if (repsResponse.ok) {
          const repsData = await repsResponse.json()
          setSalesReps(repsData)
        }

        // Load meetings
        const meetingsUrl = selectedRep === "all" ? "/api/meetings" : `/api/meetings?salesRepId=${selectedRep}`
        const meetingsResponse = await fetch(meetingsUrl)
        if (meetingsResponse.ok) {
          const meetingsData = await meetingsResponse.json()
          setMeetings(meetingsData)
        }

        // Load stats
        // const statsResponse = await fetch(selectedRep === "all" ? "/api/admin/stats" : `/api/admin/stats?salesRepId=${selectedRep}`)
        // if (statsResponse.ok) {
        //   const statsData = await statsResponse.json()
        //   setStats(statsData)
        // }
      } catch (error) {
        console.error("Error loading dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [selectedRep])

  const cutOffLabel = (label: string, length: number) => {
    if (label.length > length) {
      return label.slice(0, length) + "..."
    }
    return label
  }

  const refreshGamePlan = async (meetingId: string) => {
    const gamePlan = await fetch(`/api/game-plan-ai/${meetingId}?force=true`)
    const gamePlanData = await gamePlan.json()
    setSelectedMeeting(prev => ({
      ...prev,
      game_plan: gamePlanData.toString()
    } as MeetingWithDetails))
  }

  const formatMeetingDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
  }

  const selectViewMeeting = async (meetingId: string) => {

    fetch(`/api/events`, {
      method: "POST",
      body: JSON.stringify({
        user_id: getCookie("salesRepId"),
        event_type: "track",
        event_name: "meeting_details_viewed"
      })
    })

    const gamePlan = await fetch(`/api/game-plan-ai/${meetingId}`)
    const gamePlanData = await gamePlan.json()

    setSelectedMeeting(prev => ({
      ...prev,
      game_plan: gamePlanData.toString()
    } as MeetingWithDetails))

    const prosp_id = meetings.find((m) => m.id.toString() === meetingId)?.prospect_id
    const prospectEvents = await fetch(`/api/events/${prosp_id}`)
    const prospectEventsData = await prospectEvents.json()
    setProspectEvents(prospectEventsData.events.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()))

    setOpenDialog(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Sales Dashboard</h1>
          <p className="text-lg text-muted-foreground">Manage your meetings and prospects</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedRep} onValueChange={setSelectedRep}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by sales rep" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sales Reps</SelectItem>
              {salesReps.map((rep) => (
                <SelectItem key={rep.id} value={rep.id.toString()}>
                  {rep.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card sx={{
          backgroundColor: "black",
          color: "white",
          border: "1px solid #a1a1a1"
        }}>
          <CardHeader
          avatar={<CalendarDays/>}
          title={<Typography variant="h6" component="h2" className="text-sm font-medium">Total Meetings</Typography>}
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 2
          }}
          />
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMeetings}</div>
          </CardContent>
        </Card>
        <Card sx={{
          backgroundColor: "black",
          color: "white",
          border: "1px solid #a1a1a1"
        }}>
          <CardHeader 
          avatar={<Clock/>}
          title={<Typography variant="h6" component="h2" className="text-sm font-medium">Upcoming</Typography>}
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 2
          }}
          />
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingMeetings}</div>
          </CardContent>
        </Card>
        <Card sx={{
          backgroundColor: "black",
          color: "white",
          border: "1px solid #a1a1a1"
        }}>
          <CardHeader 
          avatar={<TrendingUp/>}
          title={<Typography variant="h6" component="h2" className="text-sm font-medium">Completed</Typography>}
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 2
          }}
          />
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedMeetings}</div>
          </CardContent>
        </Card>
        <Card sx={{
          backgroundColor: "black",
          color: "white",
          border: "1px solid #a1a1a1"
        }}>
          <CardHeader 
          avatar={<Users/>}
          title={<Typography variant="h6" component="h2" className="text-sm font-medium">Total Prospects</Typography>}
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 2
          }}
          />
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProspects}</div>
          </CardContent>
        </Card>
      </div> */}

      {/* Meetings List */}
      <Card sx={{
        backgroundColor: "black",
        color: "white",
        border: "1px solid #a1a1a1"
      }}>
        <CardHeader 
        avatar={<Calendar/>}
        title={<Typography variant="h6" component="h2" className="text-sm font-medium">
          {selectedRep === "all"
            ? `All Meetings (${meetings.length})`
            : `Meetings for ${salesReps.find((r) => r.id.toString() === selectedRep)?.name} (${meetings.length})`}
        </Typography>}
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 2
        }}
        />
          <CardContent sx={{
            backgroundColor: "black",
            color: "white"
          }}>
            {meetings.length === 0 ? (
              <Box>
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <Typography variant="body2" component="p" className="text-sm text-muted-foreground text-center">
                  No meetings found
                </Typography>
              </Box>
            ) : (
              <Box>
                {meetings.map((meeting) => {
                  const { date, time } = formatMeetingDate(meeting.meeting_date)
                  return (
                    <Box key={meeting.id} sx={{
                      border: "1px solid #a1a1a1",
                      backgroundColor: "black",
                      color: "white",
                      borderRadius: "10px",
                      p: 2,
                      mb: 2
                    }}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="font-semibold">
                                {date} at {time}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-start gap-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {meeting.prospect_email}
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {meeting.sales_rep_name}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs capitalize" style={{border: "1px solid #a1a1a1"}}>
                              {meeting.product_interest.replaceAll("_", " ")}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              {meeting.prospect_country}
                            </div>
                          </div>
                        </div>
                        <div>
                          <Button variant="outlined" sx={{ 
                        mb:1,
                        backgroundColor: "black", 
                        border: "1px solid #a1a1a1",
                        color: "white", 
                        '&:hover': {
                          color: "#a1a1a1"
                        }
                      }} size="small" onClick={() => {setSelectedMeeting(meeting); selectViewMeeting(meeting.id.toString()); setOpenDialog(true)}}>
                            View Details
                          </Button>                        
                        </div>
                      </div>                      
                      </Box>
                  )
                })}
              </Box>
            )}            
          </CardContent>
      </Card>
      {
        selectedMeeting && (
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}
          fullWidth
          maxWidth="lg"
          PaperProps={{
            sx: {
              border: "1px solid #a1a1a1",
              backgroundColor: "black",
              color: "white"
            }
          }}
        >
          <DialogContent sx={{ width: "100%", position: "relative" }}>
            <DialogTitle sx={{ color: "white", fontFamily: "GeistSans", px:0 }}>
              Meeting Details: {formatMeetingDate(selectedMeeting?.meeting_date || "").date} at {formatMeetingDate(selectedMeeting?.meeting_date || "" ).time}
            </DialogTitle>
            <Box
              ref={(node) => {
                drawerContainerRef.current = node as HTMLDivElement;
                if (node && node !== drawerContainerEl) setDrawerContainerEl(node as HTMLElement);
              }}
              sx={{
                position: "relative",
                minHeight: 500,   // ensures space for the drawer
                overflow: "hidden",
              }}
            >                            
              {selectedMeeting && (
              <>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Prospect Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        {selectedMeeting.prospect_email}
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="h-3 w-3 text-muted-foreground" />
                        {selectedMeeting.prospect_country}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs capitalize" style={{border: "1px solid #a1a1a1"}}>
                          {selectedMeeting.product_interest.replaceAll("_", " ")}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Sales Rep</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 text-muted-foreground" />
                        {selectedMeeting.sales_rep_name}
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        {selectedMeeting.sales_rep_email}
                      </div>
                    </div>
                  </div>
                </div>

                <Divider sx={{
                  borderColor: "#a1a1a1",
                  my: 4
                }} />

                {selectedMeeting && (
                  <>
                  <Box sx={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    alignItems: "flex-start",
                    width: "100%",
                    my: 3
                  }}>
                    <Box sx={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-start",
                      alignItems: "flex-start",
                      width: "33%",
                    }}>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Form Submission Response
                      </h4>
                      <div className="bg-muted p-3 rounded-md text-sm mr-3" style={{fontStyle: `${selectedMeeting.prospect_message ? 'normal' : 'italic'}`}}>
                        {selectedMeeting.prospect_message || "Prospect did not submit a response"}
                      </div>                                        
                    </Box>
                    <Box sx={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-start",
                      alignItems: "flex-start",
                      width: "33%",
                    }}>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <AutoAwesomeOutlined className="h-4 w-4" />
                        Additional Information
                      </h4>
                      <Button variant="outlined" sx={{ 
                        mb:1,
                        backgroundColor: "black", 
                        border: "1px solid #a1a1a1",
                        color: "white", 
                        '&:hover': {
                          backgroundColor: "black",
                          color: "#a1a1a1"
                        }
                      }} size="small" onClick={() => {
                        setDrawerContent("chat");
                        setOpenDrawer(!openDrawer);
                      }}>
                        AI Chat
                      </Button>
                      <Button variant="outlined" sx={{ 
                        mb:1,
                        backgroundColor: "black", 
                        border: "1px solid #a1a1a1",
                        color: "white", 
                        '&:hover': {
                          backgroundColor: "black",
                          color: "#a1a1a1"
                        }
                      }} size="small" onClick={() => {
                        setDrawerContent("enrichment");
                        setOpenDrawer(!openDrawer);
                      }}>
                        Enrichment
                      </Button>
                      <Button variant="outlined" sx={{ 
                        mb:1,
                        backgroundColor: "black", 
                        border: "1px solid #a1a1a1",
                        color: "white", 
                        '&:hover': {
                          backgroundColor: "black",
                          color: "#a1a1a1"
                        }
                      }} size="small" onClick={() => {
                        setDrawerContent("prospect_events");
                        setOpenDrawer(!openDrawer);
                      }}>
                        Events
                      </Button>
                    </Box>
                    <Box sx={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-start",
                      alignItems: "flex-start",
                      width: "33%",
                    }}>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <BookmarksOutlined className="h-4 w-4" />
                        Given Resources
                      </h4>
                      <Box sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-start",
                        alignItems: "flex-start",
                        width: "100%",
                        ml: 2
                      }}>
                        {
                          selectedMeeting.ai_resources && selectedMeeting.ai_resources.map((resource) => (
                            <FormControlLabel
                              key={resource}
                              sx={{
                                width: "100%",
                                cursor: "default"
                              }}
                              control={<Checkbox sx={{
                                p:0, 
                                mr: 1,
                                pointerEvents: "none",
                                color: 'white',
                                '&.Mui-checked': {
                                  color: 'white',
                                }
                              }} checked={selectedMeeting.resources_completed?.includes(resource)} />}
                              label={
                                <Box sx={{
                                  display: "flex",
                                  flexDirection: "row",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  width: "100%",
                                  gap: 1
                                }}>
                                  <Typography variant="body2" component="p" className="text-sm">
                                    {cutOffLabel(resources.find((r: any) => r.id === resource)?.name || "Resource", 30)}
                                  </Typography>
                                  <IconButton sx={{cursor: "pointer", color: "white"}} onClick={()=> window.open(resources.find((r: any) => r.id === resource)?.url || "", '_blank') }>
                                    <ExternalLink className="h-4 w-4" />
                                  </IconButton>
                                </Box>
                              }
                            />
                          ))
                        }
                      </Box>
                    </Box>
                  </Box>
                  </>
                )}
                <Divider sx={{
                  borderColor: "#a1a1a1",
                  my: 4
                }} />
                { 
                  selectedMeeting.game_plan ? (
                    <div>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 3 }}>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Clapperboard className="h-4 w-4" />
                          Game Plan
                        </h4>
                        <IconButton onClick={() => {
                          refreshGamePlan(selectedMeeting.id.toString())
                        }}>
                          <RefreshCcw className="h-4 w-4" />
                        </IconButton>                       
                      </Box>
                      <div className="bg-muted p-3 rounded-md text-sm">
                        <div className="markdown-content">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                                h1: ({children}) => <h1>{children}</h1>,
                                h2: ({children}) => <h2>{children}</h2>,
                                h3: ({children}) => <h3>{children}</h3>,
                                h4: ({children}) => <h4>{children}</h4>,
                                h5: ({children}) => <h5>{children}</h5>,
                                h6: ({children}) => <h6>{children}</h6>,
                                p: ({children}) => <p>{children}</p>,
                                code: ({children, className}) => {
                                    const isInline = !className;
                                    return isInline ? (
                                        <code>{children}</code>
                                    ) : (
                                        <pre><code>{children}</code></pre>
                                    );
                                },
                                pre: ({children}) => <pre>{children}</pre>,
                                blockquote: ({children}) => <blockquote>{children}</blockquote>,
                                a: ({children, href}) => <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>,
                                ul: ({children}) => <ul>{children}</ul>,
                                ol: ({children}) => <ol>{children}</ol>,
                                li: ({children}) => <li>{children}</li>,
                                strong: ({children}) => <strong>{children}</strong>,
                                em: ({children}) => <em>{children}</em>,
                            }}
                        >
                            {selectedMeeting.game_plan}
                        </ReactMarkdown>
                        </div>
                      </div>
                  </div>
                  ) : (
                    <>
                    <Box sx={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      width: "100%",
                      my: 5
                    }}>
                      <Blocks className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <Typography variant="body2" component="p" className="text-sm text-muted-foreground text-center">
                        Working on a game plan for this meeting...
                      </Typography>
                    </Box>
                    </>
                  )
                }

              </div>
              <Drawer
                anchor="right"
                open={openDrawer}
                onClose={() => setOpenDrawer(false)}
                variant="temporary"
                ModalProps={{
                  container: drawerContainerEl,   // 👈 this is the key line
                  keepMounted: true,
                }}
                hideBackdrop
                PaperProps={{
                  sx: {
                    borderLeft: "1px solid #a1a1a1",
                    position: "absolute",
                    right: 0,
                    top: 0,
                    height: "100%",
                    width: "50%",
                    background: 'black'
                  },
                }}
              >
                <Box sx={{ p: 1, height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
                  {/* Button for closing drawer */}
                  <IconButton 
                    onClick={() => setOpenDrawer(false)}
                    size="large"
                    sx={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: 'white'
                    }}
                    style={{
                      position: "absolute",
                      top: 20,
                      right: 15,
                      zIndex: 1000
                    }}
                  >
                    <KeyboardTab className="h-4 w-4" />
                  </IconButton>
                  {
                    (() => {
                      switch (drawerContent) {
                        case "chat":
                          return <Chat meetingId={selectedMeeting.id.toString()} readOnly={true} height="95vh"/>
                        case "enrichment":
                          return <Box sx={{ height: '95vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                            <Typography variant="h6" component="h2" sx={{
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                color: '#fff',
                                my: 2,
                                height: '7%'
                            }}>
                                Prospect Enrichment
                            </Typography>
                            <Box sx={{
                              width: '100%',
                              background: 'linear-gradient(135deg, #111112 0%, #000 100%)',
                              boxShadow: '0 8px 32px 0 rgba(0,0,0,0.45)',
                              padding: '2.5rem 2rem',
                              gap: '1.5rem',
                              height: '93%',
                              overflowY: 'scroll',
                              scrollbarWidth: 'thin',
                              scrollbarColor: '#444 #232526',
                              border: '1.5px solid #333',
                              borderRadius: '18px',
                              position: 'relative',
                              pb: 0
                            }}>
                              <JsonViewer 
                                theme={'dark'} 
                                rootName={false} 
                                value={selectedMeeting?.enrichment || {}} 
                                displayDataTypes={false}
                                defaultInspectDepth={2}
                                style={{
                                  background: 'transparent'
                                }}
                              />
                            </Box>
                          </Box>
                        case "prospect_events":
                          return (
                            <Box sx={{ height: '95vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                            <Typography variant="h6" component="h2" sx={{
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                color: '#fff',
                                my: 2,
                                height: '7%'
                            }}>
                                Prospect Events
                            </Typography>
                            <Box sx={{
                              width: '100%',
                              background: 'linear-gradient(135deg, #111112 0%, #000 100%)',
                              boxShadow: '0 8px 32px 0 rgba(0,0,0,0.45)',
                              padding: '2.5rem 2rem',
                              gap: '1.5rem',
                              height: '93%',
                              overflowY: 'scroll',
                              scrollbarWidth: 'thin',
                              scrollbarColor: '#444 #232526',
                              border: '1.5px solid #333',
                              borderRadius: '18px',
                              position: 'relative',
                              pb: 0
                            }}>
                              <TableContainer
                                sx={{
                                  maxHeight: '100%'
                                }}
                              >
                                <Table
                                  stickyHeader
                                  aria-label="sticky table"
                                >
                                  <TableHead>
                                    <TableRow>
                                      <TableCell
                                        sx={{
                                          background: 'black',
                                          color: 'white',
                                          borderBottom: '1px solid #444',
                                        }}
                                      >
                                        Event Type
                                      </TableCell>
                                      <TableCell
                                        sx={{
                                          background: 'black',
                                          color: 'white',
                                          borderBottom: '1px solid #444',
                                        }}
                                      >
                                        Event Name
                                      </TableCell>
                                      <TableCell
                                        sx={{
                                          background: 'black',
                                          color: 'white',
                                          borderBottom: '1px solid #444',
                                        }}
                                      >
                                        Timestamp
                                      </TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {prospectEvents.map((event) => (
                                      <TableRow
                                        key={event.id}
                                        sx={{
                                          background: 'transparent',
                                        }}
                                      >
                                        <TableCell
                                          sx={{
                                            color: 'white',
                                            background: 'transparent',
                                            borderBottom: '1px solid #333',
                                          }}
                                        >
                                          {event.event_type}
                                        </TableCell>
                                        <TableCell
                                          sx={{
                                            color: 'white',
                                            background: 'transparent',
                                            borderBottom: '1px solid #333',
                                          }}
                                        >
                                          {event.event_name}
                                        </TableCell>
                                        <TableCell
                                          sx={{
                                            color: 'white',
                                            background: 'transparent',
                                            borderBottom: '1px solid #333',
                                          }}
                                        >
                                          {formatMeetingDate(event.created_at || "").date} {formatMeetingDate(event.created_at || "").time} 
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </Box>
                            </Box>
   
                          )
                      }
                    }) ()
                  }
                </Box>
              </Drawer>
              </>
            )}
            </Box>
          </DialogContent>
        </Dialog>
        )
      }
    </div>
  )
}
