import * as React from "react";
import { cn } from "@/lib/utils";

export const fieldBase = [
  "h-12 w-full rounded-control border border-border bg-surface px-4 text-body text-text",
  "placeholder:text-text-muted transition-colors duration-150 ease-out",
  "hover:border-border-strong focus-visible:border-accent",
  "aria-invalid:border-error disabled:cursor-not-allowed disabled:opacity-50",
].join(" ");

function Input({ className, type = "text", ...props }: React.ComponentProps<"input">) {
  return <input type={type} className={cn(fieldBase, className)} {...props} />;
}

export { Input };
