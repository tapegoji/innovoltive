"use client"

import { Table } from "@tanstack/react-table"
import { X, Trash2, Search, Share2, Edit, Copy } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "./data-table-view-options"

import { types, statuses } from "@/lib/definitions"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"
import { CreateNewProject } from "./create-project"
import { DeleteProject } from "./delete-project"
import { ShareProject } from "./share-project"
import { EditProject } from "./edit-project"
import { CopyProject } from "./copy-project"
import { usePathname } from "next/navigation"
import { ProjectData } from "@/lib/definitions"

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
  const [showBulkShareDialog, setShowBulkShareDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showCopyDialog, setShowCopyDialog] = useState(false)
  const [showSearchInput, setShowSearchInput] = useState(false)

  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedProjectIds = selectedRows.map(row => (row.original as ProjectData).id)

  return (
    <>
      <div className="flex items-center gap-4 py-2 overflow-x-auto">
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
                  Delete ({selectedRows.length})
                </span>
              </Button>
            )}
            {selectedRows.length === 1 && (
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowEditDialog(true)}
              >
                <Edit className="h-4 w-4" />
                <span className="hidden lg:inline ml-2">
                  Edit
                </span>
              </Button>
            )}
            {selectedRows.length === 1 && (
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowCopyDialog(true)}
              >
                <Copy className="h-4 w-4" />
                <span className="hidden lg:inline ml-2">
                  Copy
                </span>
              </Button>
            )}
            {selectedRows.length === 1 && (
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowBulkShareDialog(true)}
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden lg:inline ml-2">
                  Share
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

          {table.getColumn("simType") && (
            <DataTableFacetedFilter
              column={table.getColumn("simType")}
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

      {selectedRows.length === 1 && (
        <ShareProject
          project={selectedRows[0].original as ProjectData}
          open={showBulkShareDialog}
          onOpenChange={setShowBulkShareDialog}
        />
      )}

      {selectedRows.length === 1 && (
        <EditProject
          project={selectedRows[0].original as ProjectData}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
        />
      )}

      {selectedRows.length === 1 && (
        <CopyProject
          project={selectedRows[0].original as ProjectData}
          open={showCopyDialog}
          onOpenChange={setShowCopyDialog}
        />
      )}
    </>
  )
}