"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode, useMemo } from "react";
import { AuthProvider } from "@/lib/auth/auth-context";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const client = useMemo(() => {
    if (!CONVEX_URL) return null;
    return new ConvexReactClient(CONVEX_URL);
  }, []);

  if (!client) {
    // Convex URL not configured — render children without Convex/Auth
    return <>{children}</>;
  }

  return (
    <ConvexProvider client={client}>
      <AuthProvider>{children}</AuthProvider>
    </ConvexProvider>
  );
}
