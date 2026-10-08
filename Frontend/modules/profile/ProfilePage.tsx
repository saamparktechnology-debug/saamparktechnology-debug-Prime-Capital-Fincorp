// modules/profile/ProfilePage.tsx
"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileInfoTab } from "./components/ProfileInfoTab";
import { ChangePasswordTab } from "./components/ChangePasswordTab";
import { PreferencesTab } from "./components/PreferencesTab";
import { MyKycTab } from "./components/MyKycTab";
import { CompanyProfileTab } from "./components/CompanyProfileTab";
import { useAuthStore } from "@/store/authStore";
import { ROLE } from "@/lib/constants/statuses";

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const isAgent = user?.role === ROLE.AGENT;
  const isAdmin = user?.role === ROLE.ADMIN;

  const tabs = ["info"];
  if (isAdmin) tabs.push("company");
  if (isAgent) tabs.push("kyc");
  tabs.push("password", "preferences");

  const cols = tabs.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile & Settings"
        description="Manage your account and preferences"
      />

      <Tabs defaultValue="info">
        <TabsList
          className={`grid w-full max-w-3xl grid-cols-${cols}`}
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          <TabsTrigger value="info">Profile</TabsTrigger>
          {isAdmin && <TabsTrigger value="company">Company</TabsTrigger>}
          {isAgent && <TabsTrigger value="kyc">My KYC</TabsTrigger>}
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-6">
          <ProfileInfoTab />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="company" className="mt-6">
            <CompanyProfileTab />
          </TabsContent>
        )}

        {isAgent && (
          <TabsContent value="kyc" className="mt-6">
            <MyKycTab />
          </TabsContent>
        )}

        <TabsContent value="password" className="mt-6">
          <ChangePasswordTab />
        </TabsContent>
        <TabsContent value="preferences" className="mt-6">
          <PreferencesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
