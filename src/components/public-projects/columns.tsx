"use client"

import { ColumnDef } from "@tanstack/react-table"

import { types, statuses } from "../projects/data"
import { Project } from "../projects/schema"
import { DataTableColumnHeader } from "../projects/data-table-column-header"
import { PublicProjectRowActions } from "./public-project-row-actions"

export const publicProjectColumns: ColumnDef<Project>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => <div className="w-[80px]">{row.getValue("name")}</div>,
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

      // Split comma-separated values and find individual matches
      const typeValues = typeValue.split(',').map(t => t.trim())
      const matchedTypes = typeValues
        .map(val => types.find(type => type.value.toLowerCase() === val.toLowerCase()))
        .filter(Boolean)

      if (matchedTypes.length === 0) {
        return <div className="text-red-500 text-sm">Unknown type</div>
      }

      return (
        <div className="flex w-[100px] items-center gap-1 flex-wrap">
          {matchedTypes.map((type, index) => {
            return (
              <div key={index} className="flex items-center gap-1">
                <span className="text-xs">{type!.label}</span>
                {index < matchedTypes.length - 1 && <span className="text-xs">,</span>}
              </div>
            )
          })}
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
      const status = statuses.find(
        (status) => status.value === row.getValue("status")
      )
      if (!status) {
        return null
      }

      return (
        <div className="flex w-[100px] items-center gap-2">
          <span>{status.label}</span>
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
      <DataTableColumnHeader column={column} title="Created By" />
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <PublicProjectRowActions row={row} />,
  },
]