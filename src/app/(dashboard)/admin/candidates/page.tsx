"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Users } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function CandidatesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const candidates = useQuery(api.candidates.list, {
    search: search || undefined,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Candidates</h1>
        <Button onClick={() => router.push("/admin/candidates/new")}>
          <Plus className="mr-2 h-4 w-4" />
          New Candidate
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, role, or company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {candidates === undefined ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : candidates.length === 0 ? (
        <EmptyState
          icon={search ? Search : Users}
          title={search ? "No results found" : "No candidates yet"}
          description={search ? "Try a different search term." : "Add your first candidate to the bank."}
          action={!search ? { label: "New Candidate", onClick: () => router.push("/admin/candidates/new") } : undefined}
        />
      ) : (
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Current Role</TableHead>
              <TableHead>Company</TableHead>
              <TableHead className="text-center">Positions</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {candidates.map((candidate) => (
              <TableRow
                key={candidate._id}
                className="cursor-pointer"
                onClick={() =>
                  router.push(`/admin/candidates/${candidate._id}`)
                }
              >
                <TableCell className="font-medium">
                  {candidate.fullName}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {candidate.currentRole ?? "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {candidate.currentCompany ?? "—"}
                </TableCell>
                <TableCell className="text-center">
                  {candidate.positionCount}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(candidate.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      )}
    </div>
  );
}
