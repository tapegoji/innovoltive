"use client"

import React from "react"
import { Folder, File, Grid3X3, List, ArrowUpDown, HardDrive, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export interface FileItem {
  id: string
  name: string
  type: "em" | "ht" | "cfd" | "folder" | "file"
  size?: string
  dateModified: string
  description?: string
  status: "active" | "completed" | "paused" | "archived"
  user?: string
}

interface FileExplorerProps {
  items: FileItem[]
  currentPath?: string[]
  viewMode?: "grid" | "list"
  onViewModeChange?: (mode: "grid" | "list") => void
  renderItemLink?: (item: FileItem, children: React.ReactNode) => React.ReactNode
  toolbarActions?: React.ReactNode
  onItemsDeleted?: () => void
  userId?: string
  emptyState?: React.ReactNode
}

const getIcon = (type: string) => {
  const isProject = ["em", "ht", "cfd"].includes(type)
  return isProject || type === "folder" ? 
    <Folder className="h-4 w-4 text-blue-500 flex-shrink-0" /> : 
    <File className="h-4 w-4 text-gray-600 flex-shrink-0" />
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
  <span className={cn(
    "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
    status === "active" && "bg-green-100 text-green-800",
    status === "completed" && "bg-blue-100 text-blue-800", 
    status === "paused" && "bg-yellow-100 text-yellow-800",
    status === "archived" && "bg-gray-100 text-gray-800"
  )}>
    {status.charAt(0).toUpperCase() + status.slice(1)}
  </span>
)

export function FileExplorer({ items, currentPath = ["My Projects"], viewMode = "list", onViewModeChange, renderItemLink, toolbarActions, onItemsDeleted, userId, emptyState }: FileExplorerProps) {
  const [sortBy, setSortBy] = React.useState<"name" | "type" | "status" | "date" | "size" | "user">("name")
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("asc")
  const [selectedItems, setSelectedItems] = React.useState<Set<string>>(new Set())
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => {
      const getTypePriority = (type: string) => {
        if (!type) return 3
        const firstType = type.split(',')[0]?.trim() || ''
        return ["em", "ht", "cfd"].includes(firstType) ? 0 : firstType === "folder" ? 1 : 2
      }
      const aPriority = getTypePriority(a.type)
      const bPriority = getTypePriority(b.type)
      
      if (aPriority !== bPriority) return aPriority - bPriority

      let comparison = 0
      switch (sortBy) {
        case "name": comparison = a.name.localeCompare(b.name); break
        case "date": comparison = new Date(a.dateModified).getTime() - new Date(b.dateModified).getTime(); break
        case "size": comparison = (a.size || "").localeCompare(b.size || ""); break
        case "status": comparison = a.status.localeCompare(b.status); break
        case "type": 
          // For sorting, use the first type in the list
          const aFirstType = a.type.split(',')[0]?.trim() || ''
          const bFirstType = b.type.split(',')[0]?.trim() || ''
          comparison = aFirstType.localeCompare(bFirstType); 
          break
        case "user": comparison = (a.user || "").localeCompare(b.user || ""); break
      }
      return sortOrder === "asc" ? comparison : -comparison
    })
  }, [items, sortBy, sortOrder])

  const handleSort = (newSortBy: typeof sortBy) => {
    setSortOrder(sortBy === newSortBy ? (sortOrder === "asc" ? "desc" : "asc") : "asc")
    setSortBy(newSortBy)
  }

  const handleSelectItem = (itemId: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId)
    } else {
      newSelected.add(itemId)
    }
    setSelectedItems(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(items.map(item => item.id)))
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedItems.size === 0 || !userId) return
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!userId) return
    setShowDeleteDialog(false)
    setIsDeleting(true)
    try {
      const { deleteProjects } = await import('@/lib/actions')
      const result = await deleteProjects(Array.from(selectedItems), userId)
      
      if (result.success) {
        setSelectedItems(new Set())
        onItemsDeleted?.()
      } else {
        console.error('Failed to delete projects:', result.error)
      }
    } catch (error) {
      console.error('Error deleting projects:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const ItemWrapper = ({ item, children }: { item: FileItem; children: React.ReactNode }) => 
    children

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Toolbar */}
      <div className="border-b bg-muted/50 p-3 flex items-center justify-between">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem><HardDrive className="h-4 w-4" /></BreadcrumbItem>
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
          
          {selectedItems.size > 0 && (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleDeleteSelected}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? 'Deleting...' : `Delete (${selectedItems.size})`}
            </Button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <ArrowUpDown className="h-4 w-4 mr-2" />Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {(["name", "type", "status", "date", "size", "user"] as const).map(field => (
                <DropdownMenuItem key={field} onClick={() => handleSort(field)}>
                  {field === "user" ? "Created By" : field.charAt(0).toUpperCase() + field.slice(1)} {sortBy === field && (sortOrder === "asc" ? "↑" : "↓")}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex border rounded-md">
            <Button variant={viewMode === "grid" ? "default" : "ghost"} size="sm" onClick={() => onViewModeChange?.("grid")} className="rounded-r-none">
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button variant={viewMode === "list" ? "default" : "ghost"} size="sm" onClick={() => onViewModeChange?.("list")} className="rounded-l-none">
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-auto">
        {items.length === 0 && emptyState ? (
          emptyState
        ) : viewMode === "grid" ? (
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {sortedItems.map(item => (
              <ItemWrapper key={item.id} item={item}>
                <Card className={cn(
                  "p-3 hover:bg-accent/50 transition-colors border-0 shadow-none hover:shadow-sm relative",
                  selectedItems.has(item.id) ? "bg-accent shadow-sm" : ""
                )}>
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item.id)}
                    onChange={(e) => {
                      e.stopPropagation()
                      handleSelectItem(item.id)
                    }}
                    className="absolute top-2 right-2 h-4 w-4"
                  />
                  <div className="flex flex-col items-center text-center space-y-2">
                    <Folder className="h-12 w-12 text-blue-500" />
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
              </ItemWrapper>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            <div className="grid grid-cols-14 gap-4 px-3 py-2 text-sm font-medium text-muted-foreground border-b">
              <div className="col-span-1">
                <input
                  type="checkbox"
                  checked={selectedItems.size === items.length && items.length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4"
                />
              </div>
              <div className="col-span-3">Name</div>
              <div className="col-span-1">Type</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1">Size</div>
              <div className="col-span-2">Date Modified</div>
              <div className="col-span-2">User</div>
              <div className="col-span-2">Description</div>
            </div>
            {sortedItems.map(item => (
              <ItemWrapper key={item.id} item={item}>
                <div className={cn(
                  "grid grid-cols-14 gap-4 px-3 py-2 text-sm hover:bg-accent/50 rounded transition-colors",
                  selectedItems.has(item.id) ? "bg-accent" : ""
                )}>
                  <div className="col-span-1 flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.id)}
                      onChange={(e) => {
                        e.stopPropagation()
                        handleSelectItem(item.id)
                      }}
                      className="h-4 w-4"
                    />
                  </div>
                  <div className="col-span-3 flex items-center space-x-2 min-w-0">
                    {getIcon(item.type)}
                    {renderItemLink ? (
                      renderItemLink(item, 
                        <span className="truncate font-medium hover:underline cursor-pointer" title={item.name}>{item.name}</span>
                      )
                    ) : (
                      <span className="truncate font-medium" title={item.name}>{item.name}</span>
                    )}
                  </div>
                  <div className="col-span-1 text-muted-foreground">{getTypeLabel(item.type)}</div>
                  <div className="col-span-2">{getStatusBadge(item.status)}</div>
                  <div className="col-span-1 text-muted-foreground">{item.size || "-"}</div>
                  <div className="col-span-2 text-muted-foreground">{item.dateModified}</div>
                  <div className="col-span-2 text-muted-foreground">
                    <span className="truncate" title={item.user}>{item.user || "-"}</span>
                  </div>
                  <div className="col-span-2 text-muted-foreground">
                    <span className="truncate" title={item.description}>{item.description || "-"}</span>
                  </div>
                </div>
              </ItemWrapper>
            ))}
          </div>
        )}
      </div>
      
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Projects</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedItems.size} project{selectedItems.size > 1 ? 's' : ''}? This action cannot be undone.
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