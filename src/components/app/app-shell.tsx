"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Check,
  ChevronsUpDown,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  Sparkles,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { LogoMark } from "@/components/brand/logo";
import { Avatar } from "@/components/ui/avatar";
import { Kbd } from "@/components/ui/kbd";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
} from "@/components/ui/drawer";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { CommandPalette } from "@/components/app/command-palette";
import { NotificationsMenu } from "@/components/app/notifications";
import { appNav, settingsNav, settingsSections } from "@/lib/navigation";
import { getCurrentUser, getWorkspaces } from "@/lib/data";
import { isDemoClient, signOut } from "@/lib/auth";
import { cn } from "@/lib/utils";

/* ────────────────────────────────────────────────────────────────
   App shell: collapsible sidebar, topbar with breadcrumbs, global
   search (⌘K), notifications, workspace switcher, user menu and a
   drawer-based mobile navigation.
   ──────────────────────────────────────────────────────────────── */

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [hydrated, setHydrated] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [paletteOpen, setPaletteOpen] = React.useState(false);

  React.useEffect(() => {
    try {
      // One-time hydration from localStorage: the server can't know
      // this preference, so it must be applied after mount.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCollapsed(window.localStorage.getItem("halo-sidebar") === "collapsed");
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  const toggleSidebar = React.useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem("halo-sidebar", next ? "collapsed" : "open");
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  // Global shortcuts: ⌘K palette, ⌘B sidebar.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleSidebar]);

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex min-h-dvh">
        {/* Desktop sidebar */}
        <aside
          className={cn(
            "sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-edge bg-surface lg:flex",
            "transition-[width] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
            hydrated && collapsed ? "w-16" : "w-60"
          )}
        >
          <SidebarContent collapsed={hydrated ? collapsed : false} onToggle={toggleSidebar} />
        </aside>

        {/* Mobile navigation drawer */}
        <Drawer open={mobileOpen} onOpenChange={setMobileOpen}>
          <DrawerContent side="left" widthClassName="max-w-[280px]" className="lg:hidden">
            <DrawerTitle className="sr-only">Navigation</DrawerTitle>
            <SidebarContent
              collapsed={false}
              onToggle={() => setMobileOpen(false)}
              onNavigate={() => setMobileOpen(false)}
              mobile
            />
          </DrawerContent>
        </Drawer>

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar
            onOpenMobileNav={() => setMobileOpen(true)}
            onOpenPalette={() => setPaletteOpen(true)}
          />
          <main className="flex-1 pb-16">{children}</main>
        </div>
      </div>

      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        onToggleSidebar={toggleSidebar}
      />
    </TooltipProvider>
  );
}

/* ── Sidebar ───────────────────────────────────────────────────── */

function SidebarContent({
  collapsed,
  onToggle,
  onNavigate,
  mobile = false,
}: {
  collapsed: boolean;
  onToggle: () => void;
  /** Mobile drawer: close on link click. */
  onNavigate?: () => void;
  mobile?: boolean;
}) {
  const pathname = usePathname();

  return (
    <>
      <div className={cn("flex items-center gap-2 px-3 pt-4", collapsed && "justify-center px-2")}>
        <WorkspaceSwitcher collapsed={collapsed} />
      </div>

      <nav
        className={cn("mt-6 flex-1 space-y-0.5 overflow-y-auto scrollbar-quiet px-3", collapsed && "px-2")}
        aria-label="Application"
      >
        {appNav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const link = (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors",
                collapsed && "justify-center px-0 py-2.5",
                active
                  ? "bg-halo-500/[0.09] text-ink"
                  : "text-ink-secondary hover:bg-raised hover:text-ink"
              )}
            >
              {active ? (
                <span
                  aria-hidden
                  className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-halo-400"
                />
              ) : null}
              <item.icon
                className={cn(
                  "size-4.5 shrink-0",
                  active ? "text-halo-300" : "text-ink-muted group-hover:text-ink-secondary"
                )}
                aria-hidden
              />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
          return collapsed && !mobile ? (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>{link}</TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          ) : (
            link
          );
        })}
      </nav>

      <div className={cn("space-y-0.5 border-t border-edge px-3 py-3", collapsed && "px-2")}>
        <Link
          href={settingsNav.href}
          onClick={onNavigate}
          aria-current={pathname.startsWith("/settings") ? "page" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors",
            collapsed && "justify-center px-0",
            pathname.startsWith("/settings")
              ? "bg-halo-500/[0.09] text-ink"
              : "text-ink-secondary hover:bg-raised hover:text-ink"
          )}
        >
          <Settings className="size-4.5 shrink-0 text-ink-muted" aria-hidden />
          {!collapsed && <span>Settings</span>}
        </Link>
        {!mobile ? (
          <button
            type="button"
            onClick={onToggle}
            className={cn(
              "flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-sm text-ink-muted transition-colors hover:bg-raised hover:text-ink",
              collapsed && "justify-center px-0"
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen className="size-4.5" aria-hidden />
            ) : (
              <>
                <PanelLeftClose className="size-4.5" aria-hidden />
                <span>Collapse</span>
                <Kbd className="ml-auto">⌘B</Kbd>
              </>
            )}
          </button>
        ) : null}
      </div>
    </>
  );
}

/* ── Workspace switcher ────────────────────────────────────────── */

function WorkspaceSwitcher({ collapsed }: { collapsed: boolean }) {
  const workspaces = getWorkspaces();
  const [activeId, setActiveId] = React.useState(workspaces[0]!.id);
  const active = workspaces.find((w) => w.id === activeId)!;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex w-full items-center gap-2.5 rounded-md border border-transparent p-1.5 text-left transition-colors hover:bg-raised",
            collapsed && "w-auto justify-center"
          )}
          aria-label={`Workspace: ${active.name}`}
        >
          <LogoMark size={30} />
          {!collapsed && (
            <>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-ink">
                  {active.name}
                </span>
                <span className="block text-2xs capitalize text-ink-muted">
                  {active.plan} plan
                </span>
              </span>
              <ChevronsUpDown className="size-3.5 shrink-0 text-ink-muted" aria-hidden />
            </>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-60">
        <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
        {workspaces.map((ws) => (
          <DropdownMenuItem
            key={ws.id}
            onSelect={() => {
              setActiveId(ws.id);
              toast.success(`Switched to ${ws.name}`);
            }}
          >
            <span className="flex size-6 items-center justify-center rounded-[5px] border border-halo-500/40 bg-halo-500/15 text-2xs font-semibold text-halo-300">
              {ws.name[0]}
            </span>
            <span className="flex-1">{ws.name}</span>
            {ws.id === activeId ? <Check className="text-halo-400" aria-hidden /> : null}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings/organization">
            <Settings aria-hidden />
            Workspace settings
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ── Topbar ────────────────────────────────────────────────────── */

function Topbar({
  onOpenMobileNav,
  onOpenPalette,
}: {
  onOpenMobileNav: () => void;
  onOpenPalette: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-edge bg-base/85 px-3 backdrop-blur-md sm:px-5">
      <button
        type="button"
        onClick={onOpenMobileNav}
        className="rounded-md p-2 text-ink-secondary hover:bg-raised hover:text-ink lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="size-5" aria-hidden />
      </button>

      <Breadcrumbs />

      <div className="ml-auto flex items-center gap-1.5">
        {isDemoClient() ? (
          <span className="mr-1 hidden items-center gap-1.5 rounded-full border border-ember-400/25 bg-ember-400/[0.08] px-2.5 py-1 text-2xs font-medium text-ember-300 md:inline-flex">
            <Sparkles className="size-3" aria-hidden />
            Demo data
          </span>
        ) : null}
        <button
          type="button"
          onClick={onOpenPalette}
          className="hidden h-9 w-56 items-center gap-2.5 rounded-md border border-edge bg-void/40 px-3 text-sm text-ink-muted transition-colors hover:border-edge-strong hover:text-ink-secondary md:flex"
        >
          <Search className="size-3.5" aria-hidden />
          <span className="flex-1 text-left text-[13px]">Search</span>
          <Kbd>⌘K</Kbd>
        </button>
        <button
          type="button"
          onClick={onOpenPalette}
          className="rounded-md p-2 text-ink-muted transition-colors hover:bg-raised hover:text-ink md:hidden"
          aria-label="Search"
        >
          <Search className="size-4.5" aria-hidden />
        </button>
        <NotificationsMenu />
        <UserMenu />
      </div>
    </header>
  );
}

function Breadcrumbs() {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);
  const rootLabel =
    [...appNav, settingsNav].find((n) => `/${parts[0]}` === n.href)?.label ??
    parts[0] ??
    "";
  const section =
    parts[0] === "settings" && parts[1]
      ? settingsSections.find((s) => s.href === pathname)?.label
      : parts[0] === "settings"
        ? "Profile"
        : undefined;

  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex items-center gap-1.5 text-[13px]">
        <li className="hidden text-ink-muted sm:block">Northwind Systems</li>
        <li aria-hidden className="hidden text-ink-faint sm:block">/</li>
        <li className={cn("truncate", section ? "text-ink-muted" : "font-medium text-ink")}>
          {section ? (
            <Link href="/settings" className="hover:text-ink">
              {rootLabel}
            </Link>
          ) : (
            rootLabel
          )}
        </li>
        {section ? (
          <>
            <li aria-hidden className="text-ink-faint">/</li>
            <li className="truncate font-medium text-ink">{section}</li>
          </>
        ) : null}
      </ol>
    </nav>
  );
}

/* ── User menu ─────────────────────────────────────────────────── */

function UserMenu() {
  const router = useRouter();
  const user = getCurrentUser();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="ml-1 rounded-full outline-offset-2"
          aria-label={`Account menu for ${user.name}`}
        >
          <Avatar name={user.name} size="md" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2.5 py-2">
          <p className="text-sm font-medium text-ink">{user.name}</p>
          <p className="truncate text-xs text-ink-muted">{user.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <User aria-hidden />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings/billing">
            <Sparkles aria-hidden />
            Plan &amp; billing
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings/notifications">
            <Settings aria-hidden />
            Preferences
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={async () => {
            await signOut();
            toast.success("Signed out");
            router.push("/");
            router.refresh();
          }}
        >
          <LogOut aria-hidden />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
