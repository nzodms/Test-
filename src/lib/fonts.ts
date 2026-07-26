import { Instrument_Sans, Instrument_Serif } from "next/font/google";
import { GeistMono } from "geist/font/mono";

/**
 * Three voices, each with one job.
 *
 * Instrument Sans carries the interface. Instrument Serif — its
 * direct companion, drawn in 2023, high contrast and unmistakably
 * contemporary — is reserved for report titles and the file cover.
 * Geist Mono carries references: case numbers, timestamps, domains.
 *
 * The serif is what keeps the file from reading as another B2B
 * dashboard. It appears rarely, and never in the interface chrome.
 */
export const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  weight: ["400", "500", "600"],
  display: "swap",
});

export const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

export const geistMono = GeistMono;
