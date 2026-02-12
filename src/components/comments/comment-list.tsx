"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { Id } from "../../../convex/_generated/dataModel";

function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface CommentListProps {
  candidatePositionId: Id<"candidatePositions">;
}

export function CommentList({ candidatePositionId }: CommentListProps) {
  const comments = useQuery(api.comments.listByCandidatePosition, {
    candidatePositionId,
  });

  if (comments === undefined) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No comments yet.</p>
    );
  }

  return (
    <ScrollArea className="max-h-[400px]">
      <div className="space-y-4">
        {comments.map((comment) => {
          const initials = comment.userName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
          return (
            <div key={comment._id} className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{comment.userName}</span>
                  <span className="text-xs text-muted-foreground">
                    {timeAgo(comment.createdAt)}
                  </span>
                </div>
                <p className="mt-1 text-sm whitespace-pre-wrap">{comment.body}</p>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
