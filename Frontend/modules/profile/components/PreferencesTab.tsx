// modules/profile/components/PreferencesTab.tsx
"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Monitor, Sun, Moon } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const THEME_KEY = "bsa-theme-preference";
const NOTIF_KEY = "bsa-notifications";

export function PreferencesTab() {
  const { theme, setTheme } = useTheme();
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(true);

  useEffect(() => {
    const savedNotif = localStorage.getItem(NOTIF_KEY);
    if (savedNotif) {
      const parsed = JSON.parse(savedNotif);
      setEmailNotif(parsed.email ?? true);
      setSmsNotif(parsed.sms ?? true);
    }
  }, []);

  const handleTheme = (t: string) => {
    setTheme(t);
    localStorage.setItem(THEME_KEY, t);
  };

  const handleNotifications = (email: boolean, sms: boolean) => {
    setEmailNotif(email);
    setSmsNotif(sms);
    localStorage.setItem(NOTIF_KEY, JSON.stringify({ email, sms }));
  };

  const savePreferences = () => {
    handleNotifications(emailNotif, smsNotif);
    toast.success("Preferences saved.");
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Theme</CardTitle>
          <CardDescription>Choose how the app looks.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            <ThemeOption
              icon={Sun}
              label="Light"
              active={theme === "light"}
              onClick={() => handleTheme("light")}
            />
            <ThemeOption
              icon={Moon}
              label="Dark"
              active={theme === "dark"}
              onClick={() => handleTheme("dark")}
            />
            <ThemeOption
              icon={Monitor}
              label="System"
              active={theme === "system"}
              onClick={() => handleTheme("system")}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Notifications</CardTitle>
          <CardDescription>
            Control how you receive EMI reminders and system alerts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label className="text-sm">Email Notifications</Label>
              <p className="text-xs text-muted-foreground">
                Receive reminders and alerts via email.
              </p>
            </div>
            <Switch checked={emailNotif} onCheckedChange={setEmailNotif} />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label className="text-sm">SMS Notifications</Label>
              <p className="text-xs text-muted-foreground">
                Receive critical updates via SMS.
              </p>
            </div>
            <Switch checked={smsNotif} onCheckedChange={setSmsNotif} />
          </div>

          <Button onClick={savePreferences}>Save Preferences</Button>
        </CardContent>
      </Card>
    </div>
  );
}

function ThemeOption({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors",
        active
          ? "border-blue-500 bg-blue-500/5 ring-1 ring-blue-500/20"
          : "hover:bg-muted/40",
      )}
    >
      <Icon className="h-5 w-5" />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
