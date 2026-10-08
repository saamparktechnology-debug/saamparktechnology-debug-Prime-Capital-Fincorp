// modules/masters/modals/BusinessTypeFormModal.tsx
"use client";

import { useEffect } from "react";
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

import {
  useCreateBusinessType,
  useUpdateBusinessType,
} from "../hooks/useMasters";
import type { BusinessType } from "../types";

const schema = z.object({
  type_name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  display_order: z.coerce.number().min(0).optional(),
  is_active: z.union([z.boolean(), z.number()]).optional(),
});

type FormValues = z.infer<typeof schema>;

export function BusinessTypeFormModal({
  open,
  onOpenChange,
  item,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: BusinessType | null;
}) {
  const isEdit = Boolean(item);
  const createM = useCreateBusinessType();
  const updateM = useUpdateBusinessType(item?.type_id);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      type_name: "",
      description: "",
      display_order: 0,
      is_active: true,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        type_name: item?.type_name ?? "",
        description: item?.description ?? "",
        display_order: item?.display_order ?? 0,
        is_active: Boolean(item?.is_active ?? true),
      });
    }
  }, [open, item, form]);

  const onSubmit = form.handleSubmit((values) => {
    const payload = {
      type_name: values.type_name,
      description: values.description,
      display_order: values.display_order,
      is_active: Number(Boolean(values.is_active)),
    };

    if (isEdit && item) {
      updateM.mutate(payload, { onSuccess: () => onOpenChange(false) });
    } else {
      createM.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  });

  const isPending = createM.isPending || updateM.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Business Type" : "Add Business Type"}
          </DialogTitle>
          <DialogDescription>
            Master list used in business loan applications.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>
              Name <span className="text-destructive">*</span>
            </Label>
            <Input placeholder="e.g., Retail" {...form.register("type_name")} />
            {form.formState.errors.type_name && (
              <p className="text-xs text-destructive">
                {form.formState.errors.type_name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              placeholder="Optional description"
              {...form.register("description")}
            />
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
                  Inactive items won't show in new applications.
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
                "Add Type"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
