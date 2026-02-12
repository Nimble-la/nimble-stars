"use client";

import { useAuth } from "@/lib/auth/auth-context";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

function hexToOklch(hex: string): string | null {
  // Convert hex to RGB
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  // sRGB to linear RGB
  const toLinear = (c: number) =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const lr = toLinear(r);
  const lg = toLinear(g);
  const lb = toLinear(b);

  // Linear RGB to OKLab
  const l_ = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m_ = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s_ = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

  const l_c = Math.cbrt(l_);
  const m_c = Math.cbrt(m_);
  const s_c = Math.cbrt(s_);

  const L = 0.2104542553 * l_c + 0.7936177850 * m_c - 0.0040720468 * s_c;
  const a = 1.9779984951 * l_c - 2.4285922050 * m_c + 0.4505937099 * s_c;
  const bOk = 0.0259040371 * l_c + 0.7827717662 * m_c - 0.8086757660 * s_c;

  const C = Math.sqrt(a * a + bOk * bOk);
  let h = (Math.atan2(bOk, a) * 180) / Math.PI;
  if (h < 0) h += 360;

  return `oklch(${L.toFixed(3)} ${C.toFixed(3)} ${h.toFixed(1)})`;
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { orgId } = useAuth();

  const org = useQuery(
    api.organizations.getById,
    orgId ? { orgId: orgId as Id<"organizations"> } : "skip"
  );

  const primaryColor = org?.primaryColor ?? undefined;
  const oklchPrimary = primaryColor ? hexToOklch(primaryColor) : null;

  return (
    <div
      style={
        primaryColor
          ? ({
              "--client-primary": primaryColor,
              "--client-primary-hover": `${primaryColor}dd`,
              "--client-primary-light": `${primaryColor}15`,
              ...(oklchPrimary ? { "--primary": oklchPrimary } : {}),
            } as React.CSSProperties)
          : undefined
      }
    >
      {children}
    </div>
  );
}
