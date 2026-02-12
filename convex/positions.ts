import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const countOpen = query({
  args: {},
  handler: async (ctx) => {
    const positions = await ctx.db.query("positions").collect();
    return positions.filter((p) => p.status === "open").length;
  },
});

export const listByOrg = query({
  args: { orgId: v.id("organizations") },
  handler: async (ctx, args) => {
    const positions = await ctx.db
      .query("positions")
      .withIndex("by_org", (q) => q.eq("orgId", args.orgId))
      .collect();

    const positionsWithCounts = await Promise.all(
      positions.map(async (pos) => {
        const cps = await ctx.db
          .query("candidatePositions")
          .withIndex("by_position", (q) => q.eq("positionId", pos._id))
          .collect();
        return { ...pos, candidateCount: cps.length };
      })
    );

    return positionsWithCounts;
  },
});

export const listOpenByOrg = query({
  args: { orgId: v.id("organizations") },
  handler: async (ctx, args) => {
    const positions = await ctx.db
      .query("positions")
      .withIndex("by_org", (q) => q.eq("orgId", args.orgId))
      .collect();
    return positions.filter((p) => p.status === "open");
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    orgId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("positions", {
      title: args.title,
      description: args.description,
      status: "open",
      orgId: args.orgId,
      createdAt: Date.now(),
    });
    return id;
  },
});

export const updateStatus = mutation({
  args: {
    positionId: v.id("positions"),
    status: v.union(v.literal("open"), v.literal("closed")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.positionId, { status: args.status });
  },
});

export const update = mutation({
  args: {
    positionId: v.id("positions"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { positionId, ...fields } = args;
    const updates: Record<string, string> = {};
    if (fields.title !== undefined) updates.title = fields.title;
    if (fields.description !== undefined) updates.description = fields.description;
    await ctx.db.patch(positionId, updates);
  },
});
