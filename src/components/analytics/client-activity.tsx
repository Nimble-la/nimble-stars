"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpDown, Building2 } from "lucide-react";
import type { Id } from "../../../convex/_generated/dataModel";

interface ClientActivityRow {
  orgId: Id<"organizations">;
  orgName: string;
  openPositions: number;
  candidateCount: number;
  avgResponseTime: number | null;
  lastActive: number | null;
}

interface ClientActivityProps {
  data: ClientActivityRow[] | undefined;
}

type SortKey = "orgName" | "openPositions" | "candidateCount" | "avgResponseTime" | "lastActive";
type SortDir = "asc" | "desc";

const MS_PER_DAY = 86400000;

function formatRelativeTime(timestamp: number | null): string {
  if (!timestamp) return "Never";
  const diff = Date.now() - timestamp;
  const days = Math.floor(diff / MS_PER_DAY);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

function getResponseTimeColor(days: number | null): string {
  if (days === null) return "text-muted-foreground";
  if (days < 3) return "text-green-600";
  if (days <= 7) return "text-amber-600";
  return "text-red-600";
}

function getLastActiveColor(timestamp: number | null): string {
  if (!timestamp) return "text-red-600";
  const days = (Date.now() - timestamp) / MS_PER_DAY;
  if (days < 1) return "text-green-600";
  if (days <= 7) return "text-amber-600";
  return "text-red-600";
}

export function ClientActivity({ data }: ClientActivityProps) {
  const router = useRouter();
  const [sortKey, setSortKey] = useState<SortKey>("orgName");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Client Activity</CardTitle>
          <CardDescription>Engagement metrics by organization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Client Activity</CardTitle>
          <CardDescription>Engagement metrics by organization</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-sm text-muted-foreground">
            No client data available
          </p>
        </CardContent>
      </Card>
    );
  }

  const sorted = [...data].sort((a, b) => {
    const mul = sortDir === "asc" ? 1 : -1;
    switch (sortKey) {
      case "orgName":
        return mul * a.orgName.localeCompare(b.orgName);
      case "openPositions":
        return mul * (a.openPositions - b.openPositions);
      case "candidateCount":
        return mul * (a.candidateCount - b.candidateCount);
      case "avgResponseTime":
        return mul * ((a.avgResponseTime ?? 999) - (b.avgResponseTime ?? 999));
      case "lastActive":
        return mul * ((a.lastActive ?? 0) - (b.lastActive ?? 0));
      default:
        return 0;
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Client Activity</CardTitle>
        <CardDescription>Engagement metrics by organization</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHead
                  label="Client"
                  sortKey="orgName"
                  currentKey={sortKey}
                  currentDir={sortDir}
                  onSort={handleSort}
                />
                <SortableHead
                  label="Open Positions"
                  sortKey="openPositions"
                  currentKey={sortKey}
                  currentDir={sortDir}
                  onSort={handleSort}
                  className="text-center"
                />
                <SortableHead
                  label="Candidates"
                  sortKey="candidateCount"
                  currentKey={sortKey}
                  currentDir={sortDir}
                  onSort={handleSort}
                  className="text-center"
                />
                <SortableHead
                  label="Avg. Response"
                  sortKey="avgResponseTime"
                  currentKey={sortKey}
                  currentDir={sortDir}
                  onSort={handleSort}
                  className="text-right"
                />
                <SortableHead
                  label="Last Active"
                  sortKey="lastActive"
                  currentKey={sortKey}
                  currentDir={sortDir}
                  onSort={handleSort}
                  className="text-right"
                />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((row) => (
                <TableRow
                  key={row.orgId}
                  className="cursor-pointer"
                  onClick={() => router.push(`/admin/clients/${row.orgId}`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded bg-muted">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <span className="font-medium">{row.orgName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {row.openPositions}
                  </TableCell>
                  <TableCell className="text-center">
                    {row.candidateCount}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={getResponseTimeColor(row.avgResponseTime)}>
                      {row.avgResponseTime !== null
                        ? `${row.avgResponseTime} days`
                        : "—"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={getLastActiveColor(row.lastActive)}>
                      {formatRelativeTime(row.lastActive)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function SortableHead({
  label,
  sortKey,
  currentKey,
  currentDir,
  onSort,
  className = "",
}: {
  label: string;
  sortKey: SortKey;
  currentKey: SortKey;
  currentDir: SortDir;
  onSort: (key: SortKey) => void;
  className?: string;
}) {
  const isActive = currentKey === sortKey;
  return (
    <TableHead className={className}>
      <button
        className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
        onClick={() => onSort(sortKey)}
      >
        {label}
        <ArrowUpDown
          className={`h-3 w-3 ${isActive ? "text-foreground" : "text-muted-foreground/50"}`}
        />
        {isActive && (
          <span className="text-[10px] text-muted-foreground">
            {currentDir === "asc" ? "↑" : "↓"}
          </span>
        )}
      </button>
    </TableHead>
  );
}
