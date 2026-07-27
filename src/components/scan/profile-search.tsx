"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { copy } from "@/config/product";
import { parseSearchQuery, platformLabels, type Platform } from "@/lib/validation";
import { motionTokens } from "@/lib/motion";
import { cn } from "@/lib/utils";

const CONDITIONS: Array<[string, string]> = [
  ["Public sources only", "Indexed pages, forums, mirrors, public channels and archives."],
  ["Sensitive details protected", "Exact addresses and evidence are withheld until you verify."],
  ["Ownership verification required", "Only the profile owner can open the full report."],
];

/**
 * ProfileSearch — the first thing on the page and the only thing
 * asked for.
 *
 * There is no headline above it doing marketing work: one short line
 * says what the product does, the field says what to do, and three
 * conditions say what it will and will not touch. Everything else
 * about Argus is learned by watching it run.
 */
export function ProfileSearch({
  onScan,
}: {
  onScan: (username: string, platform: Platform | null, raw: string) => void;
}) {
  const reduced = useReducedMotion();
  const [value, setValue] = React.useState("");
  const [platform, setPlatform] = React.useState<Platform | "any">("any");
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!inputRef.current) return;
    if (window.matchMedia("(min-width: 768px)").matches) {
      inputRef.current.focus();
    }
  }, []);

  const submit = () => {
    const result = parseSearchQuery(value, platform === "any" ? null : platform);
    if (!result.ok) {
      setError(copy.landing.errors[result.error]);
      inputRef.current?.focus();
      return;
    }
    setError(null);
    onScan(result.value.username, result.value.platform, result.value.raw);
  };

  const enter = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          transition: {
            duration: motionTokens.duration.slow,
            delay,
            ease: motionTokens.ease.enter,
          },
        };

  /* Deliberately asymmetric: the search holds the left of the measure
     and the scope sits in the margin beside it. A centred box under a
     centred line is the shape of every search-first template. */
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_248px] lg:gap-16">
      <div className="min-w-0 max-w-[620px]">
      <motion.p
        {...enter(0)}
        className="text-title text-[21px] text-ink sm:text-[24px]"
      >
        Find where your content has resurfaced.
      </motion.p>

      <motion.form
        {...enter(0.05)}
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="mt-7"
      >
        <div
          className={cn(
            "flex items-center gap-3 rounded-[8px] border bg-page pl-4 pr-2 transition-[border-color,box-shadow] duration-150",
            "h-[60px] sm:h-[64px]",
            error
              ? "border-crit/55"
              : "border-edge-strong focus-within:border-ink/45 focus-within:shadow-[0_1px_2px_rgb(22_23_26/0.05),0_8px_24px_-16px_rgb(22_23_26/0.28)]"
          )}
        >
          <span
            aria-hidden
            className="shrink-0 font-mono text-[16px] text-ink-faint"
          >
            @
          </span>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (error) setError(null);
            }}
            placeholder="username or profile URL"
            aria-label={copy.landing.searchAria}
            aria-invalid={Boolean(error)}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            className="min-w-0 flex-1 bg-transparent text-[18px] text-ink outline-none placeholder:text-ink-faint sm:text-[19px]"
          />

          <div className="hidden shrink-0 sm:block">
            <Select
              value={platform}
              onValueChange={(v) => setPlatform(v as Platform | "any")}
            >
              <SelectTrigger
                aria-label={copy.landing.platformLabel}
                className="h-10 w-[136px] border-0 bg-transparent px-2 text-[14px] shadow-none focus:shadow-none"
              >
                <SelectValue placeholder={copy.landing.platformAny} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">{copy.landing.platformAny}</SelectItem>
                {(Object.keys(platformLabels) as Platform[]).map((p) => (
                  <SelectItem key={p} value={p}>
                    {platformLabels[p]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <button
            type="submit"
            aria-label="Run public profile scan"
            className="flex size-12 shrink-0 items-center justify-center rounded-[6px] bg-ink text-page transition-[transform,background-color] duration-150 hover:bg-graphite active:scale-95 sm:size-11"
          >
            <ArrowRight className="size-[18px]" aria-hidden />
          </button>
        </div>

        {/* A phone has no room for the platform control inside the
            field, but it must not lose the capability either. */}
        <div className="mt-3 sm:hidden">
          <Select
            value={platform}
            onValueChange={(v) => setPlatform(v as Platform | "any")}
          >
            <SelectTrigger
              aria-label={copy.landing.platformLabel}
              className="h-12 w-full text-[15px]"
            >
              <SelectValue placeholder={copy.landing.platformAny} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">{copy.landing.platformAny}</SelectItem>
              {(Object.keys(platformLabels) as Platform[]).map((p) => (
                <SelectItem key={p} value={p}>
                  {platformLabels[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {error ? (
          <p role="alert" className="mt-4 text-[14px] text-crit">
            {error}
          </p>
        ) : null}
      </motion.form>

      <motion.p {...enter(0.12)} className="mt-6 text-[14.5px] text-ink-soft">
        Not your profile yet?{" "}
        <button
          type="button"
          onClick={() => onScan("grn.louann", "onlyfans", "grn.louann")}
          className="text-ink underline decoration-edge-strong underline-offset-[4px] transition-colors hover:decoration-ink"
        >
          Run a sample scan
        </button>{" "}
        against a demonstration dataset to see exactly what Argus produces.
      </motion.p>
      </div>

      {/* The terms of the search, in the margin */}
      <motion.dl {...enter(0.18)} className="min-w-0 lg:pt-1">
        <div className="mb-1 hidden lg:block">
          <span className="block h-px w-full bg-ink/20" />
        </div>
        {CONDITIONS.map(([term, def]) => (
          <div key={term} className="border-t border-edge py-3 lg:first:border-t-0">
            <dt className="text-[14.5px] text-ink">{term}</dt>
            <dd className="mt-1 text-[13.5px] leading-relaxed text-ink-soft">
              {def}
            </dd>
          </div>
        ))}
      </motion.dl>
    </div>
  );
}
