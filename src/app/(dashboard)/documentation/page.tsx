import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { IconBook, IconClock, IconFileText } from '@tabler/icons-react'

export default function DocumentationPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Documentation</h1>
        <p className="text-muted-foreground mt-2">
          Comprehensive guides and API references for CAD modeling and simulation
        </p>
      </div>

      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <IconBook className="h-16 w-16 text-primary" />
                <IconClock className="h-6 w-6 text-orange-500 absolute -top-1 -right-1 bg-background rounded-full p-1" size={24} />
              </div>
            </div>
            <CardTitle className="text-2xl">Coming Soon</CardTitle>
            <CardDescription className="text-lg mt-2">
              Documentation Hub
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Detailed documentation, tutorials, and API references are being 
              prepared to help you get the most out of our platform.
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-primary">
              <IconFileText size={16} />
              <span>Content being authored</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}