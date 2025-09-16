'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Globe, Mail } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { shareProject } from "@/lib/actions"
import { Project } from "@/lib/definitions"

interface ShareProjectProps {
  project: Project
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ShareProject({ project, open, onOpenChange }: ShareProjectProps) {
  const [shareMode, setShareMode] = useState<'email' | 'public'>('email')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'viewer' | 'owner'>('viewer')
  const [isSharing, setIsSharing] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    if (shareMode === 'email') {
      if (!email || !email.includes('@')) {
        toast.error('Please enter a valid email address')
        return
      }
      formData.set('email', email)
      formData.set('role', role)
    } else {
      // For public sharing, use a special identifier and always set role to viewer
      formData.set('email', 'user_public')
      formData.set('role', 'viewer')
    }

    setIsSharing(true)
    try {
      const result = await shareProject(project.id, formData)
      
      if (result.success) {
        const message = shareMode === 'public' 
          ? 'Project made public successfully' 
          : result.message || 'Project shared successfully'
        toast.success(message)
        setEmail('')
        setRole('viewer')
        onOpenChange(false)
      } else {
        toast.error(result.error || 'Failed to share project')
      }
    } catch (error) {
      console.error('Error sharing project:', error)
      toast.error('An error occurred while sharing the project')
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form action={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Share "{project.name}"</DialogTitle>
            <DialogDescription>
              Share this project with specific users or make it publicly accessible.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <Tabs value={shareMode} onValueChange={(value) => setShareMode(value as 'email' | 'public')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </TabsTrigger>
                <TabsTrigger value="public" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Public
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="email" className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required={shareMode === 'email'}
                    disabled={isSharing}
                  />
                  <p className="text-xs text-muted-foreground">
                    The user must have an account on the platform.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="public" className="space-y-4">
                <div className="p-4 border rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="h-4 w-4" />
                    <span className="font-medium">Make Public</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Anyone will be able to view this project without signing in. 
                    The project will appear in the public demo projects section with viewer access only.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
            
            {/* Only show role selection for email sharing */}
            {shareMode === 'email' && (
              <div className="grid gap-2">
                <Label htmlFor="role">Access Level</Label>
                <Select 
                  value={role} 
                  onValueChange={(value: 'viewer' | 'owner') => setRole(value)}
                  disabled={isSharing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select access level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">
                      <div className="flex flex-col items-start">
                        <span>Viewer</span>
                        <span className="text-xs text-muted-foreground">Can view and copy the project</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="owner">
                      <div className="flex flex-col items-start">
                        <span>Owner</span>
                        <span className="text-xs text-muted-foreground">Can view, edit, and manage the project</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSharing}>
                Cancel
              </Button>
            </DialogClose>
            <Button 
              type="submit" 
              disabled={isSharing || (shareMode === 'email' && !email.trim())}
            >
              {isSharing ? 'Sharing...' : shareMode === 'public' ? 'Make Public' : 'Share Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
