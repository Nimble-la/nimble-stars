"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useAction } from "convex/react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
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

interface ManatalJob {
  id: number;
  title: string;
  description: string;
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
  const [mode, setMode] = useState<"manual" | "import">("manual");
  const [jobs, setJobs] = useState<ManatalJob[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [jobsError, setJobsError] = useState<string | null>(null);
  const [jobsFetched, setJobsFetched] = useState(false);

  const createPosition = useMutation(api.positions.create);
  const listJobs = useAction(api.manatal.listJobs);

  const fetchJobs = async () => {
    if (jobsFetched) return;
    setLoadingJobs(true);
    setJobsError(null);
    try {
      const data = await listJobs();
      setJobs(data.results);
      setJobsFetched(true);
    } catch (err) {
      setJobsError(err instanceof Error ? err.message : "Failed to fetch jobs");
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleModeChange = (value: string) => {
    setMode(value as "manual" | "import");
    if (value === "import") {
      fetchJobs();
    }
  };

  const handleJobSelect = (jobId: string) => {
    const job = jobs.find((j) => String(j.id) === jobId);
    if (job) {
      setTitle(job.title);
      // Strip HTML tags from description
      const cleanDesc = job.description.replace(/<[^>]*>/g, "").trim();
      setDescription(cleanDesc);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createPosition({
        title,
        description: description || undefined,
        orgId,
      });
      toast.success("Position created");
      setOpen(false);
      resetForm();
      onCreated();
    } catch {
      toast.error("Failed to create position");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setMode("manual");
    setJobs([]);
    setJobsFetched(false);
    setJobsError(null);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
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
        <Tabs value={mode} onValueChange={handleModeChange}>
          <TabsList className="w-full">
            <TabsTrigger value="manual" className="flex-1">Manual</TabsTrigger>
            <TabsTrigger value="import" className="flex-1">Import from Manatal</TabsTrigger>
          </TabsList>
          <TabsContent value="import">
            <div className="space-y-2 pt-2">
              {loadingJobs && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading jobs from Manatal...
                </div>
              )}
              {jobsError && (
                <p className="text-sm text-destructive">{jobsError}</p>
              )}
              {jobsFetched && jobs.length === 0 && !loadingJobs && (
                <p className="text-sm text-muted-foreground">No active jobs found in Manatal.</p>
              )}
              {jobsFetched && jobs.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select a job</label>
                  <Select onValueChange={handleJobSelect}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose a Manatal job..." />
                    </SelectTrigger>
                    <SelectContent>
                      {jobs.map((job) => (
                        <SelectItem key={job.id} value={String(job.id)}>
                          {job.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        <form onSubmit={handleSubmit} className="space-y-4">
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
    const newStatus = currentStatus === "open" ? "closed" : "open";
    try {
      await updateStatus({ positionId, status: newStatus });
      toast.success(`Position ${newStatus === "open" ? "reopened" : "closed"}`);
    } catch {
      toast.error("Failed to update position status");
    }
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
        <div className="overflow-x-auto">
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
        </div>
      )}
    </div>
  );
}
