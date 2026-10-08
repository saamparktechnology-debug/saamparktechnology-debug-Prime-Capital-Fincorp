// modules/banks/modals/BankFormModal.tsx
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
import { Switch } from "@/components/ui/switch";
import { UploadInput } from "@/components/ui/upload-input";

import {
  useCreateBank,
  useUpdateBank,
  useUploadBankLogo,
  useRemoveBankLogo,
} from "../hooks/useBanks";
import { documentUrl } from "@/lib/format";
import type { Bank } from "../types";

const schema = z.object({
  bank_name: z.string().min(1, "Bank name is required"),
  short_code: z.string().optional(),
  tagline: z.string().optional(),
  apply_link: z
    .string()
    .optional()
    .refine(
      (v) => !v || /^https?:\/\/.+/.test(v),
      "Enter a valid URL (https://...)",
    ),
  display_order: z.coerce.number().min(0).optional(),
  is_active: z.union([z.boolean(), z.number()]).optional(),
});

type FormValues = z.infer<typeof schema>;

export function BankFormModal({
  open,
  onOpenChange,
  bank,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bank?: Bank | null;
}) {
  const isEdit = Boolean(bank);
  const createM = useCreateBank();
  const updateM = useUpdateBank(bank?.bank_id);
  const uploadLogoM = useUploadBankLogo();
  const removeLogoM = useRemoveBankLogo();

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [removeOldLogo, setRemoveOldLogo] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      bank_name: "",
      short_code: "",
      tagline: "",
      apply_link: "",
      display_order: 0,
      is_active: true,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        bank_name: bank?.bank_name ?? "",
        short_code: bank?.short_code ?? "",
        tagline: bank?.tagline ?? "",
        apply_link: bank?.apply_link ?? "",
        display_order: bank?.display_order ?? 0,
        is_active: Boolean(bank?.is_active ?? true),
      });
      setLogoFile(null);
      setRemoveOldLogo(false);
    }
  }, [open, bank, form]);

  const handleFileChange = (f: File | null) => {
    setLogoFile(f);
    if (f) setRemoveOldLogo(false);
  };

  const onSubmit = form.handleSubmit((values) => {
    const finish = async (bankId?: number) => {
      if (!bankId) {
        onOpenChange(false);
        form.reset();
        return;
      }

      if (logoFile) {
        try {
          await uploadLogoM.mutateAsync({ bankId, file: logoFile });
        } catch (err) {
          console.error("[BankFormModal] Logo upload failed:", err);
        }
      } else if (removeOldLogo && isEdit && bank?.logo_path) {
        try {
          await removeLogoM.mutateAsync({ bankId });
        } catch (err) {
          console.error("[BankFormModal] Logo removal failed:", err);
        }
      }

      onOpenChange(false);
      form.reset();
    };

    const payload = {
      bank_name: values.bank_name,
      short_code: values.short_code,
      tagline: values.tagline,
      apply_link: values.apply_link,
      display_order: values.display_order,
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
    createM.isPending ||
    updateM.isPending ||
    uploadLogoM.isPending ||
    removeLogoM.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Bank" : "Add Bank"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the partner bank details."
              : "Register a new partner bank."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Logo */}
          <div className="space-y-2">
            <Label>Bank Logo</Label>
            <UploadInput
              variant="image"
              maxSizeMB={2}
              onFileSelect={handleFileChange}
              currentPreview={
                bank?.logo_path && !removeOldLogo
                  ? documentUrl(bank.logo_path)
                  : null
              }
              label="Upload"
              loading={uploadLogoM.isPending}
            />
            {isEdit && bank?.logo_path && !logoFile && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs text-destructive hover:text-destructive"
                onClick={() => setRemoveOldLogo((v) => !v)}
              >
                {removeOldLogo ? "Undo remove" : "Remove current logo"}
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <Label>
              Bank Name <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="e.g., State Bank of India"
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
              <Input placeholder="SBI" {...form.register("short_code")} />
            </div>
            <div className="space-y-2">
              <Label>Tagline</Label>
              <Input placeholder="Home Loan" {...form.register("tagline")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Apply Link (URL)</Label>
            <Input placeholder="https://..." {...form.register("apply_link")} />
            {form.formState.errors.apply_link && (
              <p className="text-xs text-destructive">
                {form.formState.errors.apply_link.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Customer will be redirected to this URL after applying.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Display Order</Label>
            <Input
              type="number"
              min={0}
              placeholder="0"
              {...form.register("display_order")}
            />
            <p className="text-xs text-muted-foreground">
              Lower numbers appear first.
            </p>
          </div>

          {isEdit && (
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label className="text-sm">Active</Label>
                <p className="text-xs text-muted-foreground">
                  Inactive banks won't appear in new applications.
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
