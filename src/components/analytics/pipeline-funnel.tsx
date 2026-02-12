"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, ArrowRight } from "lucide-react";

const STAGE_CONFIG = {
  submitted: { label: "Submitted", color: "#3B82F6", bg: "bg-blue-500" },
  to_interview: { label: "To Interview", color: "#F59E0B", bg: "bg-amber-500" },
  approved: { label: "Approved", color: "#10B981", bg: "bg-green-500" },
  rejected: { label: "Rejected", color: "#EF4444", bg: "bg-red-500" },
} as const;

interface StageData {
  stage: string;
  count: number;
  percentage: number;
}

interface FunnelData {
  stages: StageData[];
  total: number;
  conversionRates: {
    submittedToInterview: number;
    interviewToApproved: number;
  };
}

interface PipelineFunnelProps {
  data: FunnelData | undefined;
}

export function PipelineFunnel({ data }: PipelineFunnelProps) {
  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Funnel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (data.total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-sm text-muted-foreground">
            No data for the selected period
          </p>
        </CardContent>
      </Card>
    );
  }

  const maxCount = Math.max(...data.stages.map((s) => s.count), 1);

  // Find biggest drop-off between pipeline stages (excluding rejected)
  const pipelineStages = data.stages.filter((s) => s.stage !== "rejected");
  let biggestDropStage = "";
  let biggestDrop = 0;
  for (let i = 1; i < pipelineStages.length; i++) {
    const drop = pipelineStages[i - 1].count - pipelineStages[i].count;
    if (drop > biggestDrop) {
      biggestDrop = drop;
      biggestDropStage = pipelineStages[i - 1].stage;
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pipeline Funnel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {data.stages.map((stageData, index) => {
          const config =
            STAGE_CONFIG[stageData.stage as keyof typeof STAGE_CONFIG];
          if (!config) return null;

          const widthPercent = Math.max(
            (stageData.count / maxCount) * 100,
            stageData.count > 0 ? 8 : 0
          );

          const isRejected = stageData.stage === "rejected";
          const showConversion =
            !isRejected &&
            index < data.stages.length - 2;
          const conversionRate =
            index === 0
              ? data.conversionRates.submittedToInterview
              : index === 1
                ? data.conversionRates.interviewToApproved
                : null;

          const isBiggestDrop = stageData.stage === biggestDropStage;

          return (
            <div key={stageData.stage}>
              {isRejected && (
                <div className="my-3 border-t border-dashed" />
              )}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: config.color }}
                    />
                    <span className="font-medium">{config.label}</span>
                    {isBiggestDrop && biggestDrop > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                        <AlertTriangle className="h-3 w-3" />
                        Biggest drop-off
                      </span>
                    )}
                  </div>
                  <span className="text-muted-foreground">
                    {stageData.count}{" "}
                    <span className="text-xs">({stageData.percentage}%)</span>
                  </span>
                </div>
                <div className="h-8 w-full rounded-md bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-md transition-all duration-500 ease-out"
                    style={{
                      width: `${widthPercent}%`,
                      backgroundColor: config.color,
                    }}
                  />
                </div>
              </div>

              {showConversion && conversionRate !== null && (
                <div className="flex items-center gap-1 py-1.5 pl-4 text-xs text-muted-foreground">
                  <ArrowRight className="h-3 w-3" />
                  {conversionRate}% conversion
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
