import * as React from "react";
import { cn } from "@/lib/utils";

function Card({
  className,
  interactive = false,
  ...props
}: React.ComponentProps<"div"> & { interactive?: boolean }) {
  return (
    <div
      className={cn(
        "glass rounded-card p-8",
        interactive &&
          "transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1 hover:border-border-strong hover:shadow-pop",
        className,
      )}
      {...props}
    />
  );
}

export { Card };
