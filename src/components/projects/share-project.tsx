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
import { Globe, Mail, Loader2Icon } from "lucide-react"
import { useState } from "react"
import { shareProject } from "@/lib/actions"
import { Project } from "@/lib/definitions"
import { useFormStatus } from 'react-dom'

interface ShareProjectProps {
  project: Project
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ShareProject({ project, open, onOpenChange }: ShareProjectProps) {
  const [shareMode, setShareMode] = useState<'email' | 'public'>('email')

  function SubmitButton() {
    const { pending } = useFormStatus()
    return (
      <Button type="submit" disabled={pending}>
        {pending && <Loader2Icon className="animate-spin" />}
        {pending ? 'Sharing...' : (shareMode === 'public' ? 'Make Public' : 'Share Project')}
      </Button>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form action={shareProject.bind(null, project.id)}>
          <DialogHeader>
            <DialogTitle>Share project</DialogTitle>
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
                    required={shareMode === 'email'}
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
            
            {/* Hidden inputs for public sharing */}
            {shareMode === 'public' && (
              <>
                <input type="hidden" name="email" value="info@innovoltive.com" />
                <input type="hidden" name="role" value="viewer" />
              </>
            )}
            
            {/* Role selection - only show for email sharing */}
            {shareMode === 'email' && (
              <div className="grid gap-2">
                <Label htmlFor="role">Access Level</Label>
                <Select name="role" defaultValue="viewer">
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
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
