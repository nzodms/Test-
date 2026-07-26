import { Check, Minus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ROLE_COLUMNS = ["owner", "admin", "member", "viewer"] as const;
type RoleColumn = (typeof ROLE_COLUMNS)[number];

const ROLE_HEADING: Record<RoleColumn, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
  viewer: "Viewer",
};

interface Capability {
  label: string;
  owner: boolean;
  admin: boolean;
  member: boolean;
  viewer: boolean;
}

/** Static mirror of what each role can actually do in Halo. */
const CAPABILITIES: Capability[] = [
  { label: "View signals", owner: true, admin: true, member: true, viewer: true },
  { label: "Triage & assign", owner: true, admin: true, member: true, viewer: false },
  { label: "Manage automations", owner: true, admin: true, member: false, viewer: false },
  { label: "Manage members", owner: true, admin: true, member: false, viewer: false },
  { label: "Billing & plan", owner: true, admin: false, member: false, viewer: false },
  { label: "Delete workspace", owner: true, admin: false, member: false, viewer: false },
];

/**
 * Informative roles matrix — read-only reference so nobody has to
 * guess what an invitation grants before sending it.
 */
export function PermissionsMatrix() {
  return (
    <section className="surface-card overflow-hidden">
      <div className="border-b border-edge px-4 py-3 sm:px-5">
        <h2 className="text-label">Roles overview</h2>
        <p className="mt-1 text-xs text-ink-muted">
          What each role can do across the workspace.
        </p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Capability</TableHead>
            {ROLE_COLUMNS.map((role) => (
              <TableHead key={role} className="text-center">
                {ROLE_HEADING[role]}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {CAPABILITIES.map((capability) => (
            <TableRow key={capability.label}>
              <TableCell className="whitespace-nowrap text-[13px] text-ink-secondary">
                {capability.label}
              </TableCell>
              {ROLE_COLUMNS.map((role) => (
                <TableCell key={role} className="text-center">
                  <span className="inline-flex items-center justify-center">
                    {capability[role] ? (
                      <>
                        <Check className="size-3.5 text-halo-400" aria-hidden />
                        <span className="sr-only">Allowed</span>
                      </>
                    ) : (
                      <>
                        <Minus className="size-3.5 text-ink-faint" aria-hidden />
                        <span className="sr-only">Not allowed</span>
                      </>
                    )}
                  </span>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <p className="border-t border-edge-faint px-4 py-3 text-xs text-ink-muted sm:px-5">
        Ownership is held by one person at a time. Transfer it from the danger
        zone in workspace settings.
      </p>
    </section>
  );
}
