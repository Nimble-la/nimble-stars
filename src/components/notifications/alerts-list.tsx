"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "@/lib/auth/auth-context";
import { AlertCard } from "./alert-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BellOff } from "lucide-react";
import type { Id } from "../../../convex/_generated/dataModel";

type FilterValue =
  | undefined
  | "unread"
  | "stage_change"
  | "new_comment"
  | "client_login"
  | "candidate_assigned";

interface AlertsListProps {
  showLoginType?: boolean;
}

const allTabs: { value: string; label: string; filter: FilterValue }[] = [
  { value: "all", label: "All", filter: undefined },
  { value: "unread", label: "Unread", filter: "unread" },
  { value: "stage_change", label: "Stage Changes", filter: "stage_change" },
  { value: "new_comment", label: "Comments", filter: "new_comment" },
  { value: "client_login", label: "Logins", filter: "client_login" },
  {
    value: "candidate_assigned",
    label: "Assignments",
    filter: "candidate_assigned",
  },
];

export function AlertsList({ showLoginType = true }: AlertsListProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");

  const tabs = showLoginType
    ? allTabs
    : allTabs.filter((t) => t.value !== "client_login");

  const currentFilter = tabs.find((t) => t.value === activeTab)?.filter;

  const notifications = useQuery(
    api.notifications.listFiltered,
    user
      ? {
          userId: user._id as Id<"users">,
          filter: currentFilter,
          limit: 50,
        }
      : "skip"
  );
  const unreadCount = useQuery(
    api.notifications.countUnread,
    user ? { userId: user._id as Id<"users"> } : "skip"
  );
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);

  const handleMarkAllRead = async () => {
    if (!user) return;
    await markAllAsRead({ userId: user._id as Id<"users"> });
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Alerts</h1>
        {!!unreadCount && unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
            Mark all as read
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {notifications === undefined ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-lg bg-muted"
            />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <BellOff className="mb-3 h-10 w-10" />
          <p className="text-lg font-medium">You&apos;re all caught up!</p>
          <p className="text-sm">No notifications to show.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <AlertCard key={n._id} notification={n} />
          ))}
        </div>
      )}
    </div>
  );
}
