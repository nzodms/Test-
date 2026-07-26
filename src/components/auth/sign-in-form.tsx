"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/label";
import { copy } from "@/config/product";
import { routes } from "@/config/navigation";
import { isDemoClient, signInWithGoogle, signInWithPassword } from "@/lib/auth";

/* ────────────────────────────────────────────────────────────────
   Strings that belong to this surface only. Everything shared
   comes from @/config/product.
   ──────────────────────────────────────────────────────────────── */

const text = {
  emailLabel: "Email",
  emailPlaceholder: "you@example.com",
  passwordLabel: "Password",
  showPassword: "Show password",
  hidePassword: "Hide password",
  divider: "or",
  google: "Continue with Google",
  demoTitle: copy.onboarding.demoBadge,
  demoNote:
    "No authentication backend is configured. Any email and password opens the demo workspace, and nothing you enter here is stored.",
  fallbackError: "Sign-in could not be completed. Please try again.",
  emailInvalid: "Enter a valid email address.",
  passwordRequired: "Enter your password.",
} as const;

const signInSchema = z.object({
  email: z.email(text.emailInvalid),
  password: z.string().min(1, text.passwordRequired),
});

type SignInValues = z.infer<typeof signInSchema>;

/**
 * A post-sign-in destination is only honoured when it is a single
 * leading-slash relative path — never a protocol-relative or
 * absolute URL pointing off-site.
 */
const SAFE_NEXT = /^\/(?!\/)/;

function resolveNext(raw: string | null): string {
  if (!raw) return routes.dashboard;
  if (!SAFE_NEXT.test(raw)) return routes.dashboard;
  if (raw.startsWith("/\\")) return routes.dashboard;
  return raw;
}

/* ── Google mark — drawn inline, no remote asset ───────────────── */

function GoogleMark() {
  return (
    <svg viewBox="0 0 18 18" width="16" height="16" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.874 2.684-6.615Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.859-3.048.859-2.344 0-4.328-1.583-5.036-3.71H.957v2.331A8.997 8.997 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71a5.41 5.41 0 0 1 0-3.42V4.958H.957a9 9 0 0 0 0 8.083l3.007-2.331Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.346l2.582-2.582C13.463.892 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
      />
    </svg>
  );
}

/* ── Inner form — reads ?next=, so it lives behind Suspense ────── */

function SignInFormFields() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = resolveNext(searchParams.get("next"));

  const demo = isDemoClient();

  const [serverError, setServerError] = React.useState<string | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);
  const [redirecting, setRedirecting] = React.useState(false);
  const [googlePending, setGooglePending] = React.useState(false);

  const mounted = React.useRef(true);
  React.useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const busy = isSubmitting || redirecting;
  const locked = busy || googlePending;

  async function onSubmit(values: SignInValues) {
    setServerError(null);
    const result = await signInWithPassword(values.email, values.password);
    if (!mounted.current) return;
    if (!result.ok) {
      setServerError(result.error || text.fallbackError);
      return;
    }
    setRedirecting(true);
    router.push(nextPath);
    router.refresh();
  }

  async function onGoogle() {
    setServerError(null);
    setGooglePending(true);
    const result = await signInWithGoogle();
    if (!mounted.current) return;
    if (!result.ok) {
      setServerError(result.error || text.fallbackError);
      setGooglePending(false);
      return;
    }
    // The provider takes over the page from here — keep the button
    // in its pending state rather than racing the redirect.
  }

  return (
    <div className="space-y-6">
      {demo ? (
        <div className="rounded-sm border border-edge-faint bg-mineral px-3.5 py-3">
          <p className="text-label">{text.demoTitle}</p>
          <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
            {text.demoNote}
          </p>
        </div>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {serverError ? (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-sm border border-crit/25 bg-crit/[0.03] px-3 py-2.5"
          >
            <TriangleAlert
              className="mt-px size-3.5 shrink-0 text-crit"
              aria-hidden
            />
            <p className="min-w-0 break-words text-[13px] leading-relaxed text-crit">
              {serverError}
            </p>
          </div>
        ) : null}

        <Field
          label={text.emailLabel}
          htmlFor="sign-in-email"
          error={errors.email?.message}
        >
          <Input
            id="sign-in-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            placeholder={text.emailPlaceholder}
            aria-invalid={errors.email ? true : undefined}
            className="h-11 sm:h-10"
            {...register("email")}
          />
        </Field>

        <Field
          label={text.passwordLabel}
          htmlFor="sign-in-password"
          error={errors.password?.message}
        >
          <div className="relative">
            <Input
              id="sign-in-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              autoCapitalize="none"
              spellCheck={false}
              aria-invalid={errors.password ? true : undefined}
              className="h-11 pr-12 sm:h-10"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-pressed={showPassword}
              aria-controls="sign-in-password"
              aria-label={showPassword ? text.hidePassword : text.showPassword}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-sm text-ink-soft transition-colors hover:text-ink sm:w-10"
            >
              {showPassword ? (
                <EyeOff className="size-4" aria-hidden />
              ) : (
                <Eye className="size-4" aria-hidden />
              )}
            </button>
          </div>
        </Field>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          loading={busy}
          disabled={locked}
        >
          {copy.nav.signIn}
        </Button>
      </form>

      {!demo ? (
        <>
          <div className="flex items-center gap-3" aria-hidden>
            <span className="edge-fade-x h-px flex-1" />
            <span className="text-2xs uppercase tracking-[0.09em] text-ink-soft">
              {text.divider}
            </span>
            <span className="edge-fade-x h-px flex-1" />
          </div>

          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={onGoogle}
            loading={googlePending}
            disabled={locked}
          >
            {googlePending ? null : <GoogleMark />}
            {text.google}
          </Button>
        </>
      ) : null}
    </div>
  );
}

/* ── Public component — Suspense boundary for useSearchParams ──── */

export function SignInForm() {
  return (
    <React.Suspense fallback={null}>
      <SignInFormFields />
    </React.Suspense>
  );
}

export default SignInForm;
