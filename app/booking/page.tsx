import { Suspense } from "react"
import { CalendarBooking } from "@/components/calendar-booking"
import { Loader2 } from "lucide-react"

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">Schedule Your Meeting</h1>
            <p className="text-lg text-muted-foreground">
              Choose a convenient time to speak with one of our sales experts
            </p>
          </div>
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            }
          >
            <CalendarBooking />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
