import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ className, hoverEffect = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-glass border border-glass-border backdrop-blur-xl rounded-2xl p-6",
          "shadow-lg shadow-black/5 dark:shadow-black/20",
          hoverEffect && "transition-all duration-300 hover:shadow-xl hover:bg-white/10 dark:hover:bg-black/10 hover:-translate-y-1",
          className
        )}
        {...props}
      />
    );
  }
);
GlassPanel.displayName = "GlassPanel";
