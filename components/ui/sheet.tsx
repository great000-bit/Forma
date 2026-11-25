"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;
const SheetTitle = DialogPrimitive.Title;
const SheetDescription = DialogPrimitive.Description;

/** Slides up from the bottom on mobile, in from the right from md up. */
function SheetContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in" />
      <DialogPrimitive.Content
        className={cn(
          "fixed z-50 flex flex-col gap-6 border border-border bg-surface-raised p-8 shadow-pop backdrop-blur-2xl",
          "inset-x-0 bottom-0 max-h-[85dvh] rounded-t-dialog",
          "data-[state=closed]:animate-sheet-out-bottom data-[state=open]:animate-sheet-in-bottom",
          "md:inset-y-0 md:right-0 md:left-auto md:max-h-none md:w-[400px] md:rounded-none md:rounded-l-dialog",
          "md:data-[state=closed]:animate-sheet-out-right md:data-[state=open]:animate-sheet-in-right",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          className="absolute top-5 right-5 inline-flex size-11 cursor-pointer items-center justify-center rounded-control text-text-muted transition-colors duration-150 hover:bg-accent-soft hover:text-text"
          aria-label="Close menu"
        >
          <X className="size-5" aria-hidden="true" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetTitle, SheetDescription };
