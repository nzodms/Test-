"use client";

import * as React from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/states";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Surface the real error for debugging without crashing the UI.
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh items-center justify-center px-6">
      <div className="w-full max-w-md">
        <ErrorState
          title="Something went wrong"
          description="An unexpected error interrupted this view. Your data is safe — try again, and if it persists the error has been logged."
          action={
            <Button onClick={reset}>
              <RotateCcw aria-hidden />
              Try again
            </Button>
          }
        />
      </div>
    </div>
  );
}
