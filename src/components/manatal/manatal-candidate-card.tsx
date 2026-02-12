"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2 } from "lucide-react";
import type { ManatalCandidate } from "@/lib/types/manatal";

interface ManatalCandidateCardProps {
  candidate: ManatalCandidate;
  onImport: (manatalId: number) => void;
  importing?: boolean;
}

export function ManatalCandidateCard({
  candidate,
  onImport,
  importing,
}: ManatalCandidateCardProps) {
  const existing = useQuery(api.candidates.getByManatalId, {
    manatalId: candidate.id,
  });

  const initials = candidate.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const details = [candidate.current_position, candidate.current_company]
    .filter(Boolean)
    .join(" · ");
  const contact = [candidate.email, candidate.phone_number]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex items-center gap-4 rounded-lg border p-4">
      <Avatar className="h-10 w-10">
        <AvatarFallback className="bg-gray-100 text-sm font-medium">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{candidate.full_name}</p>
        {details && (
          <p className="text-sm text-muted-foreground truncate">{details}</p>
        )}
        {contact && (
          <p className="text-xs text-muted-foreground truncate">{contact}</p>
        )}
      </div>
      {existing ? (
        <Badge variant="secondary" className="shrink-0">
          <Check className="mr-1 h-3 w-3" />
          Already imported
        </Badge>
      ) : (
        <Button
          size="sm"
          onClick={() => onImport(candidate.id)}
          disabled={importing}
        >
          {importing ? (
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
          ) : null}
          Import
        </Button>
      )}
    </div>
  );
}
