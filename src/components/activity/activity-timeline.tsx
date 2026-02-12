"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowRightLeft, MessageSquare, ClipboardList } from "lucide-react";
import { STAGE_CONFIG } from "@/components/pipeline/stage-badge";
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

function formatAbsolute(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const ACTION_ICONS = {
  stage_change: ArrowRightLeft,
  comment: MessageSquare,
  assigned: ClipboardList,
} as const;

const ACTION_COLORS = {
  stage_change: "bg-blue-100 text-blue-600",
  comment: "bg-amber-100 text-amber-600",
  assigned: "bg-green-100 text-green-600",
} as const;

interface ActivityTimelineProps {
  candidatePositionId: Id<"candidatePositions">;
}

export function ActivityTimeline({ candidatePositionId }: ActivityTimelineProps) {
  const activities = useQuery(api.activityLog.listByCandidatePosition, {
    candidatePositionId,
  });

  if (activities === undefined) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No activity yet.</p>
    );
  }

  return (
    <TooltipProvider>
      <ScrollArea className="max-h-[400px]">
        <div className="space-y-4">
          {activities.map((activity) => {
            const actionKey = activity.action as keyof typeof ACTION_ICONS;
            const Icon = ACTION_ICONS[actionKey] ?? ClipboardList;
            const iconColor = ACTION_COLORS[actionKey] ?? "bg-gray-100 text-gray-600";

            const fromLabel = activity.fromStage
              ? STAGE_CONFIG[activity.fromStage]?.label ?? activity.fromStage
              : null;
            const toLabel = activity.toStage
              ? STAGE_CONFIG[activity.toStage]?.label ?? activity.toStage
              : null;

            return (
              <div key={activity._id} className="flex items-start gap-3">
                <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${iconColor}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{activity.userName}</span>{" "}
                    {activity.action === "assigned" ? (
                      "assigned this candidate to the position"
                    ) : activity.action === "stage_change" ? (
                      <>
                        moved from{" "}
                        <span className="font-medium">{fromLabel}</span> to{" "}
                        <span className="font-medium">{toLabel}</span>
                      </>
                    ) : activity.action === "comment" ? (
                      "left a comment"
                    ) : (
                      activity.action
                    )}
                  </p>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-xs text-muted-foreground cursor-default">
                        {timeAgo(activity.createdAt)}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      {formatAbsolute(activity.createdAt)}
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </TooltipProvider>
  );
}
