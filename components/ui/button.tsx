import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full text-label",
    "transition-[background-color,border-color,color,transform,box-shadow] duration-200 ease-out",
    "disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50",
    "[&_svg]:size-4 [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-accent text-accent-text",
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_0_0_1px_rgba(120,160,255,0.35),0_8px_28px_-6px_rgba(47,107,255,0.65)]",
          "hover:-translate-y-px hover:bg-accent-hover hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_0_0_1px_rgba(140,175,255,0.5),0_12px_36px_-6px_rgba(47,107,255,0.8)]",
          "active:translate-y-0 active:bg-accent-pressed",
        ],
        secondary: [
          "border border-border bg-surface text-text backdrop-blur-xl",
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
          "hover:-translate-y-px hover:border-border-strong hover:bg-[rgba(255,255,255,0.08)] active:translate-y-0",
        ],
        light: "bg-white text-black hover:-translate-y-px hover:bg-white/90 active:translate-y-0",
        ghost: "text-text hover:bg-accent-soft",
        destructive: "bg-error text-accent-text hover:-translate-y-px active:translate-y-0",
      },
      size: {
        sm: "h-9 px-4",
        md: "h-11 px-5",
        lg: "h-13 px-6",
        icon: "size-11",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size }), className);

  if (asChild) {
    return (
      <Slot className={classes} {...props}>
        {children}
      </Slot>
    );
  }

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

export { Button, buttonVariants };
