"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  FilePlus2,
  LogOut,
  Moon,
  PanelLeft,
  Radar,
  Settings,
  UserPlus,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { appNav, settingsNav } from "@/lib/navigation";
import { getSignals } from "@/lib/data";
import { signOut } from "@/lib/auth";

export function CommandPalette({
  open,
  onOpenChange,
  onToggleSidebar,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggleSidebar: () => void;
}) {
  const router = useRouter();
  const signals = React.useMemo(
    () => getSignals().filter((s) => s.status !== "resolved").slice(0, 6),
    []
  );

  const run = (fn: () => void) => {
    onOpenChange(false);
    fn();
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search pages, signals, actions…" />
      <CommandList>
        <CommandEmpty>No results. Try a signal ID or a page name.</CommandEmpty>

        <CommandGroup heading="Go to">
          {[...appNav, settingsNav].map((item) => (
            <CommandItem
              key={item.href}
              value={`${item.label} ${item.hint}`}
              onSelect={() => run(() => router.push(item.href))}
            >
              <item.icon aria-hidden />
              {item.label}
              <span className="ml-2 hidden text-2xs text-ink-faint sm:inline">
                {item.hint}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Signals">
          {signals.map((s) => (
            <CommandItem
              key={s.id}
              value={`${s.id} ${s.title} ${s.tags.join(" ")}`}
              onSelect={() => run(() => router.push(`/signals?focus=${s.id}`))}
            >
              <Radar aria-hidden />
              <span className="truncate">{s.title}</span>
              <CommandShortcut>{s.id}</CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Actions">
          <CommandItem
            value="create automation new"
            onSelect={() => run(() => router.push("/automations?new=1"))}
          >
            <FilePlus2 aria-hidden />
            Create automation
          </CommandItem>
          <CommandItem
            value="invite teammate member"
            onSelect={() => run(() => router.push("/team?invite=1"))}
          >
            <UserPlus aria-hidden />
            Invite a teammate
          </CommandItem>
          <CommandItem
            value="toggle sidebar collapse"
            onSelect={() => run(onToggleSidebar)}
          >
            <PanelLeft aria-hidden />
            Toggle sidebar
            <CommandShortcut>⌘B</CommandShortcut>
          </CommandItem>
          <CommandItem
            value="appearance theme settings"
            onSelect={() => run(() => router.push("/settings/appearance"))}
          >
            <Moon aria-hidden />
            Appearance settings
          </CommandItem>
          <CommandItem
            value="workspace settings"
            onSelect={() => run(() => router.push("/settings/organization"))}
          >
            <Settings aria-hidden />
            Workspace settings
          </CommandItem>
          <CommandItem
            value="sign out logout"
            onSelect={() =>
              run(async () => {
                await signOut();
                toast.success("Signed out");
                router.push("/");
                router.refresh();
              })
            }
          >
            <LogOut aria-hidden />
            Sign out
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
