"use client";

import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, ArrowRightLeft, MessageSquare } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
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

export function NotificationBell() {
  const router = useRouter();
  const { user } = useAuth();

  const unreadCount = useQuery(
    api.notifications.countUnread,
    user ? { userId: user._id as Id<"users"> } : "skip"
  );
  const recent = useQuery(
    api.notifications.listRecent,
    user ? { userId: user._id as Id<"users">, limit: 15 } : "skip"
  );
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);

  const handleClick = async (
    notificationId: Id<"notifications">,
    candidatePositionId?: Id<"candidatePositions">,
    isRead?: boolean
  ) => {
    if (!isRead) {
      await markAsRead({ id: notificationId });
    }
    if (candidatePositionId) {
      // Navigate to admin pipeline — we don't know position ID from here,
      // so we navigate to the admin dashboard for now
      router.push("/admin");
    }
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    await markAllAsRead({ userId: user._id as Id<"users"> });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {!!unreadCount && unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-sm font-semibold">Notifications</span>
          {!!unreadCount && unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Mark all as read
            </button>
          )}
        </div>
        <DropdownMenuSeparator />
        <ScrollArea className="max-h-80">
          {recent === undefined ? (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              Loading...
            </div>
          ) : recent.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            recent.map((n) => (
              <DropdownMenuItem
                key={n._id}
                className="flex cursor-pointer items-start gap-3 px-3 py-2.5"
                onClick={() =>
                  handleClick(
                    n._id,
                    n.relatedCandidatePositionId as Id<"candidatePositions"> | undefined,
                    n.isRead
                  )
                }
              >
                <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                  n.type === "stage_change"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-amber-100 text-amber-600"
                }`}>
                  {n.type === "stage_change" ? (
                    <ArrowRightLeft className="h-3.5 w-3.5" />
                  ) : (
                    <MessageSquare className="h-3.5 w-3.5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${n.isRead ? "text-muted-foreground" : "font-medium"}`}>
                    {n.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {timeAgo(n.createdAt)}
                  </p>
                </div>
                {!n.isRead && (
                  <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                )}
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
