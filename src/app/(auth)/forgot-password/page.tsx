"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/label";
import { AuthError } from "@/components/auth/bits";
import { requestPasswordReset, isDemoClient } from "@/lib/auth";

const schema = z.object({
  email: z.email("Enter the email you signed up with."),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = React.useState<string | null>(null);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    const result = await requestPasswordReset(values.email);
    if (!result.ok) {
      setServerError(result.error);
      return;
    }
    setSent(values.email);
  };

  if (sent) {
    return (
      <div className="text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-md border border-halo-500/30 bg-halo-500/10">
          <MailCheck className="size-5 text-halo-300" aria-hidden />
        </div>
        <h1 className="text-display mt-6 text-2xl text-ink">Check your inbox</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
          If an account exists for <span className="text-ink">{sent}</span>,
          a reset link is on its way. It expires in one hour.
        </p>
        {isDemoClient() ? (
          <p className="mt-3 text-[13px] text-ink-muted">
            (Demo environment — no email is actually sent.)
          </p>
        ) : null}
        <Button variant="secondary" className="mt-8" asChild>
          <Link href="/login">
            <ArrowLeft aria-hidden />
            Back to sign in
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-display text-2xl text-ink">Reset your password</h1>
      <p className="mt-2 text-sm text-ink-secondary">
        Enter your email and we&apos;ll send a reset link.
      </p>

      <div className="mt-8">
        <AuthError message={serverError} />
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Field label="Email" htmlFor="email" error={errors.email?.message}>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              aria-invalid={Boolean(errors.email)}
              {...register("email")}
            />
          </Field>
          <Button type="submit" className="w-full" loading={isSubmitting}>
            Send reset link
          </Button>
        </form>
        <p className="mt-6 text-center text-[13px] text-ink-muted">
          Remembered it after all?{" "}
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
