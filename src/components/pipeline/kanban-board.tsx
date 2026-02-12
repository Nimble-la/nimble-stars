"use client";

import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { KanbanColumn } from "./kanban-column";
import type { Id } from "../../../convex/_generated/dataModel";

interface CandidateItem {
  _id: Id<"candidatePositions">;
  candidateId: Id<"candidates">;
  candidateName: string;
  candidateRole?: string;
  commentCount: number;
  lastInteractionAt: number;
  stage: string;
}

const STAGES = [
  { id: "submitted", label: "Submitted", color: "bg-[#3B82F6]" },
  { id: "to_interview", label: "Interview", color: "bg-[#F59E0B]" },
  { id: "approved", label: "Approved", color: "bg-[#10B981]" },
  { id: "rejected", label: "Rejected", color: "bg-[#EF4444]" },
];

interface KanbanBoardProps {
  candidates: CandidateItem[];
  onStageChange: (candidatePositionId: Id<"candidatePositions">, newStage: string) => void;
}

export function KanbanBoard({ candidates, onStageChange }: KanbanBoardProps) {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const newStage = destination.droppableId;
    const item = candidates.find((c) => c._id === draggableId);
    if (item && item.stage !== newStage) {
      onStageChange(draggableId as Id<"candidatePositions">, newStage);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => (
          <KanbanColumn
            key={stage.id}
            stageId={stage.id}
            label={stage.label}
            color={stage.color}
            candidates={candidates.filter((c) => c.stage === stage.id)}
          />
        ))}
      </div>
    </DragDropContext>
  );
}
