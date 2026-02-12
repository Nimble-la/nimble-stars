"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth/auth-context";
import type { Id } from "../../../convex/_generated/dataModel";

interface CommentFormProps {
  candidatePositionId: Id<"candidatePositions">;
}

export function CommentForm({ candidatePositionId }: CommentFormProps) {
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const createComment = useMutation(api.comments.create);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim() || !user) return;
    setSaving(true);
    try {
      await createComment({
        body: body.trim(),
        userId: user._id as Id<"users">,
        userName: user.name,
        candidatePositionId,
      });
      setBody("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Add a comment..."
        rows={2}
      />
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={!body.trim() || saving}>
          {saving ? "Posting..." : "Add Comment"}
        </Button>
      </div>
    </form>
  );
}
