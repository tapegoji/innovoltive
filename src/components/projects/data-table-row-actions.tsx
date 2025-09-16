"use client"

import { Row } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { EditProject } from "./edit-project"
import { CopyProject } from "./copy-project"
import { ShareProject } from "./share-project"
import { DeleteProject } from "./delete-project"

import { Project } from "@/lib/definitions"
import { usePathname } from "next/navigation"


interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showCopyDialog, setShowCopyDialog] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const project = row.original as Project
  const pathname = usePathname()
  const isPublic = pathname === '/public-projects'

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
          {!isPublic && (
            <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
              Edit
            </DropdownMenuItem>
          )}
          {!isPublic && (
            <DropdownMenuItem onClick={() => setShowShareDialog(true)}>
              Share
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => setShowCopyDialog(true)}>
            Copy
          </DropdownMenuItem>
          {!isPublic && (
            <DropdownMenuItem 
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              Delete
              <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <EditProject
        project={project}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />

      <CopyProject
        project={project}
        open={showCopyDialog}
        onOpenChange={setShowCopyDialog}
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
