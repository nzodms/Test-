"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/* The trigger is the same aperture as an Input — a select that does
   not match the field beside it is the fastest way to make a form
   look assembled out of two different products. */

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-11 w-full items-center justify-between gap-2 rounded-sm px-3 sm:h-9",
      "border border-edge bg-page text-[15px] text-ink sm:text-sm",
      "transition-[border-color,box-shadow,background-color] duration-150",
      "hover:border-edge-strong",
      "focus:border-accent focus:shadow-[0_0_0_1px_var(--color-accent)] focus:outline-none",
      "data-[state=open]:border-accent data-[state=open]:shadow-[0_0_0_1px_var(--color-accent)]",
      "disabled:cursor-not-allowed disabled:border-edge-faint disabled:bg-mineral disabled:text-ink-faint",
      "data-[placeholder]:text-ink-faint [&>span]:truncate",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown
        className="size-4 shrink-0 text-ink-soft transition-transform duration-150"
        aria-hidden
      />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = "SelectTrigger";

const SelectContent = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      position={position}
      sideOffset={5}
      className={cn(
        "z-50 max-h-72 min-w-[var(--radix-select-trigger-width)] overflow-y-auto scrollbar-quiet",
        "rounded-sm border border-edge-strong bg-page p-1",
        "shadow-[0_8px_24px_-14px_rgb(22_23_26/0.4)]",
        "data-[state=open]:animate-fade-in",
        className
      )}
      {...props}
    >
      <SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = "SelectContent";

const SelectItem = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex min-h-10 cursor-default select-none items-center rounded-xs sm:min-h-8",
      "py-1.5 pl-2.5 pr-8 text-sm text-ink-soft outline-none",
      "data-highlighted:bg-mineral data-highlighted:text-ink",
      "data-[state=checked]:text-ink",
      "data-disabled:pointer-events-none data-disabled:text-ink-faint",
      className
    )}
    {...props}
  >
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    <span className="absolute right-2.5 flex size-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="size-3.5 text-accent" aria-hidden />
      </SelectPrimitive.ItemIndicator>
    </span>
  </SelectPrimitive.Item>
));
SelectItem.displayName = "SelectItem";

const SelectLabel = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn(
      "px-2.5 pb-1 pt-2 text-[13.5px] font-medium text-ink-soft",
      className
    )}
    {...props}
  />
));
SelectLabel.displayName = "SelectLabel";

const SelectSeparator = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-edge", className)}
    {...props}
  />
));
SelectSeparator.displayName = "SelectSeparator";

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectSeparator,
};
