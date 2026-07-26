import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * The heading block every workspace page opens with. Measured, not
 * monumental: the title stays at reading scale and the actions sit
 * on the same line until the viewport says otherwise.
 */
export function PageIntro({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6",
        className
      )}
    >
      <div className="min-w-0">
        <h1 className="text-title text-xl text-ink sm:text-2xl">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-[64ch] text-sm leading-relaxed text-ink-soft">
            {description}
          </p>
        ) : null}
      </div>

      {actions ? (
        <div className="flex flex-wrap items-center gap-2 sm:shrink-0 sm:justify-end">
          {actions}
        </div>
      ) : null}
    </div>
  );
}

/**
 * A content group. `label` is the small uppercase marker, `title`
 * the plain-language heading — a section can use either, both, or
 * neither when the content speaks for itself.
 */
export function Section({
  title,
  label,
  description,
  actions,
  children,
  className,
  id,
}: {
  title?: string;
  label?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const hasHeading = Boolean(label ?? title ?? description ?? actions);

  return (
    <section id={id} className={cn("min-w-0", className)}>
      {hasHeading ? (
        <div className="mb-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
          <div className="min-w-0">
            {label ? <p className="text-label">{label}</p> : null}
            {title ? (
              <h2
                className={cn(
                  "text-title text-[15px] text-ink",
                  label && "mt-1.5"
                )}
              >
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="mt-1.5 max-w-[64ch] text-sm leading-relaxed text-ink-soft">
                {description}
              </p>
            ) : null}
          </div>

          {actions ? (
            <div className="flex shrink-0 items-center gap-2">{actions}</div>
          ) : null}
        </div>
      ) : null}

      {children}
    </section>
  );
}
