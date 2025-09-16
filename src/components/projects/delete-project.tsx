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

interface DeleteProjectProps {
  project: Project
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteProject({ project, open, onOpenChange }: DeleteProjectProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <form action={deleteProjects}>
          <input type="hidden" name="projectId" value={project.id} />
          <AlertDialogHeader>
            <AlertDialogTitle>Delete project</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete &quot;{project.name}&quot;
              and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
            <Button 
              type="submit"
              variant="destructive"
            >
              Delete Project
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
