import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Toaster } from "sonner";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Halo — Operational intelligence for modern teams",
    template: "%s · Halo",
  },
  description:
    "Halo centralizes your company's signals, risks, opportunities and automations in one calm, precise workspace.",
  openGraph: {
    type: "website",
    siteName: "Halo",
    title: "Halo — Operational intelligence for modern teams",
    description:
      "Centralize signals, risks, opportunities and automations. See what matters before it matters.",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Halo — Operational intelligence for modern teams",
    description:
      "Centralize signals, risks, opportunities and automations. See what matters before it matters.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0b0e15",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh bg-base text-ink antialiased">
        {children}
        <Toaster
          position="bottom-right"
          theme="dark"
          toastOptions={{
            style: {
              background: "var(--color-overlay)",
              border: "1px solid var(--color-edge-strong)",
              color: "var(--color-ink)",
              boxShadow: "var(--shadow-float)",
            },
          }}
        />
      </body>
    </html>
  );
}
