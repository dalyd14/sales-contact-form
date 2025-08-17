import { SalesContactForm } from "@/components/sales-contact-form"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">Get Started with Vercel</h1>
            <p className="text-lg text-muted-foreground">
              Connect with our sales team to learn how Vercel can accelerate your development workflow
            </p>
          </div>
          <SalesContactForm />
        </div>
      </div>
    </div>
  )
}
