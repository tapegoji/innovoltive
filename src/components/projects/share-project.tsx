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
import { useState } from "react"
import { toast } from "sonner"
import { shareProject } from "@/lib/actions"
import { Project } from "./schema"

interface ShareProjectProps {
  project: Project
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ShareProject({ project, open, onOpenChange }: ShareProjectProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'viewer' | 'owner'>('viewer')
  const [isSharing, setIsSharing] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }

    setIsSharing(true)
    try {
      // Add the role to formData
      formData.set('role', role)
      
      const result = await shareProject(project.id, formData)
      
      if (result.success) {
        toast.success(result.message || 'Project shared successfully')
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
              Enter the email address of the user you want to share this project with. 
              The user must have an account on the platform.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSharing}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select 
                value={role} 
                onValueChange={(value: 'viewer' | 'owner') => setRole(value)}
                disabled={isSharing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">
                    <div className="flex flex-col items-start">
                      <span>Viewer</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="owner">
                    <div className="flex flex-col items-start">
                      <span>Owner</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSharing}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSharing || !email.trim()}>
              {isSharing ? 'Sharing...' : 'Share Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
