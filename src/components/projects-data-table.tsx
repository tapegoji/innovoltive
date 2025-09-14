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
  IconDevices,
  IconMinus,
} from "@tabler/icons-react"
import { ShareProjectDialog } from "@/components/share-project-dialog"
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
import { ProjectForm, ProjectFormData } from "@/components/project-form"

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
  isPublicView?: boolean
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

const getTypeBadge = (type: string) => {
  if (!type) return (
    <Badge variant="outline" className="text-xs font-medium">
      Unknown
    </Badge>
  )
  
  const types = type.split(',').map(t => t.trim().toLowerCase())
  
  // For multiple types, show them as separate badges
  if (types.length > 1) {
    return (
      <div className="flex items-center gap-1 flex-wrap">
        {types.map((t, index) => {
          const badgeClasses = {
            'em': 'text-blue-600 border-blue-200',
            'ht': 'text-red-600 border-red-200',
            'cfd': 'text-green-600 border-green-200',
            'folder': 'text-gray-600 border-gray-200',
            'file': 'text-gray-600 border-gray-200'
          }[t] || 'text-gray-600 border-gray-200'
          
          const labels = {
            'em': 'EM',
            'ht': 'HT', 
            'cfd': 'CFD',
            'folder': 'Folder',
            'file': 'File'
          }[t] || t.toUpperCase()
          
          return (
            <Badge 
              key={index}
              variant="outline" 
              className={`text-xs font-medium ${badgeClasses}`}
            >
              {labels}
            </Badge>
          )
        })}
      </div>
    )
  }
  
  // For single types, show one badge
  const firstType = types[0]
  const badgeClasses = {
    'em': 'text-blue-600 border-blue-200',
    'ht': 'text-red-600 border-red-200', 
    'cfd': 'text-green-600 border-green-200',
    'folder': 'text-gray-600 border-gray-200',
    'file': 'text-gray-600 border-gray-200'
  }[firstType] || 'text-gray-600 border-gray-200'
  
  const labels = {
    'em': 'EM',
    'ht': 'HT',
    'cfd': 'CFD', 
    'folder': 'Folder',
    'file': 'File'
  }[firstType] || firstType.toUpperCase()
  
  return (
    <Badge 
      variant="outline" 
      className={`text-xs font-medium ${badgeClasses}`}
    >
      {labels}
    </Badge>
  )
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
  emptyState,
  isPublicView = false
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
  const [isArchiving, setIsArchiving] = React.useState<string | null>(null)
  const [isDuplicating, setIsDuplicating] = React.useState<string | null>(null)
  const [showEditDialog, setShowEditDialog] = React.useState(false)
  const [editingProject, setEditingProject] = React.useState<ProjectData | null>(null)
  const [isUpdating, setIsUpdating] = React.useState(false)
  const [editForm, setEditForm] = React.useState<ProjectFormData>({
    name: '',
    description: '',
    types: [],
    status: 'active'
  })
  const [editError, setEditError] = React.useState<string | null>(null)
  const [editSuccess, setEditSuccess] = React.useState(false)
  const [showShareDialog, setShowShareDialog] = React.useState(false)
  const [sharingProject, setSharingProject] = React.useState<ProjectData | null>(null)
  const [isCopying, setIsCopying] = React.useState<string | null>(null)
  
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

  const handleEdit = React.useCallback(async (project: ProjectData) => {
    setEditingProject(project)
    setEditForm({
      name: project.name,
      description: project.description || '',
      types: project.type ? project.type.split(',').map(t => t.trim()) : [],
      status: project.status
    })
    setEditError(null)
    setEditSuccess(false)
    setShowEditDialog(true)
  }, [])

  const handleEditSubmit = React.useCallback(async () => {
    if (!editingProject || !userId) return
    
    setEditError(null)
    
    if (!editForm.name.trim()) {
      setEditError('Project name is required')
      return
    }
    
    if (editForm.types.length === 0) {
      setEditError('Please select at least one project type')
      return
    }
    
    setIsUpdating(true)
    try {
      const { updateProject } = await import('@/lib/actions')
      const result = await updateProject(editingProject.id, {
        ...editForm,
        type: editForm.types.join(',') // Join types array into comma-separated string
      }, userId)
      
      if (result.success) {
        setEditSuccess(true)
        onItemsDeleted?.() // Refresh the data
        toast.success('Project updated successfully')
        
        // Close dialog after a short delay
        setTimeout(() => {
          setShowEditDialog(false)
          setEditingProject(null)
          setEditSuccess(false)
        }, 1500)
      } else {
        console.error('Failed to update project:', result.error)
        setEditError(result.error || 'Failed to update project')
      }
    } catch (error) {
      console.error('Error updating project:', error)
      setEditError('An error occurred while updating the project')
    } finally {
      setIsUpdating(false)
    }
  }, [editingProject, editForm, userId, onItemsDeleted])

  const handleDuplicate = React.useCallback(async (projectId: string) => {
    if (!userId) return
    
    setIsDuplicating(projectId)
    try {
      const { duplicateProject } = await import('@/lib/actions')
      const result = await duplicateProject(projectId, userId)
      
      if (result.success) {
        onItemsDeleted?.() // Refresh the data
        toast.success('Project duplicated successfully')
      } else {
        console.error('Failed to duplicate project:', result.error)
        toast.error(result.error || 'Failed to duplicate project')
      }
    } catch (error) {
      console.error('Error duplicating project:', error)
      toast.error('An error occurred while duplicating the project')
    } finally {
      setIsDuplicating(null)
    }
  }, [userId, onItemsDeleted])

  const handleArchive = React.useCallback(async (projectId: string) => {
    if (!userId) return
    
    setIsArchiving(projectId)
    try {
      const { archiveProject } = await import('@/lib/actions')
      const result = await archiveProject(projectId, userId)
      
      if (result.success) {
        onItemsDeleted?.() // Refresh the data
        toast.success('Project archived successfully')
      } else {
        console.error('Failed to archive project:', result.error)
        toast.error(result.error || 'Failed to archive project')
      }
    } catch (error) {
      console.error('Error archiving project:', error)
      toast.error('An error occurred while archiving the project')
    } finally {
      setIsArchiving(null)
    }
  }, [userId, onItemsDeleted])

  const handleShare = React.useCallback(async (project: ProjectData) => {
    setSharingProject(project)
    setShowShareDialog(true)
  }, [])

  const handleCopyPublicProject = React.useCallback(async (projectId: string) => {
    if (!userId) return
    
    setIsCopying(projectId)
    try {
      const { duplicateProject } = await import('@/lib/actions')
      const result = await duplicateProject(projectId, userId, true) // allowPublicCopy = true
      
      if (result.success) {
        toast.success('Project copied to your workspace successfully!')
        // Don't refresh the demo projects list, as it should remain the same
      } else {
        console.error('Failed to copy project:', result.error)
        toast.error(result.error || 'Failed to copy project')
      }
    } catch (error) {
      console.error('Error copying project:', error)
      toast.error('An error occurred while copying the project')
    } finally {
      setIsCopying(null)
    }
  }, [userId])

  // Create columns definition for projects
  const allColumns: ColumnDef<ProjectData>[] = React.useMemo(() => [
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
          <div className="flex items-center min-w-0">
            {renderItemLink ? (
              renderItemLink(project, 
                <span className="cursor-pointer font-bold" title={project.name}>
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
      cell: ({ row }) => getTypeBadge(row.original.type),
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
      cell: ({ row }) => {
        const project = row.original
        const isCurrentlyArchiving = isArchiving === project.id
        const isCurrentlyDuplicating = isDuplicating === project.id
        const isCurrentlyCopying = isCopying === project.id
        
        // For public view, show only copy button
        if (isPublicView) {
          return (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopyPublicProject(project.id)}
              disabled={isCurrentlyCopying || !userId}
              className="text-blue-600 hover:text-blue-700"
            >
              {isCurrentlyCopying ? 'Copying...' : 'Copy to My Projects'}
            </Button>
          )
        }
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                size="icon"
                disabled={isCurrentlyArchiving || isCurrentlyDuplicating}
              >
                <IconDotsVertical />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem onClick={() => handleEdit(project)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleDuplicate(project.id)}
                disabled={isCurrentlyDuplicating}
              >
                {isCurrentlyDuplicating ? 'Duplicating...' : 'Duplicate'}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleArchive(project.id)}
                disabled={isCurrentlyArchiving || project.status === 'archived'}
              >
                {isCurrentlyArchiving ? 'Archiving...' : project.status === 'archived' ? 'Archived' : 'Archive'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare(project)}>
                Share
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={() => handleDeleteSingle(project.id)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
      size: 40,
    },
  ], [renderItemLink, handleDeleteSingle, handleEdit, handleDuplicate, handleArchive, handleShare, handleCopyPublicProject, isArchiving, isDuplicating, isCopying, isPublicView, userId])

  // Filter columns based on view mode
  const columns = React.useMemo(() => {
    if (isPublicView) {
      // For public view, exclude drag and select columns, but keep actions for copy button
      return allColumns.filter(col => 
        col.id !== "drag" && 
        col.id !== "select"
      )
    }
    return allColumns
  }, [allColumns, isPublicView])

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
          "p-3 bg-accent/30 border border-border hover:bg-accent/50 transition-colors shadow-sm hover:shadow-md relative",
          !isPublicView && rowSelection[item.id] ? "bg-accent border-accent-foreground/20 shadow-md" : ""
        )}>
          {!isPublicView && (
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
          )}
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="min-w-0 flex-1">
              {renderItemLink ? (
                renderItemLink(item, 
                  <p className="text-sm font-medium truncate hover:underline cursor-pointer text-blue-600 hover:text-blue-800" title={item.name}>{item.name}</p>
                )
              ) : (
                <p className="text-sm font-medium truncate" title={item.name}>{item.name}</p>
              )}
              <p className="text-xs text-muted-foreground">{item.dateModified}</p>
              {isPublicView && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyPublicProject(item.id)}
                  disabled={isCopying === item.id || !userId}
                  className="mt-2 text-xs h-6 px-2"
                >
                  {isCopying === item.id ? 'Copying...' : 'Copy'}
                </Button>
              )}
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

      {/* Edit project dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Make changes to your project details.
            </DialogDescription>
          </DialogHeader>
          <ProjectForm
            data={editForm}
            onChange={setEditForm}
            onSubmit={handleEditSubmit}
            onCancel={() => setShowEditDialog(false)}
            isLoading={isUpdating}
            submitLabel="Update Project"
            error={editError}
            success={editSuccess}
          />
        </DialogContent>
      </Dialog>
      
      {/* Share project dialog */}
      <ShareProjectDialog
        project={sharingProject}
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        userId={userId || ''}
      />
    </div>
  )
}