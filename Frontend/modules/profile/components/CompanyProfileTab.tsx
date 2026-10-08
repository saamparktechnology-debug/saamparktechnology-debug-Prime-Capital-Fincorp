// modules/profile/components/CompanyProfileTab.tsx
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Save } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { UploadInput } from "@/components/ui/upload-input";

import {
  useCompany,
  useUpdateCompany,
  useUploadLogo,
} from "@/modules/agents/hooks/useCompany";
import { documentUrl } from "@/lib/format";

const schema = z.object({
  company_name: z.string().min(1, "Company name is required"),
  tagline: z.string().optional(),
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  website: z.string().optional(),
  card_validity_years: z.coerce.number().min(1).max(10).optional(),
});

type FormValues = z.infer<typeof schema>;

export function CompanyProfileTab() {
  const { data, isLoading } = useCompany();
  const updateM = useUpdateCompany();
  const uploadM = useUploadLogo();

  const [logoFile, setLogoFile] = useState<File | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      company_name: "",
      tagline: "",
      address_line1: "",
      address_line2: "",
      city: "",
      state: "",
      pincode: "",
      phone: "",
      email: "",
      website: "",
      card_validity_years: 1,
    },
  });

  useEffect(() => {
    if (data) {
      form.reset({
        company_name: data.company_name ?? "",
        tagline: data.tagline ?? "",
        address_line1: data.address_line1 ?? "",
        address_line2: data.address_line2 ?? "",
        city: data.city ?? "",
        state: data.state ?? "",
        pincode: data.pincode ?? "",
        phone: data.phone ?? "",
        email: data.email ?? "",
        website: data.website ?? "",
        card_validity_years: data.card_validity_years ?? 1,
      });
      setLogoFile(null);
    }
  }, [data, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    updateM.mutate(values, {
      onSuccess: async () => {
        if (logoFile) {
          try {
            await uploadM.mutateAsync(logoFile);
          } catch {
            /* handled */
          }
        }
      },
    });
  });

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <form onSubmit={onSubmit} className="max-w-3xl space-y-6">
      {/* Logo */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Company Logo</CardTitle>
        </CardHeader>
        <CardContent>
          <UploadInput
            variant="image"
            maxSizeMB={2}
            onFileSelect={setLogoFile}
            currentPreview={
              data?.logo_path ? documentUrl(data.logo_path) : null
            }
            label="Upload Logo"
            loading={uploadM.isPending}
          />
        </CardContent>
      </Card>

      {/* Basic Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Company Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>
                Company Name <span className="text-destructive">*</span>
              </Label>
              <Input {...form.register("company_name")} />
              {form.formState.errors.company_name && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.company_name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Tagline</Label>
              <Input {...form.register("tagline")} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Address</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Address Line 1</Label>
            <Input {...form.register("address_line1")} />
          </div>
          <div className="space-y-2">
            <Label>Address Line 2</Label>
            <Input {...form.register("address_line2")} />
          </div>
          <div className="space-y-2">
            <Label>City</Label>
            <Input {...form.register("city")} />
          </div>
          <div className="space-y-2">
            <Label>State</Label>
            <Input {...form.register("state")} />
          </div>
          <div className="space-y-2">
            <Label>Pincode</Label>
            <Input {...form.register("pincode")} />
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Contact & Other</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input {...form.register("phone")} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" {...form.register("email")} />
          </div>
          <div className="space-y-2">
            <Label>Website</Label>
            <Input {...form.register("website")} />
          </div>
          <div className="space-y-2">
            <Label>ID Card Validity (years)</Label>
            <Input
              type="number"
              min={1}
              max={10}
              {...form.register("card_validity_years")}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={updateM.isPending || uploadM.isPending}>
          {updateM.isPending || uploadM.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Company Profile
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
