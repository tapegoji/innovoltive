"use client"

import { ColumnDef } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

import { types, statuses } from "./data"
import { Project } from "./schema"
import { DataTableColumnHeader } from "./data-table-column-header"
import { DataTableRowActions } from "./data-table-row-actions"

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
      const day = date.getDate().toString().padStart(2, '0')
      const month = date.toLocaleString('en-US', { month: 'short' })
      const year = date.getFullYear()
      const hour = date.getHours().toString().padStart(2, '0')
      const minute = date.getMinutes().toString().padStart(2, '0')
      return <div>{`${day}-${month}-${year}-${hour}-${minute}`}</div>
    },
  },
  { accessorKey: "user_id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User" />
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]