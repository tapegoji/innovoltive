import React from 'react';
import { cn } from "@/lib/utils";

interface FooterProps {
  compact?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const Footer: React.FC<FooterProps> = ({ compact = false, className, children }) => {
  return (
    <footer className={cn(
      "fixed bottom-0 left-0 right-0 bg-sidebar border-sidebar-border flex items-center w-full z-50",
      compact ? "h-8 px-2" : "px-2",
      className
    )}>
      <div className="flex-1 flex items-center">
        <p className="text-sm text-sidebar-foreground">
          © 2025 Innovoltive.
        </p>
      </div>
      {children && (
        <div className="flex-1 flex items-center justify-center">
          {children}
        </div>
      )}
      <div className="flex-1"></div>
    </footer>
  );
};

export default Footer;