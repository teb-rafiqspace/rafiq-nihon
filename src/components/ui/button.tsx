import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sakura-200 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-gradient-primary text-primary-foreground shadow-sakura hover:opacity-90 hover:shadow-elevated",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border-2 border-primary bg-background text-primary hover:bg-sakura-50 hover:border-sakura-400",
        secondary: "bg-gradient-secondary text-secondary-foreground shadow-matcha hover:opacity-90",
        ghost: "hover:bg-sakura-50 hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        success: "bg-gradient-success text-success-foreground shadow-matcha hover:opacity-90",
        premium: "bg-gradient-kiniro text-sumi-900 shadow-kiniro hover:opacity-90",
        tab: "bg-muted text-muted-foreground hover:bg-sakura-50 data-[active=true]:bg-primary data-[active=true]:text-primary-foreground",
        action: "bg-card text-foreground shadow-card hover:shadow-elevated border border-sakura-100 hover:border-sakura-200",
        sakura: "bg-sakura-100 text-sakura-700 hover:bg-sakura-200 border border-sakura-200",
        matcha: "bg-matcha-100 text-matcha-700 hover:bg-matcha-200 border border-matcha-200",
        kiniro: "bg-kiniro-100 text-kiniro-500 hover:bg-kiniro-200 border border-kiniro-200",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-2xl px-10 text-lg font-bold",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
