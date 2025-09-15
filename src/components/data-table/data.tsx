import {
  CheckCircle,
  Circle,
  CircleOff,
  HelpCircle,
  Timer,
} from "lucide-react"

export const labels = [
  {
    value: "bug",
    label: "Bug",
  },
  {
    value: "feature",
    label: "Feature",
  },
  {
    value: "documentation",
    label: "Documentation",
  },
]

export const statuses = [
  {
    value: "active",
    label: "Active",
    icon: HelpCircle,
  },
  {
    value: "archived",
    label: "Archived",
    icon: Circle,
  },
  {
    value: "in progress",
    label: "In Progress",
    icon: Timer,
  },
  {
    value: "done",
    label: "Done",
    icon: CheckCircle,
  },
  {
    value: "canceled",
    label: "Canceled",
    icon: CircleOff,
  },
]

export const types = [
  {
    label: "EM",
    value: "em",
  },
  {
    label: "HT",
    value: "ht",
  },
  {
    label: "CFD",
    value: "cfd",
  },
]