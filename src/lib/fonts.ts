import { Instrument_Sans } from "next/font/google";
import { GeistMono } from "geist/font/mono";

/**
 * Instrument Sans carries the interface voice; Geist Mono carries
 * technical data (domains, timestamps, statuses). Both are served
 * through next/font — no external font requests at runtime.
 */
export const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  weight: ["400", "500", "600"],
  display: "swap",
});

export const geistMono = GeistMono;
