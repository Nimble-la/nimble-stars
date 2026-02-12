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
