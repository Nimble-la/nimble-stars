import { query } from "./_generated/server";
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
