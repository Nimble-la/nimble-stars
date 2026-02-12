"use client";

import { useAuth } from "@/lib/auth/auth-context";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { orgId } = useAuth();

  const org = useQuery(
    api.organizations.getById,
    orgId ? { orgId: orgId as never } : "skip"
  );

  const primaryColor = org?.primaryColor ?? undefined;

  return (
    <div
      style={
        primaryColor
          ? ({
              "--client-primary": primaryColor,
              "--client-primary-hover": `${primaryColor}dd`,
              "--client-primary-light": `${primaryColor}15`,
            } as React.CSSProperties)
          : undefined
      }
    >
      {children}
    </div>
  );
}
