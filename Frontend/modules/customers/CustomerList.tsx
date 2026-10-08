// modules/customers/CustomerList.tsx
"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { CustomerTable } from "./components/CustomerTable";
import { useCustomersList } from "./hooks/useCustomers";

export default function CustomerList() {
  const { data, isLoading } = useCustomersList();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description="Manage your customer portfolio"
        action={
          <Link href="/customers/new" className={buttonVariants()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Link>
        }
      />
      <CustomerTable data={data} loading={isLoading} />
    </div>
  );
}
