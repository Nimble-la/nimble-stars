"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Briefcase, Users, Clock } from "lucide-react";

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function MetricCard({
  title,
  value,
  icon: Icon,
  loading,
}: {
  title: string;
  value: number | undefined;
  icon: React.ComponentType<{ className?: string }>;
  loading: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <div className="text-2xl font-bold">{value ?? 0}</div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const clientCount = useQuery(api.organizations.countActive);
  const positionCount = useQuery(api.positions.countOpen);
  const pipelineCount = useQuery(api.candidatePositions.countAll);
  const recentActivity = useQuery(api.activityLog.getRecent, { limit: 10 });

  const metricsLoading =
    clientCount === undefined ||
    positionCount === undefined ||
    pipelineCount === undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of all clients, positions, and pipeline activity.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Active Clients"
          value={clientCount}
          icon={Building2}
          loading={metricsLoading}
        />
        <MetricCard
          title="Open Positions"
          value={positionCount}
          icon={Briefcase}
          loading={metricsLoading}
        />
        <MetricCard
          title="Candidates in Pipeline"
          value={pipelineCount}
          icon={Users}
          loading={metricsLoading}
        />
        <MetricCard
          title="Recent Actions"
          value={recentActivity?.length}
          icon={Clock}
          loading={recentActivity === undefined}
        />
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity === undefined ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No recent activity yet.
            </p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((entry) => (
                <div
                  key={entry._id}
                  className="flex items-start justify-between gap-4 text-sm"
                >
                  <div className="flex-1">
                    <span className="font-medium">{entry.userName}</span>{" "}
                    <span className="text-muted-foreground">
                      {entry.action}
                      {entry.fromStage && entry.toStage && (
                        <>
                          {" "}
                          from{" "}
                          <span className="font-medium">{entry.fromStage}</span>{" "}
                          to{" "}
                          <span className="font-medium">{entry.toStage}</span>
                        </>
                      )}
                    </span>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatRelativeTime(entry.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
