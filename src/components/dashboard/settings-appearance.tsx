import { Badge } from "@/components/ui/badge";
import { copy } from "@/config/product";

const text = {
  light: "Porcelain workspace",
  lightBody:
    "The only theme Argus ships today. The scanning surface stays dark by design; everything around it stays light.",
  inUse: "In use",
  dark: "Dark workspace theme",
  darkBody:
    "A full dark environment is on the roadmap. It is not available yet, so there is nothing to switch.",
  planned: copy.onboarding.steps.notifications.planned,
} as const;

/**
 * Stated plainly rather than dressed up as a control: a toggle that
 * changes nothing would be worse than no toggle at all.
 */
export function SettingsAppearance() {
  return (
    <div className="surface-mineral rounded-lg px-4 py-1 sm:px-5">
      <div className="flex items-start justify-between gap-4 border-b border-edge py-4">
        <div className="min-w-0">
          <p className="text-[14px] font-medium text-ink">{text.light}</p>
          <p className="mt-0.5 max-w-[52ch] text-[13px] leading-relaxed text-ink-soft">
            {text.lightBody}
          </p>
        </div>
        <Badge variant="neutral" className="mt-0.5 shrink-0">
          {text.inUse}
        </Badge>
      </div>

      <div className="flex items-start justify-between gap-4 py-4">
        <div className="min-w-0">
          <p className="text-[14px] font-medium text-ink-soft">{text.dark}</p>
          <p className="mt-0.5 max-w-[52ch] text-[13px] leading-relaxed text-ink-soft">
            {text.darkBody}
          </p>
        </div>
        <Badge variant="outline" className="mt-0.5 shrink-0">
          {text.planned}
        </Badge>
      </div>
    </div>
  );
}
