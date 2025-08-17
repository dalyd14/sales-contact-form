export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold mb-4">Vercel Sales Portal</h3>
            <p className="text-sm text-muted-foreground">
              Connect with our sales team to learn how Vercel can accelerate your development workflow.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://vercel.com/docs" className="text-muted-foreground hover:text-foreground">
                  Documentation
                </a>
              </li>
              <li>
                <a href="https://vercel.com/templates" className="text-muted-foreground hover:text-foreground">
                  Templates
                </a>
              </li>
              <li>
                <a href="https://vercel.com/customers" className="text-muted-foreground hover:text-foreground">
                  Customer Stories
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://vercel.com/help" className="text-muted-foreground hover:text-foreground">
                  Help Center
                </a>
              </li>
              <li>
                <a href="https://vercel.com/contact" className="text-muted-foreground hover:text-foreground">
                  Contact Support
                </a>
              </li>
              <li>
                <a href="https://vercel.com/guides" className="text-muted-foreground hover:text-foreground">
                  Guides
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 Vercel Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
