// app/(dashboard)/reports/page.tsx
import { Suspense } from "react";
import ReportsPage from "@/modules/reports/ReportsPage";
import { Skeleton } from "@/components/ui/skeleton";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-64 w-full" />
        </div>
      }
    >
      <ReportsPage />
    </Suspense>
  );
}
