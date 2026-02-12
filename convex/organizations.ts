import { query } from "./_generated/server";
import { v } from "convex/values";

export const getById = query({
  args: { orgId: v.id("organizations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.orgId);
  },
});
