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

/**
 * The intake — the first page of an empty file.
 *
 * There is no hero here. A file opens with its subject line and the
 * field that identifies the subject; everything else is the standing
 * conditions under which the search runs.
 */
export function FileIntake({
  onOpen,
}: {
  onOpen: (username: string, platform: Platform | null, raw: string) => void;
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
    onOpen(result.value.username, result.value.platform, result.value.raw);
  };

  const enter = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 8 },
          animate: { opacity: 1, y: 0 },
          transition: {
            duration: motionTokens.duration.slow,
            delay,
            ease: motionTokens.ease.enter,
          },
        };

  return (
    <div className="max-w-[560px]">
      <motion.h1
        {...enter(0)}
        className="text-report text-[34px] text-ink sm:text-[40px]"
      >
        Search a public creator profile
      </motion.h1>

      <motion.form
        {...enter(0.06)}
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="mt-8"
      >
        {/* A field ruled like a form line, not boxed like a widget */}
        <div
          className={cn(
            "flex items-center gap-3 border-b pb-2.5 transition-colors",
            error ? "border-crit/50" : "border-ink/25 focus-within:border-ink"
          )}
        >
          <span
            aria-hidden
            className="shrink-0 font-mono text-[15px] text-ink-faint"
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
            className="min-w-0 flex-1 bg-transparent text-[19px] text-ink outline-none placeholder:text-ink-faint sm:text-[20px]"
          />

          <div className="hidden shrink-0 sm:block">
            <Select
              value={platform}
              onValueChange={(v) => setPlatform(v as Platform | "any")}
            >
              <SelectTrigger
                aria-label={copy.landing.platformLabel}
                className="h-9 w-[132px] border-0 bg-transparent px-2 text-[14px] shadow-none focus:shadow-none"
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
            aria-label="Open scan"
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-ink text-page transition-transform duration-200 hover:scale-[1.04] active:scale-95 sm:size-10"
          >
            <ArrowRight className="size-4.5" aria-hidden />
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between gap-4">
          <p
            className={cn("text-[14px]", error ? "text-crit" : "text-ink-soft")}
            role={error ? "alert" : undefined}
          >
            {error ?? "Public sources only"}
          </p>
          <button
            type="button"
            onClick={() => onOpen("grn.louann", "onlyfans", "grn.louann")}
            className="shrink-0 text-[14px] text-ink-soft underline decoration-edge-strong underline-offset-[3px] transition-colors hover:text-accent"
          >
            Open a sample file
          </button>
        </div>
      </motion.form>

      <motion.dl {...enter(0.14)} className="mt-14 max-w-sm">
        {[
          ["Scope", "Indexed public sources only"],
          ["Detail", "Sensitive details protected"],
          ["Access", "Ownership verification required"],
        ].map(([term, def]) => (
          <div
            key={term}
            className="flex items-baseline gap-6 border-t border-edge py-2.5"
          >
            <dt className="w-16 shrink-0 font-mono text-[12.5px] text-ink-faint">
              {term}
            </dt>
            <dd className="text-[14.5px] text-ink-soft">{def}</dd>
          </div>
        ))}
      </motion.dl>
    </div>
  );
}
