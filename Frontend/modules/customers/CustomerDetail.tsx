// modules/customers/CustomerDetail.tsx
"use client";

import { useParams } from "next/navigation";

import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

import { CustomerProfileTab } from "./components/CustomerProfileTab";
import { CustomerDocumentsTab } from "./components/CustomerDocumentsTab";
import { CustomerLoansTab } from "./components/CustomerLoansTab";
import { CustomerEmisTab } from "./components/CustomerEmisTab";
import { useCustomerDetail } from "./hooks/useCustomers";
import { KycStatusCard } from "@/modules/kyc/components/KycStatusCard";

export default function CustomerDetail() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { data, isLoading } = useCustomerDetail(id);

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          isLoading || !data
            ? "Customer"
            : `${data.first_name} ${data.last_name}`
        }
        description={data ? `Phone: ${data.primary_phone}` : undefined}
        action={data ? <StatusBadge status={data.kyc_status} /> : undefined}
      />

      {isLoading || !data ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full max-w-md" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <>
          <KycStatusCard customer={data} />

          <Tabs defaultValue="profile">
            <TabsList className="grid w-full max-w-2xl grid-cols-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="loans">Loans</TabsTrigger>
              <TabsTrigger value="emis">EMIs</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-6">
              <CustomerProfileTab customer={data} />
            </TabsContent>
            <TabsContent value="documents" className="mt-6">
              <CustomerDocumentsTab customer={data} />
            </TabsContent>
            <TabsContent value="loans" className="mt-6">
              <CustomerLoansTab customerId={data.customer_id} />
            </TabsContent>
            <TabsContent value="emis" className="mt-6">
              <CustomerEmisTab customerId={data.customer_id} />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
