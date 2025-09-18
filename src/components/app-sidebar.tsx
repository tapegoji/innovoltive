"use client"

import * as React from "react"
import {
  BookOpen,
  Folder,
  Globe,
  Settings2,
} from "lucide-react"

import { NavPlatForm } from "@/components/nav-platform"
import { NavProjects } from "@/components/nav-projects"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { MdDashboard } from "react-icons/md"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "InnoVoltive",
      logo: MdDashboard,
      plan: "Enterprise",
    }
  ],
  NavPlatForm: [
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Quick Reference",
          url: "",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    
    {
      title: "My Projects",
      url: "/my-projects",
      icon: Folder,
      items: []
    },
    {
      title: "Public Projects",
      url: "/public-projects",
      icon: Globe,
      items: []
    }
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
        <SidebarContent>
        <SidebarSeparator />
        <NavProjects items={data.projects} />
        <SidebarSeparator />
        <NavPlatForm items={data.NavPlatForm} />
      </SidebarContent>
      <SidebarFooter>
        {/* <NavUser user={data.user} /> */}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
