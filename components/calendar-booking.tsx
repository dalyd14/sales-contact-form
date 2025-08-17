"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Loader2, Clock, User } from "lucide-react"
import type { SalesRep } from "@/lib/db"
import { upsertCookie } from "@/lib/utils"

interface TimeSlot {
  time: string
  available: boolean
}

export function CalendarBooking({ prospectId }: { prospectId: string }) {
  const router = useRouter()

  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [assignedRep, setAssignedRep] = useState<SalesRep | null>(null)
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isBooking, setIsBooking] = useState(false)

  // Generate time slots for business hours (9 AM - 5 PM)
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = []
    for (let hour = 9; hour < 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
        slots.push({ time, available: true })
      }
    }
    return slots
  }

  // Load assigned sales rep when component mounts
  useEffect(() => {
    const loadAssignedRep = async () => {
      if (!prospectId) return

      try {
        const response = await fetch(`/api/prospects/${prospectId}/assign-rep`)
        if (response.ok) {
          const rep = await response.json()
          setAssignedRep(rep)
        }
      } catch (error) {
        console.error("Error loading assigned rep:", error)
      }
    }

    loadAssignedRep()
  }, [prospectId])

  // Load available time slots when date is selected
  useEffect(() => {
    if (selectedDate && assignedRep) {
      setIsLoading(true)
      // For now, generate all slots as available
      // In a real app, you'd check the rep's calendar
      setTimeout(() => {
        setTimeSlots(generateTimeSlots())
        setIsLoading(false)
      }, 500)
    }
  }, [selectedDate, assignedRep])

  const handleBookMeeting = async () => {
    if (!prospectId || !selectedDate || !selectedTime || !assignedRep) return

    setIsBooking(true)
    try {
      const meetingDateTime = new Date(selectedDate)
      const [hours, minutes] = selectedTime.split(":").map(Number)
      meetingDateTime.setHours(hours, minutes, 0, 0)

      // Create meeting with prospect id and sales rep id and meeting date
      const response = await fetch("/api/meetings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prospectId: prospectId,
          salesRepId: assignedRep.id,
          meetingDate: meetingDateTime.toISOString(),
        }),
      })

      if (response.ok) {
        const { meetingId } = await response.json()
        upsertCookie("prospectId", prospectId)
        router.push(`/prep-room?meetingId=${meetingId}`)
      } else {
        throw new Error("Failed to book meeting")
      }
    } catch (error) {
      console.error("Error booking meeting:", error)
      // TODO: Add proper error handling
    } finally {
      setIsBooking(false)
    }
  }

  if (!prospectId) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Invalid booking link. Please start from the contact form.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Calendar Section */}
      <Card>
        <CardHeader>
          <CardTitle>Select Date</CardTitle>
          <CardDescription>Choose a date for your meeting</CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={(date) => {
              // Disable past dates and weekends
              const today = new Date()
              today.setHours(0, 0, 0, 0)
              return date < today || date.getDay() === 0 || date.getDay() === 6
            }}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      {/* Time Slots and Rep Info */}
      <div className="space-y-6">
        {/* Assigned Rep Info */}
        {assignedRep && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Your Sales Expert
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{assignedRep.name}</p>
                  <p className="text-sm text-muted-foreground">{assignedRep.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Time Slots */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Available Times
            </CardTitle>
            <CardDescription>
              {selectedDate ? `Select a time for ${selectedDate.toLocaleDateString()}` : "Please select a date first"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedDate ? (
              <p className="text-center text-muted-foreground py-8">Select a date to see available times</p>
            ) : isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {timeSlots.map((slot) => (
                  <Button
                    key={slot.time}
                    variant={selectedTime === slot.time ? "default" : "outline"}
                    size="sm"
                    disabled={!slot.available}
                    onClick={() => setSelectedTime(slot.time)}
                    className="justify-center"
                  >
                    {slot.time}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Book Meeting Button */}
        {selectedDate && selectedTime && assignedRep && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="text-center">
                  <p className="font-semibold">Meeting Summary</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedDate.toLocaleDateString()} at {selectedTime} with {assignedRep.name}
                  </p>
                </div>
                <Button onClick={handleBookMeeting} className="w-full" disabled={isBooking}>
                  {isBooking ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Booking Meeting...
                    </>
                  ) : (
                    "Confirm Meeting"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
