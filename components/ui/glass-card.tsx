import { cn } from "@/lib/utils";

export function GlassCard({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        // Base card styling
        "relative rounded-lg",

        // Clean background
        "bg-card",

        // Subtle border
        "border border-border",

        // Soft shadow for depth
        "shadow-sm transition-all duration-300 hover:shadow-md",

        className,
      )}
      {...props}>
      {children}
    </div>
  );
}
