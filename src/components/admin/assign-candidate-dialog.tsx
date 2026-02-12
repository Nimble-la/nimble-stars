"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
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
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth/auth-context";
import type { Id } from "../../../convex/_generated/dataModel";

interface AssignCandidateDialogProps {
  candidateId: Id<"candidates">;
  candidateName: string;
}

export function AssignCandidateDialog({
  candidateId,
  candidateName,
}: AssignCandidateDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  const [selectedPositionId, setSelectedPositionId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const orgs = useQuery(api.organizations.list);
  const positions = useQuery(
    api.positions.listOpenByOrg,
    selectedOrgId ? { orgId: selectedOrgId as Id<"organizations"> } : "skip"
  );
  const assign = useMutation(api.candidatePositions.assign);

  const handleOrgChange = (value: string) => {
    setSelectedOrgId(value);
    setSelectedPositionId("");
    setError(null);
  };

  const handleAssign = async () => {
    if (!selectedPositionId || !user) return;
    setSaving(true);
    setError(null);

    try {
      await assign({
        candidateId,
        positionId: selectedPositionId as Id<"positions">,
        userId: user._id as Id<"users">,
        userName: user.name,
      });
      toast.success(`${candidateName} assigned to position`);
      setOpen(false);
      setSelectedOrgId("");
      setSelectedPositionId("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to assign";
      if (msg.includes("already assigned")) {
        setError("This candidate is already assigned to this position.");
      } else {
        setError(msg);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Assign to Position
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign {candidateName} to Position</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Client</label>
            <Select value={selectedOrgId} onValueChange={handleOrgChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a client..." />
              </SelectTrigger>
              <SelectContent>
                {orgs?.map((org) => (
                  <SelectItem key={org._id} value={org._id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedOrgId && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Position</label>
              <Select
                value={selectedPositionId}
                onValueChange={(v) => {
                  setSelectedPositionId(v);
                  setError(null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a position..." />
                </SelectTrigger>
                <SelectContent>
                  {positions === undefined ? (
                    <SelectItem value="loading" disabled>
                      Loading...
                    </SelectItem>
                  ) : positions.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No open positions
                    </SelectItem>
                  ) : (
                    positions.map((pos) => (
                      <SelectItem key={pos._id} value={pos._id}>
                        {pos.title}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedPositionId || saving}
          >
            {saving ? "Assigning..." : "Assign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
