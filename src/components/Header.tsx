'use client'

import {
  SignInButton,
  // SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { CircleUserRound, LayoutDashboard } from 'lucide-react'
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip"

export function Header() {
  return (
    <TooltipProvider>
      <header className="flex justify-between items-center px-2 gap-4 h-10 border-b">
        <Logo />
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <SignedOut>
            <Tooltip>
              <TooltipTrigger asChild>
                <SignInButton>
                  <CircleUserRound className="cursor-pointer" />
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