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

const CONDITIONS = [
  "Public sources only",
  "Sensitive details protected",
  "Ownership verification required",
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

  return (
    <div className="max-w-[620px]">
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

        <div className="mt-4">
          {error ? (
            <p role="alert" className="text-[14px] text-crit">
              {error}
            </p>
          ) : (
            <ul className="flex flex-wrap gap-x-6 gap-y-1.5">
              {CONDITIONS.map((c) => (
                <li key={c} className="text-[13.5px] text-ink-soft">
                  {c}
                </li>
              ))}
            </ul>
          )}
        </div>
      </motion.form>

      <motion.div {...enter(0.12)} className="mt-8 border-t border-edge pt-5">
        <p className="text-[14.5px] text-ink-soft">
          Not your profile yet?{" "}
          <button
            type="button"
            onClick={() => onScan("grn.louann", "onlyfans", "grn.louann")}
            className="text-ink underline decoration-edge-strong underline-offset-[4px] transition-colors hover:decoration-ink"
          >
            Run a sample scan
          </button>{" "}
          against a demonstration dataset to see exactly what Argus produces.
        </p>
      </motion.div>
    </div>
  );
}
