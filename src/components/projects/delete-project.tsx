'use client'

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { deleteProjects } from "@/lib/actions"
import { Project } from "@/lib/definitions"
import { useFormStatus } from 'react-dom'
import { Loader2Icon } from 'lucide-react'

interface DeleteProjectProps {
  project?: Project
  selectedProjectIds?: string[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteProject({ project, selectedProjectIds, open, onOpenChange }: DeleteProjectProps) {
  // Determine if this is a bulk delete or single delete
  const isBulkDelete = selectedProjectIds && selectedProjectIds.length > 0
  const projectIds = isBulkDelete ? selectedProjectIds : (project ? [project.id] : [])
  const projectCount = projectIds.length
  const projectName = project?.name || `${projectCount} project${projectCount > 1 ? 's' : ''}`

  function SubmitButton() {
    const { pending } = useFormStatus()
    return (
      <Button 
        type="submit"
        variant="destructive"
        disabled={pending}
      >
        {pending && <Loader2Icon className="animate-spin" />}
        {pending ? 'Deleting...' : `Delete ${isBulkDelete ? `${projectCount} Project${projectCount > 1 ? 's' : ''}` : 'Project'}`}
      </Button>
    )
  }

  // Don't render if we don't have any projects to delete
  if (projectIds.length === 0) {
    return null
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-[80vw] sm:max-w-[425px]">
        <form action={deleteProjects}>
          {projectIds.map((id) => (
            <input key={id} type="hidden" name="projectId" value={id} />
          ))}
          <AlertDialogHeader>
            <AlertDialogTitle>{isBulkDelete ? 'Delete projects' : 'Delete project'}</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete &quot;{projectName}&quot;
              and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
            <SubmitButton />
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
