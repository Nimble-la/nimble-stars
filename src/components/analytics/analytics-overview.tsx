"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Minus, Users, Briefcase, Clock, Target } from "lucide-react";

interface OverviewData {
  totalCandidatesInPipeline: number;
  openPositions: number;
  avgTimeToHire: number;
  approvalRate: number;
  trends: {
    pipelineChange: number;
    approvalRateChange: number;
  };
}

interface AnalyticsOverviewProps {
  data: OverviewData | undefined;
}

function TrendBadge({
  value,
  suffix = "",
  invertColor = false,
}: {
  value: number;
  suffix?: string;
  invertColor?: boolean;
}) {
  if (value === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <Minus className="h-3 w-3" />
        No change
      </span>
    );
  }

  const isPositive = value > 0;
  // invertColor: for "time to hire", a decrease is good (green)
  const isGood = invertColor ? !isPositive : isPositive;

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium ${
        isGood ? "text-green-600" : "text-red-500"
      }`}
    >
      {isPositive ? (
        <TrendingUp className="h-3 w-3" />
      ) : (
        <TrendingDown className="h-3 w-3" />
      )}
      {isPositive ? "+" : ""}
      {value}
      {suffix}
    </span>
  );
}

function KpiCard({
  title,
  value,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  trend?: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {trend && <div className="pt-1">{trend}</div>}
          </div>
          <div className="rounded-md bg-muted p-2">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function KpiSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}

export function AnalyticsOverview({ data }: AnalyticsOverviewProps) {
  if (!data) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <KpiSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        title="Candidates in Pipeline"
        value={String(data.totalCandidatesInPipeline)}
        icon={Users}
        trend={
          <TrendBadge
            value={data.trends.pipelineChange}
            suffix=" vs prev period"
          />
        }
      />
      <KpiCard
        title="Open Positions"
        value={String(data.openPositions)}
        icon={Briefcase}
      />
      <KpiCard
        title="Avg Time to Hire"
        value={`${data.avgTimeToHire} days`}
        icon={Clock}
      />
      <KpiCard
        title="Approval Rate"
        value={`${data.approvalRate}%`}
        icon={Target}
        trend={
          <TrendBadge
            value={data.trends.approvalRateChange}
            suffix="% vs prev period"
          />
        }
      />
    </div>
  );
}
