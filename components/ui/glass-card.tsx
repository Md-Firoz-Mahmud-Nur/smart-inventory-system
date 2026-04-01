import { cn } from "@/lib/utils";

export function GlassCard({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        // Base glass effect
        "relative rounded-2xl",

        // Glass background (IMPORTANT)
        "bg-white/10 dark:bg-white/5",

        // Blur (core glass effect)
        "backdrop-blur-xl",

        // Border (VERY IMPORTANT for glass)
        "border border-white/20 dark:border-white/10",

        // Depth
        "shadow-lg shadow-black/10 dark:shadow-black/40",

        // Subtle inner glow (modern touch)
        "before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-white/20 before:to-transparent before:opacity-50",

        // Smooth transitions
        "transition-all duration-300",

        className,
      )}
      {...props}>
      {children}
    </div>
  );
}
