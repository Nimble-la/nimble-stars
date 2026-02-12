"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { useAuth } from "@/lib/auth/auth-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex flex-1 flex-col">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          actions={role === "admin" ? <NotificationBell /> : undefined}
        />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
