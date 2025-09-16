"use client"

import { Table } from "@tanstack/react-table"
import { X, ChevronDown } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "./data-table-view-options"

import { types, statuses } from "@/lib/definitions"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"
import { CreateNewProject } from "./create-project"
import { DeleteProject } from "./delete-project"
import { usePathname } from "next/navigation"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const pathname = usePathname()
  const isPublic = pathname === '/public-projects'
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false)
  const [showBulkCopyDialog, setShowBulkCopyDialog] = useState(false)

  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedProjectIds = selectedRows.map(row => (row.original as any).id)

  return (
    <>
      <div className="flex items-center justify-between gap-4 py-2">
        {!isPublic && (
          <div className="flex items-center space-x-2 gap-2">
            <CreateNewProject />
            {selectedRows.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowBulkDeleteDialog(true)}
              >
                Delete Selected ({selectedRows.length})
              </Button>
            )}
          </div>
        )}
        <div className="flex flex-1 items-center gap-2">
          <Input
            placeholder="Filter by name..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="h-8 w-[150px] lg:w-[250px]"
          />
          {table.getColumn("type") && (
            <DataTableFacetedFilter
              column={table.getColumn("type")}
              title="Type"
              options={types}
            />
          )}
          {table.getColumn("status") && (
            <DataTableFacetedFilter
              column={table.getColumn("status")}
              title="Status"
              options={statuses}
            />
          )}
          {isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => table.resetColumnFilters()}
            >
              Reset
              <X />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <DataTableViewOptions table={table} />
        </div>
      </div>

      <DeleteProject
        project={selectedRows[0]?.original as any}
        open={showBulkDeleteDialog}
        onOpenChange={setShowBulkDeleteDialog}
      />
    </>
  )
}