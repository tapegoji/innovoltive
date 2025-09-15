import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { IconPlus } from "@tabler/icons-react"
import { types } from "./data"
import { useState } from "react"

export function AddNewProject() {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])

  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button variant="default" size="sm">
            <IconPlus />
            <span className="hidden lg:inline">Add Project</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add a new project</DialogTitle>
            <DialogDescription>
              Add your project details here. Click save when you&apos;re done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" placeholder="Project name" />
            </div>
            <div className="grid gap-3">
              <Label>Type (select multiple)</Label>
              <div className="flex flex-col gap-2">
                {types.map((type) => (
                  <div key={type.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={type.value}
                      checked={selectedTypes.includes(type.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedTypes([...selectedTypes, type.value])
                        } else {
                          setSelectedTypes(selectedTypes.filter(t => t !== type.value))
                        }
                      }}
                    />
                    <Label htmlFor={type.value}>{type.label}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" placeholder="Project description" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Add Project</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}
