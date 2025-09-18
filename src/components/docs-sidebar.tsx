import * as React from "react"
import Link from "next/link"
import { Minus, Plus } from "lucide-react"
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
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

interface DocumentationItem {
  title: string;
  url: string;
}

const documentationItems: DocumentationItem[] = [
  {
    title: "Quick Reference",
    url: "/documentation/quick-reference",
  },
  {
    title: "Get Started",
    url: "/documentation/get-started",
  },
  {
    title: "Tutorials",
    url: "/documentation/tutorials",
  },
  {
    title: "Changelog",
    url: "/documentation/changelog",
  },
];

export function DocsSidebar() {
  return (
    <>
      <SidebarHeader className="gap-3.5 border-b p-4">
        <div className="text-foreground text-base font-medium">
          Documentation
        </div>
        <SidebarInput placeholder="Type to search..." />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="px-0">
          <SidebarGroupContent>
            <SidebarMenu>
              {documentationItems.map((subItem) => (
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
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </>
  );
}