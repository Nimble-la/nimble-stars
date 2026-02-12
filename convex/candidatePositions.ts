import { query, mutation } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";
import { stageChangeHtml, candidateAssignedHtml } from "./emailTemplates";

export const countAll = query({
  args: {},
  handler: async (ctx) => {
    const cps = await ctx.db.query("candidatePositions").collect();
    return cps.length;
  },
});

export const listByCandidate = query({
  args: { candidateId: v.id("candidates") },
  handler: async (ctx, args) => {
    const cps = await ctx.db
      .query("candidatePositions")
      .withIndex("by_candidate", (q) => q.eq("candidateId", args.candidateId))
      .collect();

    const withDetails = await Promise.all(
      cps.map(async (cp) => {
        const position = await ctx.db.get(cp.positionId);
        const org = position ? await ctx.db.get(position.orgId) : null;
        return {
          ...cp,
          positionTitle: position?.title ?? "Unknown",
          orgName: org?.name ?? "Unknown",
        };
      })
    );

    return withDetails;
  },
});

export const assign = mutation({
  args: {
    candidateId: v.id("candidates"),
    positionId: v.id("positions"),
    userId: v.id("users"),
    userName: v.string(),
  },
  handler: async (ctx, args) => {
    // Check for duplicate assignment
    const existing = await ctx.db
      .query("candidatePositions")
      .withIndex("by_position_and_candidate", (q) =>
        q.eq("positionId", args.positionId).eq("candidateId", args.candidateId)
      )
      .unique();

    if (existing) {
      throw new Error("Candidate is already assigned to this position");
    }

    const now = Date.now();
    const cpId = await ctx.db.insert("candidatePositions", {
      candidateId: args.candidateId,
      positionId: args.positionId,
      stage: "submitted",
      createdAt: now,
      updatedAt: now,
      lastInteractionAt: now,
    });

    // Create activity log entry
    await ctx.db.insert("activityLog", {
      action: "assigned",
      userId: args.userId,
      userName: args.userName,
      candidatePositionId: cpId,
      createdAt: now,
    });

    // Notify client users in the org about the new candidate assignment
    const position = await ctx.db.get(args.positionId);
    if (position) {
      const candidate = await ctx.db.get(args.candidateId);
      const org = await ctx.db.get(position.orgId);
      const candidateName = candidate?.fullName ?? "A candidate";
      const message = `${candidateName} has been assigned to ${position.title}`;
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://stars.nimble.la";

      const clientUsers = await ctx.db
        .query("users")
        .withIndex("by_org", (q) => q.eq("orgId", position.orgId))
        .filter((q) => q.eq(q.field("role"), "client"))
        .collect();

      await Promise.all(
        clientUsers
          .filter((u) => u._id !== args.userId)
          .map(async (clientUser) => {
            await ctx.db.insert("notifications", {
              type: "candidate_assigned",
              message,
              isRead: false,
              userId: clientUser._id,
              relatedCandidatePositionId: cpId,
              createdAt: now,
            });
            await ctx.scheduler.runAfter(0, api.emails.sendNotificationEmail, {
              to: clientUser.email,
              subject: `New Candidate: ${candidateName} for ${position.title}`,
              html: candidateAssignedHtml({
                candidateName,
                positionTitle: position.title,
                orgName: org?.name ?? "Unknown",
                currentRole: candidate?.currentRole,
                profileUrl: `${baseUrl}/positions/${position._id}`,
              }),
              templateName: "candidate-assigned",
              relatedEventType: "candidate_assigned",
              relatedCandidatePositionId: cpId,
            });
          })
      );
    }

    return cpId;
  },
});

export const listByPosition = query({
  args: { positionId: v.id("positions") },
  handler: async (ctx, args) => {
    const cps = await ctx.db
      .query("candidatePositions")
      .withIndex("by_position", (q) => q.eq("positionId", args.positionId))
      .collect();

    const withDetails = await Promise.all(
      cps.map(async (cp) => {
        const candidate = await ctx.db.get(cp.candidateId);
        const comments = await ctx.db
          .query("comments")
          .withIndex("by_candidate_position", (q) =>
            q.eq("candidatePositionId", cp._id)
          )
          .collect();
        return {
          ...cp,
          candidateName: candidate?.fullName ?? "Unknown",
          candidateRole: candidate?.currentRole,
          commentCount: comments.length,
        };
      })
    );

    return withDetails;
  },
});

export const getForClient = query({
  args: {
    candidatePositionId: v.id("candidatePositions"),
    orgId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const cp = await ctx.db.get(args.candidatePositionId);
    if (!cp) return null;

    // Verify position belongs to org
    const position = await ctx.db.get(cp.positionId);
    if (!position || position.orgId !== args.orgId) return null;

    const candidate = await ctx.db.get(cp.candidateId);
    if (!candidate) return null;

    const files = await ctx.db
      .query("candidateFiles")
      .withIndex("by_candidate", (q) => q.eq("candidateId", cp.candidateId))
      .collect();

    // Return candidate data WITHOUT manatalUrl
    return {
      ...cp,
      candidate: {
        _id: candidate._id,
        fullName: candidate.fullName,
        email: candidate.email,
        phone: candidate.phone,
        currentRole: candidate.currentRole,
        currentCompany: candidate.currentCompany,
        summary: candidate.summary,
      },
      files,
      positionTitle: position.title,
    };
  },
});

export const listByPositionForClient = query({
  args: {
    positionId: v.id("positions"),
    orgId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    // Verify position belongs to org and is open
    const position = await ctx.db.get(args.positionId);
    if (!position || position.orgId !== args.orgId || position.status !== "open") {
      return [];
    }

    const cps = await ctx.db
      .query("candidatePositions")
      .withIndex("by_position", (q) => q.eq("positionId", args.positionId))
      .collect();

    const withDetails = await Promise.all(
      cps.map(async (cp) => {
        const candidate = await ctx.db.get(cp.candidateId);
        const comments = await ctx.db
          .query("comments")
          .withIndex("by_candidate_position", (q) =>
            q.eq("candidatePositionId", cp._id)
          )
          .collect();
        return {
          ...cp,
          candidateName: candidate?.fullName ?? "Unknown",
          candidateRole: candidate?.currentRole,
          commentCount: comments.length,
        };
      })
    );

    return withDetails;
  },
});

export const updateStage = mutation({
  args: {
    id: v.id("candidatePositions"),
    stage: v.union(
      v.literal("submitted"),
      v.literal("to_interview"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    userId: v.id("users"),
    userName: v.string(),
  },
  handler: async (ctx, args) => {
    const cp = await ctx.db.get(args.id);
    if (!cp) throw new Error("CandidatePosition not found");

    const fromStage = cp.stage;
    const now = Date.now();

    await ctx.db.patch(args.id, {
      stage: args.stage,
      updatedAt: now,
      lastInteractionAt: now,
    });

    await ctx.db.insert("activityLog", {
      action: "stage_change",
      fromStage,
      toStage: args.stage,
      userId: args.userId,
      userName: args.userName,
      candidatePositionId: args.id,
      createdAt: now,
    });

    // Notify admin users when a client changes stage
    const actingUser = await ctx.db.get(args.userId);
    if (actingUser?.role === "client") {
      const candidate = await ctx.db.get(cp.candidateId);
      const candidateName = candidate?.fullName ?? "A candidate";

      const STAGE_LABELS: Record<string, string> = {
        submitted: "Submitted",
        to_interview: "Interview",
        approved: "Approved",
        rejected: "Rejected",
      };
      const message = `${args.userName} moved ${candidateName} from ${STAGE_LABELS[fromStage] ?? fromStage} to ${STAGE_LABELS[args.stage] ?? args.stage}`;

      const admins = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("role"), "admin"))
        .collect();

      const position = await ctx.db.get(cp.positionId);
      const org = position ? await ctx.db.get(position.orgId) : null;
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://stars.nimble.la";

      await Promise.all(
        admins.map(async (admin) => {
          await ctx.db.insert("notifications", {
            type: "stage_change",
            message,
            isRead: false,
            userId: admin._id,
            relatedCandidatePositionId: args.id,
            createdAt: now,
          });
          // Schedule email
          await ctx.scheduler.runAfter(0, api.emails.sendNotificationEmail, {
            to: admin.email,
            subject: `Stage Change: ${candidateName} → ${STAGE_LABELS[args.stage] ?? args.stage}`,
            html: stageChangeHtml({
              actorName: args.userName,
              candidateName,
              fromStage,
              toStage: args.stage,
              positionTitle: position?.title ?? "Unknown",
              orgName: org?.name ?? "Unknown",
              profileUrl: `${baseUrl}/admin`,
            }),
            templateName: "stage-change",
            relatedEventType: "stage_change",
            relatedCandidatePositionId: args.id,
          });
        })
      );
    }
  },
});
