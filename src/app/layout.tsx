import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { instrumentSans, instrumentSerif, geistMono } from "@/lib/fonts";
import { brand } from "@/config/brand";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${brand.name} — ${brand.purpose}`,
    template: `%s · ${brand.name}`,
  },
  description: brand.description,
  openGraph: {
    type: "website",
    siteName: brand.name,
    title: `${brand.name} — ${brand.purpose}`,
    description: brand.description,
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: `${brand.name} — ${brand.purpose}`,
    description: brand.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#f3f1eb",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${instrumentSans.variable} ${instrumentSerif.variable} ${geistMono.variable}`}
    >
      <body className="min-h-dvh bg-canvas text-ink antialiased">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "var(--color-paper)",
              border: "1px solid var(--color-edge)",
              color: "var(--color-ink)",
              boxShadow: "var(--shadow-float)",
            },
          }}
        />
      </body>
    </html>
  );
}
