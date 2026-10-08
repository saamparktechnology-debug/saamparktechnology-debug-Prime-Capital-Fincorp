// modules/customers/CustomerCreate.tsx
"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { CustomerForm } from "./components/CustomerForm";

export default function CustomerCreate() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Register Customer"
        description="Fill out the details below. KYC will be pending until Admin approval."
      />
      <CustomerForm />
    </div>
  );
}
