// modules/credit-cards/modals/CreditCardBankFormModal.tsx
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { UploadInput } from "@/components/ui/upload-input";

import {
  useCreateCreditCardBank,
  useUpdateCreditCardBank,
  useUploadCreditCardBankLogo,
} from "../hooks/useCreditCardBanks";
import { documentUrl } from "@/lib/format";
import type { CreditCardBank } from "../types";

const schema = z.object({
  bank_name: z.string().min(1, "Bank name is required"),
  short_code: z.string().optional(),
  apply_link: z.string().url("Enter a valid URL"),
  tagline: z.string().optional(),
  target_audience: z.string().min(1, "Target audience is required"),
  documents_required: z.string().min(1, "Documents required is required"),
  is_active: z.union([z.boolean(), z.number()]).optional(),
});

type FormValues = z.infer<typeof schema>;

export function CreditCardBankFormModal({
  open,
  onOpenChange,
  bank,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bank?: CreditCardBank | null;
}) {
  const isEdit = Boolean(bank);
  const createM = useCreateCreditCardBank();
  const updateM = useUpdateCreditCardBank(bank?.bank_id);
  const uploadLogoM = useUploadCreditCardBankLogo();

  const [logoFile, setLogoFile] = useState<File | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      bank_name: "",
      short_code: "",
      apply_link: "",
      tagline: "",
      target_audience: "",
      documents_required: "",
      is_active: true,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        bank_name: bank?.bank_name ?? "",
        short_code: bank?.short_code ?? "",
        apply_link: bank?.apply_link ?? "",
        tagline: bank?.tagline ?? "",
        target_audience: bank?.target_audience ?? "",
        documents_required: bank?.documents_required ?? "",
        is_active: Boolean(bank?.is_active ?? true),
      });
      setLogoFile(null);
    }
  }, [open, bank, form]);

  const onSubmit = form.handleSubmit((values) => {
    const finish = async (bankId?: number) => {
      if (logoFile && bankId) {
        try {
          await uploadLogoM.mutateAsync({ bankId, file: logoFile });
        } catch (err) {
          console.error("[CCBankForm] Logo upload failed:", err);
        }
      }
      onOpenChange(false);
      form.reset();
    };

    const payload = {
      bank_name: values.bank_name,
      short_code: values.short_code,
      apply_link: values.apply_link,
      tagline: values.tagline,
      target_audience: values.target_audience,
      documents_required: values.documents_required,
      is_active: Number(Boolean(values.is_active)),
    };

    if (isEdit && bank) {
      updateM.mutate(payload, { onSuccess: () => finish(bank.bank_id) });
    } else {
      createM.mutate(payload, {
        onSuccess: (created: any) =>
          finish(created?.bank_id ?? created?.data?.bank_id),
      });
    }
  });

  const isPending =
    createM.isPending || updateM.isPending || uploadLogoM.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Credit Card Bank" : "Add Credit Card Bank"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update partner bank details."
              : "Register a new credit card partner bank."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Logo */}
          <div className="space-y-2">
            <Label>Bank Logo</Label>
            <UploadInput
              variant="image"
              maxSizeMB={2}
              onFileSelect={setLogoFile}
              currentPreview={
                bank?.logo_path ? documentUrl(bank.logo_path) : null
              }
              label="Upload"
              loading={uploadLogoM.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label>
              Bank Name <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="e.g., IndusInd Bank Credit Card"
              {...form.register("bank_name")}
            />
            {form.formState.errors.bank_name && (
              <p className="text-xs text-destructive">
                {form.formState.errors.bank_name.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Short Code</Label>
              <Input placeholder="INDUSIND" {...form.register("short_code")} />
            </div>
            <div className="space-y-2">
              <Label>Tagline</Label>
              <Input
                placeholder="IndusInd Bank"
                {...form.register("tagline")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>
              Apply Link <span className="text-destructive">*</span>
            </Label>
            <Input placeholder="https://..." {...form.register("apply_link")} />
            {form.formState.errors.apply_link && (
              <p className="text-xs text-destructive">
                {form.formState.errors.apply_link.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>
              Target Audience <span className="text-destructive">*</span>
            </Label>
            <Textarea
              rows={4}
              placeholder={`Age: 21 to 60 years
Employment Type: Salaried or Self-Employed
Annual Income: ₹3 Lakhs or more
Credit Score: 680+ with no negative history`}
              {...form.register("target_audience")}
            />
            {form.formState.errors.target_audience && (
              <p className="text-xs text-destructive">
                {form.formState.errors.target_audience.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              One requirement per line.
            </p>
          </div>

          <div className="space-y-2">
            <Label>
              Documents Required <span className="text-destructive">*</span>
            </Label>
            <Textarea
              rows={4}
              placeholder={`Aadhaar Card
PAN Card
Address Proof
Income Proof`}
              {...form.register("documents_required")}
            />
            {form.formState.errors.documents_required && (
              <p className="text-xs text-destructive">
                {form.formState.errors.documents_required.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              One document per line.
            </p>
          </div>

          {isEdit && (
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label className="text-sm">Active</Label>
                <p className="text-xs text-muted-foreground">
                  Inactive banks won&apos;t show in the application form.
                </p>
              </div>
              <Switch
                checked={Boolean(form.watch("is_active") ?? true)}
                onCheckedChange={(v: any) =>
                  form.setValue("is_active", Boolean(v))
                }
              />
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isEdit ? (
                "Save Changes"
              ) : (
                "Add Bank"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
