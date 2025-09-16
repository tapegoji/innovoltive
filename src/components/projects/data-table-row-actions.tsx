"use client"

import { Row } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EditProject } from "./edit-project"
import { ShareProject } from "./share-project"
import { DeleteProject } from "./delete-project"
import { Project } from "@/lib/definitions"
import { duplicateProject } from "@/lib/actions"


interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDuplicating, setIsDuplicating] = useState(false)
  const project = row.original as Project

  const handleDuplicate = async () => {
    setIsDuplicating(true)
    try {
      const result = await duplicateProject(project.id)
      
      if (result.success) {
        toast.success('Project copied successfully')
        // Refresh the page to show the new project
        window.location.reload()
      } else {
        toast.error(result.error || 'Failed to copy project')
      }
    } catch (error) {
      console.error('Error copying project:', error)
      toast.error('An error occurred while copying the project')
    } finally {
      setIsDuplicating(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="data-[state=open]:bg-muted size-8"
          >
            <MoreHorizontal />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowShareDialog(true)}>
            Share
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={handleDuplicate}
            disabled={isDuplicating}
          >
            {isDuplicating ? 'Copying...' : 'Make a copy'}
          </DropdownMenuItem>
          <DropdownMenuItem 
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            Delete
            <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditProject
        project={project}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />

      <DeleteProject
        project={project}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />

      <ShareProject
        project={project}
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
      />

    </>
  )
}
