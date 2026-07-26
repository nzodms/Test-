import type { ScanEvent } from "./types";
import { sourceCoverage, featuredMatches } from "@/lib/demo/scan-data";

/**
 * The scan choreography as a single ordered event stream. One
 * controller consumes this — no scattered setTimeouts in components.
 * A real backend could emit the same ScanEvent shape to drive the
 * identical UI.
 *
 * Total runtime ≈ 10.5s. Phase windows follow the brief:
 *   0–600   validation + scanner opens
 *   600–1600 identity resolution
 *   1600–3000 source coverage builds
 *   3000–5000 first matches appear
 *   5000–7500 KPIs count
 *   7500–9500 report assembles
 *   9500–10500 complete → locked
 */

let seq = 0;
function ev(
  e: Omit<ScanEvent, "id" | "status"> & { status?: ScanEvent["status"] }
): ScanEvent {
  seq += 1;
  return { id: `ev-${seq}`, status: e.status ?? "complete", ...e };
}

export function buildScanTimeline(username: string): ScanEvent[] {
  seq = 0;
  const events: ScanEvent[] = [];

  // 0–600 — initializing
  events.push(ev({ phase: "initializing", at: 120, label: `Validating “${username}”` }));
  events.push(ev({ phase: "initializing", at: 420, label: "Initializing scan session" }));

  // 600–1600 — identity
  events.push(ev({ phase: "identity", at: 720, label: "Resolving public identity" }));
  events.push(ev({ phase: "identity", at: 1080, label: "Checking connected profiles" }));
  events.push(ev({ phase: "identity", at: 1420, label: "Matching username variants" }));

  // 1600–3000 — sources (registry entries per coverage line)
  let t = 1720;
  for (const src of sourceCoverage) {
    events.push(
      ev({
        phase: "sources",
        at: t,
        label: `Opening ${src.label.toLowerCase()}`,
        payload: { source: src.kind },
      })
    );
    t += 260;
  }

  // 3000–5000 — matches (the 8 featured, staggered)
  let mt = 3120;
  featuredMatches.forEach((m, i) => {
    events.push(
      ev({
        phase: "matching",
        at: mt,
        status: m.confidence === "high" ? "warning" : "active",
        label: `Match on ${m.domainMasked}`,
        payload: { matchIndex: i },
      })
    );
    mt += 230;
  });

  // 5000–7500 — analysis (KPIs count in this window; registry notes)
  events.push(ev({ phase: "analysis", at: 5200, label: "Scoring match confidence" }));
  events.push(ev({ phase: "analysis", at: 6100, label: "Estimating exposure level", status: "warning" }));
  events.push(ev({ phase: "analysis", at: 7000, label: "Correlating recurrences" }));

  // 7500–9500 — assembling
  events.push(ev({ phase: "assembling", at: 7700, label: "Assembling activity timeline" }));
  events.push(ev({ phase: "assembling", at: 8500, label: "Compiling source breakdown" }));
  events.push(ev({ phase: "assembling", at: 9200, label: "Finalizing report" }));

  // 9500–10500 — complete → locked
  events.push(ev({ phase: "complete", at: 9800, label: "Scan complete" }));
  events.push(ev({ phase: "locked", at: 10400, label: "Locking sensitive details", status: "warning" }));

  return events;
}

export const SCAN_DURATION_MS = 10600;
