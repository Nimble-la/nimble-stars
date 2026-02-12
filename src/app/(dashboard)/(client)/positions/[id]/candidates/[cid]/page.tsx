"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { StageBadge } from "@/components/pipeline/stage-badge";
import { Copy, FileIcon, Download } from "lucide-react";
import { CommentList } from "@/components/comments/comment-list";
import { CommentForm } from "@/components/comments/comment-form";
import { ActivityTimeline } from "@/components/activity/activity-timeline";
import { useAuth } from "@/lib/auth/auth-context";
import { toast } from "sonner";
import type { Id } from "../../../../../../../../convex/_generated/dataModel";

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
  toast.success("Copied to clipboard");
}

export default function ClientCandidateProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user, orgId } = useAuth();
  const positionId = params.id as string;
  const candidatePositionId = params.cid as string;

  const data = useQuery(
    api.candidatePositions.getForClient,
    orgId
      ? {
          candidatePositionId: candidatePositionId as Id<"candidatePositions">,
          orgId: orgId as Id<"organizations">,
        }
      : "skip"
  );

  const updateStage = useMutation(api.candidatePositions.updateStage);

  const handleStageChange = async (newStage: string) => {
    if (!user) return;
    try {
      await updateStage({
        id: candidatePositionId as Id<"candidatePositions">,
        stage: newStage as "submitted" | "to_interview" | "approved" | "rejected",
        userId: user._id as Id<"users">,
        userName: user.name,
      });
      toast.success("Stage updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update stage");
    }
  };

  if (data === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (data === null) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Candidate Not Found</h1>
        <Button variant="outline" onClick={() => router.push(`/positions/${positionId}`)}>
          Back to Pipeline
        </Button>
      </div>
    );
  }

  const { candidate, files } = data;
  const initials = candidate.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="text-xl">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{candidate.fullName}</h1>
          {(candidate.currentRole || candidate.currentCompany) && (
            <p className="text-muted-foreground">
              {candidate.currentRole}
              {candidate.currentRole && candidate.currentCompany && " @ "}
              {candidate.currentCompany}
            </p>
          )}
          <div className="mt-2 flex items-center gap-4 text-sm">
            {candidate.email && (
              <button
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                onClick={() => copyToClipboard(candidate.email!)}
              >
                {candidate.email}
                <Copy className="h-3 w-3" />
              </button>
            )}
            {candidate.phone && (
              <button
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                onClick={() => copyToClipboard(candidate.phone!)}
              >
                {candidate.phone}
                <Copy className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Stage selector */}
        <div className="flex items-center gap-2">
          <StageBadge stage={data.stage} />
          <Select value={data.stage} onValueChange={handleStageChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="to_interview">Interview</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
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
      <Card>
        <CardHeader>
          <CardTitle>Files</CardTitle>
        </CardHeader>
        <CardContent>
          {files.length === 0 ? (
            <p className="text-sm text-muted-foreground">No files available.</p>
          ) : (
            <div className="space-y-2">
              {files.map((file) => (
                <div key={file._id} className="flex items-center gap-3 rounded-md border p-3">
                  <FileIcon className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium">{file.fileName}</p>
                    <p className="text-xs text-muted-foreground">{file.fileType}</p>
                  </div>
                  <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" className="rounded-md p-2 hover:bg-muted">
                    <Download className="h-4 w-4 text-muted-foreground" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comments & Activity Tabs */}
      <Tabs defaultValue="comments">
        <TabsList>
          <TabsTrigger value="comments">Comments</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="comments" className="mt-4">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <CommentForm candidatePositionId={candidatePositionId as Id<"candidatePositions">} />
              <CommentList candidatePositionId={candidatePositionId as Id<"candidatePositions">} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="activity" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <ActivityTimeline candidatePositionId={candidatePositionId as Id<"candidatePositions">} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
