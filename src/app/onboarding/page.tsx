import * as React from "react";
import type { Metadata } from "next";
import { OnboardingFlow } from "@/components/onboarding/flow";
import { brand } from "@/config/brand";
import { copy } from "@/config/product";

export const metadata: Metadata = {
  title: copy.onboarding.title,
  description: brand.description,
  robots: { index: false, follow: false },
};

export default function OnboardingPage() {
  return (
    <React.Suspense fallback={null}>
      <OnboardingFlow />
    </React.Suspense>
  );
}
