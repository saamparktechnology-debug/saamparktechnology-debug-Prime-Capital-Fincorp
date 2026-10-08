// modules/auth/components/ResetPasswordForm.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { authService } from "../services/authService";
import { getErrorMessage } from "@/lib/api/client";
import { ROLE, type Role } from "@/lib/constants/statuses";
import type { ResetPasswordPayload } from "../types";

const schema = z
  .object({
    code: z
      .string()
      .length(6, "Code must be 6 digits")
      .regex(/^\d+$/, "Code must be digits"),
    new_password: z.string().min(6, "Min 6 characters"),
    confirm_password: z.string().min(1, "Please confirm"),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    path: ["confirm_password"],
    message: "Passwords do not match",
  });

type FormValues = z.infer<typeof schema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email") || "";
  const role = (searchParams.get("role") as Role) || ROLE.AGENT;

  useEffect(() => {
    if (!email) {
      toast.error("Session expired. Please try again.");
      router.replace("/forgot-password");
    }
  }, [email, router]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: { code: "", new_password: "", confirm_password: "" },
  });

  const mutation = useMutation({
    mutationFn: (values: ResetPasswordPayload) =>
      authService.resetPassword(values),
    onSuccess: () => {
      toast.success("Password reset successfully. Please log in.");
      router.replace("/login");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const onSubmit = form.handleSubmit((values) =>
    mutation.mutate({
      email,
      role,
      code: values.code,
      new_password: values.new_password,
    }),
  );

  return (
    <div className="space-y-8">
      {/* Logo */}
      <Link href="/" className="inline-flex items-center gap-3">
        <Image
          src="/logo.png"
          alt="Prime Capital Fincorp"
          width={40}
          height={40}
          className="h-10 w-10 object-contain"
          priority
        />
        <div className="flex flex-col leading-tight">
          <span className="text-base font-bold tracking-tight">
            Prime Capital Fincorp
          </span>
          <span className="text-xs text-muted-foreground">
            Better Credit, Brighter Future
          </span>
        </div>
      </Link>

      {/* Heading */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Reset password</h1>
        <p className="text-sm text-muted-foreground">
          Enter the code sent to{" "}
          <span className="font-medium text-foreground">{email}</span>
        </p>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="code">Reset code</Label>
          <Input
            id="code"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            className="text-center text-2xl tracking-[0.5em] font-mono"
            {...form.register("code")}
          />
          {form.formState.errors.code && (
            <p className="text-xs text-destructive">
              {form.formState.errors.code.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="new_password">New password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="new_password"
              type="password"
              className="pl-9"
              {...form.register("new_password")}
            />
          </div>
          {form.formState.errors.new_password && (
            <p className="text-xs text-destructive">
              {form.formState.errors.new_password.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm_password">Confirm password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="confirm_password"
              type="password"
              className="pl-9"
              {...form.register("confirm_password")}
            />
          </div>
          {form.formState.errors.confirm_password && (
            <p className="text-xs text-destructive">
              {form.formState.errors.confirm_password.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full bg-violet-600 hover:bg-violet-700"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Resetting...
            </>
          ) : (
            "Reset Password"
          )}
        </Button>
      </form>

      <div className="flex items-center justify-center">
        <Link
          href="/login"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to login
        </Link>
      </div>
    </div>
  );
}
