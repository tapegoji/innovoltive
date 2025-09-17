"use client"

import { ColumnDef } from "@tanstack/react-table"
import { selectProject } from "@/lib/actions"
import { usePathname } from "next/navigation"

import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"

import { statuses, getTypeClass, getStatusClass } from "@/lib/definitions"
import { Project } from "@/lib/definitions"
import { DataTableColumnHeader } from "./data-table-column-header"
import { DataTableRowActions } from "./data-table-row-actions"
import { Share2 } from "lucide-react"

export const columns: ColumnDef<Project>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      const name = row.getValue("name") as string
      const isShared = row.original.shared
      const storagePathId = row.original.storage_path_id
      const projectId = row.original.id
      
      // Component to handle navigation using server action
      const ProjectNameButton = () => {
        const pathname = usePathname()
        const isPublic = pathname === '/public-projects'
        
        const handleClick = async () => {
          if (storagePathId && projectId) {
            try {
              await selectProject(projectId, storagePathId, name)
            } catch (error) {
              console.error('Failed to select project:', error)
            }
          }
        }
        
        return (
          <form action={handleClick}>
            <button 
              type="submit"
              className={`text-left transition-colors ${isPublic ? 'cursor-default' : 'hover:underline hover:text-blue-600 cursor-pointer'}`}
              disabled={isPublic || !storagePathId || !projectId}
            >
              {name}
            </button>
          </form>
        )
      }
      
      return (
        <div className="min-w-[80px] max-w-[200px] whitespace-normal break-words flex items-center gap-2">
          {isShared && <Share2 className="h-4 w-4 text-blue-500 flex-shrink-0" />}
          <ProjectNameButton />
        </div>
      )
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      const typeValue = row.getValue("type") as string
      
      if (!typeValue) {
        return null
      }

      // Split comma-separated values
      const typeValues = typeValue.split(',').map(t => t.trim()).filter(Boolean)
      
      return (
        <div className="flex w-[120px] items-center gap-1 flex-wrap">
          {typeValues.map(type => (
            <Badge key={type} variant="outline" className={getTypeClass(type)}>
              {type.toUpperCase()}
            </Badge>
          ))}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const typeValue = row.getValue(id) as string
      if (!typeValue) return false
      const typeValues = typeValue.split(',').map(t => t.trim().toLowerCase())
      return value.some((filterValue: string) => 
        typeValues.includes(filterValue.toLowerCase())
      )
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const statusValue = row.getValue("status") as string
      
      if (!statusValue) {
        return null
      }

      const statusConfig = statuses.find(s => s.value === statusValue)
      const label = statusConfig ? statusConfig.label : statusValue

      return (
        <div className="flex w-[100px] items-center">
          <Badge variant="outline" className={getStatusClass(statusValue)}>
            {label}
          </Badge>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Description" />
    ),
    cell: ({ row }) => <div className="whitespace-normal break-words">{row.getValue("description")}</div>,
  },
  { accessorKey: "size",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Size" />
    ),
  },
  { accessorKey: "date_modified",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date Modified" />
    ),
    cell: ({ row }) => {
      const dateStr = row.getValue("date_modified") as string
      if (!dateStr) return null
      const date = new Date(dateStr)
      // Convert to client's local time and format it nicely
      const formattedDate = date.toLocaleString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      })
      return <div>{formattedDate}</div>
    },
  },
  { accessorKey: "user_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User" />
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]