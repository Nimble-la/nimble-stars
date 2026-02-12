"use client";

import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Building2 } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ClientsPage() {
  const organizations = useQuery(api.organizations.list);
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clients</h1>
          <p className="text-muted-foreground">
            Manage client organizations and their branding.
          </p>
        </div>
        <Button onClick={() => router.push("/admin/clients/new")}>
          <Plus className="mr-2 h-4 w-4" />
          New Client
        </Button>
      </div>

      {organizations === undefined ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : organizations.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No clients yet"
          description="Create your first client to get started."
          action={{ label: "New Client", onClick: () => router.push("/admin/clients/new") }}
        />
      ) : (
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Logo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Color</TableHead>
              <TableHead className="text-center">Positions</TableHead>
              <TableHead className="text-center">Users</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {organizations.map((org) => (
              <TableRow
                key={org._id}
                className="cursor-pointer"
                onClick={() => router.push(`/admin/clients/${org._id}`)}
              >
                <TableCell>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={org.logoUrl ?? ""} />
                    <AvatarFallback className="text-xs">
                      {org.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">{org.name}</TableCell>
                <TableCell>
                  {org.primaryColor ? (
                    <div className="flex items-center gap-2">
                      <div
                        className="h-5 w-5 rounded-full border"
                        style={{ backgroundColor: org.primaryColor }}
                      />
                      <span className="text-xs text-muted-foreground">
                        {org.primaryColor}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {org.positionCount}
                </TableCell>
                <TableCell className="text-center">
                  {org.userCount}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(org.createdAt)}
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
