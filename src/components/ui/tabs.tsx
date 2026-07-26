"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

/** Underline style — used for page-level sections */
const TabsList = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "flex items-center gap-1 overflow-x-auto scrollbar-quiet border-b border-edge",
      className
    )}
    {...props}
  />
));
TabsList.displayName = "TabsList";

const TabsTrigger = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "relative -mb-px whitespace-nowrap border-b-2 border-transparent px-3 py-2 text-sm text-ink-muted",
      "transition-colors hover:text-ink-secondary",
      "data-[state=active]:border-halo-400 data-[state=active]:text-ink",
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = "TabsTrigger";

/** Segmented style — used for compact toggles (e.g. time ranges) */
const TabsSegment = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex items-center gap-0.5 rounded-md border border-edge bg-void/40 p-0.5",
      className
    )}
    {...props}
  />
));
TabsSegment.displayName = "TabsSegment";

const TabsSegmentTrigger = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "rounded-sm px-2.5 py-1 text-[13px] text-ink-muted transition-colors",
      "hover:text-ink-secondary",
      "data-[state=active]:bg-raised data-[state=active]:text-ink data-[state=active]:shadow-[inset_0_1px_0_rgb(233_237_245/0.05)]",
      className
    )}
    {...props}
  />
));
TabsSegmentTrigger.displayName = "TabsSegmentTrigger";

const TabsContent = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn("mt-5 outline-none", className)}
    {...props}
  />
));
TabsContent.displayName = "TabsContent";

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsSegment,
  TabsSegmentTrigger,
  TabsContent,
};
