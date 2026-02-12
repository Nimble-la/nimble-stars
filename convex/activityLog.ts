import { query } from "./_generated/server";
import { v } from "convex/values";

export const getRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    const entries = await ctx.db
      .query("activityLog")
      .order("desc")
      .take(limit);
    return entries;
  },
});

export const listByCandidatePosition = query({
  args: {
    candidatePositionId: v.id("candidatePositions"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    return await ctx.db
      .query("activityLog")
      .withIndex("by_candidate_position", (q) =>
        q.eq("candidatePositionId", args.candidatePositionId)
      )
      .order("desc")
      .take(limit);
  },
});

export const listByPosition = query({
  args: { positionId: v.id("positions") },
  handler: async (ctx, args) => {
    // Get all candidatePositions for this position
    const cps = await ctx.db
      .query("candidatePositions")
      .withIndex("by_position", (q) => q.eq("positionId", args.positionId))
      .collect();

    const cpIds = new Set(cps.map((cp) => cp._id));

    // Get activity logs for those candidatePositions
    const allLogs = await ctx.db.query("activityLog").order("desc").take(100);
    const filtered = allLogs.filter((log) =>
      cpIds.has(log.candidatePositionId)
    );

    // Enrich with candidate name
    const enriched = await Promise.all(
      filtered.map(async (log) => {
        const cp = cps.find((c) => c._id === log.candidatePositionId);
        const candidate = cp ? await ctx.db.get(cp.candidateId) : null;
        return {
          ...log,
          candidateName: candidate?.fullName ?? "Unknown",
        };
      })
    );

    return enriched.slice(0, 20);
  },
});
