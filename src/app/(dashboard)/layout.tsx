import { cookies } from "next/headers"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Header } from "@/components/Header"
import Footer from "@/components/Footer"

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <main className="w-full">
        <div className="flex items-center border-b px-2 bg-sidebar">
          <SidebarTrigger />
          <div className="flex-1">
            <Header compact/>
          </div>
        </div>
        {children}
      </main>
      <Footer />
    </SidebarProvider>
  )
}