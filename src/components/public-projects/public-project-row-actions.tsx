"use client"

import { Row } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Project } from "../projects/schema"
import { duplicateProject } from "@/lib/actions"


interface PublicProjectRowActionsProps<TData> {
  row: Row<TData>
}

export function PublicProjectRowActions<TData>({
  row,
}: PublicProjectRowActionsProps<TData>) {
  const [isCopying, setIsCopying] = useState(false)
  const project = row.original as Project

  const handleCopy = async () => {
    setIsCopying(true)
    try {
      const result = await duplicateProject(project.id, true) // allowPublicCopy = true
      
      if (result.success) {
        // Optionally redirect to my-projects or refresh
        window.location.href = '/my-projects'
      }
    } catch (error) {
      console.error('Error copying project:', error)
    } finally {
      setIsCopying(false)
    }
  }

  return (
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
        <DropdownMenuItem 
          onClick={handleCopy}
          disabled={isCopying}
        >
          {isCopying ? 'Copying...' : 'Copy to My Projects'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}