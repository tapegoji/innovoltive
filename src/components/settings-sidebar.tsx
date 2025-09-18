import * as React from "react"
import Link from "next/link"
import { Minus, Plus } from "lucide-react"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

const settingsItems = [
  {
    title: "General",
    url: "/settings/general",
  },
  {
    title: "Team",
    url: "/settings/team",
  },
  {
    title: "Billing",
    url: "/settings/billing",
  },
  {
    title: "Limits",
    url: "/settings/limits",
  },
];

export function SettingsSidebar() {
  return (
    <SidebarMenu>
      {settingsItems.map((subItem: any) => (
        <Collapsible
          key={subItem.title}
          asChild
          defaultOpen={false}
          className="group/collapsible"
        >
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton tooltip={subItem.title}>
                <span>{subItem.title}</span>
                <Plus className="ml-auto transition-all duration-200 group-data-[state=open]/collapsible:hidden" />
                <Minus className="ml-auto transition-all duration-200 group-data-[state=closed]/collapsible:hidden" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton asChild>
                    <Link href={subItem.url}>
                      <span>View {subItem.title}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      ))}
    </SidebarMenu>
  );
}