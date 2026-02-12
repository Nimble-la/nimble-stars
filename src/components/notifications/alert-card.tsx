"use client";

import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  ArrowRightLeft,
  MessageSquare,
  KeyRound,
  ClipboardList,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Doc } from "../../../convex/_generated/dataModel";

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

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

const typeConfig = {
  stage_change: {
    icon: ArrowRightLeft,
    bgColor: "bg-blue-100",
    textColor: "text-blue-600",
  },
  new_comment: {
    icon: MessageSquare,
    bgColor: "bg-amber-100",
    textColor: "text-amber-600",
  },
  client_login: {
    icon: KeyRound,
    bgColor: "bg-green-100",
    textColor: "text-green-600",
  },
  candidate_assigned: {
    icon: ClipboardList,
    bgColor: "bg-purple-100",
    textColor: "text-purple-600",
  },
};

interface AlertCardProps {
  notification: Doc<"notifications">;
}

export function AlertCard({ notification }: AlertCardProps) {
  const markAsRead = useMutation(api.notifications.markAsRead);
  const config = typeConfig[notification.type];
  const Icon = config.icon;

  const handleClick = async () => {
    if (!notification.isRead) {
      await markAsRead({ id: notification._id });
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left transition-colors hover:bg-muted/50 ${
        notification.isRead
          ? "border-transparent bg-background"
          : "border-l-4 border-l-blue-500 border-t-transparent border-r-transparent border-b-transparent bg-blue-50/50"
      }`}
    >
      <div
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${config.bgColor} ${config.textColor}`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm ${notification.isRead ? "text-muted-foreground" : "font-medium text-foreground"}`}
        >
          {notification.message}
        </p>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {timeAgo(notification.createdAt)}
              </p>
            </TooltipTrigger>
            <TooltipContent>
              <p>{formatDate(notification.createdAt)}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      {!notification.isRead && (
        <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
      )}
    </button>
  );
}
