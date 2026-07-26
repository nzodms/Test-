import { Reveal } from "@/components/halo/reveal";

const customers = [
  "VELTRIX",
  "Atlas Freight",
  "Meridian Group",
  "Oakline",
  "Kestrel & Co",
  "Solvant",
];

const stats = [
  { value: "4.2B", label: "events processed monthly" },
  { value: "38 min", label: "median time-to-detection" },
  { value: "99.98%", label: "platform uptime, trailing year" },
  { value: "12,400", label: "operators rely on Halo" },
];

export function TrustBand() {
  return (
    <section aria-label="Customers and platform metrics" className="border-y border-edge bg-void/30">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <Reveal>
          <p className="text-center text-[13px] text-ink-muted">
            Operations teams run on Halo at
          </p>
          <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {customers.map((name, i) => (
              <li
                key={name}
                className={
                  i % 2 === 0
                    ? "font-mono text-sm tracking-[0.18em] text-ink-muted"
                    : "text-[15px] font-medium tracking-tight text-ink-muted"
                }
              >
                {name}
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={0.1}>
          <dl className="mt-12 grid grid-cols-2 gap-6 border-t border-edge pt-10 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <dt className="sr-only">{s.label}</dt>
                <dd className="tabular text-2xl font-medium tracking-tight text-ink sm:text-3xl">
                  {s.value}
                </dd>
                <dd className="mt-1.5 text-[13px] leading-snug text-ink-muted">
                  {s.label}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
