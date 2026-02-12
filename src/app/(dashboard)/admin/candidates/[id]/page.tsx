"use client";

import { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  ExternalLink,
  Pencil,
  Upload,
  FileIcon,
  Download,
} from "lucide-react";
import { uploadFile } from "@/lib/supabase/storage";
import type { Id } from "../../../../../../convex/_generated/dataModel";

const STAGE_CONFIG: Record<string, { label: string; color: string }> = {
  submitted: { label: "Submitted", color: "bg-[#3B82F6]" },
  to_interview: { label: "Interview", color: "bg-[#F59E0B]" },
  approved: { label: "Approved", color: "bg-[#10B981]" },
  rejected: { label: "Rejected", color: "bg-[#EF4444]" },
};

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function EditCandidateDialog({
  candidate,
}: {
  candidate: {
    _id: Id<"candidates">;
    fullName: string;
    email?: string;
    phone?: string;
    currentRole?: string;
    currentCompany?: string;
    summary?: string;
    manatalUrl?: string;
  };
}) {
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState(candidate.fullName);
  const [email, setEmail] = useState(candidate.email ?? "");
  const [phone, setPhone] = useState(candidate.phone ?? "");
  const [currentRole, setCurrentRole] = useState(candidate.currentRole ?? "");
  const [currentCompany, setCurrentCompany] = useState(candidate.currentCompany ?? "");
  const [summary, setSummary] = useState(candidate.summary ?? "");
  const [manatalUrl, setManatalUrl] = useState(candidate.manatalUrl ?? "");
  const [saving, setSaving] = useState(false);

  const updateCandidate = useMutation(api.candidates.update);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateCandidate({
        candidateId: candidate._id,
        fullName,
        email: email || undefined,
        phone: phone || undefined,
        currentRole: currentRole || undefined,
        currentCompany: currentCompany || undefined,
        summary: summary || undefined,
        manatalUrl: manatalUrl || undefined,
      });
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Candidate</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name *</label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Role</label>
              <Input value={currentRole} onChange={(e) => setCurrentRole(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Company</label>
              <Input value={currentCompany} onChange={(e) => setCurrentCompany(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Summary</label>
            <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={3} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Manatal URL</label>
            <Input type="url" value={manatalUrl} onChange={(e) => setManatalUrl(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FilesSection({ candidateId }: { candidateId: Id<"candidates"> }) {
  const files = useQuery(api.candidateFiles.listByCandidate, { candidateId });
  const createFile = useMutation(api.candidateFiles.create);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    setUploading(true);
    try {
      for (const file of Array.from(selectedFiles)) {
        const path = `files/${candidateId}/${file.name}`;
        const fileUrl = await uploadFile("files", path, file);
        await createFile({
          candidateId,
          fileUrl,
          fileName: file.name,
          fileType: file.type || "application/octet-stream",
        });
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Files</CardTitle>
        <Button
          size="sm"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <Upload className="mr-2 h-4 w-4" />
          {uploading ? "Uploading..." : "Upload More Files"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleUpload(e.target.files)}
        />
      </CardHeader>
      <CardContent>
        {files === undefined ? (
          <Skeleton className="h-20 w-full" />
        ) : files.length === 0 ? (
          <p className="text-sm text-muted-foreground">No files uploaded.</p>
        ) : (
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file._id}
                className="flex items-center gap-3 rounded-md border p-3"
              >
                <FileIcon className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{file.fileName}</p>
                  <p className="text-xs text-muted-foreground">{file.fileType}</p>
                </div>
                <a
                  href={file.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md p-2 hover:bg-muted"
                >
                  <Download className="h-4 w-4 text-muted-foreground" />
                </a>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function CandidateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const candidateId = params.id as string;

  const candidate = useQuery(api.candidates.getById, {
    candidateId: candidateId as Id<"candidates">,
  });
  const assignments = useQuery(api.candidatePositions.listByCandidate, {
    candidateId: candidateId as Id<"candidates">,
  });

  if (candidate === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (candidate === null) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Candidate Not Found</h1>
        <Button variant="outline" onClick={() => router.push("/admin/candidates")}>
          Back to Candidates
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{candidate.fullName}</h1>
          {(candidate.currentRole || candidate.currentCompany) && (
            <p className="text-muted-foreground">
              {candidate.currentRole}
              {candidate.currentRole && candidate.currentCompany && " @ "}
              {candidate.currentCompany}
            </p>
          )}
          <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
            {candidate.email && <span>{candidate.email}</span>}
            {candidate.phone && <span>{candidate.phone}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {candidate.manatalUrl && (
            <a
              href={candidate.manatalUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm">
                <ExternalLink className="mr-2 h-4 w-4" />
                View in Manatal
              </Button>
            </a>
          )}
          <EditCandidateDialog candidate={candidate} />
        </div>
      </div>

      {/* Summary */}
      {candidate.summary && (
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{candidate.summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Files */}
      <FilesSection candidateId={candidate._id} />

      {/* Assigned Positions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Assigned Positions</CardTitle>
        </CardHeader>
        <CardContent>
          {assignments === undefined ? (
            <Skeleton className="h-20 w-full" />
          ) : assignments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Not assigned to any positions yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Position</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Last Interaction</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((a) => {
                  const stageInfo = STAGE_CONFIG[a.stage] ?? {
                    label: a.stage,
                    color: "bg-gray-500",
                  };
                  return (
                    <TableRow key={a._id}>
                      <TableCell className="font-medium">
                        {a.positionTitle}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {a.orgName}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${stageInfo.color} text-white`}
                        >
                          {stageInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(a.lastInteractionAt)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
