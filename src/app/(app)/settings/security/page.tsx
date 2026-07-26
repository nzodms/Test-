"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Laptop, Smartphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import { Field } from "@/components/ui/label";
import {
  SettingRow,
  SettingsSection,
  useSimulatedSave,
} from "@/components/settings/section";
import { usePersistentState } from "@/hooks/use-persistent-state";

const passwordSchema = z
  .object({
    current: z.string().min(1, "Enter your current password."),
    next: z
      .string()
      .min(8, "At least 8 characters.")
      .regex(/\d/, "Include at least one number."),
    confirm: z.string(),
  })
  .refine((values) => values.next === values.confirm, {
    path: ["confirm"],
    message: "Passwords do not match.",
  });

type PasswordValues = z.infer<typeof passwordSchema>;

export default function SecuritySettingsPage() {
  /* ── Change password ─────────────────────────────────────────── */
  const [savingPassword, runPasswordSave] = useSimulatedSave();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { current: "", next: "", confirm: "" },
  });

  const onPasswordSubmit = () => {
    runPasswordSave(() => {
      reset();
      toast.success("Password updated");
    });
  };

  /* ── Two-factor ──────────────────────────────────────────────── */
  const [twoFactorEnabled, setTwoFactorEnabled] = usePersistentState(
    "settings:two-factor",
    false
  );
  const [setupOpen, setSetupOpen] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [codeError, setCodeError] = React.useState<string | undefined>();
  const [verifying, runVerify] = useSimulatedSave();
  const [disabling, runDisable] = useSimulatedSave();

  const confirmTwoFactor = () => {
    if (!/^\d{6}$/.test(code)) {
      setCodeError("Enter the 6-digit code from your authenticator app.");
      return;
    }
    setCodeError(undefined);
    runVerify(() => {
      setTwoFactorEnabled(true);
      setSetupOpen(false);
      setCode("");
      toast.success("Two-factor authentication enabled");
    });
  };

  const disableTwoFactor = () => {
    runDisable(() => {
      setTwoFactorEnabled(false);
      toast.success("Two-factor authentication turned off");
    });
  };

  /* ── Sessions ────────────────────────────────────────────────── */
  const [signingOut, runSignOut] = useSimulatedSave();
  const signOutOthers = () => {
    runSignOut(() => {
      toast.success("Signed out of 1 other session");
    });
  };

  return (
    <div className="space-y-6">
      <SettingsSection
        title="Change password"
        description="Use at least 8 characters with a number. Avoid passwords you use elsewhere."
        footer={
          <>
            <p className="mr-auto text-xs text-ink-faint">
              Demo — nothing is stored.
            </p>
            <Button
              type="submit"
              form="password-form"
              size="sm"
              loading={savingPassword}
            >
              Update password
            </Button>
          </>
        }
      >
        <form
          id="password-form"
          onSubmit={handleSubmit(onPasswordSubmit)}
          className="max-w-md space-y-4"
          noValidate
        >
          <Field
            label="Current password"
            htmlFor="password-current"
            error={errors.current?.message}
          >
            <Input
              id="password-current"
              type="password"
              autoComplete="current-password"
              aria-invalid={errors.current ? true : undefined}
              {...register("current")}
            />
          </Field>
          <Field
            label="New password"
            htmlFor="password-next"
            error={errors.next?.message}
            hint="Min 8 characters, 1 number"
          >
            <Input
              id="password-next"
              type="password"
              autoComplete="new-password"
              aria-invalid={errors.next ? true : undefined}
              {...register("next")}
            />
          </Field>
          <Field
            label="Confirm new password"
            htmlFor="password-confirm"
            error={errors.confirm?.message}
          >
            <Input
              id="password-confirm"
              type="password"
              autoComplete="new-password"
              aria-invalid={errors.confirm ? true : undefined}
              {...register("confirm")}
            />
          </Field>
        </form>
      </SettingsSection>

      <SettingsSection
        title="Two-factor authentication"
        description="A second step at sign-in keeps the workspace safe even if a password leaks."
      >
        <SettingRow
          label="Authenticator app"
          description="Time-based one-time codes from an app such as 1Password or Google Authenticator."
          control={
            <div className="flex items-center gap-3">
              {twoFactorEnabled ? (
                <>
                  <Badge variant="positive" dot>
                    Enabled
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    loading={disabling}
                    onClick={disableTwoFactor}
                  >
                    Disable
                  </Button>
                </>
              ) : (
                <>
                  <Badge variant="outline">Not enabled</Badge>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setCode("");
                      setCodeError(undefined);
                      setSetupOpen(true);
                    }}
                  >
                    Set up
                  </Button>
                </>
              )}
            </div>
          }
        />
      </SettingsSection>

      <Dialog open={setupOpen} onOpenChange={setSetupOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set up two-factor authentication</DialogTitle>
            <DialogDescription>
              Scan the code with your authenticator app, then enter the
              6-digit code it shows.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="surface-well mx-auto flex size-40 flex-col items-center justify-center gap-2 rounded-md">
              <Kbd className="h-auto px-2 py-1 text-xs tracking-wider">
                HALO-7F2K-Q9TR
              </Kbd>
              <p className="px-4 text-center text-2xs text-ink-faint">
                Manual entry code — QR is simulated in demo
              </p>
            </div>

            <Field
              label="Verification code"
              htmlFor="totp-code"
              error={codeError}
            >
              <Input
                id="totp-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(event) =>
                  setCode(event.target.value.replace(/\D/g, ""))
                }
                aria-invalid={codeError ? true : undefined}
                className="text-center font-mono tracking-[0.4em]"
              />
            </Field>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost" size="sm">
                Cancel
              </Button>
            </DialogClose>
            <Button size="sm" loading={verifying} onClick={confirmTwoFactor}>
              Enable two-factor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SettingsSection
        title="Active sessions"
        description="Devices currently signed in to your account."
        footer={
          <Button
            variant="outline"
            size="sm"
            loading={signingOut}
            onClick={signOutOthers}
          >
            Sign out all other sessions
          </Button>
        }
      >
        <ul className="divide-y divide-edge-faint">
          <li className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-edge bg-void/40">
                <Laptop className="size-4 text-ink-muted" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">
                  This device
                </p>
                <p className="text-[13px] text-ink-muted">Berlin, DE · now</p>
              </div>
            </div>
            <Badge variant="positive" dot>
              Current
            </Badge>
          </li>
          <li className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-edge bg-void/40">
                <Smartphone className="size-4 text-ink-muted" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">
                  Safari · iPhone
                </p>
                <p className="text-[13px] text-ink-muted">Berlin, DE · 2d ago</p>
              </div>
            </div>
            <span className="text-xs text-ink-faint">Last active 2d ago</span>
          </li>
        </ul>
      </SettingsSection>
    </div>
  );
}
