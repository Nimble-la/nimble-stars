"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";
import type { Id } from "../../../convex/_generated/dataModel";

interface Position {
  _id: Id<"positions">;
  title: string;
  description?: string;
  status: string;
  candidateCount: number;
  createdAt: number;
}

interface PositionManagementProps {
  orgId: Id<"organizations">;
  positions: Position[];
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function AddPositionDialog({
  orgId,
  onCreated,
}: {
  orgId: Id<"organizations">;
  onCreated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const createPosition = useMutation(api.positions.create);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createPosition({
        title,
        description: description || undefined,
        orgId,
      });
      setOpen(false);
      setTitle("");
      setDescription("");
      onCreated();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Position
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Position</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Frontend Developer"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Position description (optional)"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Creating..." : "Create Position"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function PositionManagement({ orgId, positions }: PositionManagementProps) {
  const router = useRouter();
  const updateStatus = useMutation(api.positions.updateStatus);

  const toggleStatus = async (positionId: Id<"positions">, currentStatus: string) => {
    await updateStatus({
      positionId,
      status: currentStatus === "open" ? "closed" : "open",
    });
  };

  if (positions === undefined) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <AddPositionDialog orgId={orgId} onCreated={() => {}} />
      </div>

      {positions.length === 0 ? (
        <p className="text-sm text-muted-foreground">No positions yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Candidates</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {positions.map((pos) => (
              <TableRow
                key={pos._id}
                className="cursor-pointer"
                onClick={() => router.push(`/admin/positions/${pos._id}`)}
              >
                <TableCell className="font-medium">{pos.title}</TableCell>
                <TableCell>
                  <Badge
                    variant={pos.status === "open" ? "default" : "secondary"}
                    className={
                      pos.status === "open"
                        ? "bg-stage-approved text-white"
                        : ""
                    }
                  >
                    {pos.status === "open" ? "Open" : "Closed"}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  {pos.candidateCount}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(pos.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStatus(pos._id, pos.status);
                    }}
                  >
                    {pos.status === "open" ? "Close" : "Reopen"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
