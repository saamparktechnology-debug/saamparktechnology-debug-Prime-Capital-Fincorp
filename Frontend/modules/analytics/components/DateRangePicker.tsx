// modules/analytics/components/DateRangePicker.tsx
"use client";

import { Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { type SelectOption, optionTag } from "@/lib/format";
import type { DateRangePreset } from "../types";

const PRESET_OPTIONS: SelectOption[] = [
  { value: "today", tag: "Today" },
  { value: "this_month", tag: "This Month" },
  { value: "this_fy", tag: "This Financial Year" },
  { value: "all", tag: "All Time" },
  { value: "custom", tag: "Custom Range" },
];

export function DateRangePicker({
  value,
  onChange,
  start,
  end,
  onStartChange,
  onEndChange,
}: {
  value: DateRangePreset;
  onChange: (v: DateRangePreset) => void;
  start?: string;
  end?: string;
  onStartChange?: (v: string) => void;
  onEndChange?: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <Select
          value={value}
          onValueChange={(v) =>
            onChange((v ?? "this_month") as DateRangePreset)
          }
        >
          <SelectTrigger className="w-[200px]">
            <span>{optionTag(PRESET_OPTIONS, value) ?? "This Month"}</span>
          </SelectTrigger>
          <SelectContent>
            {PRESET_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.tag}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {value === "custom" && (
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={start ?? ""}
            onChange={(e) => onStartChange?.(e.target.value)}
            className="w-[150px]"
          />
          <span className="text-xs text-muted-foreground">to</span>
          <Input
            type="date"
            value={end ?? ""}
            onChange={(e) => onEndChange?.(e.target.value)}
            className="w-[150px]"
          />
        </div>
      )}
    </div>
  );
}
