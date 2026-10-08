// modules/masters/modals/BusinessCategoryFormModal.tsx
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
  useCreateBusinessCategory,
  useUpdateBusinessCategory,
} from "../hooks/useMasters";
import type { BusinessCategory } from "../types";

const schema = z.object({
  category_name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  display_order: z.coerce.number().min(0).optional(),
  is_active: z.union([z.boolean(), z.number()]).optional(),
});

type FormValues = z.infer<typeof schema>;

export function BusinessCategoryFormModal({
  open,
  onOpenChange,
  item,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: BusinessCategory | null;
}) {
  const isEdit = Boolean(item);
  const createM = useCreateBusinessCategory();
  const updateM = useUpdateBusinessCategory(item?.category_id);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      category_name: "",
      description: "",
      display_order: 0,
      is_active: true,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        category_name: item?.category_name ?? "",
        description: item?.description ?? "",
        display_order: item?.display_order ?? 0,
        is_active: Boolean(item?.is_active ?? true),
      });
    }
  }, [open, item, form]);

  const onSubmit = form.handleSubmit((values) => {
    const payload = {
      category_name: values.category_name,
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
            {isEdit ? "Edit Business Category" : "Add Business Category"}
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
            <Input
              placeholder="e.g., Sole Proprietorship"
              {...form.register("category_name")}
            />
            {form.formState.errors.category_name && (
              <p className="text-xs text-destructive">
                {form.formState.errors.category_name.message}
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
          </div>

          {isEdit && (
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label className="text-sm">Active</Label>
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
                "Add Category"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
