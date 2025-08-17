import { Suspense } from "react"
import { PrepRoom } from "@/components/prep-room"
import { Loader2 } from "lucide-react"

export default function PrepRoomPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          }
        >
          <PrepRoom />
        </Suspense>
      </div>
    </div>
  )
}
