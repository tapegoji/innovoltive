'use client'

import {
  SignInButton,
  // SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { CircleUserRound, LayoutDashboard } from 'lucide-react'
import Link from 'next/link'
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import React from 'react'

interface HeaderProps {
  compact?: boolean
  className?: string
  children?: React.ReactNode
}

export function Header({ compact = false, className, children }: HeaderProps) {
  return (
    <TooltipProvider>
      <header className={cn(
        "bg-sidebar border-sidebar-border flex items-center w-full",
        compact ? "h-8 px-2" : "px-2",
        className
      )}>
        <Logo textSize={compact ? "text-lg" : "text-2xl"} />
        {children && (
          <div className="flex-1 flex items-center justify-center">
            {children}
          </div>
        )}
        <div className={cn("flex items-center gap-4", !children && "ml-auto")}>
          <ThemeToggle />
          <SignedOut>
            <Tooltip>
              <TooltipTrigger asChild>
                <SignInButton>
                  <CircleUserRound className={cn("cursor-pointer", compact && "w-4 h-4")} />
                </SignInButton>
              </TooltipTrigger>
              <TooltipContent>
                <p>Sign in</p>
              </TooltipContent>
            </Tooltip>
            {/* <SignUpButton>
              <button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm sm:text-base h-8 sm:h-8 px-4 sm:px-5 cursor-pointer">
                Sign Up
              </button>
            </SignUpButton> */}
          </SignedOut>
          <SignedIn>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/dashboard">
                  <LayoutDashboard className={cn("mr-2", compact && "w-4 h-4")} />
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Go to Dashboard</p>
              </TooltipContent>
            </Tooltip>
            <UserButton>
              <UserButton.MenuItems>
                <UserButton.Link
                  label="Dahsboard"
                  labelIcon={<LayoutDashboard />}
                  href="/dashboard"
                />
                <UserButton.Action label="manageAccount" />
                <UserButton.Action label="signOut" />
              </UserButton.MenuItems>
            </UserButton>
          </SignedIn>
        </div>
      </header>
    </TooltipProvider>
  )
}