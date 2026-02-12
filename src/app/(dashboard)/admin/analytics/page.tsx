"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import {
  DateRangeFilter,
  getDefaultDateRange,
} from "@/components/analytics/date-range-filter";
import { AnalyticsOverview } from "@/components/analytics/analytics-overview";
import { PipelineFunnel } from "@/components/analytics/pipeline-funnel";
import { StageBottleneck } from "@/components/analytics/stage-bottleneck";
import { ClientActivity } from "@/components/analytics/client-activity";

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState(getDefaultDateRange);

  const overview = useQuery(api.analytics.getOverview, {
    dateFrom: dateRange.from,
    dateTo: dateRange.to,
  });

  const funnel = useQuery(api.analytics.getFunnel, {
    dateFrom: dateRange.from,
    dateTo: dateRange.to,
  });

  const bottlenecks = useQuery(api.analytics.getStageBottlenecks, {
    dateFrom: dateRange.from,
    dateTo: dateRange.to,
  });

  const clientActivity = useQuery(api.analytics.getClientActivity, {
    dateFrom: dateRange.from,
    dateTo: dateRange.to,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
      </div>

      <AnalyticsOverview data={overview} />

      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <PipelineFunnel data={funnel} />
        <StageBottleneck data={bottlenecks} />
      </div>

      <ClientActivity data={clientActivity} />
    </div>
  );
}
