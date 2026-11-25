import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { fieldBase } from "@/components/ui/input";

/** Native select styled to match Input. Native keeps it accessible on every device. */
function Select({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <div className="relative">
      <select className={cn(fieldBase, "cursor-pointer appearance-none pr-11 [&_option]:bg-black [&_option]:text-white", className)} {...props}>
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-text-muted"
        aria-hidden="true"
      />
    </div>
  );
}

export { Select };
