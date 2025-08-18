"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  IconButton,
  Box
} from "@mui/material"
import { Calendar, Clock, User, Mail, Globe, MessageSquare, Users, CalendarDays, TrendingUp, Clapperboard } from "lucide-react"
import type { SalesRep } from "@/lib/db"
import { getCookie, upsertCookie } from "@/lib/utils"
import { RefreshCcw } from "lucide-react"

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
        const statsResponse = await fetch(selectedRep === "all" ? "/api/admin/stats" : `/api/admin/stats?salesRepId=${selectedRep}`)
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats(statsData)
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [selectedRep])

  const refreshGamePlan = async (meetingId: string) => {
    const gamePlan = await fetch(`/api/game-plan-ai/${meetingId}?force=true`)
    const gamePlanData = await gamePlan.json()
    setSelectedMeeting(prev => ({
      ...prev,
      game_plan: gamePlanData.toString()
    } as MeetingWithDetails))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "default"
      case "completed":
        return "secondary"
      case "cancelled":
        return "destructive"
      case "no_show":
        return "outline"
      default:
        return "secondary"
    }
  }

  const formatMeetingDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
  }

  const selectViewMeeting = async (meetingId: string) => {
    const gamePlan = await fetch(`/api/game-plan-ai/${meetingId}`)
    const gamePlanData = await gamePlan.json()

    setSelectedMeeting(prev => ({
      ...prev,
      game_plan: gamePlanData.toString()
    } as MeetingWithDetails))

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Meetings</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMeetings}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingMeetings}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedMeetings}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Prospects</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProspects}</div>
          </CardContent>
        </Card>
      </div>

      {/* Meetings List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {selectedRep === "all"
              ? "All Meetings"
              : `Meetings for ${salesReps.find((r) => r.id.toString() === selectedRep)?.name}`}
          </CardTitle>
          <CardDescription>
            {meetings.length} meeting{meetings.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {meetings.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No meetings found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {meetings.map((meeting) => {
                const { date, time } = formatMeetingDate(meeting.meeting_date)
                return (
                  <div key={meeting.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold">
                              {date} at {time}
                            </span>
                          </div>
                          <Badge variant={getStatusColor(meeting.status)} className="capitalize">
                            {meeting.status.replace("_", " ")}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {meeting.prospect_email}
                          </div>
                          <div className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            {meeting.prospect_country}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {meeting.sales_rep_name}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs capitalize">
                            {meeting.product_interest.replace("_", " & ")}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <Button variant="outline" size="sm" onClick={() => {setSelectedMeeting(meeting); selectViewMeeting(meeting.id.toString()); setOpenDialog(true)}}>
                          View Details
                        </Button>                        
                      </div>
                      {
                        selectedMeeting && (
                        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}
                          fullWidth
                          maxWidth="lg"
                        >
                          <DialogContent sx={{ width: "100%" }}>
                            <DialogTitle>Meeting Details: {formatMeetingDate(selectedMeeting?.meeting_date || "").date} at {formatMeetingDate(selectedMeeting?.meeting_date || "" ).time}</DialogTitle>
                            {selectedMeeting && (
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
                                        <Badge variant="outline" className="text-xs capitalize">
                                          {selectedMeeting.product_interest.replace("_", " & ")}
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
                                {selectedMeeting.prospect_message && (
                                  <div>
                                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                                      <MessageSquare className="h-4 w-4" />
                                      Prospect Form Submission Message
                                    </h4>
                                    <div className="bg-muted p-3 rounded-md text-sm">
                                      {selectedMeeting.prospect_message}
                                    </div>
                                  </div>
                                )}
                                { 
                                  selectedMeeting.game_plan && (
                                    <div>
                                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
                                  )
                                }
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>                          
                        )
                      }

                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
