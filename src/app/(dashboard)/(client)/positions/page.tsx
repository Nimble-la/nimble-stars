"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth/auth-context";
import type { Id } from "../../../../../convex/_generated/dataModel";

const STAGE_LABELS: Record<string, { label: string; color: string }> = {
  submitted: { label: "Submitted", color: "bg-[#3B82F6]" },
  to_interview: { label: "Interview", color: "bg-[#F59E0B]" },
  approved: { label: "Approved", color: "bg-[#10B981]" },
  rejected: { label: "Rejected", color: "bg-[#EF4444]" },
};

export default function PositionsPage() {
  const router = useRouter();
  const { orgId } = useAuth();

  const positions = useQuery(
    api.positions.listOpenByOrg,
    orgId ? { orgId: orgId as Id<"organizations"> } : "skip"
  );

  if (!orgId) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Positions</h1>

      {positions === undefined ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : positions.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">No open positions at the moment.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {positions.map((pos) => (
            <Card
              key={pos._id}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => router.push(`/positions/${pos._id}`)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{pos.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {pos.candidateCount} candidate{pos.candidateCount !== 1 ? "s" : ""}
                </p>
                {pos.candidateCount > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {Object.entries(pos.stageCounts).map(([stage, count]) => {
                      if (count === 0) return null;
                      const config = STAGE_LABELS[stage];
                      if (!config) return null;
                      return (
                        <span
                          key={stage}
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs text-white ${config.color}`}
                        >
                          {count} {config.label}
                        </span>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
