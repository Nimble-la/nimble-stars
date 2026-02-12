import { query, mutation } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";
import { newCommentHtml } from "./emailTemplates";

export const listByCandidatePosition = query({
  args: { candidatePositionId: v.id("candidatePositions") },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_candidate_position", (q) =>
        q.eq("candidatePositionId", args.candidatePositionId)
      )
      .order("desc")
      .collect();

    const withUsers = await Promise.all(
      comments.map(async (comment) => {
        const user = await ctx.db.get(comment.userId);
        return {
          ...comment,
          userName: user?.name ?? "Unknown",
        };
      })
    );

    return withUsers;
  },
});

export const create = mutation({
  args: {
    body: v.string(),
    userId: v.id("users"),
    userName: v.string(),
    candidatePositionId: v.id("candidatePositions"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const id = await ctx.db.insert("comments", {
      body: args.body,
      userId: args.userId,
      candidatePositionId: args.candidatePositionId,
      createdAt: now,
    });

    // Update lastInteractionAt
    await ctx.db.patch(args.candidatePositionId, {
      lastInteractionAt: now,
      updatedAt: now,
    });

    // Create activity log
    await ctx.db.insert("activityLog", {
      action: "comment",
      userId: args.userId,
      userName: args.userName,
      candidatePositionId: args.candidatePositionId,
      createdAt: now,
    });

    // Notify admin users when a client leaves a comment
    const actingUser = await ctx.db.get(args.userId);
    if (actingUser?.role === "client") {
      const cp = await ctx.db.get(args.candidatePositionId);
      const candidate = cp ? await ctx.db.get(cp.candidateId) : null;
      const position = cp ? await ctx.db.get(cp.positionId) : null;
      const candidateName = candidate?.fullName ?? "a candidate";
      const message = `${args.userName} commented on ${candidateName}`;
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://stars.nimble.la";

      const admins = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("role"), "admin"))
        .collect();

      await Promise.all(
        admins.map(async (admin) => {
          await ctx.db.insert("notifications", {
            type: "new_comment",
            message,
            isRead: false,
            userId: admin._id,
            relatedCandidatePositionId: args.candidatePositionId,
            createdAt: now,
          });
          await ctx.scheduler.runAfter(0, api.emails.sendNotificationEmail, {
            to: admin.email,
            subject: `New Comment on ${candidateName}`,
            html: newCommentHtml({
              actorName: args.userName,
              candidateName,
              positionTitle: position?.title ?? "Unknown",
              commentPreview: args.body,
              profileUrl: `${baseUrl}/admin`,
            }),
            templateName: "new-comment",
            relatedEventType: "new_comment",
            relatedCandidatePositionId: args.candidatePositionId,
          });
        })
      );
    }

    return id;
  },
});
