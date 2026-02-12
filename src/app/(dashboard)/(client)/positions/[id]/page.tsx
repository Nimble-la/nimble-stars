"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { KanbanBoard } from "@/components/pipeline/kanban-board";
import { CandidateTable } from "@/components/candidates/candidate-table";
import { useAuth } from "@/lib/auth/auth-context";
import { toast } from "sonner";
import type { Id } from "../../../../../../convex/_generated/dataModel";

export default function ClientPipelinePage() {
  const params = useParams();
  const router = useRouter();
  const positionId = params.id as string;
  const { user, orgId } = useAuth();
  const [view, setView] = useState<"kanban" | "list">("kanban");

  const position = useQuery(api.positions.getById, {
    positionId: positionId as Id<"positions">,
  });

  const candidates = useQuery(
    api.candidatePositions.listByPositionForClient,
    orgId
      ? {
          positionId: positionId as Id<"positions">,
          orgId: orgId as Id<"organizations">,
        }
      : "skip"
  );

  const updateStage = useMutation(api.candidatePositions.updateStage);

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

  const handleCandidateClick = (candidateId: Id<"candidates">) => {
    // Find the candidatePositionId for this candidate in this position
    const cp = candidates?.find((c) => c.candidateId === candidateId);
    if (cp) {
      router.push(`/positions/${positionId}/candidates/${cp._id}`);
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
        <Button variant="outline" onClick={() => router.push("/positions")}>
          Back to Positions
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{position.title}</h1>
        {position.description && (
          <p className="mt-1 text-sm text-muted-foreground">
            {position.description}
          </p>
        )}
      </div>

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
          <CandidateTable
            candidates={candidates}
            onRowClick={handleCandidateClick}
          />
        )}
      </div>
    </div>
  );
}
