import { cn } from "@/lib/utils";
import React from "react";

interface NeomorphButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function NeomorphButton({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: NeomorphButtonProps) {
  return (
    <button
      className={cn(
        "relative font-medium transition-all duration-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2",
        // Light mode shadows
        "shadow-lg hover:shadow-xl active:shadow-md",
        // Size variants
        size === "sm" && "px-3 py-1.5 text-sm",
        size === "md" && "px-4 py-2 text-base",
        size === "lg" && "px-6 py-3 text-lg",
        // Color variants
        variant === "primary" &&
          "bg-gradient-to-b from-[var(--primary)] to-[var(--primary)] text-[var(--primary-foreground)] shadow-[0_4px_15px_rgba(255,105,50,0.4)] hover:shadow-[0_6px_20px_rgba(255,105,50,0.6)] active:shadow-[0_2px_8px_rgba(255,105,50,0.3)]",
        variant === "secondary" &&
          "bg-gradient-to-b from-[var(--secondary)] to-[var(--secondary)] text-[var(--secondary-foreground)] shadow-[0_4px_15px_rgba(66,77,147,0.3)] hover:shadow-[0_6px_20px_rgba(66,77,147,0.5)]",
        variant === "ghost" &&
          "bg-transparent text-[var(--foreground)] shadow-none hover:bg-[var(--muted)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)]",
        className,
      )}
      {...props}>
      {children}
    </button>
  );
}
