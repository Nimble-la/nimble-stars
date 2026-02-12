"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Upload, X, FileIcon } from "lucide-react";
import { uploadFile } from "@/lib/supabase/storage";
import { toast } from "sonner";
import type { Id } from "../../../../../../convex/_generated/dataModel";

interface PendingFile {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
}

export default function NewCandidatePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [currentRole, setCurrentRole] = useState("");
  const [currentCompany, setCurrentCompany] = useState("");
  const [summary, setSummary] = useState("");
  const [manatalUrl, setManatalUrl] = useState("");
  const [files, setFiles] = useState<PendingFile[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCandidate = useMutation(api.candidates.create);
  const createFile = useMutation(api.candidateFiles.create);

  const handleFilesSelected = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    const newFiles: PendingFile[] = Array.from(selectedFiles).map((file) => ({
      file,
      progress: 0,
      status: "pending" as const,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFilesSelected(e.dataTransfer.files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const candidateId = await createCandidate({
        fullName,
        email: email || undefined,
        phone: phone || undefined,
        currentRole: currentRole || undefined,
        currentCompany: currentCompany || undefined,
        summary: summary || undefined,
        manatalUrl: manatalUrl || undefined,
      });

      // Upload files
      for (let i = 0; i < files.length; i++) {
        const pf = files[i];
        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, status: "uploading" as const, progress: 50 } : f
          )
        );

        try {
          const path = `files/${candidateId}/${pf.file.name}`;
          const fileUrl = await uploadFile("files", path, pf.file);

          await createFile({
            candidateId: candidateId as Id<"candidates">,
            fileUrl,
            fileName: pf.file.name,
            fileType: pf.file.type || "application/octet-stream",
          });

          setFiles((prev) =>
            prev.map((f, idx) =>
              idx === i ? { ...f, status: "done" as const, progress: 100 } : f
            )
          );
        } catch {
          setFiles((prev) =>
            prev.map((f, idx) =>
              idx === i ? { ...f, status: "error" as const } : f
            )
          );
        }
      }

      toast.success("Candidate created");
      router.push(`/admin/candidates/${candidateId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create candidate");
      setError(err instanceof Error ? err.message : "Failed to create candidate");
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">New Candidate</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name *</label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Current Role</label>
                <Input
                  value={currentRole}
                  onChange={(e) => setCurrentRole(e.target.value)}
                  placeholder="Senior Developer"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Current Company</label>
                <Input
                  value={currentCompany}
                  onChange={(e) => setCurrentCompany(e.target.value)}
                  placeholder="Acme Corp"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Summary</label>
              <Textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Brief description of the candidate..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Manatal URL</label>
              <Input
                type="url"
                value={manatalUrl}
                onChange={(e) => setManatalUrl(e.target.value)}
                placeholder="https://app.manatal.com/..."
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Files</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors hover:border-primary hover:bg-muted/50"
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                Drag & drop files here, or click to browse
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleFilesSelected(e.target.files)}
              />
            </div>

            {files.length > 0 && (
              <div className="space-y-2">
                {files.map((pf, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-md border p-3"
                  >
                    <FileIcon className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium">
                        {pf.file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(pf.file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    {pf.status === "uploading" && (
                      <div className="h-2 w-20 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${pf.progress}%` }}
                        />
                      </div>
                    )}
                    {pf.status === "done" && (
                      <span className="text-xs text-green-600">Uploaded</span>
                    )}
                    {pf.status === "error" && (
                      <span className="text-xs text-destructive">Failed</span>
                    )}
                    {pf.status === "pending" && (
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="rounded-md p-1 hover:bg-muted"
                      >
                        <X className="h-4 w-4 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/candidates")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Creating..." : "Create Candidate"}
          </Button>
        </div>
      </form>
    </div>
  );
}
