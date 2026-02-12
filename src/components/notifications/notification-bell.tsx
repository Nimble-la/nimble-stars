"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import type { Id } from "../../../convex/_generated/dataModel";

export function NotificationBell() {
  const { user, role } = useAuth();

  const unreadCount = useQuery(
    api.notifications.countUnread,
    user ? { userId: user._id as Id<"users"> } : "skip"
  );

  const href = role === "admin" ? "/admin/alerts" : "/alerts";

  return (
    <Button variant="ghost" size="icon" className="relative" asChild>
      <Link href={href}>
        <Bell className="h-5 w-5" />
        {!!unreadCount && unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Link>
    </Button>
  );
}
