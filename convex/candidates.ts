import { query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { search: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const candidates = await ctx.db.query("candidates").collect();

    const filtered = args.search
      ? candidates.filter((c) => {
          const term = args.search!.toLowerCase();
          return (
            c.fullName.toLowerCase().includes(term) ||
            (c.currentRole?.toLowerCase().includes(term) ?? false) ||
            (c.currentCompany?.toLowerCase().includes(term) ?? false)
          );
        })
      : candidates;

    const withCounts = await Promise.all(
      filtered.map(async (candidate) => {
        const cps = await ctx.db
          .query("candidatePositions")
          .withIndex("by_candidate", (q) => q.eq("candidateId", candidate._id))
          .collect();
        return { ...candidate, positionCount: cps.length };
      })
    );

    return withCounts;
  },
});

export const getById = query({
  args: { candidateId: v.id("candidates") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.candidateId);
  },
});
