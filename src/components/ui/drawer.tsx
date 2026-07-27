"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Side drawer built on the Radix Dialog primitive.
 *
 * It slides because it comes from an edge and returns to it — the
 * motion states where the panel lives, which is the only reason a
 * panel is allowed to move at all.
 */

const Drawer = DialogPrimitive.Root;
const DrawerTrigger = DialogPrimitive.Trigger;
const DrawerClose = DialogPrimitive.Close;

const DrawerContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    side?: "right" | "left";
    widthClassName?: string;
  }
>(({ className, children, side = "right", widthClassName, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/30 data-[state=open]:animate-fade-in" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed inset-y-0 z-50 flex w-full flex-col border-edge-strong bg-page",
        "shadow-[0_0_60px_-24px_rgb(22_23_26/0.5)]",
        widthClassName ?? "max-w-md",
        side === "right"
          ? "right-0 border-l data-[state=open]:animate-[drawer-in-right_0.4s_cubic-bezier(0.22,1,0.36,1)] data-[state=closed]:animate-[drawer-out-right_0.28s_cubic-bezier(0.4,0,1,1)_both]"
          : "left-0 border-r data-[state=open]:animate-[drawer-in-left_0.4s_cubic-bezier(0.22,1,0.36,1)] data-[state=closed]:animate-[drawer-out-left_0.28s_cubic-bezier(0.4,0,1,1)_both]",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close
        className={cn(
          "absolute right-2.5 top-3 inline-flex size-11 items-center justify-center sm:size-8",
          "rounded-sm text-ink-soft transition-colors duration-150",
          "hover:bg-mineral hover:text-ink active:bg-mineral-deep",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        )}
      >
        <X className="size-4" aria-hidden />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
DrawerContent.displayName = "DrawerContent";

function DrawerHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("border-b border-edge px-5 py-5 pr-16 sm:px-6", className)}
      {...props}
    />
  );
}

function DrawerBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex-1 overflow-y-auto scrollbar-quiet px-5 py-5 sm:px-6",
        className
      )}
      {...props}
    />
  );
}

function DrawerFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-2 border-t border-edge px-5 py-4 sm:px-6",
        className
      )}
      {...props}
    />
  );
}

const DrawerTitle = DialogPrimitive.Title;
const DrawerDescription = DialogPrimitive.Description;

export {
  Drawer,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
