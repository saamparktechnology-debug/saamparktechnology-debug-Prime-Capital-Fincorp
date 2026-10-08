// modules/auth/components/ForgetPasswordForm.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Mail, UserCog } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

import { authService } from "../services/authService";
import { getErrorMessage } from "@/lib/api/client";
import { ROLE } from "@/lib/constants/statuses";
import { type SelectOption, optionTag } from "@/lib/format";
import type { ForgotPasswordPayload } from "../types";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  role: z.enum([ROLE.ADMIN, ROLE.AGENT]),
});

type FormValues = z.infer<typeof schema>;

const ROLE_OPTIONS: SelectOption[] = [
  { value: ROLE.AGENT, tag: "Agent" },
  { value: ROLE.ADMIN, tag: "Admin" },
];

export function ForgotPasswordForm() {
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: { email: "", role: ROLE.AGENT },
  });

  const mutation = useMutation({
    mutationFn: (values: ForgotPasswordPayload) =>
      authService.forgotPassword(values),
    onSuccess: (_data, variables) => {
      toast.success("If the email exists, a reset code has been sent.");
      const params = new URLSearchParams({
        email: variables.email,
        role: variables.role,
      });
      router.push(`/reset-password?${params.toString()}`);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const onSubmit = form.handleSubmit((values) => mutation.mutate(values));

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
        <h1 className="text-3xl font-bold tracking-tight">Forgot password?</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and we&apos;ll send a reset code
        </p>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label>Role</Label>
          <Select
            value={form.watch("role")}
            onValueChange={(v) =>
              form.setValue("role", (v ?? ROLE.AGENT) as FormValues["role"])
            }
          >
            <SelectTrigger>
              <UserCog className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>
                {optionTag(ROLE_OPTIONS, form.watch("role")) ?? "Select role"}
              </span>
            </SelectTrigger>
            <SelectContent>
              {ROLE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="pl-9"
              {...form.register("email")}
            />
          </div>
          {form.formState.errors.email && (
            <p className="text-xs text-destructive">
              {form.formState.errors.email.message}
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
              Sending...
            </>
          ) : (
            "Send Reset Code"
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
