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
import {
  AuthError,
  DemoNotice,
  GoogleButton,
} from "@/components/auth/bits";
import { signInWithPassword, signInWithGoogle, isDemoClient } from "@/lib/auth";

const schema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

type FormValues = z.infer<typeof schema>;

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/overview";
  const [serverError, setServerError] = React.useState<string | null>(
    params.get("error")
  );
  const [googleLoading, setGoogleLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    const result = await signInWithPassword(values.email, values.password);
    if (!result.ok) {
      setServerError(result.error);
      return;
    }
    router.push(next.startsWith("/") ? next : "/overview");
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
      router.push("/overview");
      router.refresh();
    }
    // In Supabase mode the browser redirects to Google.
  };

  return (
    <div>
      <h1 className="text-display text-2xl text-ink">Welcome back</h1>
      <p className="mt-2 text-sm text-ink-secondary">
        Sign in to your Halo workspace.
      </p>

      <div className="mt-8">
        <DemoNotice context="login" />
        <AuthError message={serverError} />
        <GoogleButton onClick={onGoogle} loading={googleLoading} />

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
          <Field
            label="Password"
            htmlFor="password"
            error={errors.password?.message}
            hint={undefined}
          >
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              aria-invalid={Boolean(errors.password)}
              {...register("password")}
            />
          </Field>
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-[13px] text-ink-muted transition-colors hover:text-halo-300"
            >
              Forgot your password?
            </Link>
          </div>
          <Button type="submit" className="w-full" loading={isSubmitting}>
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-center text-[13px] text-ink-muted">
          New to Halo?{" "}
          <Link
            href="/signup"
            className="font-medium text-halo-300 transition-colors hover:text-halo-200"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={null}>
      <LoginForm />
    </React.Suspense>
  );
}
