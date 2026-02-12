import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

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

    return cpId;
  },
});
