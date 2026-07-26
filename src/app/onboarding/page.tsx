import * as React from "react";
import type { Metadata } from "next";
import { OnboardingFlow } from "@/components/onboarding/flow";
import { local } from "@/components/onboarding/state";
import { brand } from "@/config/brand";

export const metadata: Metadata = {
  title: local.documentTitle,
  description: brand.description,
  robots: { index: false, follow: false },
};

/**
 * Open route. Setting up a workspace never requires an account, in
 * either the plain or the ?mode=demo form.
 */
export default function OnboardingPage() {
  return (
    <React.Suspense fallback={null}>
      <OnboardingFlow />
    </React.Suspense>
  );
}
