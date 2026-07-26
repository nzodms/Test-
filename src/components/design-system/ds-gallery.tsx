"use client";

import * as React from "react";
import {
  Archive,
  Copy,
  Inbox,
  Info,
  Plus,
  RefreshCw,
  Settings2,
  Trash2,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsSegment,
  TabsSegmentTrigger,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Checkbox,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Progress,
  Separator,
  Spinner,
} from "@/components/ui/misc";
import { Avatar } from "@/components/ui/avatar";
import { Kbd } from "@/components/ui/kbd";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import { dataNow, getDailySeries, getMembers, getSignals } from "@/lib/data";
import type { Signal } from "@/lib/data";
import { formatDate, formatRelative } from "@/lib/utils";
import { DsSection, Specimen } from "./ds-primitives";

/* Badge conventions shared across the app — mirrored here verbatim. */
const severityVariant = {
  critical: "critical",
  high: "caution",
  medium: "halo",
  low: "neutral",
} as const;

const statusVariant = {
  new: "halo",
  investigating: "caution",
  monitoring: "neutral",
  resolved: "positive",
} as const;

/* ────────────────────────────────────────────────────────────────
   Section 7 — Components gallery
   ──────────────────────────────────────────────────────────────── */

export function ComponentsGallery() {
  return (
    <DsSection
      id="components"
      label="07 — Components"
      title="Component gallery"
      description="Every primitive in the kit, rendered live with its real props. Conventions shown here — severity and status badge mapping, tabular numbers, icon-button labeling — are binding across the product."
    >
      <ButtonsSpecimen />
      <BadgesSpecimen />
      <InputsSpecimen />
      <TabsSpecimen />
      <TableSpecimen />
      <div className="grid gap-6 lg:grid-cols-2">
        <OverlaysSpecimen />
        <MenusSpecimen />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <ProgressSpecimen />
        <IdentitySpecimen />
      </div>
    </DsSection>
  );
}

function ButtonsSpecimen() {
  return (
    <Specimen title="Buttons" note="6 variants × 5 sizes — primary for the one main action per view; ember at most once per screen">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="ember">Ember</Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="secondary">
            Small
          </Button>
          <Button size="md" variant="secondary">
            Medium
          </Button>
          <Button size="lg" variant="secondary">
            Large
          </Button>
          <Button size="icon" variant="secondary" aria-label="Open settings">
            <Settings2 aria-hidden />
          </Button>
          <Button size="icon-sm" variant="outline" aria-label="Add signal">
            <Plus aria-hidden />
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button loading>Generating report</Button>
          <Button variant="secondary" disabled>
            Disabled
          </Button>
          <Button variant="outline" disabled>
            Disabled outline
          </Button>
        </div>
      </div>
    </Specimen>
  );
}

function BadgesSpecimen() {
  return (
    <Specimen title="Badges" note="severity: critical / high→caution / medium→halo / low→neutral · status: new→halo / investigating→caution / monitoring→neutral / resolved→positive">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>Neutral</Badge>
          <Badge variant="halo">Halo</Badge>
          <Badge variant="positive">Positive</Badge>
          <Badge variant="caution">Caution</Badge>
          <Badge variant="critical">Critical</Badge>
          <Badge variant="ember">Ember</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="critical" dot>
            Critical
          </Badge>
          <Badge variant="caution" dot>
            High
          </Badge>
          <Badge variant="halo" dot>
            Medium
          </Badge>
          <Badge variant="neutral" dot>
            Low
          </Badge>
          <Separator orientation="vertical" className="h-4" />
          <Badge variant="positive" dot>
            Active
          </Badge>
          <Badge variant="outline">Paused</Badge>
        </div>
      </div>
    </Specimen>
  );
}

function InputsSpecimen() {
  const [severity, setSeverity] = React.useState("high");
  const [digest, setDigest] = React.useState(true);
  const [ackChecked, setAckChecked] = React.useState(true);

  return (
    <Specimen title="Inputs & controls" note="every control carries a label; errors set aria-invalid and render under the field">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-5">
          <Field label="Workspace name" htmlFor="ds-ws-name" hint="Visible to all members">
            <Input id="ds-ws-name" defaultValue="Northwind Systems" />
          </Field>
          <Field
            label="Notification email"
            htmlFor="ds-email"
            error="Enter a valid work email address."
          >
            <Input
              id="ds-email"
              type="email"
              defaultValue="ops-team@northwind"
              aria-invalid
            />
          </Field>
          <Field label="Escalation note" htmlFor="ds-note">
            <Textarea
              id="ds-note"
              placeholder="Context for the on-call engineer…"
              rows={3}
            />
          </Field>
        </div>
        <div className="space-y-5">
          <Field label="Minimum severity" htmlFor="ds-severity">
            <Select value={severity} onValueChange={setSeverity}>
              <SelectTrigger id="ds-severity" aria-label="Minimum severity">
                <SelectValue placeholder="Select severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <div className="flex items-center justify-between rounded-md border border-edge bg-raised px-4 py-3">
            <div>
              <p className="text-[13px] font-medium text-ink">Daily digest</p>
              <p className="text-xs text-ink-muted">A summary at 08:00 local time</p>
            </div>
            <Switch
              checked={digest}
              onCheckedChange={setDigest}
              aria-label="Toggle daily digest"
            />
          </div>
          <div className="space-y-2.5">
            <label className="flex items-center gap-2.5 text-[13px] text-ink-secondary">
              <Checkbox
                checked={ackChecked}
                onCheckedChange={(v) => setAckChecked(v === true)}
              />
              Acknowledge before resolving
            </label>
            <label className="flex items-center gap-2.5 text-[13px] text-ink-secondary">
              <Checkbox checked="indeterminate" aria-label="Partially selected group" />
              Partially selected group
            </label>
          </div>
          <div>
            <p className="text-label mb-2">Segmented — time ranges</p>
            <Tabs defaultValue="7d">
              <TabsSegment aria-label="Time range">
                <TabsSegmentTrigger value="24h">24h</TabsSegmentTrigger>
                <TabsSegmentTrigger value="7d">7d</TabsSegmentTrigger>
                <TabsSegmentTrigger value="28d">28d</TabsSegmentTrigger>
                <TabsSegmentTrigger value="90d">90d</TabsSegmentTrigger>
              </TabsSegment>
            </Tabs>
          </div>
        </div>
      </div>
    </Specimen>
  );
}

function TabsSpecimen() {
  return (
    <Specimen title="Tabs — underline" note="page-level sections; segmented style above is for compact filters">
      <Tabs defaultValue="signals">
        <TabsList>
          <TabsTrigger value="signals">Signals</TabsTrigger>
          <TabsTrigger value="automations">Automations</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        <TabsContent value="signals">
          <p className="text-sm text-ink-secondary">
            Active signals across all connected sources, ranked by severity and impact.
          </p>
        </TabsContent>
        <TabsContent value="automations">
          <p className="text-sm text-ink-secondary">
            Rules that triage, route and escalate without human intervention.
          </p>
        </TabsContent>
        <TabsContent value="history">
          <p className="text-sm text-ink-secondary">
            A complete audit trail of every state change, kept for 13 months.
          </p>
        </TabsContent>
      </Tabs>
    </Specimen>
  );
}

function TableSpecimen() {
  const rows: Signal[] = getSignals().slice(0, 3);
  return (
    <Specimen
      title="Table"
      note="scrolls horizontally inside its own wrapper; numbers use .tabular; second row shows the selected state"
      bodyClassName="p-0"
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Signal</TableHead>
            <TableHead>Severity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Impact</TableHead>
            <TableHead className="text-right">Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((sig, i) => (
            <TableRow key={sig.id} data-state={i === 1 ? "selected" : undefined}>
              <TableCell>
                <span className="font-mono text-xs text-ink-muted">{sig.id}</span>
                <span className="ml-2 text-sm text-ink">{sig.title}</span>
              </TableCell>
              <TableCell>
                <Badge variant={severityVariant[sig.severity]} dot>
                  {sig.severity}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={statusVariant[sig.status]}>{sig.status}</Badge>
              </TableCell>
              <TableCell className="tabular text-right text-sm text-ink">
                {sig.impact}
              </TableCell>
              <TableCell className="tabular text-right text-xs text-ink-muted">
                {formatRelative(sig.updatedAt, dataNow)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Specimen>
  );
}

function OverlaysSpecimen() {
  return (
    <Specimen title="Overlays" note="every dialog and drawer has a Title; focus is trapped and returned">
      <div className="flex flex-wrap items-center gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="secondary">Open dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Archive resolved signals</DialogTitle>
              <DialogDescription>
                12 resolved signals older than 30 days will move to the archive.
                They remain searchable and fully auditable.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button
                  onClick={() =>
                    toast.success("Signals archived", {
                      description: "12 signals moved to the archive.",
                    })
                  }
                >
                  <Archive aria-hidden />
                  Archive 12 signals
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline">Open drawer</Button>
          </DrawerTrigger>
          <DrawerContent widthClassName="max-w-md">
            <DrawerHeader>
              <DrawerTitle className="text-title text-base text-ink">
                Signal detail
              </DrawerTitle>
              <DrawerDescription className="mt-1 text-sm text-ink-secondary">
                The standard side panel for inspecting a record without leaving
                the list.
              </DrawerDescription>
            </DrawerHeader>
            <DrawerBody>
              <dl className="space-y-4 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-ink-muted">Severity</dt>
                  <dd>
                    <Badge variant="caution" dot>
                      high
                    </Badge>
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-ink-muted">Assignee</dt>
                  <dd className="flex items-center gap-2 text-ink">
                    <Avatar name="Amara Okafor" size="xs" />
                    Amara Okafor
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-ink-muted">Impact score</dt>
                  <dd className="tabular text-ink">74</dd>
                </div>
              </dl>
            </DrawerBody>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="ghost">Close</Button>
              </DrawerClose>
              <Button variant="secondary">Assign to me</Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    </Specimen>
  );
}

function MenusSpecimen() {
  const [muted, setMuted] = React.useState(false);
  return (
    <Specimen title="Menus, tooltip & popover" note="icon-only triggers always carry aria-label">
      <div className="flex flex-wrap items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary">Row actions</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>SIG-1043</DropdownMenuLabel>
            <DropdownMenuItem onSelect={() => toast.info("Assigned to you")}>
              <UserRound aria-hidden className="size-3.5" />
              Assign to me
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() =>
                toast.success("Copied", { description: "SIG-1043 copied to clipboard." })
              }
            >
              <Copy aria-hidden className="size-3.5" />
              Copy signal ID
              <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuCheckboxItem checked={muted} onCheckedChange={setMuted}>
              Mute notifications
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              destructive
              onSelect={() => toast.error("Signal deleted")}
            >
              <Trash2 aria-hidden className="size-3.5" />
              Delete signal
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="outline" aria-label="Refresh signal data">
                <RefreshCw aria-hidden />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refresh signal data</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Impact score</Button>
          </PopoverTrigger>
          <PopoverContent align="start">
            <p className="text-[13px] font-medium text-ink">How impact is scored</p>
            <p className="mt-1.5 text-xs leading-relaxed text-ink-secondary">
              A 0–100 blend of affected revenue, customer count and blast
              radius, recomputed every five minutes while a signal is open.
            </p>
          </PopoverContent>
        </Popover>
      </div>
    </Specimen>
  );
}

function ProgressSpecimen() {
  return (
    <Specimen title="Progress" note="halo for neutral work, positive for healthy rates, ember for capacity moments">
      <div className="space-y-5">
        {(
          [
            { tone: "halo", label: "Report generation", value: 72 },
            { tone: "positive", label: "Automation success", value: 98 },
            { tone: "ember", label: "Plan usage", value: 45 },
          ] as const
        ).map((row) => (
          <div key={row.tone}>
            <div className="mb-1.5 flex items-baseline justify-between">
              <span className="text-xs text-ink-secondary">{row.label}</span>
              <span className="tabular text-xs text-ink-muted">{row.value}%</span>
            </div>
            <Progress value={row.value} tone={row.tone} aria-label={row.label} />
          </div>
        ))}
      </div>
    </Specimen>
  );
}

function IdentitySpecimen() {
  const members = getMembers().slice(0, 4);
  return (
    <Specimen title="Avatars, Kbd & Spinner" note="avatar hue is deterministic per name — the same member looks identical everywhere">
      <div className="space-y-5">
        <div className="flex flex-wrap items-end gap-4">
          {members.map((m, i) => {
            const size = (["xs", "sm", "md", "lg"] as const)[i] ?? "md";
            return (
              <div key={m.id} className="flex flex-col items-center gap-1.5">
                <Avatar name={m.name} size={size} />
                <span className="text-2xs text-ink-muted">{size}</span>
              </div>
            );
          })}
        </div>
        <Separator />
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-ink-secondary">
          <span className="inline-flex items-center gap-1.5">
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
            Command palette
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Kbd>G</Kbd>
            <span className="text-ink-faint">then</span>
            <Kbd>S</Kbd>
            Go to signals
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Kbd>Esc</Kbd>
            Dismiss
          </span>
        </div>
        <Separator />
        <div className="flex items-center gap-4">
          <Spinner className="size-4" />
          <Spinner className="size-5" />
          <Spinner className="size-6 text-ink-muted" />
          <span className="text-xs text-ink-muted">
            Spinner — inline waits under 400 ms need no indicator at all
          </span>
        </div>
      </div>
    </Specimen>
  );
}

/* ────────────────────────────────────────────────────────────────
   Section 8 — Feedback & states
   ──────────────────────────────────────────────────────────────── */

export function FeedbackStates() {
  const [saving, setSaving] = React.useState(false);

  const simulateSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Preferences saved", {
        description: "Digest schedule updated for Northwind Systems.",
      });
    }, 1200);
  };

  return (
    <DsSection
      id="feedback"
      label="08 — Feedback"
      title="Feedback & states"
      description="Loading, empty, error and confirmation patterns. Skeletons mirror the exact layout they replace; toasts confirm mutations; error states always offer a way forward."
    >
      <Specimen title="Skeleton — KPI row" note="shimmer runs on the raised surface; shapes match the loaded layout 1:1">
        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="surface-card rounded-lg p-5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="mt-4 h-7 w-16" />
              <Skeleton className="mt-4 h-2 w-full" />
            </div>
          ))}
        </div>
      </Specimen>

      <div className="grid gap-6 lg:grid-cols-2">
        <Specimen title="Empty state" note="dashed border, quiet halo, one clear action" bodyClassName="p-5">
          <EmptyState
            icon={Inbox}
            title="No signals match this filter"
            description="Widen the severity range or clear the source filter to see the full queue."
            action={<Button variant="secondary">Clear filters</Button>}
          />
        </Specimen>
        <Specimen title="Error state" note="critical tint at 4% — never a red wall" bodyClassName="p-5">
          <ErrorState
            description="The signals service did not respond within 10 seconds. Your data is safe; this view will recover on retry."
            action={
              <Button
                variant="secondary"
                onClick={() =>
                  toast.info("Retrying", { description: "Reconnecting to the signals service." })
                }
              >
                <RefreshCw aria-hidden />
                Retry
              </Button>
            }
          />
        </Specimen>
      </div>

      <Specimen title="Toasts & loading button" note="toasts confirm every mutation; the button holds its width while loading">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            onClick={() =>
              toast.success("Automation enabled", {
                description: "Pager escalation runs on the next matching signal.",
              })
            }
          >
            Success toast
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              toast.error("Report generation failed", {
                description: "The reporting service timed out. Retry from Reports.",
              })
            }
          >
            Error toast
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              toast.info("Signal reassigned", {
                description: "SIG-1043 is now owned by Priya Sharma.",
              })
            }
          >
            Info toast
          </Button>
          <Separator orientation="vertical" className="h-5" />
          <Button loading={saving} onClick={simulateSave}>
            {saving ? "Saving" : "Save preferences"}
          </Button>
          <span className="inline-flex items-center gap-1.5 text-xs text-ink-muted">
            <Info aria-hidden className="size-3.5" />
            Simulated 1.2 s round trip
          </span>
        </div>
      </Specimen>
    </DsSection>
  );
}

/* ────────────────────────────────────────────────────────────────
   Section 9 — Charts
   ──────────────────────────────────────────────────────────────── */

export function ChartsSection() {
  const series = getDailySeries()
    .slice(-14)
    .map((d) => ({
      date: formatDate(d.date),
      detected: d.detected,
      resolved: d.resolved,
    }));

  return (
    <DsSection
      id="charts"
      label="09 — Charts"
      title="Charts"
      description="Recharts with one shared recipe: quiet horizontal grid, small muted ticks, overlay-colored tooltip, series drawn in the four canonical hues. Gradient fills get a unique id per chart."
    >
      <Specimen title="Area — signals detected vs. resolved, last 14 days" note="halo #5ECFE3 for detected, positive #63d39e for resolved">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="ds-detected-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5ECFE3" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#5ECFE3" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ds-resolved-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#63d39e" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#63d39e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgb(154 170 207 / 0.07)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: "#626e85", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                minTickGap={24}
              />
              <YAxis
                tick={{ fill: "#626e85", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <RechartsTooltip
                contentStyle={{
                  background: "#1b2130",
                  border: "1px solid rgb(154 170 207 / 0.2)",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "#e9edf5",
                }}
              />
              <Area
                type="monotone"
                dataKey="detected"
                name="Detected"
                stroke="#5ECFE3"
                strokeWidth={1.5}
                fill="url(#ds-detected-fill)"
              />
              <Area
                type="monotone"
                dataKey="resolved"
                name="Resolved"
                stroke="#63d39e"
                strokeWidth={1.5}
                fill="url(#ds-resolved-fill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 rounded-md border border-edge bg-void/40 p-4">
          <p className="text-label mb-2">Recipe</p>
          <ul className="space-y-1 font-mono text-2xs leading-relaxed text-ink-secondary">
            <li>{'<CartesianGrid stroke="rgb(154 170 207 / 0.07)" vertical={false} />'}</li>
            <li>{'ticks: { fill: "#626e85", fontSize: 10 } · tickLine={false} axisLine={false}'}</li>
            <li>{'tooltip: bg #1b2130 · border rgb(154 170 207 / 0.2) · radius 8 · text #e9edf5'}</li>
            <li>{"series: halo #5ECFE3 · positive #63d39e · ember #EEBC6F · critical #ef8395"}</li>
            <li>{'wrap: <div className="h-64"> + <ResponsiveContainer width="100%" height="100%">'}</li>
            <li>{"gradient fills: <defs><linearGradient> with a UNIQUE id per chart"}</li>
          </ul>
        </div>
      </Specimen>
    </DsSection>
  );
}
