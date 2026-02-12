import { query } from "./_generated/server";
import { v } from "convex/values";

export const getById = query({
  args: { orgId: v.id("organizations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.orgId);
  },
});

export const countActive = query({
  args: {},
  handler: async (ctx) => {
    const orgs = await ctx.db.query("organizations").collect();
    return orgs.length;
  },
});
