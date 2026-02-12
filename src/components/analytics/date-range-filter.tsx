"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

interface DateRange {
  from: number;
  to: number;
}

interface DateRangeFilterProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

type Preset = "7d" | "30d" | "90d" | "custom";

const MS_PER_DAY = 86400000;

function getPresetRange(preset: Exclude<Preset, "custom">): DateRange {
  const now = Date.now();
  const days = preset === "7d" ? 7 : preset === "30d" ? 30 : 90;
  return { from: now - days * MS_PER_DAY, to: now };
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function toInputDate(timestamp: number): string {
  return new Date(timestamp).toISOString().split("T")[0];
}

function fromInputDate(dateStr: string): number {
  return new Date(dateStr).getTime();
}

export function getDefaultDateRange(): DateRange {
  return getPresetRange("30d");
}

export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  const [preset, setPreset] = useState<Preset>("30d");
  const [customFrom, setCustomFrom] = useState(toInputDate(value.from));
  const [customTo, setCustomTo] = useState(toInputDate(value.to));

  const handlePresetChange = (newPreset: string) => {
    const p = newPreset as Preset;
    setPreset(p);
    if (p !== "custom") {
      onChange(getPresetRange(p));
    }
  };

  const handleApplyCustom = () => {
    const from = fromInputDate(customFrom);
    const to = fromInputDate(customTo) + MS_PER_DAY - 1; // end of day
    if (from && to && from <= to) {
      onChange({ from, to });
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Calendar className="h-4 w-4" />
        <span className="hidden sm:inline">
          {formatDate(value.from)} &ndash; {formatDate(value.to)}
        </span>
      </div>

      <Select value={preset} onValueChange={handlePresetChange}>
        <SelectTrigger className="w-[160px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7d">Last 7 days</SelectItem>
          <SelectItem value="30d">Last 30 days</SelectItem>
          <SelectItem value="90d">Last 90 days</SelectItem>
          <SelectItem value="custom">Custom range</SelectItem>
        </SelectContent>
      </Select>

      {preset === "custom" && (
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={customFrom}
            onChange={(e) => setCustomFrom(e.target.value)}
            className="w-[140px]"
          />
          <span className="text-sm text-muted-foreground">to</span>
          <Input
            type="date"
            value={customTo}
            onChange={(e) => setCustomTo(e.target.value)}
            className="w-[140px]"
          />
          <Button size="sm" onClick={handleApplyCustom}>
            Apply
          </Button>
        </div>
      )}
    </div>
  );
}
