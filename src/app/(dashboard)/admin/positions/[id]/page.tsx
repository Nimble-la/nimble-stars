"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { KanbanBoard } from "@/components/pipeline/kanban-board";
import { CandidateTable } from "@/components/candidates/candidate-table";
import { STAGE_CONFIG } from "@/components/pipeline/stage-badge";
import { useAuth } from "@/lib/auth/auth-context";
import { toast } from "sonner";
import type { Id } from "../../../../../../convex/_generated/dataModel";

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function ActivityFeed({ positionId }: { positionId: Id<"positions"> }) {
  const activities = useQuery(api.activityLog.listByPosition, { positionId });

  if (activities === undefined) {
    return <Skeleton className="h-40 w-full" />;
  }

  if (activities.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No activity yet.</p>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((a) => {
        const fromLabel = a.fromStage
          ? STAGE_CONFIG[a.fromStage]?.label ?? a.fromStage
          : null;
        const toLabel = a.toStage
          ? STAGE_CONFIG[a.toStage]?.label ?? a.toStage
          : null;

        return (
          <div key={a._id} className="flex items-start gap-3 text-sm">
            <div className="mt-1 h-2 w-2 rounded-full bg-muted-foreground" />
            <div className="flex-1">
              <p>
                <span className="font-medium">{a.userName}</span>{" "}
                {a.action === "assigned" ? (
                  <>assigned <span className="font-medium">{a.candidateName}</span></>
                ) : a.action === "stage_change" ? (
                  <>
                    moved <span className="font-medium">{a.candidateName}</span>{" "}
                    from {fromLabel} to {toLabel}
                  </>
                ) : (
                  <>{a.action}</>
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDate(a.createdAt)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function PositionPipelinePage() {
  const params = useParams();
  const router = useRouter();
  const positionId = params.id as string;
  const { user } = useAuth();
  const [view, setView] = useState<"kanban" | "list">("kanban");

  const position = useQuery(api.positions.getById, {
    positionId: positionId as Id<"positions">,
  });
  const candidates = useQuery(api.candidatePositions.listByPosition, {
    positionId: positionId as Id<"positions">,
  });
  const updateStage = useMutation(api.candidatePositions.updateStage);
  const updateStatus = useMutation(api.positions.updateStatus);

  const handleStageChange = async (
    candidatePositionId: Id<"candidatePositions">,
    newStage: string
  ) => {
    if (!user) return;
    try {
      await updateStage({
        id: candidatePositionId,
        stage: newStage as "submitted" | "to_interview" | "approved" | "rejected",
        userId: user._id as Id<"users">,
        userName: user.name,
      });
      toast.success("Stage updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update stage");
    }
  };

  if (position === undefined || candidates === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (position === null) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Position Not Found</h1>
        <Button variant="outline" onClick={() => router.push("/admin/clients")}>
          Back to Clients
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Position Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{position.title}</h1>
          <Badge
            variant={position.status === "open" ? "default" : "secondary"}
            className={
              position.status === "open"
                ? "bg-stage-approved text-white"
                : ""
            }
          >
            {position.status === "open" ? "Open" : "Closed"}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              const newStatus = position.status === "open" ? "closed" : "open";
              try {
                await updateStatus({
                  positionId: positionId as Id<"positions">,
                  status: newStatus,
                });
                toast.success(`Position ${newStatus === "open" ? "reopened" : "closed"}`);
              } catch {
                toast.error("Failed to update position status");
              }
            }}
          >
            {position.status === "open" ? "Close Position" : "Reopen Position"}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">{position.orgName}</p>
        {position.description && (
          <p className="mt-2 text-sm">{position.description}</p>
        )}
      </div>

      {/* View Toggle + Pipeline */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button
            variant={view === "kanban" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("kanban")}
          >
            Kanban
          </Button>
          <Button
            variant={view === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("list")}
          >
            List
          </Button>
          <span className="ml-auto text-sm text-muted-foreground">
            {candidates.length} candidate{candidates.length !== 1 ? "s" : ""}
          </span>
        </div>

        {view === "kanban" ? (
          <KanbanBoard
            candidates={candidates}
            onStageChange={handleStageChange}
          />
        ) : (
          <CandidateTable candidates={candidates} />
        )}
      </div>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityFeed positionId={positionId as Id<"positions">} />
        </CardContent>
      </Card>
    </div>
  );
}
