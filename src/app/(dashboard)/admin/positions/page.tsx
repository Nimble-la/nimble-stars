"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

type StatusFilter = "all" | "open" | "closed";

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function PositionsPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const positions = useQuery(api.positions.listAll, {
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const filters: { label: string; value: StatusFilter }[] = [
    { label: "All", value: "all" },
    { label: "Open", value: "open" },
    { label: "Closed", value: "closed" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Positions</h1>
      </div>

      <div className="flex items-center gap-2">
        {filters.map((f) => (
          <Button
            key={f.value}
            variant={statusFilter === f.value ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {positions === undefined ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : positions.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No positions found"
          description={
            statusFilter === "all"
              ? "No positions have been created yet."
              : `No ${statusFilter} positions found.`
          }
        />
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Candidates</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positions.map((position) => (
                <TableRow
                  key={position._id}
                  className="cursor-pointer"
                  onClick={() =>
                    router.push(`/admin/positions/${position._id}`)
                  }
                >
                  <TableCell className="font-medium">
                    {position.title}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {position.orgName}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        position.status === "open" ? "default" : "secondary"
                      }
                    >
                      {position.status === "open" ? "Open" : "Closed"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {position.candidateCount}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(position.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
