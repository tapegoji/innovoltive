"use client"

import * as React from "react"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheckFilled,
  IconDotsVertical,
  IconGripVertical,
  IconLayoutColumns,
  IconLoader,
  IconGrid3x3,
  IconList,
  IconTrash,
  IconFolder,
  IconFile,
  IconDevices,
  IconMinus,
} from "@tabler/icons-react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { toast } from "sonner"
import { z } from "zod"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Project schema that matches the FileItem interface but works with DataTable
export const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  status: z.enum(["active", "completed", "paused", "archived"]),
  size: z.string().optional(),
  dateModified: z.string(),
  description: z.string().optional(),
  user: z.string().optional(),
})

export type ProjectData = z.infer<typeof projectSchema>

interface ProjectsDataTableProps {
  data: ProjectData[]
  viewMode?: "grid" | "list"
  onViewModeChange?: (mode: "grid" | "list") => void
  currentPath?: string[]
  userId?: string
  onItemsDeleted?: () => void
  renderItemLink?: (item: ProjectData, children: React.ReactNode) => React.ReactNode
  toolbarActions?: React.ReactNode
  emptyState?: React.ReactNode
}

// Helper functions for project display
const getIcon = (type: string) => {
  const isProject = ["em", "ht", "cfd"].includes(type)
  return isProject || type === "folder" ? 
    <IconFolder className="h-4 w-4 text-blue-500 flex-shrink-0" /> : 
    <IconFile className="h-4 w-4 text-gray-600 flex-shrink-0" />
}

const getTypeLabel = (type: string) => {
  if (!type) return "Unknown"
  
  // Handle multiple types (comma-separated)
  const types = type.split(',').map(t => t.trim())
  const typeLabels = types.map(t => 
    ({ em: "EM", ht: "HT", cfd: "CFD", folder: "Folder", file: "File" })[t] || t.toUpperCase()
  )
  
  return typeLabels.join(' + ')
}

const getStatusBadge = (status: string) => (
  <Badge 
    variant="outline" 
    className={cn(
      "text-xs font-medium",
      status === "active" && "border-green-500 text-green-700 bg-green-50",
      status === "completed" && "border-blue-500 text-blue-700 bg-blue-50", 
      status === "paused" && "border-yellow-500 text-yellow-700 bg-yellow-50",
      status === "archived" && "border-gray-500 text-gray-700 bg-gray-50"
    )}
  >
    {status === "completed" ? (
      <IconCircleCheckFilled className="w-3 h-3 mr-1" />
    ) : status === "paused" ? (
      <IconMinus className="w-3 h-3 mr-1" />
    ) : status === "active" ? (
      <IconLoader className="w-3 h-3 mr-1" />
    ) : null}
    {status.charAt(0).toUpperCase() + status.slice(1)}
  </Badge>
)

// Create a separate component for the drag handle
function DragHandle({ id }: { id: string }) {
  const { attributes, listeners } = useSortable({
    id,
  })

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent"
    >
      <IconGripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  )
}

function DraggableRow({ row }: { row: Row<ProjectData> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  })

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}

export function ProjectsDataTable({
  data: initialData,
  viewMode = "list",
  onViewModeChange,
  currentPath = ["My Projects"],
  userId,
  onItemsDeleted,
  renderItemLink,
  toolbarActions,
  emptyState
}: ProjectsDataTableProps) {
  const [data, setData] = React.useState(() => initialData)
  const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
  
  const sortableId = React.useId()
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

  // Update data when initialData changes
  React.useEffect(() => {
    setData(initialData)
  }, [initialData])

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id) || [],
    [data]
  )

  const handleDeleteSingle = React.useCallback(async (projectId: string) => {
    if (!userId) return
    // Set the specific row as selected and trigger delete
    setRowSelection({ [projectId]: true })
    setShowDeleteDialog(true)
  }, [userId])

  // Create columns definition for projects
  const columns: ColumnDef<ProjectData>[] = React.useMemo(() => [
    {
      id: "drag",
      header: () => null,
      cell: ({ row }) => <DragHandle id={row.original.id} />,
      size: 40,
    },
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const project = row.original
        return (
          <div className="flex items-center space-x-2 min-w-0">
            {getIcon(project.type)}
            {renderItemLink ? (
              renderItemLink(project, 
                <span className="font-medium hover:underline cursor-pointer truncate" title={project.name}>
                  {project.name}
                </span>
              )
            ) : (
              <span className="font-medium truncate" title={project.name}>
                {project.name}
              </span>
            )}
          </div>
        )
      },
      enableHiding: false,
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <div className="text-muted-foreground">
          {getTypeLabel(row.original.type)}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      accessorKey: "size",
      header: () => <div className="text-right">Size</div>,
      cell: ({ row }) => (
        <div className="text-right text-muted-foreground">
          {row.original.size || "-"}
        </div>
      ),
    },
    {
      accessorKey: "dateModified",
      header: "Date Modified",
      cell: ({ row }) => (
        <div className="text-muted-foreground">
          {row.original.dateModified}
        </div>
      ),
    },
    {
      accessorKey: "user",
      header: "Created By",
      cell: ({ row }) => (
        <div className="text-muted-foreground">
          {row.original.user || "-"}
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <div className="text-muted-foreground max-w-xs truncate" title={row.original.description}>
          {row.original.description || "-"}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
              size="icon"
            >
              <IconDotsVertical />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuItem>Archive</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive"
              onClick={() => handleDeleteSingle(row.original.id)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      size: 40,
    },
  ], [renderItemLink, handleDeleteSingle])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id)
        const newIndex = dataIds.indexOf(over.id)
        return arrayMove(data, oldIndex, newIndex)
      })
    }
  }

  const handleDeleteSelected = async () => {
    const selectedIds = table.getFilteredSelectedRowModel().rows.map(row => row.original.id)
    if (selectedIds.length === 0 || !userId) return
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!userId) return
    const selectedIds = Object.keys(rowSelection).filter(id => rowSelection[id])
    if (selectedIds.length === 0) return

    setShowDeleteDialog(false)
    setIsDeleting(true)
    try {
      const { deleteProjects } = await import('@/lib/actions')
      const result = await deleteProjects(selectedIds, userId)
      
      if (result.success) {
        setRowSelection({})
        onItemsDeleted?.()
        toast.success(`Successfully deleted ${selectedIds.length} project${selectedIds.length > 1 ? 's' : ''}`)
      } else {
        console.error('Failed to delete projects:', result.error)
        toast.error('Failed to delete projects')
      }
    } catch (error) {
      console.error('Error deleting projects:', error)
      toast.error('An error occurred while deleting projects')
    } finally {
      setIsDeleting(false)
    }
  }

  const selectedCount = table.getFilteredSelectedRowModel().rows.length

  // Grid view component
  const GridView = () => (
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 p-4">
      {data.map(item => (
        <Card key={item.id} className={cn(
          "p-3 hover:bg-accent/50 transition-colors border-0 shadow-none hover:shadow-sm relative",
          rowSelection[item.id] ? "bg-accent shadow-sm" : ""
        )}>
          <input
            type="checkbox"
            checked={!!rowSelection[item.id]}
            onChange={(e) => {
              e.stopPropagation()
              setRowSelection(prev => ({
                ...prev,
                [item.id]: e.target.checked
              }))
            }}
            className="absolute top-2 right-2 h-4 w-4"
          />
          <div className="flex flex-col items-center text-center space-y-2">
            <IconFolder className="h-12 w-12 text-blue-500" />
            <div className="min-w-0 flex-1">
              {renderItemLink ? (
                renderItemLink(item, 
                  <p className="text-sm font-medium truncate hover:underline cursor-pointer" title={item.name}>{item.name}</p>
                )
              ) : (
                <p className="text-sm font-medium truncate" title={item.name}>{item.name}</p>
              )}
              <p className="text-xs text-muted-foreground">{item.dateModified}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )

  if (data.length === 0 && emptyState) {
    return (
      <div className="h-full flex flex-col bg-background">
        {/* Toolbar */}
        <div className="border-b bg-muted/50 p-3 flex items-center justify-between">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem><IconDevices className="h-4 w-4" /></BreadcrumbItem>
              <BreadcrumbSeparator />
              {currentPath.map((segment, index) => (
                <React.Fragment key={index}>
                  <BreadcrumbItem>
                    {index === currentPath.length - 1 ? 
                      <BreadcrumbPage>{segment}</BreadcrumbPage> : 
                      <BreadcrumbLink href="#">{segment}</BreadcrumbLink>
                    }
                  </BreadcrumbItem>
                  {index < currentPath.length - 1 && <BreadcrumbSeparator />}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex items-center gap-2">
            {toolbarActions}
          </div>
        </div>
        
        {/* Empty state */}
        <div className="flex-1 flex items-center justify-center">
          {emptyState}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Toolbar */}
      <div className="border-b bg-muted/50 p-3 flex items-center justify-between">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem><IconDevices className="h-4 w-4" /></BreadcrumbItem>
            <BreadcrumbSeparator />
            {currentPath.map((segment, index) => (
              <React.Fragment key={index}>
                <BreadcrumbItem>
                  {index === currentPath.length - 1 ? 
                    <BreadcrumbPage>{segment}</BreadcrumbPage> : 
                    <BreadcrumbLink href="#">{segment}</BreadcrumbLink>
                  }
                </BreadcrumbItem>
                {index < currentPath.length - 1 && <BreadcrumbSeparator />}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center gap-2">
          {toolbarActions}
          
          {selectedCount > 0 && (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleDeleteSelected}
              disabled={isDeleting}
            >
              <IconTrash className="h-4 w-4 mr-2" />
              {isDeleting ? 'Deleting...' : `Delete (${selectedCount})`}
            </Button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <IconLayoutColumns />
                Columns
                <IconChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>

          {onViewModeChange && (
            <div className="flex border rounded-md">
              <Button 
                variant={viewMode === "grid" ? "default" : "ghost"} 
                size="sm" 
                onClick={() => onViewModeChange("grid")} 
                className="rounded-r-none"
              >
                <IconGrid3x3 className="h-4 w-4" />
              </Button>
              <Button 
                variant={viewMode === "list" ? "default" : "ghost"} 
                size="sm" 
                onClick={() => onViewModeChange("list")} 
                className="rounded-l-none"
              >
                <IconList className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {viewMode === "grid" ? (
          <GridView />
        ) : (
          <div className="flex flex-col h-full">
            <div className="overflow-hidden rounded-lg border m-4">
              <DndContext
                collisionDetection={closestCenter}
                modifiers={[restrictToVerticalAxis]}
                onDragEnd={handleDragEnd}
                sensors={sensors}
                id={sortableId}
              >
                <Table>
                  <TableHeader className="bg-muted sticky top-0 z-10">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => {
                          return (
                            <TableHead key={header.id} colSpan={header.colSpan}>
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                            </TableHead>
                          )
                        })}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows?.length ? (
                      <SortableContext
                        items={dataIds}
                        strategy={verticalListSortingStrategy}
                      >
                        {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                        ))}
                      </SortableContext>
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className="h-24 text-center"
                        >
                          No projects found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </DndContext>
            </div>
            
            {/* Pagination */}
            <div className="flex items-center justify-between px-8 py-4">
              <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
                {selectedCount} of {table.getFilteredRowModel().rows.length} row(s) selected.
              </div>
              <div className="flex w-full items-center gap-8 lg:w-fit">
                <div className="hidden items-center gap-2 lg:flex">
                  <Label htmlFor="rows-per-page" className="text-sm font-medium">
                    Rows per page
                  </Label>
                  <Select
                    value={`${table.getState().pagination.pageSize}`}
                    onValueChange={(value) => {
                      table.setPageSize(Number(value))
                    }}
                  >
                    <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                      <SelectValue
                        placeholder={table.getState().pagination.pageSize}
                      />
                    </SelectTrigger>
                    <SelectContent side="top">
                      {[10, 20, 30, 40, 50].map((pageSize) => (
                        <SelectItem key={pageSize} value={`${pageSize}`}>
                          {pageSize}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex w-fit items-center justify-center text-sm font-medium">
                  Page {table.getState().pagination.pageIndex + 1} of{" "}
                  {table.getPageCount()}
                </div>
                <div className="ml-auto flex items-center gap-2 lg:ml-0">
                  <Button
                    variant="outline"
                    className="hidden h-8 w-8 p-0 lg:flex"
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage()}
                  >
                    <span className="sr-only">Go to first page</span>
                    <IconChevronsLeft />
                  </Button>
                  <Button
                    variant="outline"
                    className="size-8"
                    size="icon"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    <span className="sr-only">Go to previous page</span>
                    <IconChevronLeft />
                  </Button>
                  <Button
                    variant="outline"
                    className="size-8"
                    size="icon"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    <span className="sr-only">Go to next page</span>
                    <IconChevronRight />
                  </Button>
                  <Button
                    variant="outline"
                    className="hidden size-8 lg:flex"
                    size="icon"
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                    disabled={!table.getCanNextPage()}
                  >
                    <span className="sr-only">Go to last page</span>
                    <IconChevronsRight />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Projects</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedCount} project{selectedCount > 1 ? 's' : ''}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}