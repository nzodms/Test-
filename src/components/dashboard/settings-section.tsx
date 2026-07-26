import * as React from "react";

/**
 * One settings block: a stated purpose on the left, the controls on
 * the right. The two-column measure keeps every section reading at
 * the same rhythm without wrapping each one in a card.
 */
export function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid min-w-0 gap-4 lg:grid-cols-[210px_minmax(0,1fr)] lg:gap-10">
      <div className="min-w-0">
        <h2 className="text-title text-[15px] text-ink">{title}</h2>
        <p className="mt-1.5 max-w-[46ch] text-[13px] leading-relaxed text-ink-soft">
          {description}
        </p>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}
