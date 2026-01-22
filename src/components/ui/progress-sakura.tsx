import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

interface SakuraProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  indicatorClassName?: string;
  variant?: 'sakura' | 'matcha' | 'kiniro' | 'default';
}

const SakuraProgress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  SakuraProgressProps
>(({ className, value, indicatorClassName, variant = 'sakura', ...props }, ref) => {
  const variantClasses = {
    sakura: 'bg-gradient-primary',
    matcha: 'bg-gradient-secondary',
    kiniro: 'bg-gradient-kiniro',
    default: 'bg-primary',
  };

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-3 w-full overflow-hidden rounded-full bg-sakura-100",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full w-full flex-1 transition-all duration-500 ease-out rounded-full",
          variantClasses[variant],
          indicatorClassName
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
});
SakuraProgress.displayName = "SakuraProgress";

interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  variant?: 'sakura' | 'matcha' | 'kiniro';
  className?: string;
  children?: React.ReactNode;
}

export function CircularProgress({
  value,
  size = 80,
  strokeWidth = 8,
  variant = 'sakura',
  className,
  children,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  const gradientColors = {
    sakura: { start: 'hsl(350, 100%, 71%)', end: 'hsl(340, 85%, 65%)' },
    matcha: { start: 'hsl(142, 71%, 45%)', end: 'hsl(150, 60%, 50%)' },
    kiniro: { start: 'hsl(43, 96%, 56%)', end: 'hsl(38, 92%, 50%)' },
  };

  const gradientId = `gradient-${variant}-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={gradientColors[variant].start} />
            <stop offset="100%" stopColor={gradientColors[variant].end} />
          </linearGradient>
        </defs>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(350, 100%, 95%)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500 ease-out"
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}

export { SakuraProgress };
