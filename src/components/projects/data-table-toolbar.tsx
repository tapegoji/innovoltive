"use client"

import { Table } from "@tanstack/react-table"
import { X, Trash2, Search } from "lucide-react"
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
  const [showSearchInput, setShowSearchInput] = useState(false)

  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedProjectIds = selectedRows.map(row => (row.original as any).id)

  return (
    <>
      <div className="flex items-center gap-4 py-2">
        {!isPublic && (
          <div className="flex items-center space-x-2 gap-2">
            <CreateNewProject />
            {selectedRows.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowBulkDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden lg:inline ml-2">
                  Delete Selected ({selectedRows.length})
                </span>
              </Button>
            )}
          </div>
        )}
        <div className="flex items-center gap-2">
          {/* Mobile Search Button */}
          <Button
            variant="outline"
            size="sm"
            className="h-8 lg:hidden"
            onClick={() => setShowSearchInput(!showSearchInput)}
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Search Input - Single component for both desktop and mobile */}
          <div className={showSearchInput ? "block" : "hidden lg:block"}>
            <Input
              placeholder="Filter by name..."
              value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("name")?.setFilterValue(event.target.value)
              }
              className={showSearchInput ? "h-8 w-[200px]" : "h-8 w-[250px]"}
              autoFocus={showSearchInput}
            />
          </div>

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
          <DataTableViewOptions table={table} />
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
      </div>

      <DeleteProject
        selectedProjectIds={selectedProjectIds}
        open={showBulkDeleteDialog}
        onOpenChange={setShowBulkDeleteDialog}
      />
    </>
  )
}