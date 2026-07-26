"use client";

import * as React from "react";
import { FileOutput } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Report } from "@/lib/data";

export type ReportType = "weekly" | "risk" | "roi";
export type ReportPeriodChoice = "this-week" | "last-week" | "this-month";

export interface GenerateReportInput {
  type: ReportType;
  period: ReportPeriodChoice;
  format: Report["format"];
}

const TYPE_OPTIONS: { value: ReportType; label: string }[] = [
  { value: "weekly", label: "Weekly operations review" },
  { value: "risk", label: "Risk assessment" },
  { value: "roi", label: "Automation ROI" },
];

const PERIOD_OPTIONS: { value: ReportPeriodChoice; label: string }[] = [
  { value: "this-week", label: "This week" },
  { value: "last-week", label: "Last week" },
  { value: "this-month", label: "This month" },
];

const FORMAT_OPTIONS: Report["format"][] = ["PDF", "CSV"];

/**
 * "Generate report" dialog — three deterministic choices, no free
 * text. Submitting hands the selection to the page, which owns the
 * simulated compilation lifecycle.
 */
export function GenerateReportDialog({
  open,
  onOpenChange,
  onGenerate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (input: GenerateReportInput) => void;
}) {
  const [type, setType] = React.useState<ReportType>("weekly");
  const [period, setPeriod] = React.useState<ReportPeriodChoice>("this-week");
  const [format, setFormat] = React.useState<Report["format"]>("PDF");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onGenerate({ type, period, format });
    // Reset for the next open — each generation starts from defaults.
    setType("weekly");
    setPeriod("this-week");
    setFormat("PDF");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate report</DialogTitle>
          <DialogDescription>
            Compiled from live workspace data — signals, automations and
            response metrics for the selected period.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Report type" htmlFor="report-type">
            <Select
              value={type}
              onValueChange={(v) => setType(v as ReportType)}
            >
              <SelectTrigger id="report-type" aria-label="Report type">
                <SelectValue placeholder="Select a report type" />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Period" htmlFor="report-period">
            <Select
              value={period}
              onValueChange={(v) => setPeriod(v as ReportPeriodChoice)}
            >
              <SelectTrigger id="report-period" aria-label="Report period">
                <SelectValue placeholder="Select a period" />
              </SelectTrigger>
              <SelectContent>
                {PERIOD_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field
            label="Format"
            htmlFor="report-format"
            hint="PDF for reviews, CSV for raw rows"
          >
            <Select
              value={format}
              onValueChange={(v) => setFormat(v as Report["format"])}
            >
              <SelectTrigger id="report-format" aria-label="Report format">
                <SelectValue placeholder="Select a format" />
              </SelectTrigger>
              <SelectContent>
                {FORMAT_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">
              <FileOutput aria-hidden />
              Generate
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
