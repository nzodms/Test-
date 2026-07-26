"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Side drawer built on the Radix Dialog primitive.
 * Slides in from the right (default) or left.
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
    <DialogPrimitive.Overlay
      className="fixed inset-0 z-50 bg-void/60 backdrop-blur-[2px] data-[state=open]:animate-fade-in"
    />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed inset-y-0 z-50 flex w-full flex-col border-edge-strong bg-surface shadow-modal",
        widthClassName ?? "max-w-md",
        side === "right"
          ? "right-0 border-l data-[state=open]:animate-[drawer-in-right_0.35s_cubic-bezier(0.32,0.72,0,1)] data-[state=closed]:animate-[drawer-out-right_0.25s_ease-in_both]"
          : "left-0 border-r data-[state=open]:animate-[drawer-in-left_0.35s_cubic-bezier(0.32,0.72,0,1)] data-[state=closed]:animate-[drawer-out-left_0.25s_ease-in_both]",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close
        className="absolute right-4 top-4 rounded-sm p-1 text-ink-muted transition-colors hover:bg-lifted hover:text-ink"
      >
        <X className="size-4" />
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
      className={cn("border-b border-edge px-6 py-5 pr-12", className)}
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
      className={cn("flex-1 overflow-y-auto scrollbar-quiet px-6 py-5", className)}
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
        "flex items-center justify-end gap-2 border-t border-edge px-6 py-4",
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
