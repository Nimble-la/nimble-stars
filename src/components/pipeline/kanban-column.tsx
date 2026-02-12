"use client";

import { Droppable, Draggable } from "@hello-pangea/dnd";
import { CandidateCard } from "@/components/candidates/candidate-card";
import type { Id } from "../../../convex/_generated/dataModel";

interface CandidateItem {
  _id: Id<"candidatePositions">;
  candidateId: Id<"candidates">;
  candidateName: string;
  candidateRole?: string;
  commentCount: number;
  lastInteractionAt: number;
}

interface KanbanColumnProps {
  stageId: string;
  label: string;
  color: string;
  candidates: CandidateItem[];
}

export function KanbanColumn({
  stageId,
  label,
  color,
  candidates,
}: KanbanColumnProps) {
  return (
    <div className="flex w-72 flex-shrink-0 flex-col rounded-lg bg-muted/50">
      <div className="flex items-center gap-2 px-3 py-3">
        <div className={`h-3 w-3 rounded-full ${color}`} />
        <h3 className="text-sm font-semibold">{label}</h3>
        <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {candidates.length}
        </span>
      </div>
      <Droppable droppableId={stageId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 space-y-2 px-2 pb-2 min-h-[100px] transition-colors ${
              snapshot.isDraggingOver ? "bg-muted/80" : ""
            }`}
          >
            {candidates.length === 0 && !snapshot.isDraggingOver && (
              <p className="py-4 text-center text-xs text-muted-foreground">
                No candidates
              </p>
            )}
            {candidates.map((candidate, index) => (
              <Draggable
                key={candidate._id}
                draggableId={candidate._id}
                index={index}
              >
                {(dragProvided) => (
                  <div
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                    {...dragProvided.dragHandleProps}
                  >
                    <CandidateCard
                      candidatePositionId={candidate._id}
                      candidateId={candidate.candidateId}
                      candidateName={candidate.candidateName}
                      candidateRole={candidate.candidateRole}
                      commentCount={candidate.commentCount}
                      lastInteractionAt={candidate.lastInteractionAt}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
