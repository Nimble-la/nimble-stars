import { query, mutation } from "./_generated/server";
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

export const list = query({
  args: {},
  handler: async (ctx) => {
    const orgs = await ctx.db.query("organizations").collect();

    const orgsWithCounts = await Promise.all(
      orgs.map(async (org) => {
        const users = await ctx.db
          .query("users")
          .withIndex("by_org", (q) => q.eq("orgId", org._id))
          .collect();
        const positions = await ctx.db
          .query("positions")
          .withIndex("by_org", (q) => q.eq("orgId", org._id))
          .collect();
        return {
          ...org,
          userCount: users.length,
          positionCount: positions.length,
        };
      })
    );

    return orgsWithCounts;
  },
});

export const getDetail = query({
  args: { orgId: v.id("organizations") },
  handler: async (ctx, args) => {
    const org = await ctx.db.get(args.orgId);
    if (!org) return null;

    const positions = await ctx.db
      .query("positions")
      .withIndex("by_org", (q) => q.eq("orgId", org._id))
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

    const users = await ctx.db
      .query("users")
      .withIndex("by_org", (q) => q.eq("orgId", org._id))
      .collect();

    return { ...org, positions: positionsWithCounts, users };
  },
});

export const update = mutation({
  args: {
    orgId: v.id("organizations"),
    name: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    primaryColor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { orgId, ...fields } = args;
    const updates: Record<string, string> = {};
    if (fields.name !== undefined) updates.name = fields.name;
    if (fields.logoUrl !== undefined) updates.logoUrl = fields.logoUrl;
    if (fields.primaryColor !== undefined) updates.primaryColor = fields.primaryColor;
    await ctx.db.patch(orgId, updates);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    logoUrl: v.optional(v.string()),
    primaryColor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("organizations", {
      name: args.name,
      logoUrl: args.logoUrl,
      primaryColor: args.primaryColor,
      createdAt: Date.now(),
    });
    return id;
  },
});
