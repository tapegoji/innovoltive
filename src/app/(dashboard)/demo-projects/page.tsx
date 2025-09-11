import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MdPublic } from 'react-icons/md'
import { IconClock, IconRocket } from '@tabler/icons-react'

export default function DemoProjectsPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Demo Projects</h1>
        <p className="text-muted-foreground mt-2">
          Explore public CAD projects and simulation examples
        </p>
      </div>

      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <MdPublic className="h-16 w-16 text-primary" />
                <IconClock className="h-6 w-6 text-orange-500 absolute -top-1 -right-1 bg-background rounded-full p-1" size={24} />
              </div>
            </div>
            <CardTitle className="text-2xl">Coming Soon</CardTitle>
            <CardDescription className="text-lg mt-2">
              Demo Projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              We&apos;re working hard to bring you amazing public project examples, 
              templates, and tutorials. Check back soon!
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-primary">
              <IconRocket size={16} />
              <span>Feature in development</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}