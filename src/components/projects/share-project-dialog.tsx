'use client'

import React from 'react'
import { Users, Globe, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export interface ProjectData {
  id: string
  name: string
  type: string
  status: string
  dateModified: string
  description?: string
  user?: string
}

interface ShareEmail {
  email: string
  role: 'viewer' | 'editor'
}

interface ShareProjectDialogProps {
  project: ProjectData | null
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
}

export function ShareProjectDialog({ 
  project, 
  open, 
  onOpenChange, 
  userId 
}: ShareProjectDialogProps) {
  const [shareOption, setShareOption] = React.useState<'email' | 'public'>('email')
  const [emailInput, setEmailInput] = React.useState('')
  const [sharedEmails, setSharedEmails] = React.useState<ShareEmail[]>([])
  const [showPublicConfirm, setShowPublicConfirm] = React.useState(false)
  const [isSharing, setIsSharing] = React.useState(false)

  // Reset state when dialog opens/closes
  React.useEffect(() => {
    if (!open) {
      setEmailInput('')
      setSharedEmails([])
      setShareOption('email')
      setShowPublicConfirm(false)
    } else if (project) {
      loadExistingShares()
    }
  }, [open, project]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadExistingShares = React.useCallback(async () => {
    if (!project) return
    
    try {
      const { getProjectShares } = await import('@/lib/actions')
      const result = await getProjectShares(project.id, userId)
      if (result.success) {
        const emails = result.emails || []
        
        // If project is public, add the "public" entry to the emails list
        if (result.isPublic) {
          const publicEntry: ShareEmail = {
            email: 'public',
            role: 'viewer'
          }
          setSharedEmails([...emails, publicEntry])
        } else {
          setSharedEmails(emails)
        }
      }
    } catch (error) {
      console.error('Error loading existing shares:', error)
    }
  }, [project, userId])

  const handleAddEmail = () => {
    if (!emailInput.trim()) return
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailInput)) {
      toast.error('Please enter a valid email address')
      return
    }

    // Check if email is already added
    if (sharedEmails.find(item => item.email.toLowerCase() === emailInput.toLowerCase())) {
      toast.error('This email is already in the share list')
      return
    }

    // Add email to shared list
    const newEmail: ShareEmail = {
      email: emailInput.toLowerCase(),
      role: 'viewer'
    }
    
    setSharedEmails(prev => [...prev, newEmail])
    setEmailInput('')
    setShareOption('email')
    toast.success('Email added to share list')
  }

  const handleSelectPublic = () => {
    setShowPublicConfirm(true)
  }

  const handleConfirmPublic = () => {
    // Add "public" as a special email entry
    const publicEntry: ShareEmail = {
      email: 'public',
      role: 'viewer'
    }
    
    // Check if public is already added
    if (!sharedEmails.find(item => item.email === 'public')) {
      setSharedEmails(prev => [...prev, publicEntry])
      toast.success('Project will be made public when you click Share Project')
    }
    
    setShareOption('email')
    setEmailInput('')
    setShowPublicConfirm(false)
  }

  const handleCancelPublic = () => {
    setShowPublicConfirm(false)
  }

  const handleRemoveEmail = (email: string) => {
    setSharedEmails(prev => prev.filter(item => item.email !== email))
    toast.success('Email removed from share list')
  }

  const handleRoleChange = (email: string, role: 'viewer' | 'editor') => {
    setSharedEmails(prev => 
      prev.map(item => 
        item.email === email ? { ...item, role } : item
      )
    )
  }

  const handleShare = async () => {
    if (!project) return

    setIsSharing(true)
    try {
      const { shareProject } = await import('@/lib/actions')
      
      // Separate regular emails from public
      const regularEmails = sharedEmails.filter(item => item.email !== 'public')
      const hasPublic = sharedEmails.some(item => item.email === 'public')
      
      // Create email roles map (excluding public)
      const emailRoles: Record<string, 'viewer' | 'editor'> = {}
      regularEmails.forEach(item => {
        emailRoles[item.email] = item.role
      })
      
      const result = await shareProject(project.id, {
        emails: regularEmails.map(item => item.email),
        emailRoles,
        isPublic: hasPublic,
        publicRole: 'viewer', // Public is always viewer
        ownerId: userId
      })

      if (!result.success) {
        toast.error(result.error || 'Failed to share project')
        return
      }
      
      toast.success('Project sharing updated successfully! If the users exist, the project will be available in their profile.')
      onOpenChange(false)
    } catch (error) {
      console.error('Error sharing project:', error)
      toast.error('Failed to share project')
    } finally {
      setIsSharing(false)
    }
  }

  if (!project) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Share &quot;{project.name}&quot;
            </DialogTitle>
            <DialogDescription>
              Share this project with other users or make it publicly accessible.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Unified Share Input */}
            <div className="space-y-3">
              <Label>Share with</Label>
              <Command className="rounded-lg border shadow-sm">
                <CommandInput 
                  placeholder="Enter email address or select option..."
                  value={emailInput}
                  onValueChange={setEmailInput}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && emailInput && emailInput.includes('@')) {
                      e.preventDefault()
                      handleAddEmail()
                    }
                  }}
                />
                <CommandList>
                  <CommandEmpty>
                    {emailInput && emailInput.includes('@') ? (
                      "Press Enter to add this email"
                    ) : (
                      "Enter an email address"
                    )}
                  </CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      onSelect={handleSelectPublic}
                    >
                      <Globe className="mr-2 h-4 w-4" />
                      <span>Make public</span>
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
              
              {shareOption === 'email' && emailInput && emailInput.includes('@') && (
                <div className="flex items-center space-x-2">
                  <Select
                    value="viewer"
                    onValueChange={() => {}} // Will set role when adding
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">Viewer</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={handleAddEmail}
                    disabled={!emailInput.trim()}
                    size="sm"
                  >
                    Add
                  </Button>
                </div>
              )}
              
              <p className="text-xs text-muted-foreground">
                Enter email addresses to share with. If the users exist, the project will be available in their profile.
              </p>
            </div>

            {/* Shared emails list */}
            {sharedEmails.length > 0 && (
              <div className="space-y-3">
                <Label>People with access</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {sharedEmails.map((emailItem) => (
                    <div key={emailItem.email} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          {emailItem.email === 'public' ? (
                            <Globe className="h-4 w-4" />
                          ) : (
                            <span className="text-sm font-medium">
                              {emailItem.email.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <span className="text-sm font-medium">
                            {emailItem.email === 'public' ? 'Public access' : emailItem.email}
                          </span>
                          {emailItem.email === 'public' && (
                            <p className="text-xs text-muted-foreground">
                              Anyone with the link
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Select
                          value={emailItem.role}
                          onValueChange={(role: 'viewer' | 'editor') => handleRoleChange(emailItem.email, role)}
                          disabled={emailItem.email === 'public'} // Public is always viewer
                        >
                          <SelectTrigger className="w-24 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="viewer">Viewer</SelectItem>
                            <SelectItem value="editor">Editor</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleRemoveEmail(emailItem.email)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Share summary */}
            {sharedEmails.length > 0 && (
              <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
                <Label className="text-sm font-medium">Share summary:</Label>
                <div className="flex flex-wrap gap-2">
                  {sharedEmails.map((emailItem) => (
                    <Badge 
                      key={emailItem.email} 
                      variant={emailItem.email === 'public' ? "outline" : "secondary"} 
                      className="text-xs"
                    >
                      {emailItem.email === 'public' ? (
                        <>
                          <Globe className="h-3 w-3 mr-1" />
                          Public (viewer)
                        </>
                      ) : (
                        `${emailItem.email} (${emailItem.role})`
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleShare}
              disabled={isSharing || sharedEmails.length === 0}
            >
              {isSharing ? 'Sharing...' : 'Share Project'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Public Confirmation Dialog */}
      <AlertDialog open={showPublicConfirm} onOpenChange={setShowPublicConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Make Project Public?</AlertDialogTitle>
            <AlertDialogDescription>
              This will make &quot;{project?.name}&quot; accessible to anyone with the link. 
              Anyone will be able to view this project without needing to sign in.
              Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelPublic}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmPublic}>
              Yes, Make Public
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}