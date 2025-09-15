import {
  CheckCircle,
  Circle,
  CircleOff,
  HelpCircle,
  icons,
  Timer,
} from "lucide-react"

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
    value: "em",
    label: "EM",
    icon: Circle,
  },
  {
    value: "ht",
    label: "HT",
    icon: Circle,
  },
  {
    value: "cfd",
    label: "CFD",
    icon: Circle,
  },
]