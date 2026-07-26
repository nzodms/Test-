"use client";

import * as React from "react";
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
import { cn } from "@/lib/utils";
import { LogoMark } from "@/components/brand/logo";

/**
 * SearchField — the central instrument. Accepts username, @handle
 * or profile URL, with an optional platform hint. Submit is built
 * into the field (Enter or the inline button). Not a generic search
 * box: the reticle mark anchors it, and it validates on submit.
 */
export function SearchField({
  onScan,
  autoFocus = false,
  size = "lg",
}: {
  onScan: (username: string, platform: Platform | null, raw: string) => void;
  autoFocus?: boolean;
  size?: "lg" | "md";
}) {
  const [value, setValue] = React.useState("");
  const [platform, setPlatform] = React.useState<Platform | "any">("any");
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (autoFocus && inputRef.current) {
      // Desktop only — avoid forcing the mobile keyboard open.
      if (window.matchMedia("(min-width: 768px)").matches) {
        inputRef.current.focus();
      }
    }
  }, [autoFocus]);

  const submit = () => {
    const result = parseSearchQuery(
      value,
      platform === "any" ? null : platform
    );
    if (!result.ok) {
      setError(copy.landing.errors[result.error]);
      inputRef.current?.focus();
      return;
    }
    setError(null);
    onScan(result.value.username, result.value.platform, result.value.raw);
  };

  return (
    <div className="w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className={cn(
          "group flex items-center gap-2 rounded-lg border bg-paper pr-2 transition-shadow",
          "shadow-[0_1px_2px_rgb(17_18_16/0.05),0_16px_40px_-28px_rgb(17_18_16/0.4)]",
          error ? "border-crit/40" : "border-edge-strong",
          "focus-within:border-ink/25 focus-within:shadow-[0_0_0_3px_rgb(17_18_16/0.05),0_16px_40px_-28px_rgb(17_18_16/0.4)]",
          size === "lg" ? "h-14 pl-4" : "h-12 pl-3.5"
        )}
      >
        <LogoMark size={size === "lg" ? 22 : 20} className="shrink-0 opacity-90" />
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError(null);
          }}
          placeholder={copy.landing.searchPlaceholder}
          aria-label={copy.landing.searchAria}
          aria-invalid={Boolean(error)}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          className={cn(
            "min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-ink-faint",
            size === "lg" ? "text-[17px]" : "text-[15px]"
          )}
        />

        <div className="hidden h-7 items-center border-l border-edge pl-2 sm:flex">
          <Select
            value={platform}
            onValueChange={(v) => setPlatform(v as Platform | "any")}
          >
            <SelectTrigger
              aria-label={copy.landing.platformLabel}
              className="h-8 w-[136px] border-0 bg-transparent px-2 text-[13px] shadow-none focus:shadow-none"
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
          aria-label={copy.landing.searchAction}
          className={cn(
            "flex shrink-0 items-center justify-center rounded-md bg-ink text-paper transition-colors hover:bg-[#26281f]",
            size === "lg" ? "size-10" : "size-9"
          )}
        >
          <ArrowRight className="size-4.5" aria-hidden />
        </button>
      </form>

      <div className="mt-2 flex items-center justify-between gap-3 px-1">
        <p
          className={cn(
            "text-2xs",
            error ? "text-crit" : "text-ink-soft"
          )}
          role={error ? "alert" : undefined}
        >
          {error ?? copy.landing.publicSourcesOnly}
        </p>
        <button
          type="button"
          onClick={() => onScan("mia.also", "onlyfans", "mia.also")}
          className="shrink-0 text-2xs text-ink-soft underline decoration-edge-strong underline-offset-2 transition-colors hover:text-accent"
        >
          {copy.landing.tryDemo}
        </button>
      </div>
    </div>
  );
}
