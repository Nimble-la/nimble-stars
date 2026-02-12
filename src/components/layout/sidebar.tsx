"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "@/lib/auth/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Building2,
  Users,
  Briefcase,
  Bell,
  LogOut,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Id } from "../../../convex/_generated/dataModel";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/alerts", label: "Alerts", icon: Bell },
  { href: "/admin/clients", label: "Clients", icon: Building2 },
  { href: "/admin/candidates", label: "Candidates", icon: Users },
];

const clientLinks = [
  { href: "/positions", label: "Positions", icon: Briefcase },
  { href: "/alerts", label: "Alerts", icon: Bell },
];

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, role, orgId, signOut } = useAuth();
  const [logoError, setLogoError] = useState(false);

  const isAdmin = role === "admin";
  const org = useQuery(
    api.organizations.getById,
    !isAdmin && orgId ? { orgId: orgId as Id<"organizations"> } : "skip"
  );
  const logoUrl = isAdmin ? null : (org?.logoUrl ?? null);

  const unreadCount = useQuery(
    api.notifications.countUnread,
    user ? { userId: user._id as Id<"users"> } : "skip"
  );

  const links = role === "admin" ? adminLinks : clientLinks;

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-nimble-gray-900 text-white transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-6">
          {logoUrl && !logoError ? (
            <Image
              src={logoUrl}
              alt="Logo"
              width={140}
              height={32}
              className="h-8 w-auto object-contain"
              onError={() => setLogoError(true)}
            />
          ) : (
            <span className="text-xl font-bold tracking-tight">nimble</span>
          )}
          <button
            onClick={onClose}
            className="rounded-md p-1 hover:bg-white/10 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {links.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/admin" && pathname.startsWith(link.href));
            const showBadge =
              link.label === "Alerts" && !!unreadCount && unreadCount > 0;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-white/15 text-white"
                    : "text-nimble-gray-400 hover:bg-white/10 hover:text-white"
                )}
              >
                <link.icon className="h-5 w-5" />
                {link.label}
                {showBadge && (
                  <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src="" />
              <AvatarFallback className="bg-white/20 text-xs text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium">{user?.name}</p>
              <p className="truncate text-xs text-nimble-gray-400">
                {user?.email}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={signOut}
              className="h-8 w-8 text-nimble-gray-400 hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
