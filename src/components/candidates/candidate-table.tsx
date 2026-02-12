"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StageBadge } from "@/components/pipeline/stage-badge";
import type { Id } from "../../../convex/_generated/dataModel";

interface CandidateItem {
  _id: Id<"candidatePositions">;
  candidateId: Id<"candidates">;
  candidateName: string;
  candidateRole?: string;
  commentCount: number;
  lastInteractionAt: number;
  stage: string;
  createdAt: number;
}

interface CandidateTableProps {
  candidates: CandidateItem[];
  onRowClick?: (candidateId: Id<"candidates">) => void;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

type SortKey = "createdAt" | "lastInteractionAt";

export function CandidateTable({ candidates, onRowClick }: CandidateTableProps) {
  const router = useRouter();
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortKey>("lastInteractionAt");

  const filtered =
    stageFilter === "all"
      ? candidates
      : candidates.filter((c) => c.stage === stageFilter);

  const sorted = [...filtered].sort(
    (a, b) => b[sortBy] - a[sortBy]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="to_interview">Interview</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortKey)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="lastInteractionAt">Last Interaction</SelectItem>
            <SelectItem value="createdAt">Date Added</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground">No candidates to show.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Current Role</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Date Added</TableHead>
              <TableHead>Last Interaction</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((c) => (
              <TableRow
                key={c._id}
                className="cursor-pointer"
                onClick={() =>
                  onRowClick
                    ? onRowClick(c.candidateId)
                    : router.push(`/admin/candidates/${c.candidateId}`)
                }
              >
                <TableCell className="font-medium">{c.candidateName}</TableCell>
                <TableCell className="text-muted-foreground">
                  {c.candidateRole ?? "—"}
                </TableCell>
                <TableCell>
                  <StageBadge stage={c.stage} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(c.createdAt)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(c.lastInteractionAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
