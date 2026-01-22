import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-sakura-100 text-sakura-700 border border-sakura-200",
        sakura: "bg-sakura-500 text-white",
        matcha: "bg-matcha-500 text-white",
        kiniro: "bg-kiniro-400 text-sumi-900",
        level: "bg-gradient-primary text-white shadow-sakura",
        streak: "bg-gradient-streak text-white shadow-sm",
        xp: "bg-gradient-xp text-white shadow-sm",
        outline: "border-2 border-sakura-300 text-sakura-600 bg-transparent",
        success: "bg-matcha-100 text-matcha-700 border border-matcha-200",
        warning: "bg-kiniro-100 text-kiniro-500 border border-kiniro-200",
        destructive: "bg-destructive/10 text-destructive border border-destructive/20",
        muted: "bg-sumi-100 text-sumi-600",
      },
      size: {
        default: "text-xs px-3 py-1",
        sm: "text-[10px] px-2 py-0.5",
        lg: "text-sm px-4 py-1.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function SakuraBadge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

// Level Badge with icon
interface LevelBadgeProps {
  level: string;
  className?: string;
}

export function LevelBadge({ level, className }: LevelBadgeProps) {
  return (
    <SakuraBadge variant="level" className={cn("gap-1 font-bold", className)}>
      <span className="text-base">🌸</span>
      {level}
    </SakuraBadge>
  );
}

// Streak Badge
interface StreakBadgeProps {
  days: number;
  className?: string;
}

export function StreakBadge({ days, className }: StreakBadgeProps) {
  return (
    <SakuraBadge variant="streak" className={cn("gap-1", className)}>
      <span>🔥</span>
      {days}日連続
    </SakuraBadge>
  );
}

// Status Badge
type StatusType = 'completed' | 'in-progress' | 'locked' | 'new';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusConfig = {
    completed: { variant: 'success' as const, label: '完了', icon: '✓' },
    'in-progress': { variant: 'sakura' as const, label: '進行中', icon: '📖' },
    locked: { variant: 'muted' as const, label: 'ロック', icon: '🔒' },
    new: { variant: 'kiniro' as const, label: 'NEW', icon: '✨' },
  };

  const config = statusConfig[status];

  return (
    <SakuraBadge variant={config.variant} className={cn("gap-1", className)}>
      <span>{config.icon}</span>
      {config.label}
    </SakuraBadge>
  );
}

export { SakuraBadge, badgeVariants };
