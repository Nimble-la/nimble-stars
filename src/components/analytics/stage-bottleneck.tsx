"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle } from "lucide-react";

const STAGE_LABELS: Record<string, string> = {
  submitted: "Submitted",
  to_interview: "To Interview",
  approved: "Approved",
  rejected: "Rejected",
};

interface BottleneckData {
  stage: string;
  avgDays: number;
  candidateCount: number;
}

interface StageBottleneckProps {
  data: BottleneckData[] | undefined;
}

function getDaysColor(days: number): string {
  if (days < 5) return "#10B981"; // green
  if (days <= 10) return "#F59E0B"; // amber
  return "#EF4444"; // red
}

function getDaysLabel(days: number): string {
  if (days < 5) return "Healthy";
  if (days <= 10) return "Needs attention";
  return "Bottleneck";
}

export function StageBottleneck({ data }: StageBottleneckProps) {
  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Time in Stage</CardTitle>
          <CardDescription>
            Average days candidates spend in each stage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-6 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const maxDays = Math.max(...data.map((d) => d.avgDays), 1);
  const bottleneckStage = data.reduce(
    (max, d) => (d.avgDays > max.avgDays ? d : max),
    data[0]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Time in Stage</CardTitle>
        <CardDescription>
          Average days candidates spend in each stage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((item) => {
          const color = getDaysColor(item.avgDays);
          const widthPercent = Math.max(
            (item.avgDays / maxDays) * 100,
            item.avgDays > 0 ? 4 : 0
          );
          const isBottleneck =
            item.stage === bottleneckStage?.stage && item.avgDays >= 10;

          return (
            <div key={item.stage} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {STAGE_LABELS[item.stage] || item.stage}
                  </span>
                  {isBottleneck && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                      <AlertTriangle className="h-3 w-3" />
                      Bottleneck
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {item.candidateCount} candidates
                  </span>
                  <span className="font-medium tabular-nums">
                    {item.avgDays} days
                  </span>
                </div>
              </div>
              <div className="h-6 w-full rounded bg-muted overflow-hidden">
                <div
                  className="h-full rounded transition-all duration-500 ease-out flex items-center justify-end pr-2"
                  style={{
                    width: `${widthPercent}%`,
                    backgroundColor: color,
                  }}
                >
                  {widthPercent > 20 && (
                    <span className="text-[10px] font-medium text-white">
                      {getDaysLabel(item.avgDays)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
