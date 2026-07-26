"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AuthError, DemoNotice, GoogleButton } from "@/components/auth/bits";
import { signUp, signInWithGoogle, isDemoClient } from "@/lib/auth";

const schema = z.object({
  fullName: z.string().min(2, "Tell us your name."),
  email: z.email("Enter a valid work email."),
  password: z
    .string()
    .min(8, "Use at least 8 characters.")
    .regex(/[0-9]/, "Include at least one number."),
});

type FormValues = z.infer<typeof schema>;

function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const plan = params.get("plan");
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    const result = await signUp(values.email, values.password, values.fullName);
    if (!result.ok) {
      setServerError(result.error);
      return;
    }
    if (result.requiresConfirmation) {
      router.push(`/verify-email?email=${encodeURIComponent(values.email)}`);
      return;
    }
    router.push("/onboarding");
    router.refresh();
  };

  const onGoogle = async () => {
    setGoogleLoading(true);
    setServerError(null);
    const result = await signInWithGoogle();
    if (!result.ok) {
      setServerError(result.error);
      setGoogleLoading(false);
      return;
    }
    if (isDemoClient()) {
      router.push("/onboarding");
      router.refresh();
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3">
        <h1 className="text-display text-2xl text-ink">Create your workspace</h1>
        {plan ? <Badge variant="halo">{plan} plan</Badge> : null}
      </div>
      <p className="mt-2 text-sm text-ink-secondary">
        Free for up to 3 members. No card required.
      </p>

      <div className="mt-8">
        <DemoNotice context="signup" />
        <AuthError message={serverError} />
        <GoogleButton onClick={onGoogle} loading={googleLoading} />

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Field
            label="Full name"
            htmlFor="fullName"
            error={errors.fullName?.message}
          >
            <Input
              id="fullName"
              autoComplete="name"
              placeholder="Ada Lindgren"
              aria-invalid={Boolean(errors.fullName)}
              {...register("fullName")}
            />
          </Field>
          <Field label="Work email" htmlFor="email" error={errors.email?.message}>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              aria-invalid={Boolean(errors.email)}
              {...register("email")}
            />
          </Field>
          <Field
            label="Password"
            htmlFor="password"
            error={errors.password?.message}
            hint="8+ characters, one number"
          >
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              aria-invalid={Boolean(errors.password)}
              {...register("password")}
            />
          </Field>
          <Button type="submit" className="w-full" loading={isSubmitting}>
            Create account
          </Button>
        </form>

        <p className="mt-4 text-center text-xs leading-relaxed text-ink-faint">
          By continuing you agree to the{" "}
          <Link href="/legal/terms" className="underline hover:text-ink-muted">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/legal/privacy" className="underline hover:text-ink-muted">
            Privacy Policy
          </Link>
          .
        </p>

        <p className="mt-6 text-center text-[13px] text-ink-muted">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-halo-300 transition-colors hover:text-halo-200"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <React.Suspense fallback={null}>
      <SignupForm />
    </React.Suspense>
  );
}
