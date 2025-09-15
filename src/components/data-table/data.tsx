import {
  CheckCircle,
  Circle,
  CircleOff,
  HelpCircle,
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
    value: "EM",
    label: "EM",
    icon: Circle,
  },
  {
    value: "HT",
    label: "HT",
    icon: Circle,
  },
  {
    value: "CFD",
    label: "CFD",
    icon: Circle,
  }
]