"use client";

import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Clock } from "lucide-react";
import type { Id } from "../../../convex/_generated/dataModel";

interface CandidateCardProps {
  candidatePositionId: Id<"candidatePositions">;
  candidateId: Id<"candidates">;
  candidateName: string;
  candidateRole?: string;
  commentCount: number;
  lastInteractionAt: number;
  onClick?: () => void;
}

function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function CandidateCard({
  candidateId,
  candidateName,
  candidateRole,
  commentCount,
  lastInteractionAt,
  onClick,
}: CandidateCardProps) {
  const router = useRouter();
  const initials = candidateName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push(`/admin/candidates/${candidateId}`);
    }
  };

  return (
    <div
      className="cursor-pointer rounded-lg border bg-card p-3 shadow-sm transition-shadow hover:shadow-md"
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium">{candidateName}</p>
          {candidateRole && (
            <p className="truncate text-xs text-muted-foreground">
              {candidateRole}
            </p>
          )}
        </div>
      </div>
      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <MessageSquare className="h-3 w-3" />
          {commentCount}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {timeAgo(lastInteractionAt)}
        </span>
      </div>
    </div>
  );
}
