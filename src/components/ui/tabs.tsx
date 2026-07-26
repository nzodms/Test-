"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

/** Underline style — page-level sections. Ink underline, no accent. */
const TabsList = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "flex items-stretch gap-1 overflow-x-auto scrollbar-quiet border-b border-edge",
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
      "relative -mb-px inline-flex min-h-11 items-center whitespace-nowrap sm:min-h-9",
      "border-b-2 border-transparent px-3 text-sm text-ink-soft",
      "transition-colors duration-150",
      "hover:border-edge-strong hover:text-ink",
      "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent",
      "data-[state=active]:border-ink data-[state=active]:font-medium data-[state=active]:text-ink",
      "disabled:pointer-events-none disabled:text-ink-faint",
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = "TabsTrigger";

/** Segmented style — compact toggles (time ranges, filters). */
const TabsSegment = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex items-stretch gap-px rounded-sm border border-edge bg-mineral p-px",
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
      "inline-flex min-h-10 items-center rounded-[3px] border border-transparent px-3 sm:min-h-7",
      "text-[13.5px] text-ink-soft transition-colors duration-150",
      "hover:bg-mineral-deep hover:text-ink",
      "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent",
      "data-[state=active]:border-edge data-[state=active]:bg-page",
      "data-[state=active]:font-medium data-[state=active]:text-ink",
      "disabled:pointer-events-none disabled:text-ink-faint",
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
