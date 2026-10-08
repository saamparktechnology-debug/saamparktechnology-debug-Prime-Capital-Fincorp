// modules/auth/components/LoginForm.tsx
"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Lock, Mail, UserCog } from "lucide-react";

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
import { useAuthStore } from "@/store/authStore";
import { ROLE } from "@/lib/constants/statuses";
import { type SelectOption, optionTag } from "@/lib/format";
import type { LoginPayload } from "../types";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
  role: z.enum([ROLE.ADMIN, ROLE.AGENT]),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const ROLE_OPTIONS: SelectOption[] = [
  { value: ROLE.AGENT, tag: "Agent" },
  { value: ROLE.ADMIN, tag: "Admin" },
];

export function LoginForm() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema) as any,
    defaultValues: { email: "", password: "", role: ROLE.AGENT },
  });

  const mutation = useMutation({
    mutationFn: (values: LoginPayload) => authService.login(values),
    onSuccess: (data) => {
      setSession({
        token: data.access_token,
        user: data.user,
      });
      toast.success(`Welcome back, ${data.user.fullName}!`);
      router.replace("/dashboard");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
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
        <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Please enter your details to sign in
        </p>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-5">
        {/* Role */}
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select
            value={form.watch("role")}
            onValueChange={(v) =>
              form.setValue(
                "role",
                (v ?? ROLE.AGENT) as LoginFormValues["role"],
              )
            }
          >
            <SelectTrigger id="role">
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
          {form.formState.errors.role && (
            <p className="text-xs text-destructive">
              {form.formState.errors.role.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
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

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className="pl-9"
              {...form.register("password")}
            />
          </div>
          {form.formState.errors.password && (
            <p className="text-xs text-destructive">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        {/* Remember + Forgot */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border accent-violet-600"
            />
            Remember for 30 days
          </label>
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-violet-600 hover:underline dark:text-violet-400"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          size="lg"
          className="w-full bg-violet-600 hover:bg-violet-700"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>
    </div>
  );
}
