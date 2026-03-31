import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className, hover = true }: GlassCardProps) {
  return (
    <div
      className={cn(
        'relative rounded-xl border border-white/20 bg-white/10 backdrop-blur-md transition-all duration-300',
        hover && 'hover:border-white/40 hover:bg-white/15',
        className
      )}
    >
      {children}
    </div>
  );
}

// Dark mode variant
export function GlassCardDark({ children, className, hover = true }: GlassCardProps) {
  return (
    <div
      className={cn(
        'relative rounded-xl border border-white/10 bg-white/5 backdrop-blur-md transition-all duration-300',
        hover && 'border-white/20 bg-white/10',
        className
      )}
    >
      {children}
    </div>
  );
}
